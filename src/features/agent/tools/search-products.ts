import { searchProductsSchema } from "../schemas/tool-schemas";
import { listProducts } from "@/features/products/services/product-service";

export interface SearchProductsToolOutput {
  total: number;
  returned: number;
  products: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    priceMinor: number;
    currency: string;
    inStock: boolean;
    stockCount: number;
    rating: number;
    reviewCount: number;
    highlights: string[];
    specifications: Record<string, string>;
  }[];
}

export async function executeSearchProducts(
  rawArgs: unknown
): Promise<SearchProductsToolOutput> {
  const args = searchProductsSchema.parse(rawArgs);

  const result = await listProducts({
    search: args.query,
    category: args.category,
    brand: args.brand,
    minPrice: args.minPrice,
    maxPrice: args.maxPrice,
    inStock: args.inStock,
    limit: args.limit,
    page: 1,
  });

  return {
    total: result.pagination.total,
    returned: result.products.length,
    products: result.products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.price,
      priceMinor: p.priceMinor,
      currency: p.currency,
      inStock: p.inStock,
      stockCount: p.stockCount,
      rating: p.rating,
      reviewCount: p.reviewCount,
      highlights: p.highlights,
      specifications: p.specifications,
    })),
  };
}
