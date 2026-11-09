import { z } from "zod";

/**
 * 1. search_products schema
 * Searches the authoritative MongoDB catalog with various filters.
 */
export const searchProductsSchema = z.object({
  query: z
    .string()
    .trim()
    .optional()
    .describe("Keyword query to search product title, description, tags, or SKU"),
  category: z
    .string()
    .trim()
    .optional()
    .describe(
      "Product category slug (e.g. workspace, electronics, audio, accessories, furniture, lifestyle)"
    ),
  brand: z
    .string()
    .trim()
    .optional()
    .describe("Brand slug or name (e.g. keycraft, logitech, dell, herman-miller)"),
  minPrice: z
    .number()
    .nonnegative()
    .optional()
    .describe("Minimum price in dollars (e.g. 50)"),
  maxPrice: z
    .number()
    .positive()
    .optional()
    .describe("Maximum price in dollars (e.g. 500)"),
  inStock: z
    .boolean()
    .optional()
    .describe("Filter only items currently in stock"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5)
    .describe("Number of products to return (default 5, max 10)"),
});

export type SearchProductsArgs = z.infer<typeof searchProductsSchema>;

/**
 * 2. get_product_details schema
 * Retrieves full details, specifications, and live stock for a single product.
 */
export const getProductDetailsSchema = z.object({
  productId: z
    .string()
    .trim()
    .min(1)
    .describe("MongoDB ObjectId or slug of the product to inspect"),
});

export type GetProductDetailsArgs = z.infer<typeof getProductDetailsSchema>;

/**
 * 3. compare_products schema
 * Builds a side-by-side comparison matrix for 2 to 4 products.
 */
export const compareProductsSchema = z.object({
  productIds: z
    .array(z.string().trim().min(1))
    .min(2, "At least 2 product IDs are required for comparison")
    .max(4, "At most 4 products can be compared at once")
    .describe("Array of 2 to 4 product ObjectIds or slugs to compare"),
});

export type CompareProductsArgs = z.infer<typeof compareProductsSchema>;

/**
 * 4. check_inventory schema
 * Authoritative stock count and availability check for up to 20 products.
 */
export const checkInventorySchema = z.object({
  productIds: z
    .array(z.string().trim().min(1))
    .min(1, "At least 1 product ID is required")
    .max(20, "At most 20 products can be checked in a single request")
    .describe("Array of product ObjectIds or slugs to verify stock"),
});

export type CheckInventoryArgs = z.infer<typeof checkInventorySchema>;

/**
 * 5. calculate_budget schema
 * Computes exact minor-unit financial totals and remaining budget.
 */
export const calculateBudgetSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1).describe("Product ObjectId or slug"),
        quantity: z.number().int().positive().default(1).describe("Quantity of this item"),
      })
    )
    .min(1, "At least 1 item is required to calculate budget")
    .describe("Items to calculate totals for"),
  budgetLimit: z
    .number()
    .positive()
    .describe("Target budget limit in dollars (e.g. 1000)"),
});

export type CalculateBudgetArgs = z.infer<typeof calculateBudgetSchema>;
