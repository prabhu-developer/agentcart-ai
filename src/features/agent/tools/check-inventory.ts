import { checkInventorySchema } from "../schemas/tool-schemas";
import { getProductByIdOrSlug } from "@/features/products/services/product-service";

export interface InventoryItemOutput {
  id: string;
  name: string;
  inStock: boolean;
  stockCount: number;
  lowStockWarning: boolean;
}

export interface CheckInventoryToolOutput {
  totalChecked: number;
  allInStock: boolean;
  outOfStockCount: number;
  items: InventoryItemOutput[];
  notFoundIds?: string[];
}

export async function executeCheckInventory(
  rawArgs: unknown
): Promise<CheckInventoryToolOutput> {
  const args = checkInventorySchema.parse(rawArgs);

  const results = await Promise.all(
    args.productIds.map(async (id) => {
      const prod = await getProductByIdOrSlug(id);
      return { id, product: prod };
    })
  );

  const items: InventoryItemOutput[] = [];
  const notFound: string[] = [];

  for (const res of results) {
    if (!res.product) {
      notFound.push(res.id);
      continue;
    }
    const count = res.product.stockCount;
    items.push({
      id: res.product.id,
      name: res.product.name,
      inStock: res.product.inStock,
      stockCount: count,
      lowStockWarning: count > 0 && count <= 5,
    });
  }

  const outOfStockCount = items.filter((i) => !i.inStock).length;

  return {
    totalChecked: items.length,
    allInStock: outOfStockCount === 0 && notFound.length === 0,
    outOfStockCount,
    items,
    notFoundIds: notFound.length > 0 ? notFound : undefined,
  };
}
