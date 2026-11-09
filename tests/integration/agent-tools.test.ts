import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { executeToolByName } from "../../src/features/agent/tools";
import { connectDB } from "../../src/lib/db/connect";

describe("Agent Tools Execution", () => {
  it("rejects unknown tool name gracefully", async () => {
    const res = await executeToolByName("non_existent_tool", {});
    assert.strictEqual(res.success, false);
    assert.ok(res.error?.includes("Unknown tool name"));
  });

  it("handles malformed tool arguments without crashing", async () => {
    const res = await executeToolByName("compare_products", { productIds: ["only-one-id"] });
    assert.strictEqual(res.success, false);
    assert.ok(res.error?.includes("Tool execution failed"));
  });

  it("executes search_products against MongoDB catalog", async () => {
    await connectDB();
    const res = await executeToolByName("search_products", {
      query: "keyboard",
      limit: 3,
    });

    assert.strictEqual(res.success, true);
    assert.ok(res.result);
    const output = res.result as { returned: number; products: Array<{ name: string; priceMinor: number }> };
    assert.ok(output.returned > 0);
    assert.ok(output.products[0].name.length > 0);
    assert.ok(typeof output.products[0].priceMinor === "number");
  });

  it("executes check_inventory on real products", async () => {
    await connectDB();
    // Search first to get a valid product ID
    const searchRes = await executeToolByName("search_products", { limit: 1 });
    const searchOutput = searchRes.result as { products: Array<{ id: string }> };
    const validId = searchOutput.products[0].id;

    const res = await executeToolByName("check_inventory", {
      productIds: [validId],
    });

    assert.strictEqual(res.success, true);
    const output = res.result as { totalChecked: number; allInStock: boolean; items: Array<{ stockCount: number }> };
    assert.strictEqual(output.totalChecked, 1);
    assert.ok(typeof output.items[0].stockCount === "number");
  });

  it("executes calculate_budget with authoritative integer minor units", async () => {
    await connectDB();
    const searchRes = await executeToolByName("search_products", { limit: 2 });
    const searchOutput = searchRes.result as { products: Array<{ id: string; priceMinor: number }> };
    const p1 = searchOutput.products[0];
    const p2 = searchOutput.products[1];

    const res = await executeToolByName("calculate_budget", {
      items: [
        { productId: p1.id, quantity: 1 },
        { productId: p2.id, quantity: 2 },
      ],
      budgetLimit: 1500,
    });

    assert.strictEqual(res.success, true);
    const output = res.result as {
      totalCostMinor: number;
      totalCost: number;
      remainingAmount: number;
      status: string;
      itemBreakdown: Array<{ quantity: number }>;
    };

    const expectedMinor = p1.priceMinor * 1 + p2.priceMinor * 2;
    assert.strictEqual(output.totalCostMinor, expectedMinor);
    assert.strictEqual(output.totalCost, Number((expectedMinor / 100).toFixed(2)));
    assert.strictEqual(output.itemBreakdown.length, 2);
  });
});
