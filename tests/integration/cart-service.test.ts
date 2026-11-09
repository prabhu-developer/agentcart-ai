import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import crypto from "crypto";
import { connectDB } from "../../src/lib/db/connect";
import { Product } from "../../src/models/product";
import { Cart } from "../../src/models/cart";
import {
  getAuthoritativeCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCart,
  addBulkItemsToCart,
  validateCartForCheckout,
  CartError,
} from "../../src/features/cart/services/cart-service";

describe("Cart Service Integration & Authoritative Calculations", () => {
  let guestIdA: string;
  let guestIdB: string;
  let testProductA: { id: string; priceMinor: number; stock: number; name: string };
  let testProductB: { id: string; priceMinor: number; stock: number; name: string };

  before(async () => {
    await connectDB();
    guestIdA = crypto.randomUUID();
    guestIdB = crypto.randomUUID();

    // Query 2 active products from MongoDB
    const prods = await Product.find({ isActive: true, stock: { $gte: 5 } }).limit(2).lean();
    assert.ok(prods.length >= 2, "Test requires at least 2 active products in MongoDB");

    testProductA = {
      id: prods[0]._id.toString(),
      priceMinor: prods[0].priceMinor,
      stock: prods[0].stock,
      name: prods[0].name,
    };

    testProductB = {
      id: prods[1]._id.toString(),
      priceMinor: prods[1].priceMinor,
      stock: prods[1].stock,
      name: prods[1].name,
    };
  });

  after(async () => {
    // Clean up test carts
    await Cart.deleteMany({ guestId: { $in: [guestIdA, guestIdB] } });
    await mongoose.disconnect();
  });

  it("creates an empty authoritative cart for a new guest", async () => {
    const cart = await getAuthoritativeCart(guestIdA);
    assert.ok(cart.id);
    assert.strictEqual(cart.items.length, 0);
    assert.strictEqual(cart.totalItems, 0);
    assert.strictEqual(cart.subtotal, 0);
    assert.strictEqual(cart.currency, "USD");
    assert.strictEqual(cart.isValidForCheckout, false);
  });

  it("adds an item to cart and calculates authoritative line total from MongoDB price", async () => {
    const cart = await addItemToCart(guestIdA, testProductA.id, 2);
    assert.strictEqual(cart.items.length, 1);
    assert.strictEqual(cart.totalItems, 2);

    const item = cart.items[0];
    assert.strictEqual(item.productId, testProductA.id);
    assert.strictEqual(item.quantity, 2);
    assert.strictEqual(item.priceMinor, testProductA.priceMinor);

    const expectedMinor = testProductA.priceMinor * 2;
    assert.strictEqual(item.lineTotalMinor, expectedMinor);
    assert.strictEqual(cart.subtotalMinor, expectedMinor);
    assert.strictEqual(cart.subtotal, Number((expectedMinor / 100).toFixed(2)));
    assert.strictEqual(cart.isValidForCheckout, true);
  });

  it("increments quantity when the same product is added again", async () => {
    const cart = await addItemToCart(guestIdA, testProductA.id, 1);
    assert.strictEqual(cart.items.length, 1);
    assert.strictEqual(cart.items[0].quantity, 3);
    assert.strictEqual(cart.totalItems, 3);
  });

  it("updates item quantity with stock validation", async () => {
    const cart = await updateItemQuantity(guestIdA, testProductA.id, 1);
    assert.strictEqual(cart.items[0].quantity, 1);
    assert.strictEqual(cart.totalItems, 1);
  });

  it("rejects updating item quantity to 0 (must use remove)", async () => {
    await assert.rejects(
      async () => {
        await updateItemQuantity(guestIdA, testProductA.id, 0);
      },
      (err: Error) => {
        return err instanceof CartError && err.statusCode === 400;
      }
    );
  });

  it("rejects updating item quantity exceeding available stock", async () => {
    await assert.rejects(
      async () => {
        await updateItemQuantity(guestIdA, testProductA.id, testProductA.stock + 10);
      },
      (err: Error) => {
        return err instanceof CartError && err.statusCode === 409;
      }
    );
  });

  it("adds a second item and calculates multi-product subtotal in minor units", async () => {
    const cart = await addItemToCart(guestIdA, testProductB.id, 2);
    assert.strictEqual(cart.items.length, 2);
    assert.strictEqual(cart.totalItems, 3); // 1 of A, 2 of B

    const expectedSubtotalMinor = testProductA.priceMinor * 1 + testProductB.priceMinor * 2;
    assert.strictEqual(cart.subtotalMinor, expectedSubtotalMinor);
    assert.strictEqual(cart.subtotal, Number((expectedSubtotalMinor / 100).toFixed(2)));
  });

  it("removes an item from the cart", async () => {
    const cart = await removeItemFromCart(guestIdA, testProductA.id);
    assert.strictEqual(cart.items.length, 1);
    assert.strictEqual(cart.items[0].productId, testProductB.id);
    assert.strictEqual(cart.totalItems, 2);
  });

  it("clears all items from the cart", async () => {
    const cart = await clearCart(guestIdA);
    assert.strictEqual(cart.items.length, 0);
    assert.strictEqual(cart.totalItems, 0);
    assert.strictEqual(cart.subtotal, 0);
  });

  it("supports atomic bulk add for AI recommendations", async () => {
    const cart = await addBulkItemsToCart(guestIdA, [
      { productId: testProductA.id, quantity: 1 },
      { productId: testProductB.id, quantity: 1 },
    ]);

    assert.strictEqual(cart.items.length, 2);
    assert.strictEqual(cart.totalItems, 2);

    const expectedSubtotalMinor = testProductA.priceMinor * 1 + testProductB.priceMinor * 1;
    assert.strictEqual(cart.subtotalMinor, expectedSubtotalMinor);
  });

  it("rejects entire bulk add if any single item is invalid (atomic rollback)", async () => {
    await clearCart(guestIdA);

    await assert.rejects(
      async () => {
        await addBulkItemsToCart(guestIdA, [
          { productId: testProductA.id, quantity: 1 },
          { productId: "invalid-product-id-12345", quantity: 1 },
        ]);
      },
      (err: Error) => {
        return err instanceof CartError && err.statusCode === 404;
      }
    );

    // Verify cart remained completely empty
    const cart = await getAuthoritativeCart(guestIdA);
    assert.strictEqual(cart.items.length, 0);
  });

  it("validates cart for checkout preparation", async () => {
    // Add product A
    await addItemToCart(guestIdA, testProductA.id, 1);

    const prep = await validateCartForCheckout(guestIdA);
    assert.strictEqual(prep.isValid, true);
    assert.strictEqual(prep.totalItems, 1);
    assert.strictEqual(prep.currency, "USD");
    assert.strictEqual(prep.taxNotCalculated, true);
    assert.strictEqual(prep.shippingNotCalculated, true);
    assert.strictEqual(prep.issues.length, 0);
  });

  it("rejects checkout preparation for an empty cart", async () => {
    await clearCart(guestIdA);
    const prep = await validateCartForCheckout(guestIdA);
    assert.strictEqual(prep.isValid, false);
    assert.ok(prep.issues.some((issue) => issue.includes("empty cart")));
  });

  it("ensures strict guest session isolation between guest A and guest B", async () => {
    // Clear both
    await clearCart(guestIdA);
    await clearCart(guestIdB);

    // Add to Guest A
    await addItemToCart(guestIdA, testProductA.id, 2);

    // Add to Guest B
    await addItemToCart(guestIdB, testProductB.id, 1);

    // Verify Guest A
    const cartA = await getAuthoritativeCart(guestIdA);
    assert.strictEqual(cartA.items.length, 1);
    assert.strictEqual(cartA.items[0].productId, testProductA.id);
    assert.strictEqual(cartA.totalItems, 2);

    // Verify Guest B
    const cartB = await getAuthoritativeCart(guestIdB);
    assert.strictEqual(cartB.items.length, 1);
    assert.strictEqual(cartB.items[0].productId, testProductB.id);
    assert.strictEqual(cartB.totalItems, 1);
  });

  it("reflects live price changes from MongoDB Product collection without modifying stored cart items", async () => {
    // Create new isolated guest cart
    const guestC = crypto.randomUUID();
    await addItemToCart(guestC, testProductA.id, 1);

    const initialCart = await getAuthoritativeCart(guestC);
    assert.strictEqual(initialCart.items[0].priceMinor, testProductA.priceMinor);

    // Temporarily update product price in MongoDB
    const originalPrice = testProductA.priceMinor;
    const modifiedPrice = originalPrice + 1000; // +$10.00
    await Product.updateOne({ _id: testProductA.id }, { $set: { priceMinor: modifiedPrice } });

    // Retrieve cart: authoritative service must automatically recalculate with latest price!
    const updatedCart = await getAuthoritativeCart(guestC);
    assert.strictEqual(updatedCart.items[0].priceMinor, modifiedPrice);
    assert.strictEqual(updatedCart.subtotalMinor, modifiedPrice);

    // Revert price back to original
    await Product.updateOne({ _id: testProductA.id }, { $set: { priceMinor: originalPrice } });
    await Cart.deleteOne({ guestId: guestC });
  });
});
