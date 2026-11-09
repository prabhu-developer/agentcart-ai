import { z } from "zod";

export const serverEnvSchema = z
  .object({
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

    OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
    OPENROUTER_MODEL: z.string().default("openrouter/free"),

    PAYPAL_ENVIRONMENT: z.enum(["sandbox", "live"], {
      message:
        "PAYPAL_ENVIRONMENT must be explicitly set to 'sandbox' or 'live'",
    }),
    PAYPAL_BASE_URL: z.string().url().optional(),

    PAYPAL_CLIENT_ID: z.string().optional(),
    PAYPAL_CLIENT_SECRET: z.string().optional(),
    PAYPAL_WEBHOOK_ID: z.string().optional(),
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: z.string().optional(),
  })
  .refine(
    (data) => {
      // Ensure the public PayPal client ID corresponds to the configured server-side PayPal application
      if (data.PAYPAL_CLIENT_ID || data.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
        return data.PAYPAL_CLIENT_ID === data.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
      }
      return true;
    },
    {
      message:
        "NEXT_PUBLIC_PAYPAL_CLIENT_ID must match PAYPAL_CLIENT_ID to ensure client and server correspond to the same PayPal application",
      path: ["NEXT_PUBLIC_PAYPAL_CLIENT_ID"],
    }
  );

const rawPaypalEnv = process.env.PAYPAL_ENVIRONMENT;
const resolvedPaypalBaseUrl =
  process.env.PAYPAL_BASE_URL ||
  (rawPaypalEnv === "live"
    ? "https://api-m.paypal.com"
    : rawPaypalEnv === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : undefined);

export const env = serverEnvSchema.parse({
  MONGODB_URI: process.env.MONGODB_URI,

  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || "openrouter/free",

  PAYPAL_ENVIRONMENT: process.env.PAYPAL_ENVIRONMENT,
  PAYPAL_BASE_URL: resolvedPaypalBaseUrl,

  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || undefined,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || undefined,
  PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID || undefined,
  NEXT_PUBLIC_PAYPAL_CLIENT_ID:
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || undefined,
});
