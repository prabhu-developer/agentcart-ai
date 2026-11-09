import { getProductDetailsSchema } from "../schemas/tool-schemas";
import { getProductByIdOrSlug } from "@/features/products/services/product-service";

export interface ProductDetailsToolOutput {
  found: boolean;
  product?: {
    id: string;
    slug: string;
    sku?: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    priceMinor: number;
    compareAtPrice?: number;
    currency: string;
    description: string;
    inStock: boolean;
    stockCount: number;
    rating: number;
    reviewCount: number;
    specifications: Record<string, string>;
    pros: string[];
    cons: string[];
    highlights: string[];
  };
  error?: string;
}

export async function executeGetProductDetails(
  rawArgs: unknown
): Promise<ProductDetailsToolOutput> {
  const args = getProductDetailsSchema.parse(rawArgs);

  const product = await getProductByIdOrSlug(args.productId);

  if (!product) {
    return {
      found: false,
      error: `No product found in catalog matching identifier: ${args.productId}`,
    };
  }

  return {
    found: true,
    product: {
      id: product.id,
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      priceMinor: product.priceMinor,
      compareAtPrice: product.compareAtPrice,
      currency: product.currency,
      description: product.description,
      inStock: product.inStock,
      stockCount: product.stockCount,
      rating: product.rating,
      reviewCount: product.reviewCount,
      specifications: product.specifications,
      pros: product.pros,
      cons: product.cons,
      highlights: product.highlights,
    },
  };
}
