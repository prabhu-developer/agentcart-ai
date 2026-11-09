import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PayPalApiError } from "../../src/lib/paypal/client";
import { generateOrderNumber } from "../../src/features/checkout/services/checkout-service";

describe("PayPal Client Unit Tests", () => {
  it("formats PayPalApiError with custom status code and details", () => {
    const error = new PayPalApiError("Invalid client credentials", 401, {
      error: "invalid_client",
    });

    assert.strictEqual(error.message, "Invalid client credentials");
    assert.strictEqual(error.statusCode, 401);
    assert.deepStrictEqual(error.details, { error: "invalid_client" });
    assert.strictEqual(error.name, "PayPalApiError");
  });

  it("converts integer minor units to exact decimal string representations for PayPal", () => {
    const totalMinor = 14999; // $149.99
    const decimalString = (totalMinor / 100).toFixed(2);
    assert.strictEqual(decimalString, "149.99");

    const zeroCentsMinor = 5000; // $50.00
    assert.strictEqual((zeroCentsMinor / 100).toFixed(2), "50.00");

    const singleCentMinor = 1; // $0.01
    assert.strictEqual((singleCentMinor / 100).toFixed(2), "0.01");
  });

  it("generates human-readable, unique AgentCart order numbers with AC-2026 prefix", () => {
    const orderNum1 = generateOrderNumber();
    const orderNum2 = generateOrderNumber();

    assert.match(orderNum1, /^AC-2026-[0-9A-F]{6}$/);
    assert.match(orderNum2, /^AC-2026-[0-9A-F]{6}$/);
    assert.notStrictEqual(orderNum1, orderNum2);
  });
});
