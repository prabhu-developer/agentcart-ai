import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { extractShoppingRequirements } from "../../src/features/agent/services/requirement-extractor";

describe("Requirement Extractor", () => {
  it("extracts items, categories, budget, and priorities from home office query", () => {
    const query =
      "I need a complete home office setup under $1,000. I need a monitor, keyboard, mouse and ergonomic chair. Prioritize quality, reliability and value for money.";

    const extracted = extractShoppingRequirements(query);

    assert.strictEqual(extracted.isClarificationNeeded, false);
    assert.strictEqual(extracted.budgetLimit, 1000);
    assert.strictEqual(extracted.currency, "USD");

    // Detected items
    assert.ok(extracted.detectedNeeds.includes("monitor"));
    assert.ok(extracted.detectedNeeds.includes("keyboard"));
    assert.ok(extracted.detectedNeeds.includes("mouse"));
    assert.ok(extracted.detectedNeeds.includes("chair"));

    // Detected categories
    assert.ok(extracted.categoryHints.includes("electronics"));
    assert.ok(extracted.categoryHints.includes("furniture"));

    // Priorities
    assert.ok(extracted.priorities.includes("ergonomics"));
    assert.ok(extracted.priorities.includes("quality & reliability"));
    assert.ok(extracted.priorities.includes("value for money"));
  });

  it("extracts budget with various phrasing formats", () => {
    assert.strictEqual(
      extractShoppingRequirements("looking for audio gear below $500").budgetLimit,
      500
    );
    assert.strictEqual(
      extractShoppingRequirements("mechanical keyboard with budget of 150").budgetLimit,
      150
    );
    assert.strictEqual(
      extractShoppingRequirements("desk setup up to $2,500").budgetLimit,
      2500
    );
  });

  it("flags vague query or greeting as clarification needed", () => {
    const greeting = extractShoppingRequirements("hi there");
    assert.strictEqual(greeting.isClarificationNeeded, true);
    assert.ok(greeting.clarificationOptions.length > 0);
    assert.ok(typeof greeting.clarificationQuestion === "string");

    const vague = extractShoppingRequirements("help");
    assert.strictEqual(vague.isClarificationNeeded, true);
  });
});
