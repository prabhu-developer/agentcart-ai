import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import crypto from "crypto";
import { connectDB } from "../../src/lib/db/connect";
import { Product } from "../../src/models/product";
import { Cart } from "../../src/models/cart";
import { Order } from "../../src/models/order";
import { addItemToCart, clearCart } from "../../src/features/cart/services/cart-service";
import {
  createCheckoutOrder,
  CheckoutError,
} from "../../src/features/checkout/services/checkout-service";

describe("Checkout Order Creation Integration", () => {
  let guestId: string;
  let testProduct: { id: string; priceMinor: number; name: string };
  let originalFetch: typeof globalThis.fetch;

  before(async () => {
    await connectDB();
    guestId = crypto.randomUUID();

    const prod = await Product.findOne({ isActive: true, stock: { $gte: 5 } }).lean();
    assert.ok(prod, "Test requires at least one active product");

    testProduct = {
      id: prod._id.toString(),
      priceMinor: prod.priceMinor,
      name: prod.name,
    };

    // Mock global fetch for PayPal API
    originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = url.toString();

      // OAuth token mock
      if (urlStr.includes("/v1/oauth2/token")) {
        return new Response(
          JSON.stringify({
            access_token: "mock-paypal-jwt-token",
            token_type: "Bearer",
            expires_in: 3600,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // Create order mock
      if (urlStr.includes("/v2/checkout/orders") && init?.method === "POST") {
        return new Response(
          JSON.stringify({
            id: `MOCK-PAYPAL-${Date.now()}`,
            status: "CREATED",
            links: [],
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        );
      }

      return originalFetch(url, init);
    }) as typeof globalThis.fetch;
  });

  after(async () => {
    globalThis.fetch = originalFetch;
    await Cart.deleteOne({ guestId });
    await Order.deleteMany({ guestId });
    await mongoose.disconnect();
  });

  it("rejects creating checkout order for an empty cart", async () => {
    await clearCart(guestId);

    await assert.rejects(
      async () => {
        await createCheckoutOrder(guestId);
      },
      (err: Error) => {
        return err instanceof CheckoutError && err.statusCode === 400;
      }
    );
  });

  it("creates an internal order and corresponding PayPal order with exact minor units", async () => {
    await addItemToCart(guestId, testProduct.id, 2);

    const summary = await createCheckoutOrder(guestId);

    assert.ok(summary.orderId);
    assert.match(summary.orderNumber, /^AC-2026-[0-9A-F]{6}$/);
    assert.match(summary.paypalOrderId, /^MOCK-PAYPAL-/);
    assert.strictEqual(summary.currency, "USD");

    const expectedMinor = testProduct.priceMinor * 2;
    assert.strictEqual(summary.totalMinor, expectedMinor);
    assert.strictEqual(summary.total, Number((expectedMinor / 100).toFixed(2)));
    assert.strictEqual(summary.itemsCount, 2);

    // Verify database document
    const orderDoc = await Order.findById(summary.orderId);
    assert.ok(orderDoc);
    assert.strictEqual(orderDoc.orderStatus, "PENDING_PAYMENT");
    assert.strictEqual(orderDoc.paymentStatus, "CREATED");
    assert.strictEqual(orderDoc.totalMinor, expectedMinor);
    assert.strictEqual(orderDoc.items.length, 1);
    assert.strictEqual(orderDoc.items[0].quantity, 2);
    assert.strictEqual(orderDoc.items[0].unitPriceMinor, testProduct.priceMinor);
  });

  it("supports order creation idempotency for the same cart attempt", async () => {
    const idempotencyKey = `idemp-${Date.now()}`;
    const order1 = await createCheckoutOrder(guestId, idempotencyKey);
    const order2 = await createCheckoutOrder(guestId, idempotencyKey);

    assert.strictEqual(order1.orderId, order2.orderId);
    assert.strictEqual(order1.orderNumber, order2.orderNumber);
    assert.strictEqual(order1.paypalOrderId, order2.paypalOrderId);
  });
});
