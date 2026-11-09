import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PayPalApiError } from "../../src/lib/paypal/client";
import { generateOrderNumber } from "../../src/features/checkout/services/checkout-service";
import { serverEnvSchema } from "../../src/lib/env";

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

  describe("Environment Validation Security Audit", () => {
    const baseValidConfig = {
      MONGODB_URI: "mongodb://localhost:27017/test",
      OPENROUTER_API_KEY: "sk-test-key",
      OPENROUTER_MODEL: "openrouter/free",
    };

    it("rejects configuration when PAYPAL_ENVIRONMENT is missing (no implicit default)", () => {
      const result = serverEnvSchema.safeParse({
        ...baseValidConfig,
        // PAYPAL_ENVIRONMENT omitted
      });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        const envIssue = result.error.issues.find(
          (i) => i.path[0] === "PAYPAL_ENVIRONMENT"
        );
        assert.ok(envIssue, "Should report error for PAYPAL_ENVIRONMENT");
      }
    });

    it("rejects invalid PAYPAL_ENVIRONMENT values like staging or dev", () => {
      const result = serverEnvSchema.safeParse({
        ...baseValidConfig,
        PAYPAL_ENVIRONMENT: "staging",
      });
      assert.strictEqual(result.success, false);
    });

    it("accepts explicitly configured sandbox and live environments", () => {
      const sandboxResult = serverEnvSchema.safeParse({
        ...baseValidConfig,
        PAYPAL_ENVIRONMENT: "sandbox",
      });
      assert.strictEqual(sandboxResult.success, true);

      const liveResult = serverEnvSchema.safeParse({
        ...baseValidConfig,
        PAYPAL_ENVIRONMENT: "live",
      });
      assert.strictEqual(liveResult.success, true);
    });

    it("rejects when server PAYPAL_CLIENT_ID and public NEXT_PUBLIC_PAYPAL_CLIENT_ID mismatch", () => {
      const result = serverEnvSchema.safeParse({
        ...baseValidConfig,
        PAYPAL_ENVIRONMENT: "sandbox",
        PAYPAL_CLIENT_ID: "server_client_app_id_123",
        NEXT_PUBLIC_PAYPAL_CLIENT_ID: "different_public_client_id_456",
      });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        const mismatchIssue = result.error.issues.find(
          (i) => i.path[0] === "NEXT_PUBLIC_PAYPAL_CLIENT_ID"
        );
        assert.ok(mismatchIssue, "Should flag client ID mismatch");
      }
    });

    it("accepts when server PAYPAL_CLIENT_ID and public NEXT_PUBLIC_PAYPAL_CLIENT_ID correspond to each other", () => {
      const matchingClientId = "app_client_id_xyz789";
      const result = serverEnvSchema.safeParse({
        ...baseValidConfig,
        PAYPAL_ENVIRONMENT: "sandbox",
        PAYPAL_CLIENT_ID: matchingClientId,
        NEXT_PUBLIC_PAYPAL_CLIENT_ID: matchingClientId,
      });
      assert.strictEqual(result.success, true);
    });
  });
});
