"use client";

import { useShoppingCart } from "@/features/shopping/context/cart-context";
import { ChatMessage } from "@/features/shopping/types";
import { Check, Columns2, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { BudgetAnalysisCard } from "./budget-analysis-card";
import { ProductGrid } from "./product-grid";

interface ChatMessageItemProps {
  message: ChatMessage;
  onSelectPrompt?: (prompt: string) => void;
}

export function ChatMessageItem({
  message,
  onSelectPrompt,
}: ChatMessageItemProps) {
  const { addBulkToCart, compareProductsBatch } = useShoppingCart();
  const [addingAll, setAddingAll] = useState(false);

  if (message.sender === "user") {
    return (
      <div className="flex justify-end py-2">
        <div className="max-w-xl rounded-2xl rounded-tr-xs bg-[#211B2E] px-5 py-3 text-sm leading-relaxed text-white shadow-xs">
          {message.text}
        </div>
      </div>
    );
  }

  const products = message.recommendedProducts || [];
  const compareTarget =
    message.comparisonProducts && message.comparisonProducts.length > 0
      ? message.comparisonProducts
      : products;

  const sourceLabel =
    message.source === "ai"
      ? "AI Recommendation"
      : message.source === "fallback"
        ? "Verified Catalog Search"
        : null;

  const handleAddAll = async () => {
    if (products.length === 0) return;
    setAddingAll(true);
    try {
      await addBulkToCart(
        products.map((product) => ({ productId: product.id, quantity: 1 }))
      );
    } finally {
      setTimeout(() => setAddingAll(false), 1200);
    }
  };

  return (
    <div className="max-w-3xl space-y-4 py-3">
      {/* Header & Source Label */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 size-7 shrink-0 rounded-full agentcart-orb-sm" />

        <div className="flex-1 space-y-1.5">
          {sourceLabel && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#6D45D9]">
              <Sparkles className="size-3" />
              <span>{sourceLabel}</span>
            </div>
          )}
          <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#211B2E] whitespace-pre-line">
            {message.text}
          </p>
        </div>
      </div>

      {/* Clarification Chips */}
      {message.clarificationOptions && message.clarificationOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-10 pt-0.5">
          {message.clarificationOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelectPrompt?.(option)}
              className="cursor-pointer rounded-xl border border-[#EAE6F2] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#211B2E] transition-all hover:border-[#6D45D9]/40 hover:bg-[#F2EDFC] hover:text-[#5125A8] shadow-2xs"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Budget Analysis Card */}
      {message.budgetAnalysis && (
        <div className="pl-10 pt-1">
          <BudgetAnalysisCard analysis={message.budgetAnalysis} />
        </div>
      )}

      {/* Recommended Products Grid */}
      {products.length > 0 && (
        <div className="space-y-3 pl-10 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE6F2] pb-3">
            <span className="text-xs font-semibold text-[#777181]">
              Curated setup ({products.length}{" "}
              {products.length === 1 ? "piece" : "pieces"})
            </span>

            <div className="flex items-center gap-2">
              {compareTarget.length >= 2 && (
                <button
                  type="button"
                  onClick={() => compareProductsBatch(compareTarget)}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-[#EAE6F2] bg-white px-3 text-xs font-semibold text-[#211B2E] transition-all hover:border-[#6D45D9] hover:bg-[#F2EDFC] hover:text-[#5125A8]"
                >
                  <Columns2 className="size-3.5 text-[#6D45D9]" />
                  <span>Compare setup</span>
                </button>
              )}

              <button
                type="button"
                disabled={addingAll}
                onClick={handleAddAll}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-[#5125A8] px-3.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#431E8C] disabled:opacity-60"
              >
                {addingAll ? (
                  <>
                    <Check className="size-3.5" />
                    <span>Added to cart</span>
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5" />
                    <span>Add all to cart</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <ProductGrid products={products} />
        </div>
      )}

      {/* Follow-up Prompts */}
      {message.suggestedQueries && message.suggestedQueries.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-10 pt-2">
          {message.suggestedQueries.map((query) => (
            <button
              key={query}
              type="button"
              onClick={() => onSelectPrompt?.(query)}
              className="cursor-pointer rounded-full border border-[#EAE6F2] bg-white px-3.5 py-1 text-xs text-[#777181] transition-all hover:border-[#6D45D9]/40 hover:bg-[#F2EDFC] hover:text-[#5125A8]"
            >
              {query}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
