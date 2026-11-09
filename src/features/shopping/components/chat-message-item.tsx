"use client";

import React from "react";
import { Sparkles, User, SlidersHorizontal } from "lucide-react";
import { ChatMessage } from "../types";
import { BudgetAnalysisCard } from "./budget-analysis-card";
import { ProductGrid } from "./product-grid";
import { Button } from "@/components/ui/button";
import { useShoppingCart } from "../context/cart-context";

interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const { toggleCompare, openCompareModal } = useShoppingCart();
  const isAssistant = message.sender === "assistant";

  const handleCompareAll = () => {
    if (message.comparisonProducts && message.comparisonProducts.length > 0) {
      message.comparisonProducts.forEach((p) => toggleCompare(p));
      openCompareModal();
    }
  };

  return (
    <div className={`flex w-full gap-3.5 py-4 ${isAssistant ? "items-start" : "items-start justify-end"}`}>
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#0f766e] text-white shadow-xs">
          <Sparkles className="size-4" />
        </div>
      )}

      {/* Message Content Container */}
      <div className={`flex max-w-3xl flex-col ${isAssistant ? "items-start" : "items-end"}`}>
        {/* Meta Bar */}
        <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-[#727b76]">
          <span className="font-semibold text-[#202522]">
            {isAssistant ? "AgentCart Assistant" : "You"}
          </span>
          <span>·</span>
          <span>{message.timestamp}</span>
        </div>

        {/* Text Container */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isAssistant
              ? "border border-[#e8ece9] bg-white text-[#202522] shadow-xs"
              : "bg-[#eaf5f2] text-[#202522] border border-[#0f766e]/15"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>

        {/* Budget Analysis Widget if attached */}
        {message.budgetAnalysis && (
          <div className="w-full">
            <BudgetAnalysisCard analysis={message.budgetAnalysis} />
          </div>
        )}

        {/* Product Recommendations Grid if attached */}
        {message.recommendedProducts && message.recommendedProducts.length > 0 && (
          <div className="mt-4 w-full">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#202522]">
                Recommended Products ({message.recommendedProducts.length})
              </span>
              {message.comparisonProducts && message.comparisonProducts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCompareAll}
                  className="h-7 gap-1 border-[#0f766e]/20 bg-[#eaf5f2] text-xs font-medium text-[#0f766e] hover:bg-[#eaf5f2]/80"
                >
                  <SlidersHorizontal className="size-3" />
                  <span>Compare Key Options</span>
                </Button>
              )}
            </div>

            <ProductGrid products={message.recommendedProducts} />
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-[#e8ece9] bg-[#f8faf9] text-[#202522]">
          <User className="size-4" />
        </div>
      )}
    </div>
  );
}
