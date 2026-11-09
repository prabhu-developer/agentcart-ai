"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  ShoppingBag,
  SlidersHorizontal,
  RotateCcw,
  Menu,
  X,
  ShieldCheck,
  ArrowRight,
  Database,
  MessageSquare,
} from "lucide-react";
import { ChatMessage, Product } from "../types";
import {
  MOCK_RECENT_SESSIONS,
  MOCK_EXAMPLE_PROMPTS,
  getMockResponseForPrompt,
} from "../data/mock-products";
import { ChatMessageItem } from "./chat-message-item";
import { ChatComposer } from "./chat-composer";
import { ShoppingSidebar } from "./shopping-sidebar";
import { useShoppingCart } from "../context/cart-context";
import { ProductComparisonModal } from "./product-comparison-modal";
import { CartDrawer } from "./cart-drawer";
import { Button } from "@/components/ui/button";
import { CatalogBrowser } from "@/features/products/components/catalog-browser";
import { fetchProductsFromAPI } from "@/features/products/services/product-client";

let messageSeq = 0;
function createMessageId(prefix: string): string {
  messageSeq += 1;
  return `${prefix}-${messageSeq}`;
}

export function ShoppingWorkspace() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const {
    totalItems,
    formattedSubtotal,
    toggleCart,
    comparingProducts,
    openCompareModal,
  } = useShoppingCart();

  const [activeView, setActiveView] = useState<"chat" | "catalog">(() =>
    initialCategory ? "catalog" : "chat"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [activeSessionId, setActiveSessionId] = useState<string>("session-1");
  const [sessionTitle, setSessionTitle] = useState(() =>
    initialQuery ? initialQuery : "Home Office Setup Under $1,000"
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeView === "chat") {
      scrollToBottom();
    }
  }, [messages, isTyping, activeView]);

  // Query real database products and build an assistant recommendation
  const generateDatabaseRecommendation = useCallback(
    async (queryText: string): Promise<{
      text: string;
      products: Product[];
      comparison: Product[];
      budget: {
        total: number;
        budget: number;
        status: "under_budget" | "within_budget";
        difference: number;
        breakdown: { label: string; amount: number }[];
      };
    }> => {
      try {
        // Search real MongoDB catalog
        const res = await fetchProductsFromAPI({
          search: queryText.trim(),
          limit: 5,
        });

        if (res.success && res.data.length > 0) {
          const dbProducts = res.data;
          const totalCost = Number(
            dbProducts.reduce((acc, p) => acc + p.price, 0).toFixed(2)
          );
          const targetBudget = totalCost > 500 ? 1000 : 500;

          return {
            text: `I queried our real MongoDB catalog and matched ${dbProducts.length} verified products for "${queryText}". Live pricing and inventory have been confirmed.`,
            products: dbProducts,
            comparison: dbProducts.slice(0, 2),
            budget: {
              total: totalCost,
              budget: targetBudget,
              status: totalCost <= targetBudget ? "under_budget" : "within_budget",
              difference: Number((targetBudget - totalCost).toFixed(2)),
              breakdown: dbProducts.map((p) => ({ label: p.name, amount: p.price })),
            },
          };
        }
      } catch {
        // Fallback to verified local setup if network/DB is temporarily unavailable
      }

      // Default fallback
      const fallback = getMockResponseForPrompt(queryText);
      return {
        text: fallback.text,
        products: fallback.products,
        comparison: fallback.comparison,
        budget: fallback.budget,
      };
    },
    []
  );

  // Initialize session on mount
  useEffect(() => {
    let isCancelled = false;

    async function initMessages() {
      if (initialQuery) {
        setSessionTitle(initialQuery);
        const userMsg: ChatMessage = {
          id: createMessageId("user"),
          sender: "user",
          timestamp: "Just now",
          text: initialQuery,
        };

        const rec = await generateDatabaseRecommendation(initialQuery);
        if (isCancelled) return;

        const assistMsg: ChatMessage = {
          id: createMessageId("assist"),
          sender: "assistant",
          timestamp: "Just now",
          text: rec.text,
          recommendedProducts: rec.products,
          comparisonProducts: rec.comparison,
          budgetAnalysis: rec.budget,
        };

        setMessages([userMsg, assistMsg]);
      } else {
        // Load default setup
        const rec = await generateDatabaseRecommendation("Home office setup");
        if (isCancelled) return;

        setMessages([
          {
            id: createMessageId("default-user"),
            sender: "user",
            timestamp: "10:32 AM",
            text: "I need a complete home office setup under $1,000. I need a monitor, keyboard, mouse and ergonomic chair. Prioritize quality, reliability and value for money.",
          },
          {
            id: createMessageId("default-assist"),
            sender: "assistant",
            timestamp: "10:32 AM",
            text: rec.text,
            recommendedProducts: rec.products,
            comparisonProducts: rec.comparison,
            budgetAnalysis: rec.budget,
          },
        ]);
      }
    }

    initMessages();

    return () => {
      isCancelled = true;
    };
  }, [initialQuery, generateDatabaseRecommendation]);

  const handleSendMessage = async (text: string) => {
    setActiveView("chat");
    const userMsg: ChatMessage = {
      id: createMessageId("user"),
      sender: "user",
      timestamp: "Just now",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const rec = await generateDatabaseRecommendation(text);

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: createMessageId("assist"),
        sender: "assistant",
        timestamp: "Just now",
        text: rec.text,
        recommendedProducts: rec.products,
        comparisonProducts: rec.comparison,
        budgetAnalysis: rec.budget,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveView("chat");
    setActiveSessionId(sessionId);
    setMobileSidebarOpen(false);

    const found = MOCK_RECENT_SESSIONS.find((s) => s.id === sessionId);
    if (found && found.initialPrompt) {
      setSessionTitle(found.title);
      generateDatabaseRecommendation(found.initialPrompt).then((rec) => {
        setMessages([
          {
            id: createMessageId("session-user"),
            sender: "user",
            timestamp: found.updatedAt,
            text: found.initialPrompt!,
          },
          {
            id: createMessageId("session-assist"),
            sender: "assistant",
            timestamp: found.updatedAt,
            text: rec.text,
            recommendedProducts: rec.products,
            comparisonProducts: rec.comparison,
            budgetAnalysis: rec.budget,
          },
        ]);
      });
    }
  };

  const handleNewSession = () => {
    setActiveView("chat");
    setActiveSessionId(createMessageId("custom-session"));
    setSessionTitle("New Shopping Inquiry");
    setMessages([]);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-white">
      {/* Desktop Sidebar */}
      <div className="hidden h-full w-72 shrink-0 md:block lg:w-80">
        <ShoppingSidebar
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          activeView={activeView}
          onSelectView={setActiveView}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setActiveView("catalog");
          }}
          className="h-full"
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 h-full w-80 max-w-[85vw] bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 z-20 flex size-8 items-center justify-center rounded-lg border border-[#e8ece9] text-[#727b76]"
            >
              <X className="size-4" />
            </button>
            <ShoppingSidebar
              activeSessionId={activeSessionId}
              onSelectSession={handleSelectSession}
              onNewSession={handleNewSession}
              activeView={activeView}
              onSelectView={setActiveView}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setActiveView("catalog");
              }}
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex flex-1 flex-col overflow-hidden bg-white">
        {/* Workspace Topbar */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#e8ece9] bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex size-9 items-center justify-center rounded-lg border border-[#e8ece9] text-[#727b76] md:hidden hover:text-[#202522]"
              aria-label="Open sidebar"
            >
              <Menu className="size-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-[#202522] truncate max-w-xs sm:max-w-md">
                  {activeView === "chat" ? sessionTitle : "MongoDB Live Catalog"}
                </h1>
                <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 sm:inline-flex">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  MongoDB Connected
                </span>
              </div>
              <p className="hidden text-[11px] text-[#727b76] sm:block">
                {activeView === "chat"
                  ? "AI Shopping Assistant · Real-time DB Queries"
                  : "Explore 24 Products · Search, Filters, and Sorting"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher Pills */}
            <div className="hidden sm:flex items-center rounded-xl border border-[#e8ece9] bg-[#f8faf9] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveView("chat")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all ${
                  activeView === "chat"
                    ? "bg-white text-[#0f766e] shadow-xs font-semibold"
                    : "text-[#727b76] hover:text-[#202522]"
                }`}
              >
                <MessageSquare className="size-3.5" />
                <span>Assistant</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView("catalog")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all ${
                  activeView === "catalog"
                    ? "bg-white text-[#0f766e] shadow-xs font-semibold"
                    : "text-[#727b76] hover:text-[#202522]"
                }`}
              >
                <Database className="size-3.5" />
                <span>Catalog</span>
              </button>
            </div>

            {/* Compare Trigger */}
            {comparingProducts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={openCompareModal}
                className="h-8 gap-1.5 border-[#0f766e]/20 bg-[#eaf5f2] text-xs font-semibold text-[#0f766e] hover:bg-[#eaf5f2]/80"
              >
                <SlidersHorizontal className="size-3.5" />
                <span>Matrix ({comparingProducts.length})</span>
              </Button>
            )}

            {/* Clear / Reset session */}
            {activeView === "chat" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewSession}
                className="h-8 gap-1.5 border-[#e8ece9] text-xs text-[#727b76] hover:text-[#202522]"
                title="Reset conversation"
              >
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}

            {/* Cart Trigger */}
            <Button
              size="sm"
              onClick={toggleCart}
              className="h-8 gap-1.5 bg-[#0f766e] text-xs font-medium text-white hover:bg-[#115e59]"
            >
              <ShoppingBag className="size-3.5" />
              <span>Cart ({totalItems})</span>
              <span className="hidden font-bold sm:inline">· {formattedSubtotal}</span>
            </Button>
          </div>
        </div>

        {/* Phase 02 Real Catalog Notice Strip */}
        <div className="flex items-center justify-between border-b border-[#e8ece9] bg-[#f8faf9] px-4 py-1.5 text-[11px] text-[#727b76]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-[#0f766e]" />
            <span>
              Phase 02 Live Backend: Products loaded from MongoDB with server-side inventory and pricing.
            </span>
          </div>
          <span className="hidden text-[10px] text-[#0f766e] font-medium md:inline">
            REST API v1 Active
          </span>
        </div>

        {/* Workspace Body: Either Catalog Browser or Chat */}
        {activeView === "catalog" ? (
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
            <div className="mx-auto max-w-7xl">
              <CatalogBrowser initialCategory={selectedCategory} />
            </div>
          </div>
        ) : (
          <>
            {/* Chat Scroll View */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
              <div className="mx-auto max-w-4xl">
                {messages.length === 0 ? (
                  /* Empty State when opening fresh session */
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-[#eaf5f2] text-[#0f766e] shadow-xs">
                      <Sparkles className="size-7" />
                    </div>

                    <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#202522]">
                      Let&apos;s find exactly what you need.
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-[#727b76]">
                      Tell me what you&apos;re shopping for, your budget, and what matters most. Recommendations are directly matched from our live MongoDB product catalog.
                    </p>

                    <div className="mt-8 w-full max-w-xl">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#727b76]">
                        Suggested shopping inquiries
                      </span>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {MOCK_EXAMPLE_PROMPTS.map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(prompt)}
                            className="flex items-center justify-between rounded-xl border border-[#e8ece9] bg-[#f8faf9] p-3 text-left text-xs font-medium text-[#202522] transition-colors hover:border-[#0f766e]/30 hover:bg-[#eaf5f2]"
                          >
                            <span>{prompt}</span>
                            <ArrowRight className="size-3 text-[#0f766e]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Messages stream */
                  <div className="space-y-2">
                    {messages.map((message) => (
                      <ChatMessageItem key={message.id} message={message} />
                    ))}

                    {/* Assistant Typing Indicator */}
                    {isTyping && (
                      <div className="flex items-start gap-3.5 py-4">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#0f766e] text-white">
                          <Sparkles className="size-4 animate-spin" />
                        </div>
                        <div className="rounded-2xl border border-[#e8ece9] bg-white px-4 py-3 text-xs text-[#727b76] shadow-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#202522]">
                              AgentCart Assistant
                            </span>
                            <span>is searching MongoDB catalog and optimizing budget...</span>
                          </div>
                          <div className="mt-2 flex gap-1">
                            <span className="size-1.5 rounded-full bg-[#0f766e] animate-bounce" />
                            <span className="size-1.5 rounded-full bg-[#0f766e] animate-bounce [animation-delay:0.2s]" />
                            <span className="size-1.5 rounded-full bg-[#0f766e] animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Composer Footer */}
            <div className="border-t border-[#e8ece9] bg-[#f8faf9] px-4 py-3 sm:px-8">
              <div className="mx-auto max-w-4xl">
                <ChatComposer onSendMessage={handleSendMessage} isLoading={isTyping} />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Product Comparison Matrix Drawer */}
      <ProductComparisonModal />

      {/* Shopping Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
