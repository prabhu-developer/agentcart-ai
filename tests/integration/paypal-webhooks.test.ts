import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import crypto from "crypto";
import { connectDB } from "../../src/lib/db/connect";
import { Product } from "../../src/models/product";
import { Order } from "../../src/models/order";
import { WebhookEvent } from "../../src/models/webhook-event";
import {
  processPayPalWebhookEvent,
  generateOrderNumber,
  CheckoutError,
} from "../../src/features/checkout/services/checkout-service";

describe("PayPal Webhook Verification & Event Processing", () => {
  let guestId: string;
  let testOrder: { id: string; paypalOrderId: string; orderNumber: string };
  let originalFetch: typeof globalThis.fetch;
  let verifySignatureOutcome = true;

  before(async () => {
    await connectDB();
    guestId = crypto.randomUUID();

    const prod = await Product.findOne({ isActive: true }).lean();
    assert.ok(prod, "Test requires at least one product");

    const orderNumber = generateOrderNumber();
    const paypalOrderId = `MOCK-PAYPAL-WH-${Date.now()}`;

    // Create a pending order for webhook tests
    const created = await Order.create({
      orderNumber,
      guestId,
      currency: "USD",
      subtotalMinor: prod.priceMinor,
      totalMinor: prod.priceMinor,
      paypalOrderId,
      orderStatus: "PENDING_PAYMENT",
      paymentStatus: "CREATED",
      items: [
        {
          productId: prod._id,
          name: prod.name,
          sku: prod.sku || "SKU-WH",
          brand: "TestBrand",
          unitPriceMinor: prod.priceMinor,
          quantity: 1,
          lineTotalMinor: prod.priceMinor,
        },
      ],
    });

    testOrder = {
      id: created._id.toString(),
      paypalOrderId,
      orderNumber,
    };

    originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string | URL | Request) => {
      const urlStr = url.toString();

      // OAuth token mock
      if (urlStr.includes("/v1/oauth2/token")) {
        return new Response(
          JSON.stringify({
            access_token: "mock-token",
            token_type: "Bearer",
            expires_in: 3600,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // Verify webhook signature mock
      if (urlStr.includes("/v1/notifications/verify-webhook-signature")) {
        return new Response(
          JSON.stringify({
            verification_status: verifySignatureOutcome ? "SUCCESS" : "FAILURE",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      return originalFetch(url);
    }) as typeof globalThis.fetch;
  });

  after(async () => {
    globalThis.fetch = originalFetch;
    await Order.deleteMany({ guestId });
    await WebhookEvent.deleteMany({ paypalOrderId: testOrder.paypalOrderId });
    await mongoose.disconnect();
  });

  const validHeaders = {
    authAlgo: "SHA256withRSA",
    certUrl: "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-1",
    transmissionId: "test-trans-id-123",
    transmissionSig: "test-sig-base64",
    transmissionTime: "2026-11-09T12:00:00Z",
  };

  it("rejects webhook when cryptographic signature verification fails", async () => {
    verifySignatureOutcome = false;

    await assert.rejects(
      async () => {
        await processPayPalWebhookEvent(validHeaders, {
          id: `WH-FAIL-${Date.now()}`,
          event_type: "PAYMENT.CAPTURE.COMPLETED",
          resource: { id: testOrder.paypalOrderId },
        });
      },
      (err: Error) => {
        return err instanceof CheckoutError && err.statusCode === 400;
      }
    );

    verifySignatureOutcome = true;
  });

  it("processes PAYMENT.CAPTURE.COMPLETED and transitions order to PAID", async () => {
    const eventId = `WH-COMP-${Date.now()}`;

    const res = await processPayPalWebhookEvent(validHeaders, {
      id: eventId,
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: {
        id: "MOCK-CAPTURE-WH-001",
        custom_id: testOrder.id,
      },
    });

    assert.strictEqual(res.status, "PROCESSED");

    // Verify order was marked PAID
    const orderDoc = await Order.findById(testOrder.id);
    assert.ok(orderDoc);
    assert.strictEqual(orderDoc.orderStatus, "PAID");
    assert.strictEqual(orderDoc.paymentStatus, "CAPTURED");
    assert.strictEqual(orderDoc.paypalCaptureId, "MOCK-CAPTURE-WH-001");

    // Verify webhook event was persisted
    const eventDoc = await WebhookEvent.findOne({ eventId });
    assert.ok(eventDoc);
    assert.strictEqual(eventDoc.status, "PROCESSED");
  });

  it("handles duplicate webhook event delivery idempotently without re-processing", async () => {
    const eventId = `WH-IDEMP-${Date.now()}`;

    // First delivery
    const res1 = await processPayPalWebhookEvent(validHeaders, {
      id: eventId,
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: {
        id: "MOCK-CAPTURE-WH-002",
        custom_id: testOrder.id,
      },
    });
    assert.strictEqual(res1.status, "PROCESSED");

    // Duplicate redelivery
    const res2 = await processPayPalWebhookEvent(validHeaders, {
      id: eventId,
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: {
        id: "MOCK-CAPTURE-WH-002",
        custom_id: testOrder.id,
      },
    });
    assert.strictEqual(res2.status, "IGNORED");
    assert.ok(res2.message.includes("already processed"));
  });

  it("prevents an old or out-of-order event from downgrading an already-paid order", async () => {
    const eventId = `WH-DENY-${Date.now()}`;

    // Send a DENIED event for an order that is already PAID
    await processPayPalWebhookEvent(validHeaders, {
      id: eventId,
      event_type: "PAYMENT.CAPTURE.DENIED",
      resource: {
        id: testOrder.paypalOrderId,
      },
    });

    const orderDoc = await Order.findById(testOrder.id);
    assert.ok(orderDoc);
    assert.strictEqual(orderDoc.orderStatus, "PAID"); // Must remain PAID!
    assert.strictEqual(orderDoc.paymentStatus, "CAPTURED");
  });

  it("allows retry when a previous event delivery had status FAILED (PayPal retry semantics)", async () => {
    const eventId = `WH-RETRY-${Date.now()}`;

    // 1. Simulate a transient failure during earlier delivery that left the event in FAILED state
    await WebhookEvent.create({
      eventId,
      eventType: "PAYMENT.CAPTURE.COMPLETED",
      paypalOrderId: testOrder.paypalOrderId,
      status: "FAILED",
      error: "Transient network timeout connecting to database",
      processedAt: new Date(),
    });

    // 2. PayPal retries the webhook delivery
    const retryResult = await processPayPalWebhookEvent(validHeaders, {
      id: eventId,
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: {
        id: "MOCK-CAPTURE-WH-RETRY",
        custom_id: testOrder.id,
      },
    });

    // 3. Must NOT be discarded or ignored merely because event ID exists!
    assert.strictEqual(retryResult.status, "PROCESSED");

    // 4. Verify WebhookEvent document was updated to PROCESSED
    const updatedDoc = await WebhookEvent.findOne({ eventId });
    assert.ok(updatedDoc);
    assert.strictEqual(updatedDoc.status, "PROCESSED");
    assert.strictEqual(updatedDoc.error, undefined);
  });

  it("handles concurrent duplicate webhook deliveries safely without racing or crashing", async () => {
    const eventId = `WH-CONCURRENT-${Date.now()}`;

    // Fire two identical deliveries at the exact same instant
    const [res1, res2] = await Promise.all([
      processPayPalWebhookEvent(validHeaders, {
        id: eventId,
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          id: "MOCK-CAPTURE-CONC-001",
          custom_id: testOrder.id,
        },
      }),
      processPayPalWebhookEvent(validHeaders, {
        id: eventId,
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          id: "MOCK-CAPTURE-CONC-001",
          custom_id: testOrder.id,
        },
      }),
    ]);

    const statuses = [res1.status, res2.status];
    assert.ok(statuses.includes("PROCESSED"), "At least one call must process successfully");
    assert.ok(statuses.includes("IGNORED"), "The concurrent call must be safely ignored");
  });
});
