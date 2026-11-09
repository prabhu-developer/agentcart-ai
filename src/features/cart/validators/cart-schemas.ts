import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z
    .string()
    .trim()
    .min(1, "Product ID is required"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity cannot exceed 99")
    .default(1),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1. Use DELETE to remove items.")
    .max(99, "Quantity cannot exceed 99"),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const bulkAddCartItemsSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1, "Product ID is required"),
        quantity: z
          .number()
          .int("Quantity must be an integer")
          .min(1, "Quantity must be at least 1")
          .max(99, "Quantity cannot exceed 99")
          .default(1),
      })
    )
    .min(1, "At least one item is required for bulk add")
    .max(20, "Cannot add more than 20 items at once"),
});

export type BulkAddCartItemsInput = z.infer<typeof bulkAddCartItemsSchema>;
