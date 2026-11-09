import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { runShoppingAgent } from "../../src/features/agent/services/shopping-agent";
import { connectDB } from "../../src/lib/db/connect";

describe("Shopping Agent Orchestrator", () => {
  after(async () => {
    await mongoose.disconnect();
  });
  it("returns clarification options for vague greeting without invoking LLM tools", async () => {
    await connectDB();
    const response = await runShoppingAgent({
      message: "hello there",
      history: [],
    });

    assert.strictEqual(response.success, true);
    assert.strictEqual(response.type, "clarification");
    assert.ok(response.clarificationOptions && response.clarificationOptions.length > 0);
    assert.strictEqual(response.recommendedProducts?.length, 0);
  });

  it("processes a real shopping inquiry and produces verified MongoDB recommendations with budget analysis", async () => {
    await connectDB();
    const response = await runShoppingAgent({
      message:
        "I need a complete home office setup under $1,000. I need a monitor, keyboard, mouse and ergonomic chair.",
      history: [],
    });

    assert.strictEqual(response.success, true);
    assert.strictEqual(response.type, "recommendation");
    assert.ok(response.recommendedProducts && response.recommendedProducts.length > 0);

    // Verify all recommended products have valid authoritative fields
    for (const prod of response.recommendedProducts) {
      assert.ok(prod.id);
      assert.ok(prod.name);
      assert.ok(typeof prod.price === "number");
      assert.ok(typeof prod.priceMinor === "number");
      assert.strictEqual(prod.inStock, true);
    }

    // Verify authoritative budget analysis
    assert.ok(response.budgetAnalysis);
    assert.strictEqual(response.budgetAnalysis.budget, 1000);
    assert.ok(response.budgetAnalysis.total > 0);
    assert.ok(["under_budget", "within_budget", "slightly_over"].includes(response.budgetAnalysis.status));

    // Verify tools were called
    assert.ok(response.toolsCalled && response.toolsCalled.length > 0);
  });
});
