import { compareProductsSchema } from "../schemas/tool-schemas";
import { getProductByIdOrSlug, SerializedProduct } from "@/features/products/services/product-service";

export interface CompareProductsToolOutput {
  comparedCount: number;
  products: {
    id: string;
    name: string;
    brand: string;
    price: number;
    currency: string;
    rating: number;
    inStock: boolean;
    stockCount: number;
    pros: string[];
    cons: string[];
  }[];
  priceComparison: {
    cheapest: { id: string; name: string; price: number };
    mostExpensive: { id: string; name: string; price: number };
    priceDifference: number;
  };
  specificationsMatrix: Record<string, Record<string, string>>;
  notFoundIds?: string[];
}

export async function executeCompareProducts(
  rawArgs: unknown
): Promise<CompareProductsToolOutput> {
  const args = compareProductsSchema.parse(rawArgs);

  const results = await Promise.all(
    args.productIds.map(async (id) => {
      const prod = await getProductByIdOrSlug(id);
      return { id, product: prod };
    })
  );

  const foundProducts = results
    .filter((r): r is { id: string; product: SerializedProduct } => r.product !== null)
    .map((r) => r.product);

  const notFound = results.filter((r) => r.product === null).map((r) => r.id);

  if (foundProducts.length < 2) {
    throw new Error(
      `Comparison requires at least 2 valid catalog products. Found ${foundProducts.length} out of ${args.productIds.length} requested.`
    );
  }

  // Sort by price to determine cheapest / most expensive
  const sortedByPrice = [...foundProducts].sort((a, b) => a.priceMinor - b.priceMinor);
  const cheapest = sortedByPrice[0];
  const mostExpensive = sortedByPrice[sortedByPrice.length - 1];

  // Collect union of all spec keys
  const allSpecKeys = new Set<string>();
  foundProducts.forEach((p) => {
    Object.keys(p.specifications || {}).forEach((k) => allSpecKeys.add(k));
  });

  const matrix: Record<string, Record<string, string>> = {};
  allSpecKeys.forEach((key) => {
    matrix[key] = {};
    foundProducts.forEach((p) => {
      matrix[key][p.name] = p.specifications[key] || "N/A";
    });
  });

  return {
    comparedCount: foundProducts.length,
    products: foundProducts.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      currency: p.currency,
      rating: p.rating,
      inStock: p.inStock,
      stockCount: p.stockCount,
      pros: p.pros,
      cons: p.cons,
    })),
    priceComparison: {
      cheapest: { id: cheapest.id, name: cheapest.name, price: cheapest.price },
      mostExpensive: { id: mostExpensive.id, name: mostExpensive.name, price: mostExpensive.price },
      priceDifference: Number(((mostExpensive.priceMinor - cheapest.priceMinor) / 100).toFixed(2)),
    },
    specificationsMatrix: matrix,
    notFoundIds: notFound.length > 0 ? notFound : undefined,
  };
}
