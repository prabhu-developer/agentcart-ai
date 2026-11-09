import { z } from "zod";

const serverEnvSchema = z.object({
    MONGODB_URI: z.string().min(1),

    OPENROUTER_API_KEY: z.string().min(1),
    OPENROUTER_MODEL: z.string().default("openrouter/free"),

    PAYPAL_BASE_URL: z
        .string()
        .url()
        .default("https://api-m.sandbox.paypal.com"),

    PAYPAL_CLIENT_ID: z.string().optional(),
    PAYPAL_CLIENT_SECRET: z.string().optional(),
});

export const env = serverEnvSchema.parse({
    MONGODB_URI: process.env.MONGODB_URI,

    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL:
        process.env.OPENROUTER_MODEL || "openrouter/free",

    PAYPAL_BASE_URL:
        process.env.PAYPAL_BASE_URL || undefined,

    PAYPAL_CLIENT_ID:
        process.env.PAYPAL_CLIENT_ID || undefined,

    PAYPAL_CLIENT_SECRET:
        process.env.PAYPAL_CLIENT_SECRET || undefined,
});