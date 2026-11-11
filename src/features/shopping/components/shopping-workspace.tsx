"use client";

import { Button } from "@/components/ui/button";
import { sendShoppingInquiry } from "@/features/agent/services/shopping-client";
import { CatalogBrowser } from "@/features/products/components/catalog-browser";
import {
  ArrowRight,
  Database,
  Menu,
  MessageSquare,
  RotateCcw,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  X
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useShoppingCart } from "../context/cart-context";
import {
  MOCK_EXAMPLE_PROMPTS,
  MOCK_RECENT_SESSIONS,
  getMockResponseForPrompt,
} from "../data/mock-products";
import { ChatMessage, Product } from "../types";
import { CartDrawer } from "./cart-drawer";
import { ChatComposer } from "./chat-composer";
import { ChatMessageItem } from "./chat-message-item";
import { ProductComparisonModal } from "./product-comparison-modal";
import { ProductDetailsDialog } from "./product-details-dialog";
import { ShoppingSidebar } from "./shopping-sidebar";

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
    clearCart,
    refreshCart,
  } = useShoppingCart();

  const [activeView, setActiveView] = useState<"chat" | "catalog">(() =>
    initialCategory ? "catalog" : "chat"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [activeSessionId, setActiveSessionId] = useState<string>("session-1");
  const [sessionTitle, setSessionTitle] = useState(() =>
    initialQuery ? initialQuery : "Home Office Setup"
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

  // Request recommendations from our AI Shopping Agent (POST /api/ai/shopping)
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
          role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
          content: m.text,
        }));

        const result = await sendShoppingInquiry({
          message: queryText.trim(),
          history: historyPayload,
          sessionId: activeSessionId,
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
        console.warn("AI shopping agent call failed, using graceful fallback:", err);
        // Fallback to local verified bundle
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
    [activeSessionId]
  );

  // Initialize session on mount
  useEffect(() => {
    let isCancelled = false;

    async function initMessages() {
      setIsTyping(true);
      if (initialQuery) {
        setSessionTitle(initialQuery);
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
      } else {
        // Load initial home office setup
        const defaultPrompt =
          "Home office setup under $1,000 with a monitor, keyboard, mouse, and chair.";

        const rec = await queryAiShoppingAgent(defaultPrompt);
        if (isCancelled) return;

        setMessages([
          {
            id: createMessageId("default-user"),
            sender: "user",
            timestamp: "10:32 AM",
            text: defaultPrompt,
          },
          {
            id: createMessageId("default-assist"),
            sender: "assistant",
            timestamp: "10:32 AM",
            text: rec.text,
            type: rec.type,
            source: rec.source,
            recommendedProducts: rec.products,
            comparisonProducts: rec.comparison,
            budgetAnalysis: rec.budget,
            clarificationOptions: rec.clarificationOptions,
            suggestedQueries: rec.suggestedQueries,
          },
        ]);
      }
      setIsTyping(false);
    }

    initMessages();

    return () => {
      isCancelled = true;
    };
  }, [initialQuery, queryAiShoppingAgent]);

  const handleSendMessage = async (text: string) => {
    setActiveView("chat");
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

  const handleSelectSession = (sessionId: string) => {
    setActiveView("chat");
    setActiveSessionId(sessionId);
    setMobileSidebarOpen(false);

    const found = MOCK_RECENT_SESSIONS.find((s) => s.id === sessionId);
    if (found && found.initialPrompt) {
      setSessionTitle(found.title);
      setIsTyping(true);
      queryAiShoppingAgent(found.initialPrompt).then((rec) => {
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
            type: rec.type,
            recommendedProducts: rec.products,
            comparisonProducts: rec.comparison,
            budgetAnalysis: rec.budget,
            clarificationOptions: rec.clarificationOptions,
            suggestedQueries: rec.suggestedQueries,
          },
        ]);
        setIsTyping(false);
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

  const handleResetDemo = async () => {
    try {
      await fetch("/api/demo/reset", { method: "POST" });
      await clearCart();
      refreshCart();
      toast.success("Demo State Reset", {
        description: "Cart cleared and default home office demo loaded.",
      });

      const defaultPrompt =
        "I need a complete home office setup under $1,000. I need a monitor, keyboard, mouse and ergonomic chair. Prioritize quality, reliability and value for money.";
      setActiveView("chat");
      setActiveSessionId("session-1");
      setSessionTitle("Home Office Setup Under $1,000");
      setIsTyping(true);
      const rec = await queryAiShoppingAgent(defaultPrompt);
      setMessages([
        {
          id: createMessageId("reset-user"),
          sender: "user",
          timestamp: "Just now",
          text: defaultPrompt,
        },
        {
          id: createMessageId("reset-assist"),
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
        },
      ]);
      setIsTyping(false);
      setMobileSidebarOpen(false);
    } catch {
      toast.error("Failed to reset demo state");
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-white">
      {/* Desktop Sidebar */}
      <div className="hidden h-full w-72 shrink-0 md:block lg:w-80">
        <ShoppingSidebar
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onResetDemo={handleResetDemo}
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
              onResetDemo={handleResetDemo}
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
                  {activeView === "chat" ? sessionTitle : "Catalog"}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher Pills */}
            <div className="hidden sm:flex items-center rounded-xl border border-[#e8ece9] bg-[#f8faf9] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveView("chat")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all ${activeView === "chat"
                    ? "bg-white text-[#0f766e] shadow-xs font-semibold"
                    : "text-[#727b76] hover:text-[#202522]"
                  }`}
              >
                <MessageSquare className="size-3.5" />
                <span>AI Assistant</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView("catalog")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all ${activeView === "catalog"
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
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight text-[#181c1a]">
                      What are you shopping for?
                    </h2>
                    <p className="mt-2 max-w-md text-sm text-[#6b7470]">
                      Share your setup and budget for curated recommendations.
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
                      <ChatMessageItem
                        key={message.id}
                        message={message}
                        onSelectPrompt={handleSendMessage}
                      />
                    ))}

                    {/* Assistant Typing Indicator */}
                    {isTyping && (
                      <div className="flex items-start gap-3.5 py-4">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#0f766e] text-white">
                          <Sparkles className="size-4 animate-spin" />
                        </div>
                        <div className="rounded-2xl border border-[#e8ece9] bg-white px-4 py-3 text-xs text-[#727b76] shadow-xs">
                          <div className="flex items-center gap-2 text-xs text-[#6b7470]">
                            <span>Curating picks</span>
                            <span className="flex gap-1">
                              <span className="size-1 rounded-full bg-[#0f766e] animate-bounce" />
                              <span className="size-1 rounded-full bg-[#0f766e] animate-bounce [animation-delay:0.2s]" />
                              <span className="size-1 rounded-full bg-[#0f766e] animate-bounce [animation-delay:0.4s]" />
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

            {/* Composer Footer */}
            <div className="border-t border-[#e8ece9] bg-[#f8faf9] px-4 py-3 sm:px-8">
              <div className="mx-auto max-w-4xl">
                <ChatComposer onSendMessage={handleSendMessage} isLoading={isTyping} />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Product Details & Comparison Modals */}
      <ProductDetailsDialog />
      <ProductComparisonModal />

      {/* Shopping Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
