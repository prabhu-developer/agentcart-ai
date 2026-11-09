import { calculateBudgetSchema } from "../schemas/tool-schemas";
import { getProductByIdOrSlug } from "@/features/products/services/product-service";
import { BudgetStatus, BudgetAnalysis } from "@/features/shopping/types";

export interface CalculateBudgetToolOutput {
  budgetLimit: number;
  totalCost: number;
  totalCostMinor: number;
  remainingAmount: number;
  remainingAmountMinor: number;
  status: BudgetStatus;
  percentageUsed: number;
  isWithinBudget: boolean;
  itemBreakdown: {
    productId: string;
    label: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  budgetAnalysis: BudgetAnalysis;
  missingItems?: string[];
}

export async function executeCalculateBudget(
  rawArgs: unknown
): Promise<CalculateBudgetToolOutput> {
  const args = calculateBudgetSchema.parse(rawArgs);

  const budgetLimitMinor = Math.round(args.budgetLimit * 100);
  let totalCostMinor = 0;
  const breakdown: CalculateBudgetToolOutput["itemBreakdown"] = [];
  const missingItems: string[] = [];

  for (const item of args.items) {
    const product = await getProductByIdOrSlug(item.productId);
    if (!product) {
      missingItems.push(item.productId);
      continue;
    }

    const qty = Math.max(1, item.quantity || 1);
    const itemSubtotalMinor = product.priceMinor * qty;
    totalCostMinor += itemSubtotalMinor;

    breakdown.push({
      productId: product.id,
      label: product.name,
      quantity: qty,
      unitPrice: product.price,
      totalPrice: Number((itemSubtotalMinor / 100).toFixed(2)),
    });
  }

  const totalCost = Number((totalCostMinor / 100).toFixed(2));
  const differenceMinor = budgetLimitMinor - totalCostMinor;
  const remainingAmount = Number((differenceMinor / 100).toFixed(2));

  let status: BudgetStatus;
  if (differenceMinor > 0) {
    status = "under_budget";
  } else if (differenceMinor === 0) {
    status = "within_budget";
  } else {
    status = "slightly_over";
  }

  const percentageUsed =
    args.budgetLimit > 0
      ? Math.min(200, Math.round((totalCostMinor / budgetLimitMinor) * 100))
      : 100;

  const budgetAnalysis: BudgetAnalysis = {
    total: totalCost,
    budget: args.budgetLimit,
    status,
    difference: Math.abs(remainingAmount),
    breakdown: breakdown.map((b) => ({
      label: b.quantity > 1 ? `${b.label} (x${b.quantity})` : b.label,
      amount: b.totalPrice,
    })),
  };

  return {
    budgetLimit: args.budgetLimit,
    totalCost,
    totalCostMinor,
    remainingAmount,
    remainingAmountMinor: differenceMinor,
    status,
    percentageUsed,
    isWithinBudget: status !== "slightly_over",
    itemBreakdown: breakdown,
    budgetAnalysis,
    missingItems: missingItems.length > 0 ? missingItems : undefined,
  };
}
