"use client";

import { useState } from "react";
import { Check, Plus, Scale } from "lucide-react";
import { ChatMessage } from "@/features/shopping/types";
import { useShoppingCart } from "@/features/shopping/context/cart-context";
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
      <div className="flex justify-end">
        <div className="max-w-xl rounded-2xl rounded-tr-sm bg-[#181c1a] px-4 py-2.5 text-sm leading-relaxed text-white">
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
      ? "AI"
      : message.source === "fallback"
        ? "Catalog Match"
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
    <div className="max-w-4xl space-y-4">
      <div className="space-y-1.5">
        {sourceLabel && (
          <p className="text-[10px] font-medium tracking-wider text-[#727b76] uppercase">
            {sourceLabel}
          </p>
        )}
        <p className="max-w-2xl text-[15px] leading-relaxed text-[#181c1a] whitespace-pre-line">
          {message.text}
        </p>
      </div>

      {message.clarificationOptions && message.clarificationOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {message.clarificationOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelectPrompt?.(option)}
              className="cursor-pointer rounded-full border border-[#dce2de] bg-white px-3.5 py-1.5 text-xs font-medium text-[#181c1a] transition-colors hover:border-[#0f766e] hover:bg-[#f0f7f5] hover:text-[#0f766e]"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {message.budgetAnalysis && (
        <div className="max-w-2xl">
          <BudgetAnalysisCard analysis={message.budgetAnalysis} />
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#727b76]">
              Recommended · {products.length}{" "}
              {products.length === 1 ? "item" : "items"}
            </span>

            <div className="flex items-center gap-2">
              {compareTarget.length >= 2 && (
                <button
                  type="button"
                  onClick={() => compareProductsBatch(compareTarget)}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[#dce2de] bg-white px-3 text-xs font-medium text-[#181c1a] transition-colors hover:border-[#0f766e] hover:text-[#0f766e]"
                >
                  <Scale className="size-3.5" />
                  <span>Compare</span>
                </button>
              )}

              <button
                type="button"
                disabled={addingAll}
                onClick={handleAddAll}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#0f766e] px-3.5 text-xs font-medium text-white transition-colors hover:bg-[#0d655e] disabled:opacity-60"
              >
                {addingAll ? (
                  <>
                    <Check className="size-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5" />
                    <span>Add all</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <ProductGrid products={products} />
        </div>
      )}

      {message.suggestedQueries && message.suggestedQueries.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {message.suggestedQueries.map((query) => (
            <button
              key={query}
              type="button"
              onClick={() => onSelectPrompt?.(query)}
              className="cursor-pointer rounded-full border border-[#e8ece9] bg-[#f8faf9] px-3 py-1.5 text-xs text-[#4b544f] transition-colors hover:border-[#0f766e]/40 hover:bg-white hover:text-[#0f766e]"
            >
              {query}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
