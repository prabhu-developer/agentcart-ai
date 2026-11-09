"use client";

import React, { useState } from "react";
import {
  Sparkles,
  User,
  SlidersHorizontal,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { ChatMessage } from "../types";
import { BudgetAnalysisCard } from "./budget-analysis-card";
import { ProductGrid } from "./product-grid";
import { Button } from "@/components/ui/button";
import { useShoppingCart } from "../context/cart-context";

interface ChatMessageItemProps {
  message: ChatMessage;
  onSelectPrompt?: (prompt: string) => void;
}

export function ChatMessageItem({ message, onSelectPrompt }: ChatMessageItemProps) {
  const { toggleCompare, openCompareModal, addBulkToCart, openCart } = useShoppingCart();
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [addedAll, setAddedAll] = useState(false);

  const isAssistant = message.sender === "assistant";
  const isError = message.type === "error";

  const handleCompareAll = () => {
    if (message.comparisonProducts && message.comparisonProducts.length > 0) {
      message.comparisonProducts.forEach((p) => toggleCompare(p));
      openCompareModal();
    }
  };

  const handleAddAllToCart = async () => {
    if (message.recommendedProducts && message.recommendedProducts.length > 0) {
      setIsAddingAll(true);
      const bulkItems = message.recommendedProducts.map((p) => ({
        productId: p.id,
        quantity: 1,
      }));
      const success = await addBulkToCart(bulkItems);
      setIsAddingAll(false);
      if (success) {
        setAddedAll(true);
        setTimeout(() => {
          openCart();
        }, 300);
      }
    }
  };

  return (
    <div
      className={`flex w-full gap-3.5 py-4 ${
        isAssistant ? "items-start" : "items-start justify-end"
      }`}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-xl shadow-xs ${
            isError ? "bg-red-500 text-white" : "bg-[#0f766e] text-white"
          }`}
        >
          {isError ? <AlertCircle className="size-4" /> : <Sparkles className="size-4" />}
        </div>
      )}

      {/* Message Content Container */}
      <div
        className={`flex max-w-3xl flex-col ${
          isAssistant ? "items-start" : "items-end"
        }`}
      >
        {/* Meta Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-1 px-1 text-[11px] text-[#727b76]">
          <span className="font-semibold text-[#202522]">
            {isAssistant ? "AgentCart Assistant" : "You"}
          </span>
          <span>·</span>
          <span>{message.timestamp}</span>

          {isAssistant && message.source === "ai" && (
            <span className="inline-flex items-center gap-1 rounded-md border border-[#0f766e]/20 bg-[#eaf5f2] px-1.5 py-0.5 text-[10px] font-semibold text-[#0f766e]">
              <Sparkles className="size-2.5" />
              <span>OpenRouter AI · Live Catalog Tools</span>
            </span>
          )}

          {isAssistant && message.source === "fallback" && (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
              <span className="size-1.5 rounded-full bg-amber-500" />
              <span>Deterministic Engine · Live MongoDB</span>
            </span>
          )}

          {isAssistant && message.source === "clarification" && (
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
              <span>Clarification Needed</span>
            </span>
          )}
        </div>

        {/* Text Container */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isAssistant
              ? isError
                ? "border border-red-200 bg-red-50 text-red-900 shadow-xs"
                : "border border-[#e8ece9] bg-white text-[#202522] shadow-xs"
              : "bg-[#eaf5f2] text-[#202522] border border-[#0f766e]/15"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>

        {/* Clarification Options Pills (Quick replies for vague or ambiguous questions) */}
        {message.clarificationOptions && message.clarificationOptions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.clarificationOptions.map((option, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPrompt?.(option)}
                className="flex items-center gap-1.5 rounded-xl border border-[#0f766e]/20 bg-[#eaf5f2] px-3 py-1.5 text-xs font-semibold text-[#0f766e] transition-colors hover:bg-[#0f766e] hover:text-white"
              >
                <span>{option}</span>
                <ArrowRight className="size-3" />
              </button>
            ))}
          </div>
        )}

        {/* Budget Analysis Widget if attached */}
        {message.budgetAnalysis && (
          <div className="w-full">
            <BudgetAnalysisCard analysis={message.budgetAnalysis} />
          </div>
        )}

        {/* Product Recommendations Grid if attached */}
        {message.recommendedProducts && message.recommendedProducts.length > 0 && (
          <div className="mt-4 w-full">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#202522]">
                Verified Catalog Recommendations ({message.recommendedProducts.length})
              </span>

              <div className="flex items-center gap-2">
                {message.comparisonProducts && message.comparisonProducts.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCompareAll}
                    className="h-7 gap-1 border-[#0f766e]/20 bg-[#eaf5f2] text-xs font-medium text-[#0f766e] hover:bg-[#eaf5f2]/80"
                  >
                    <SlidersHorizontal className="size-3" />
                    <span>Compare Matrix</span>
                  </Button>
                )}

                {/* Explicit Approval Boundary: Add All to Cart */}
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAddAllToCart}
                  disabled={addedAll || isAddingAll}
                  className="h-7 gap-1 bg-[#0f766e] text-xs font-medium text-white hover:bg-[#115e59]"
                >
                  {isAddingAll ? (
                    <>
                      <Sparkles className="size-3 animate-spin" />
                      <span>Verifying & Adding...</span>
                    </>
                  ) : addedAll ? (
                    <>
                      <CheckCircle2 className="size-3 text-emerald-300" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="size-3" />
                      <span>Add Setup to Cart</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <ProductGrid products={message.recommendedProducts} />
          </div>
        )}

        {/* Follow-up suggestions */}
        {message.suggestedQueries && message.suggestedQueries.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-[#727b76]">
            <span className="font-medium">Suggestions:</span>
            {message.suggestedQueries.map((query, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPrompt?.(query)}
                className="rounded-lg border border-[#e8ece9] bg-[#f8faf9] px-2 py-0.5 text-[#202522] transition-colors hover:border-[#0f766e]/40 hover:bg-[#eaf5f2] hover:text-[#0f766e]"
              >
                {query}
              </button>
            ))}
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
