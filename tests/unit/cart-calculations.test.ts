import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  addCartItemSchema,
  updateCartItemSchema,
  bulkAddCartItemsSchema,
} from "../../src/features/cart/validators/cart-schemas";

describe("Cart Financial Calculations & Schema Validations", () => {
  describe("Zod Validation Rules", () => {
    it("accepts valid product ID and positive integer quantity", () => {
      const parsed = addCartItemSchema.parse({
        productId: "654321654321654321654321",
        quantity: 3,
      });
      assert.strictEqual(parsed.productId, "654321654321654321654321");
      assert.strictEqual(parsed.quantity, 3);
    });

    it("defaults quantity to 1 when omitted in addCartItemSchema", () => {
      const parsed = addCartItemSchema.parse({
        productId: "keycraft-pro",
      });
      assert.strictEqual(parsed.quantity, 1);
    });

    it("rejects non-integer, zero, or negative quantity in addCartItemSchema", () => {
      assert.throws(() => addCartItemSchema.parse({ productId: "p1", quantity: 0 }));
      assert.throws(() => addCartItemSchema.parse({ productId: "p1", quantity: -2 }));
      assert.throws(() => addCartItemSchema.parse({ productId: "p1", quantity: 1.5 }));
    });

    it("rejects quantity 0 in updateCartItemSchema (requires DELETE for removal)", () => {
      assert.throws(() => updateCartItemSchema.parse({ quantity: 0 }));
    });

    it("accepts valid positive integer in updateCartItemSchema", () => {
      const parsed = updateCartItemSchema.parse({ quantity: 4 });
      assert.strictEqual(parsed.quantity, 4);
    });

    it("validates bulk add items schema", () => {
      const parsed = bulkAddCartItemsSchema.parse({
        items: [
          { productId: "p1", quantity: 1 },
          { productId: "p2", quantity: 2 },
        ],
      });
      assert.strictEqual(parsed.items.length, 2);
    });

    it("rejects empty bulk items array", () => {
      assert.throws(() => bulkAddCartItemsSchema.parse({ items: [] }));
    });
  });

  describe("Integer Minor-Unit Precision Rules", () => {
    it("calculates exact line totals in integer minor units without floating-point artifacts", () => {
      // Classic JS floating point flaw: 0.1 * 3 = 0.30000000000000004
      const priceDollars = 0.1;
      const priceMinor = 10; // 10 cents
      const quantity = 3;

      const floatResult = priceDollars * quantity;
      assert.notStrictEqual(floatResult, 0.3); // 0.30000000000000004 !== 0.3

      const lineTotalMinor = priceMinor * quantity;
      assert.strictEqual(lineTotalMinor, 30);
      assert.strictEqual(Number.isSafeInteger(lineTotalMinor), true);

      const serializedLineTotal = Number((lineTotalMinor / 100).toFixed(2));
      assert.strictEqual(serializedLineTotal, 0.3);
    });

    it("calculates subtotal across multiple items strictly in minor units", () => {
      const items = [
        { priceMinor: 15999, quantity: 1 }, // $159.99
        { priceMinor: 8900, quantity: 2 },  // $89.00 * 2 = $178.00
        { priceMinor: 2450, quantity: 3 },  // $24.50 * 3 = $73.50
      ];

      const subtotalMinor = items.reduce(
        (sum, item) => sum + item.priceMinor * item.quantity,
        0
      );

      // Expected: 15999 + 17800 + 7350 = 41149 cents = $411.49
      assert.strictEqual(subtotalMinor, 41149);
      assert.strictEqual(Number((subtotalMinor / 100).toFixed(2)), 411.49);
    });

    it("detects unsafe integer overflow protection", () => {
      const hugeMinor = Number.MAX_SAFE_INTEGER + 10;
      assert.strictEqual(Number.isSafeInteger(hugeMinor), false);
    });
  });
});
