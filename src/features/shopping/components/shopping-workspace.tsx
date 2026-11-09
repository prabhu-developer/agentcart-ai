"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { ChatMessage } from "../types";
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

let messageSeq = 0;
function createMessageId(prefix: string): string {
  messageSeq += 1;
  return `${prefix}-${messageSeq}`;
}

function buildInitialMessages(query: string): ChatMessage[] {
  if (query) {
    const mockResp = getMockResponseForPrompt(query);
    return [
      {
        id: createMessageId("user"),
        sender: "user",
        timestamp: "Just now",
        text: query,
      },
      {
        id: createMessageId("assist"),
        sender: "assistant",
        timestamp: "Just now",
        text: mockResp.text,
        recommendedProducts: mockResp.products,
        comparisonProducts: mockResp.comparison,
        budgetAnalysis: mockResp.budget,
      },
    ];
  }

  const defaultSetup = getMockResponseForPrompt(
    "I need a complete home office setup under $1,000. I need a monitor, keyboard, mouse and ergonomic chair."
  );
  return [
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
      text: defaultSetup.text,
      recommendedProducts: defaultSetup.products,
      comparisonProducts: defaultSetup.comparison,
      budgetAnalysis: defaultSetup.budget,
    },
  ];
}

export function ShoppingWorkspace() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const {
    totalItems,
    formattedSubtotal,
    toggleCart,
    comparingProducts,
    openCompareModal,
  } = useShoppingCart();

  const [activeSessionId, setActiveSessionId] = useState<string>("session-1");
  const [sessionTitle, setSessionTitle] = useState(() =>
    initialQuery ? initialQuery : "Home Office Setup Under $1,000"
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildInitialMessages(initialQuery)
  );
  const [isTyping, setIsTyping] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: createMessageId("user"),
      sender: "user",
      timestamp: "Just now",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Realistic mock response transition
    setTimeout(() => {
      const mock = getMockResponseForPrompt(text);
      const assistantMsg: ChatMessage = {
        id: createMessageId("assist"),
        sender: "assistant",
        timestamp: "Just now",
        text: mock.text,
        recommendedProducts: mock.products,
        comparisonProducts: mock.comparison,
        budgetAnalysis: mock.budget,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 650);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setMobileSidebarOpen(false);

    const found = MOCK_RECENT_SESSIONS.find((s) => s.id === sessionId);
    if (found && found.initialPrompt) {
      setSessionTitle(found.title);
      const mock = getMockResponseForPrompt(found.initialPrompt);
      setMessages([
        {
          id: createMessageId("session-user"),
          sender: "user",
          timestamp: found.updatedAt,
          text: found.initialPrompt,
        },
        {
          id: createMessageId("session-assist"),
          sender: "assistant",
          timestamp: found.updatedAt,
          text: mock.text,
          recommendedProducts: mock.products,
          comparisonProducts: mock.comparison,
          budgetAnalysis: mock.budget,
        },
      ]);
    }
  };

  const handleNewSession = () => {
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
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* Main Conversation Area */}
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
                  {sessionTitle}
                </h1>
                <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 sm:inline-flex">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ready
                </span>
              </div>
              <p className="hidden text-[11px] text-[#727b76] sm:block">
                AI Shopping Assistant · Interactive Session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Phase 01 Subtle Notice Strip */}
        <div className="flex items-center justify-between border-b border-[#e8ece9] bg-[#f8faf9] px-4 py-1.5 text-[11px] text-[#727b76]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-[#0f766e]" />
            <span>
              Phase 01 UI Foundation: Realistic client-side product catalog active. AI orchestration connects in Phase 02.
            </span>
          </div>
          <span className="hidden text-[10px] text-[#727b76] md:inline">
            Exclusively Light Theme
          </span>
        </div>

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
                  Tell me what you&apos;re shopping for, your budget, and what matters most. I&apos;ll help you make a confident, well-researched choice.
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
                        <span>is analyzing product catalog and budget constraints...</span>
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
      </main>

      {/* Product Comparison Matrix Drawer */}
      <ProductComparisonModal />

      {/* Shopping Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
