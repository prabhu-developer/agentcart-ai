"use client";

import { useShoppingCart } from "@/features/shopping/context/cart-context";
import { ChatMessage } from "@/features/shopping/types";
import { Check, Plus, Scale, Sparkles } from "lucide-react";
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
        <div className="max-w-xl rounded-2xl rounded-tr-xs bg-[#111817] px-4.5 py-3 text-sm leading-relaxed text-white shadow-sm">
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
        ? "Catalog Search"
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
      <div className="space-y-1.5">
        {sourceLabel && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-[#0a5c55]">
            <Sparkles className="size-3" />
            <span>{sourceLabel}</span>
          </div>
        )}
        <p className="text-[15px] leading-relaxed text-[#111817] whitespace-pre-line">
          {message.text}
        </p>
      </div>

      {/* Clarification Chips */}
      {message.clarificationOptions && message.clarificationOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-0.5">
          {message.clarificationOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelectPrompt?.(option)}
              className="cursor-pointer rounded-full border border-[#e5e9e7] bg-white px-3.5 py-1.5 text-xs font-medium text-[#111817] transition-all hover:border-[#0a5c55] hover:bg-[#edf7f5] hover:text-[#0a5c55] shadow-2xs"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Budget Analysis Card */}
      {message.budgetAnalysis && (
        <div className="pt-1">
          <BudgetAnalysisCard analysis={message.budgetAnalysis} />
        </div>
      )}

      {/* Recommended Products */}
      {products.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f4f6f5] pb-2.5">
            <span className="text-xs font-medium text-[#7a8580]">
              Curated {products.length}{" "}
              {products.length === 1 ? "piece" : "pieces"}
            </span>

            <div className="flex items-center gap-2">
              {compareTarget.length >= 2 && (
                <button
                  type="button"
                  onClick={() => compareProductsBatch(compareTarget)}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[#e5e9e7] bg-white px-3 text-xs font-medium text-[#374040] transition-all hover:border-[#0a5c55] hover:text-[#0a5c55]"
                >
                  <Scale className="size-3.5" />
                  <span>Compare</span>
                </button>
              )}

              <button
                type="button"
                disabled={addingAll}
                onClick={handleAddAll}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#0a5c55] px-3.5 text-xs font-medium text-white transition-all hover:bg-[#084f49] disabled:opacity-60 shadow-2xs"
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
        <div className="flex flex-wrap gap-2 pt-2">
          {message.suggestedQueries.map((query) => (
            <button
              key={query}
              type="button"
              onClick={() => onSelectPrompt?.(query)}
              className="cursor-pointer rounded-full border border-[#e5e9e7] bg-[#fafafa] px-3.5 py-1.5 text-xs text-[#525b56] transition-all hover:border-[#0a5c55] hover:bg-white hover:text-[#0a5c55]"
            >
              {query}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
