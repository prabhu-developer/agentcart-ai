import { z } from "zod";

export const shoppingRequirementsSchema = z.object({
  detectedNeeds: z
    .array(z.string())
    .default([])
    .describe("Specific items or setup components identified (e.g., monitor, keyboard, ergonomic chair)"),
  categoryHints: z
    .array(z.string())
    .default([])
    .describe("Matching category slugs (e.g. workspace, electronics, audio, accessories, furniture, lifestyle)"),
  budgetLimit: z
    .number()
    .positive()
    .nullable()
    .default(null)
    .describe("Extracted budget constraint in dollars, or null if unstated"),
  currency: z
    .string()
    .default("USD")
    .describe("Preferred currency code (e.g. USD)"),
  priorities: z
    .array(z.string())
    .default([])
    .describe("Customer preferences (e.g., ergonomics, mechanical switches, wireless, value for money, premium)"),
  isClarificationNeeded: z
    .boolean()
    .default(false)
    .describe("True if the request is too vague to recommend specific products without follow-up"),
  clarificationQuestion: z
    .string()
    .nullable()
    .default(null)
    .describe("A targeted question to narrow down the customer's needs"),
  clarificationOptions: z
    .array(z.string())
    .default([])
    .describe("Quick multiple-choice options for the user to tap/click"),
});

export type ShoppingRequirements = z.infer<typeof shoppingRequirementsSchema>;
