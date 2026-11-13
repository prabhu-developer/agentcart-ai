"use client";

import { Button } from "@/components/ui/button";
import { sendShoppingInquiry } from "@/features/agent/services/shopping-client";
import {
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  Columns2,
  FolderOpen,
  LayoutGrid,
  Menu,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Share2,
  ShoppingBag,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useShoppingCart } from "../context/cart-context";
import {
  MOCK_RECENT_SESSIONS,
  getMockResponseForPrompt,
} from "../data/mock-products";
import { ChatMessage, Product, ShoppingSession } from "../types";
import { CartDrawer } from "./cart-drawer";
import { ChatComposer } from "./chat-composer";
import { ChatMessageItem } from "./chat-message-item";
import { ProductComparisonModal } from "./product-comparison-modal";
import { ProductDetailsDialog } from "./product-details-dialog";
import { CatalogBrowser } from "@/features/products/components/catalog-browser";

let messageSeq = 0;
function createMessageId(prefix: string): string {
  messageSeq += 1;
  return `${prefix}-${messageSeq}`;
}

const FEATURED_GUIDES = [
  {
    id: "guide-1",
    title: "Home Office Setup",
    badge: "Workspace",
    badgeStyle: "bg-[#FDF2F4] text-[#E11D48] border-[#FDE2E7]",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
    prompt: "Home office setup under $1,000 with a monitor, keyboard, mouse, and ergonomic chair.",
  },
  {
    id: "guide-2",
    title: "4K Creative Studio",
    badge: "4K Display",
    badgeStyle: "bg-[#EDFAF2] text-[#16A34A] border-[#D5F5E3]",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    prompt: "Creative workstation under $750 with a 4K monitor, quiet peripherals, and ANC headphones.",
  },
  {
    id: "guide-3",
    title: "Remote Travel Essentials",
    badge: "Travel",
    badgeStyle: "bg-[#EEF4FF] text-[#2563EB] border-[#DBEAFE]",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    prompt: "Remote travel essentials under $350 with a backpack, ANC headphones, and USB-C hub.",
  },
  {
    id: "guide-4",
    title: "Minimal Everyday Upgrade",
    badge: "Minimal",
    badgeStyle: "bg-[#FEFCE8] text-[#CA8A04] border-[#FEF08A]",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    prompt: "Minimal everyday desk upgrade under $300 with quiet mechanical keyboard and ergonomic mouse.",
  },
];

