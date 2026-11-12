"use client";

import { Button } from "@/components/ui/button";
import { sendShoppingInquiry } from "@/features/agent/services/shopping-client";
import {
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShoppingCart } from "../context/cart-context";
import {
  MOCK_EXAMPLE_PROMPTS,
  getMockResponseForPrompt,
} from "../data/mock-products";
import { ChatMessage, Product } from "../types";
import { CartDrawer } from "./cart-drawer";
import { ChatComposer } from "./chat-composer";
import { ChatMessageItem } from "./chat-message-item";
import { ProductComparisonModal } from "./product-comparison-modal";
import { ProductDetailsDialog } from "./product-details-dialog";

let messageSeq = 0;
function createMessageId(prefix: string): string {
  messageSeq += 1;
  return `${prefix}-${messageSeq}`;
}

export function ShoppingWorkspace() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const {
    comparingProducts,
    openCompareModal,
    clearCart,
    refreshCart,
  } = useShoppingCart();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const queryAiShoppingAgent = useCallback(
    async (
      queryText: string,
      historyMessages: ChatMessage[] = []
    ): Promise<{
      text: string;
      type: "recommendation" | "clarification" | "message" | "error";
      source?: "ai" | "fallback" | "clarification";
      products?: Product[];
      comparison?: Product[];
      budget?: ChatMessage["budgetAnalysis"];
      clarificationOptions?: string[];
      suggestedQueries?: string[];
    }> => {
      try {
        const historyPayload = historyMessages.map((m) => ({
          role: (m.sender === "user" ? "user" : "assistant") as
            | "user"
            | "assistant",
          content: m.text,
        }));

        const result = await sendShoppingInquiry({
          message: queryText.trim(),
          history: historyPayload,
          sessionId: "session-1",
        });

        return {
          text: result.message,
          type: result.type,
          source: result.source || "ai",
          products: result.recommendedProducts,
          comparison: result.comparisonProducts,
          budget: result.budgetAnalysis,
          clarificationOptions: result.clarificationOptions,
          suggestedQueries: result.suggestedQueries,
        };
      } catch (err: unknown) {
        console.warn(
          "AI shopping agent call failed, using graceful fallback:",
          err
        );
        const fallback = getMockResponseForPrompt(queryText);
        return {
          text: fallback.text,
          type: "recommendation",
          source: "fallback",
          products: fallback.products,
          comparison: fallback.comparison,
          budget: fallback.budget,
        };
      }
    },
    []
  );

  // Initialize session on mount or if query changes
  useEffect(() => {
    let isCancelled = false;

    async function initMessages() {
      if (!initialQuery) return;

      setIsTyping(true);

      const userMsg: ChatMessage = {
        id: createMessageId("user"),
        sender: "user",
        timestamp: "Just now",
        text: initialQuery,
      };

      const rec = await queryAiShoppingAgent(initialQuery);
      if (isCancelled) return;

      const assistMsg: ChatMessage = {
        id: createMessageId("assist"),
        sender: "assistant",
        timestamp: "Just now",
        text: rec.text,
        type: rec.type,
        source: rec.source,
        recommendedProducts: rec.products,
        comparisonProducts: rec.comparison,
        budgetAnalysis: rec.budget,
        clarificationOptions: rec.clarificationOptions,
        suggestedQueries: rec.suggestedQueries,
      };

      setMessages([userMsg, assistMsg]);
      setIsTyping(false);
    }

    initMessages();

    return () => {
      isCancelled = true;
    };
  }, [initialQuery, queryAiShoppingAgent]);

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: createMessageId("user"),
      sender: "user",
      timestamp: "Just now",
      text,
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsTyping(true);

    try {
      const rec = await queryAiShoppingAgent(text, updatedHistory);

      const assistantMsg: ChatMessage = {
        id: createMessageId("assist"),
        sender: "assistant",
        timestamp: "Just now",
        text: rec.text,
        type: rec.type,
        source: rec.source,
        recommendedProducts: rec.products,
        comparisonProducts: rec.comparison,
        budgetAnalysis: rec.budget,
        clarificationOptions: rec.clarificationOptions,
        suggestedQueries: rec.suggestedQueries,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: createMessageId("assist-error"),
        sender: "assistant",
        timestamp: "Just now",
        text: "I encountered a problem contacting the AI shopping service. Please try again or rephrase your request.",
        type: "error",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewSession = async () => {
    setMessages([]);
    try {
      await fetch("/api/demo/reset", { method: "POST" });
      await clearCart();
      refreshCart();
    } catch {
      // silent — reset is best-effort
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden bg-white">
      {/* Sub-bar / Context & Session Controls */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#e5e9e7] bg-white px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0a5c55] opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-[#0a5c55]" />
          </span>
          <span className="text-xs font-medium text-[#7a8580]">
            AI Shopping Assistant
          </span>
          <span className="hidden text-xs text-[#b0b8b4] sm:inline">
            · Connected to verified MongoDB catalog
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Compare trigger */}
          {comparingProducts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={openCompareModal}
              className="h-7.5 gap-1.5 rounded-full border-[#0a5c55]/20 bg-[#edf7f5] text-xs font-semibold text-[#0a5c55] hover:bg-[#edf7f5]/80"
            >
              <SlidersHorizontal className="size-3" />
              <span>Compare ({comparingProducts.length})</span>
            </Button>
          )}

          {/* New chat reset button */}
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewSession}
              className="h-7.5 gap-1.5 rounded-full border-[#e5e9e7] text-xs text-[#525b56] hover:border-[#0a5c55] hover:text-[#0a5c55]"
              title="New conversation"
            >
              <RotateCcw className="size-3" />
              <span>New chat</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main chat stream area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          {messages.length === 0 ? (
            /* Centered Empty / Welcome State */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#edf7f5] text-[#0a5c55] shadow-2xs">
                <Sparkles className="size-7" />
              </div>

              <h2 className="mt-5 text-2xl sm:text-3xl font-bold tracking-tight text-[#111817]">
                What are you shopping for?
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-[#7a8580]">
                Describe your goals and target budget in natural language. AgentCart will search the catalog, analyze costs, and recommend the best fit.
              </p>

              <div className="mt-8 w-full max-w-xl">
                <p className="mb-3 text-[11px] font-semibold tracking-wider uppercase text-[#9ca5a0]">
                  Suggested inquiries
                </p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {MOCK_EXAMPLE_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-[#e5e9e7] bg-[#fafafa] px-4 py-3.5 text-left text-xs font-medium text-[#111817] transition-all hover:border-[#0a5c55] hover:bg-[#edf7f5] hover:text-[#0a5c55]"
                    >
                      <span className="line-clamp-2">{prompt}</span>
                      <ArrowRight className="size-3.5 shrink-0 text-[#7a8580] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0a5c55]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Conversation Message Thread */
            <div className="space-y-2">
              {messages.map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  onSelectPrompt={handleSendMessage}
                />
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start gap-3 py-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-[#edf7f5] text-[#0a5c55]">
                    <Sparkles className="size-3.5 animate-spin" />
                  </div>
                  <div className="rounded-2xl border border-[#e5e9e7] bg-white px-4 py-2.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs text-[#7a8580]">
                      <span>Curating picks</span>
                      <span className="flex gap-1">
                        <span className="size-1.5 rounded-full bg-[#0a5c55] animate-bounce" />
                        <span className="size-1.5 rounded-full bg-[#0a5c55] animate-bounce [animation-delay:0.2s]" />
                        <span className="size-1.5 rounded-full bg-[#0a5c55] animate-bounce [animation-delay:0.4s]" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Pinned Bottom Composer */}
      <div className="border-t border-[#e5e9e7] bg-[#fafafa] px-4 py-3.5 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <ChatComposer
            onSendMessage={handleSendMessage}
            isLoading={isTyping}
          />
          <p className="mt-2 text-center text-[11px] text-[#9ca5a0]">
            AgentCart uses verified MongoDB product catalog data · Never invents prices or stock
          </p>
        </div>
      </div>

      {/* Product Details & Comparison Modals */}
      <ProductDetailsDialog />
      <ProductComparisonModal />

      {/* Shopping Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
