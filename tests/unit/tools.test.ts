import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  searchProductsSchema,
  getProductDetailsSchema,
  compareProductsSchema,
  checkInventorySchema,
  calculateBudgetSchema,
} from "../../src/features/agent/schemas/tool-schemas";

describe("Tool Schemas Validation", () => {
  describe("searchProductsSchema", () => {
    it("accepts empty args with default limit", () => {
      const parsed = searchProductsSchema.parse({});
      assert.strictEqual(parsed.limit, 5);
      assert.strictEqual(parsed.query, undefined);
    });

    it("validates valid search parameters", () => {
      const parsed = searchProductsSchema.parse({
        query: "mechanical keyboard",
        category: "electronics",
        brand: "KeyCraft",
        minPrice: 50,
        maxPrice: 200,
        inStock: true,
        limit: 8,
      });
      assert.strictEqual(parsed.query, "mechanical keyboard");
      assert.strictEqual(parsed.category, "electronics");
      assert.strictEqual(parsed.brand, "KeyCraft");
      assert.strictEqual(parsed.minPrice, 50);
      assert.strictEqual(parsed.maxPrice, 200);
      assert.strictEqual(parsed.inStock, true);
      assert.strictEqual(parsed.limit, 8);
    });

    it("rejects invalid limit exceeding max 10", () => {
      assert.throws(() => {
        searchProductsSchema.parse({ limit: 15 });
      });
    });

    it("rejects negative minPrice", () => {
      assert.throws(() => {
        searchProductsSchema.parse({ minPrice: -10 });
      });
    });
  });

  describe("getProductDetailsSchema", () => {
    it("accepts valid product id or slug", () => {
      const parsed = getProductDetailsSchema.parse({ productId: "keycraft-pro-keyboard" });
      assert.strictEqual(parsed.productId, "keycraft-pro-keyboard");
    });

    it("rejects empty product id", () => {
      assert.throws(() => {
        getProductDetailsSchema.parse({ productId: "" });
      });
    });
  });

  describe("compareProductsSchema", () => {
    it("accepts 2 to 4 product ids", () => {
      const parsed = compareProductsSchema.parse({
        productIds: ["id-1", "id-2", "id-3"],
      });
      assert.strictEqual(parsed.productIds.length, 3);
    });

    it("rejects single product id (minimum 2)", () => {
      assert.throws(() => {
        compareProductsSchema.parse({ productIds: ["id-1"] });
      });
    });

    it("rejects more than 4 products (maximum 4)", () => {
      assert.throws(() => {
        compareProductsSchema.parse({
          productIds: ["id-1", "id-2", "id-3", "id-4", "id-5"],
        });
      });
    });
  });

  describe("checkInventorySchema", () => {
    it("accepts up to 20 product ids", () => {
      const parsed = checkInventorySchema.parse({
        productIds: ["id-1", "id-2"],
      });
      assert.strictEqual(parsed.productIds.length, 2);
    });

    it("rejects empty productIds array", () => {
      assert.throws(() => {
        checkInventorySchema.parse({ productIds: [] });
      });
    });
  });

  describe("calculateBudgetSchema", () => {
    it("accepts valid items and positive budget limit", () => {
      const parsed = calculateBudgetSchema.parse({
        items: [
          { productId: "prod-1", quantity: 1 },
          { productId: "prod-2", quantity: 2 },
        ],
        budgetLimit: 1000,
      });
      assert.strictEqual(parsed.items.length, 2);
      assert.strictEqual(parsed.budgetLimit, 1000);
      assert.strictEqual(parsed.items[1].quantity, 2);
    });

    it("defaults quantity to 1 when omitted", () => {
      const parsed = calculateBudgetSchema.parse({
        items: [{ productId: "prod-1" }],
        budgetLimit: 500,
      });
      assert.strictEqual(parsed.items[0].quantity, 1);
    });

    it("rejects negative or zero budget limit", () => {
      assert.throws(() => {
        calculateBudgetSchema.parse({
          items: [{ productId: "prod-1" }],
          budgetLimit: -50,
        });
      });
    });
  });
});