export function ShoppingWorkspace() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const {
    totalItems,
    openCart,
    comparingProducts,
    openCompareModal,
    clearCart,
    refreshCart,
  } = useShoppingCart();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string>("session-1");
  const [searchFilter, setSearchFilter] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"workspace" | "catalog">(
    initialCategory ? "catalog" : "workspace"
  );
  const [copiedLink, setCopiedLink] = useState(false);

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
    [activeSessionId]
  );

  // Initialize session on mount or if query changes
  useEffect(() => {
    let isCancelled = false;

    async function initMessages() {
      if (!initialQuery) return;

      setActiveTab("workspace");
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

  const handleNewSession = useCallback(async () => {
    setMessages([]);
    setActiveSessionId(`session-${Date.now()}`);
    try {
      await fetch("/api/demo/reset", { method: "POST" });
      await clearCart();
      refreshCart();
      toast.success("New shopping session started");
    } catch {
      // silent — reset is best-effort
    }
  }, [clearCart, refreshCart]);

  // Keyboard shortcut: Cmd+N or Ctrl+N to start new session
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleNewSession();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNewSession]);

  const handleSendMessage = async (text: string) => {
    if (activeTab !== "workspace") {
      setActiveTab("workspace");
    }

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


  const handleSelectRecentSession = (session: ShoppingSession) => {
    setActiveSessionId(session.id);
    setMobileSidebarOpen(false);
    handleSendMessage(session.initialPrompt || session.title);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      toast.success("Workspace link copied to clipboard");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const filteredSessions = MOCK_RECENT_SESSIONS.filter((s) =>
    s.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8F7FB] text-[#211B2E]">
      {/* 1. SLIM LEFT DOCK (Matching ref2.png leftmost strip) */}
      <aside className="hidden lg:flex w-[62px] flex-col items-center justify-between border-r border-[#EAE6F2] bg-white py-4 z-20 shrink-0">
        <div className="flex flex-col items-center gap-6">
          {/* Top Brand Orb */}
          <Link
            href="/"
            title="AgentCart AI — Return to Home"
            className="group relative flex size-9 items-center justify-center rounded-full agentcart-orb transition-transform duration-200 hover:scale-105"
          >
            <span className="sr-only">AgentCart AI</span>
          </Link>

          {/* Navigation Action Icons */}
          <nav className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("workspace")}
              title="AI Shopping Assistant"
              className={`flex size-10 items-center justify-center rounded-xl transition-all ${
                activeTab === "workspace"
                  ? "bg-[#F2EDFC] text-[#5125A8] shadow-2xs"
                  : "text-[#777181] hover:bg-[#F8F7FB] hover:text-[#211B2E]"
              }`}
            >
              <Sparkles className="size-4.5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("catalog")}
              title="Catalog Browser"
              className={`flex size-10 items-center justify-center rounded-xl transition-all ${
                activeTab === "catalog"
                  ? "bg-[#F2EDFC] text-[#5125A8] shadow-2xs"
                  : "text-[#777181] hover:bg-[#F8F7FB] hover:text-[#211B2E]"
              }`}
            >
              <LayoutGrid className="size-4.5" />
            </button>

            <button
              type="button"
              onClick={openCart}
              title="Shopping Cart"
              className="relative flex size-10 items-center justify-center rounded-xl text-[#777181] transition-all hover:bg-[#F8F7FB] hover:text-[#211B2E]"
            >
              <ShoppingBag className="size-4.5" />
              {totalItems > 0 && (
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-[#5125A8] text-[9px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

            {comparingProducts.length > 0 && (
              <button
                type="button"
                onClick={openCompareModal}
                title="Product Comparison"
                className="relative flex size-10 items-center justify-center rounded-xl text-[#6D45D9] transition-all hover:bg-[#F2EDFC]"
              >
                <Columns2 className="size-4.5" />
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-[#6D45D9] text-[9px] font-bold text-white">
                  {comparingProducts.length}
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Bottom utility icons */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            title="Strict Light Mode"
            aria-label="Light mode"
            className="flex size-9 items-center justify-center rounded-xl text-[#777181] transition-colors hover:bg-[#F8F7FB] hover:text-[#211B2E]"
          >
            <Sun className="size-4.5" />
          </button>

          <div
            title="Guest Shopper"
            className="flex size-9 items-center justify-center rounded-full bg-[#F2EDFC] text-[#5125A8] border border-[#EAE6F2] font-semibold text-xs"
          >
            <User className="size-4 text-[#5125A8]" />
          </div>
        </div>
      </aside>

      {/* 2. SECONDARY SIDEBAR (Matching ref2.png Search, + New Chat, Nav, History, Promo box) */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-[#EAE6F2] bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Search Chats Input */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute top-3 left-3 size-4 text-[#777181]" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search Chats"
              className="h-10 w-full rounded-xl border border-[#EAE6F2] bg-[#F8F7FB] pl-9 pr-3 text-xs text-[#211B2E] placeholder:text-[#777181] focus:border-[#6D45D9] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* + New Chat (⌘N button in ref2.png) */}
        <div className="px-4 py-2">
          <button
            type="button"
            onClick={handleNewSession}
            className="flex h-10 w-full cursor-pointer items-center justify-between rounded-xl bg-[#211B2E] px-3.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#342C44] active:scale-[0.99]"
          >
            <span className="flex items-center gap-2">
              <Plus className="size-4" />
              <span>New Chat</span>
            </span>
            <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10px] text-white/90">
              ⌘N
            </kbd>
          </button>
        </div>

        {/* Navigation items: Library, Setups, Saved */}
        <div className="px-3 py-1 space-y-0.5 text-xs text-[#211B2E]">
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium transition-colors hover:bg-[#F8F7FB]"
          >
            <FolderOpen className="size-4 text-[#777181]" />
            <span>Library</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("workspace")}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium transition-colors hover:bg-[#F8F7FB]"
          >
            <LayoutGrid className="size-4 text-[#777181]" />
            <span>Curated Setups</span>
          </button>

          <button
            type="button"
            onClick={openCart}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium transition-colors hover:bg-[#F8F7FB]"
          >
            <Bookmark className="size-4 text-[#777181]" />
            <span>Saved Items</span>
          </button>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 overflow-y-auto px-3 py-3 border-t border-[#F8F7FB]">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#777181]">
            Chat History
          </p>

          <div className="space-y-1">
            {filteredSessions.map((session) => {
              const isActive = activeSessionId === session.id;
              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectRecentSession(session)}
                  className={`group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs transition-all ${
                    isActive
                      ? "bg-[#F2EDFC] font-semibold text-[#5125A8]"
                      : "text-[#211B2E] hover:bg-[#F8F7FB]"
                  }`}
                >
                  <span className="truncate pr-2">{session.title}</span>
                  <button
                    type="button"
                    title="Session options"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[#777181] hover:text-[#211B2E] transition-opacity"
                  >
                    <MoreHorizontal className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Promo / Budget Tracking Card (matching ref2.png bottom dark box) */}
        <div className="p-3 border-t border-[#EAE6F2]">
          <div className="rounded-2xl bg-[#211B2E] p-4 text-white shadow-sm">
            <h4 className="text-xs font-bold">Catalog Guaranteed</h4>
            <p className="mt-1 text-[11px] leading-relaxed text-[#A9A4B3]">
              Real-time MongoDB inventory & verified prices with sandbox checkout.
            </p>
            <button
              type="button"
              onClick={openCart}
              className="mt-3 flex h-8 w-full cursor-pointer items-center justify-center rounded-xl bg-white text-xs font-semibold text-[#211B2E] shadow-2xs transition-all hover:bg-[#F2EDFC] hover:text-[#5125A8]"
            >
              View Active Cart ({totalItems})
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* 3. MAIN WORKSPACE / CHAT STREAM (Matching ref2.png central workspace) */}
      <main className="flex flex-1 flex-col overflow-hidden bg-white">
        {/* Top Navigation Bar (matching ref2.png Model dropdown & Top right actions) */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#EAE6F2] bg-white px-4 sm:px-6">
          {/* Mobile hamburger + Model Selector */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar"
              className="flex size-8 items-center justify-center rounded-lg border border-[#EAE6F2] text-[#777181] hover:text-[#211B2E] lg:hidden"
            >
              <Menu className="size-4" />
            </button>

            {/* Model Selector Dropdown */}
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#EAE6F2] bg-[#F8F7FB] px-3 py-1.5 text-xs font-bold text-[#211B2E] shadow-2xs">
              <span>AgentCart 4.5</span>
              <ChevronDown className="size-3 text-[#777181]" />
              <span className="size-1.5 rounded-full bg-[#E11D48] animate-pulse" />
            </div>

            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#777181] pl-2">
              <span className="size-1.5 rounded-full bg-[#16A34A]" />
              <span>MongoDB live verified</span>
            </span>
          </div>

          {/* Top Right Action Buttons (Share, Archive, Report in ref2.png) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-8.5 cursor-pointer items-center gap-1.5 rounded-xl border border-[#EAE6F2] bg-white px-3 text-xs font-semibold text-[#211B2E] transition-all hover:bg-[#F8F7FB] hover:border-[#6D45D9]/40 hover:text-[#5125A8]"
            >
              {copiedLink ? (
                <>
                  <Check className="size-3.5 text-[#16A34A]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="size-3.5 text-[#777181]" />
                  <span>Share</span>
                </>
              )}
            </button>

            {comparingProducts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={openCompareModal}
                className="h-8.5 gap-1.5 rounded-xl border-[#6D45D9]/30 bg-[#F2EDFC] text-xs font-bold text-[#6D45D9] hover:bg-[#EAE4FA]"
              >
                <Columns2 className="size-3.5" />
                <span>Compare ({comparingProducts.length})</span>
              </Button>
            )}

            <button
              type="button"
              onClick={openCart}
              className="inline-flex h-8.5 cursor-pointer items-center gap-1.5 rounded-xl border border-[#EAE6F2] bg-white px-3 text-xs font-semibold text-[#211B2E] transition-all hover:bg-[#F8F7FB] hover:border-[#6D45D9]/40 hover:text-[#5125A8]"
            >
              <ShoppingBag className="size-3.5 text-[#777181]" />
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="rounded-full bg-[#5125A8] px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleNewSession}
                title="Reset conversation"
                className="inline-flex size-8.5 cursor-pointer items-center justify-center rounded-xl border border-[#EAE6F2] bg-white text-[#777181] transition-all hover:bg-[#F8F7FB] hover:text-[#211B2E]"
              >
                <RotateCcw className="size-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Content Stream Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "catalog" ? (
            <div className="p-6">
              <CatalogBrowser initialCategory={initialCategory} />
            </div>
          ) : (
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
              {messages.length === 0 ? (
                /* Welcome Screen (Matching ref2.png greeting + 2x2 Featured Guides) */
                <div className="py-6 sm:py-10 text-center animate-in fade-in duration-300">
                  {/* Glowing Iridescent Orb Logo mark */}
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full agentcart-orb">
                    <span className="sr-only">AgentCart AI</span>
                  </div>

                  <h2 className="mt-3 text-xl font-bold tracking-tight text-[#211B2E]">
                    AgentCart AI
                  </h2>

                  <p className="mt-1 text-base sm:text-lg font-semibold text-[#211B2E]">
                    Hey 👋 there! What can I help you shop for today?
                  </p>

                  <p className="mt-1 text-xs text-[#777181] max-w-md mx-auto">
                    Describe your setup goals, target budget, or choose from our featured curated configurations below.
                  </p>

                  {/* 2x2 Featured Guides Grid (Matching ref2.png exactly) */}
                  <div className="mt-8 text-left">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="text-sm font-bold text-[#211B2E]">
                        Featured Guides
                      </h3>
                      <span className="text-xs font-medium text-[#777181]">
                        Tap to load setup
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {FEATURED_GUIDES.map((guide) => (
                        <div
                          key={guide.id}
                          onClick={() => handleSendMessage(guide.prompt)}
                          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#EAE6F2] bg-white p-3.5 transition-all duration-200 hover:border-[#6D45D9]/50 hover:shadow-[0_8px_24px_rgba(33,27,46,0.06)]"
                        >
                          {/* Image container */}
                          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#F8F7FB]">
                            <Image
                              src={guide.image}
                              alt={guide.title}
                              fill
                              unoptimized
                              sizes="(max-width: 640px) 100vw, 400px"
                              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          </div>

                          {/* Card metadata matching ref2.png */}
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-[#211B2E] transition-colors group-hover:text-[#5125A8]">
                                {guide.title}
                              </span>
                              <span
                                className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${guide.badgeStyle}`}
                              >
                                {guide.badge}
                              </span>
                            </div>

                            <div className="flex size-6 items-center justify-center rounded-lg text-[#777181] transition-colors group-hover:text-[#5125A8]">
                              <ArrowUpRight className="size-4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Conversation Message Thread */
                <div className="space-y-3 pb-8">
                  {messages.map((message) => (
                    <ChatMessageItem
                      key={message.id}
                      message={message}
                      onSelectPrompt={handleSendMessage}
                    />
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-start gap-3 py-3 pl-2">
                      <div className="size-7 shrink-0 rounded-full agentcart-orb-sm animate-pulse" />
                      <div className="rounded-2xl border border-[#EAE6F2] bg-white px-4 py-2.5 shadow-2xs">
                        <div className="flex items-center gap-2 text-xs text-[#777181]">
                          <span className="font-medium">Curating verified pieces</span>
                          <span className="flex gap-1">
                            <span className="size-1.5 rounded-full bg-[#5125A8] animate-bounce" />
                            <span className="size-1.5 rounded-full bg-[#5125A8] animate-bounce [animation-delay:0.2s]" />
                            <span className="size-1.5 rounded-full bg-[#5125A8] animate-bounce [animation-delay:0.4s]" />
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. PINNED FLOATING COMPOSER (Matching ref2.png bottom bar) */}
        <div className="border-t border-[#EAE6F2] bg-[#F8F7FB]/70 px-4 py-4 sm:px-6">
          <ChatComposer
            onSendMessage={handleSendMessage}
            isLoading={isTyping}
          />
          <p className="mt-2 text-center text-[11px] text-[#777181]">
            AgentCart AI verifies live pricing and inventory against MongoDB catalog · PayPal Sandbox ready
          </p>
        </div>

        {/* Product Details & Comparison Modals */}
        <ProductDetailsDialog />
        <ProductComparisonModal />

        {/* Shopping Cart Drawer */}
        <CartDrawer />
      </main>
    </div>
  );
}
