import { z } from "zod";

export const productQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z
    .enum(["true", "false", "1", "0"])
    .transform((val) => val === "true" || val === "1")
    .optional(),
  featured: z
    .enum(["true", "false", "1", "0"])
    .transform((val) => val === "true" || val === "1")
    .optional(),
  sort: z
    .enum(["newest", "price_asc", "price_desc", "name_asc"])
    .default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type ProductQueryParams = z.infer<typeof productQuerySchema>;
