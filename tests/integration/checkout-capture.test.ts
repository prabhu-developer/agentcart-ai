import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import crypto from "crypto";
import { connectDB } from "../../src/lib/db/connect";
import { Product } from "../../src/models/product";
import { Cart } from "../../src/models/cart";
import { Order } from "../../src/models/order";
import { addItemToCart, getAuthoritativeCart } from "../../src/features/cart/services/cart-service";
import {
  createCheckoutOrder,
  captureCheckoutOrder,
  CheckoutError,
} from "../../src/features/checkout/services/checkout-service";

describe("Checkout Capture Integration", () => {
  let guestIdA: string;
  let guestIdB: string;
  let testProduct: { id: string; priceMinor: number; name: string };
  let originalFetch: typeof globalThis.fetch;
  let simulatedPayPalAmount: string = "0.00";
  let simulatedStatus: string = "APPROVED";

  before(async () => {
    await connectDB();
    guestIdA = crypto.randomUUID();
    guestIdB = crypto.randomUUID();

    const prod = await Product.findOne({ isActive: true, stock: { $gte: 5 } }).lean();
    assert.ok(prod, "Test requires at least one active product");

    testProduct = {
      id: prod._id.toString(),
      priceMinor: prod.priceMinor,
      name: prod.name,
    };

    originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
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

      // Create order mock
      if (urlStr.includes("/v2/checkout/orders") && init?.method === "POST" && !urlStr.includes("/capture")) {
        return new Response(
          JSON.stringify({
            id: `MOCK-PAYPAL-${Date.now()}`,
            status: "CREATED",
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        );
      }

      // Capture order mock
      if (urlStr.includes("/capture") && init?.method === "POST") {
        return new Response(
          JSON.stringify({
            id: "MOCK-PAYPAL-ORDER",
            status: "COMPLETED",
            purchase_units: [
              {
                payments: {
                  captures: [
                    {
                      id: "MOCK-CAPTURE-ID-999",
                      status: "COMPLETED",
                      amount: { currency_code: "USD", value: simulatedPayPalAmount },
                    },
                  ],
                },
              },
            ],
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        );
      }

      // Get order details mock
      if (urlStr.includes("/v2/checkout/orders/") && init?.method === "GET") {
        return new Response(
          JSON.stringify({
            id: "MOCK-PAYPAL-ORDER",
            status: simulatedStatus,
            purchase_units: [
              {
                reference_id: "default",
                amount: {
                  currency_code: "USD",
                  value: simulatedPayPalAmount,
                },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      return originalFetch(url, init);
    }) as typeof globalThis.fetch;
  });

  after(async () => {
    globalThis.fetch = originalFetch;
    await Cart.deleteMany({ guestId: { $in: [guestIdA, guestIdB] } });
    await Order.deleteMany({ guestId: { $in: [guestIdA, guestIdB] } });
    await mongoose.disconnect();
  });

  it("enforces guest isolation by rejecting capture from a different guest session", async () => {
    await addItemToCart(guestIdA, testProduct.id, 1);
    const summary = await createCheckoutOrder(guestIdA);

    await assert.rejects(
      async () => {
        await captureCheckoutOrder(guestIdB, summary.paypalOrderId);
      },
      (err: Error) => {
        return err instanceof CheckoutError && err.statusCode === 403;
      }
    );
  });

  it("rejects capture if the amount reported by PayPal does not match internal order", async () => {
    await addItemToCart(guestIdA, testProduct.id, 1);
    const summary = await createCheckoutOrder(guestIdA);

    // Set simulated amount to incorrect value
    simulatedPayPalAmount = "999.99";
    simulatedStatus = "APPROVED";

    await assert.rejects(
      async () => {
        await captureCheckoutOrder(guestIdA, summary.paypalOrderId);
      },
      (err: Error) => {
        return err instanceof CheckoutError && err.statusCode === 409 && err.code === "AMOUNT_MISMATCH";
      }
    );
  });

  it("successfully captures approved order, transitions status to PAID, and clears cart", async () => {
    // Reset cart and create new order
    await Cart.deleteOne({ guestId: guestIdA });
    await addItemToCart(guestIdA, testProduct.id, 1);

    const summary = await createCheckoutOrder(guestIdA);
    simulatedPayPalAmount = summary.total.toFixed(2);
    simulatedStatus = "APPROVED";

    const confirmed = await captureCheckoutOrder(guestIdA, summary.paypalOrderId);

    assert.strictEqual(confirmed.orderStatus, "PAID");
    assert.strictEqual(confirmed.paymentStatus, "CAPTURED");
    assert.strictEqual(confirmed.orderNumber, summary.orderNumber);
    assert.strictEqual(confirmed.total, summary.total);
    assert.ok(confirmed.capturedAt);

    // Verify DB order document
    const orderDoc = await Order.findById(confirmed.orderId);
    assert.ok(orderDoc);
    assert.strictEqual(orderDoc.orderStatus, "PAID");
    assert.strictEqual(orderDoc.paymentStatus, "CAPTURED");
    assert.strictEqual(orderDoc.paypalCaptureId, "MOCK-CAPTURE-ID-999");

    // Verify guest cart was cleared
    const cart = await getAuthoritativeCart(guestIdA);
    assert.strictEqual(cart.items.length, 0);
  });

  it("handles duplicate capture calls idempotently without duplicate capture or errors", async () => {
    const existingOrder = await Order.findOne({ guestId: guestIdA, orderStatus: "PAID" });
    assert.ok(existingOrder);

    // Call capture again on the already-paid order
    const confirmedAgain = await captureCheckoutOrder(guestIdA, existingOrder.paypalOrderId!);
    assert.strictEqual(confirmedAgain.orderStatus, "PAID");
    assert.strictEqual(confirmedAgain.orderNumber, existingOrder.orderNumber);
  });
});
