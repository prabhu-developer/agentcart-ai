"use client";

import Link from "next/link";
import {
  Columns2,
  LayoutGrid,
  MessageSquare,
  Plus,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";
import { MOCK_RECENT_SESSIONS } from "@/features/shopping/data/mock-products";
import { useShoppingCart } from "@/features/shopping/context/cart-context";

interface ShoppingSidebarProps {
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onResetDemo: () => void;
  activeView: "chat" | "catalog";
  onSelectView: (view: "chat" | "catalog") => void;
  onSelectCategory?: (category: string) => void;
  className?: string;
}

const CATEGORIES = [
  { id: "all", label: "All Products" },
  { id: "workspace", label: "Workspace" },
  { id: "electronics", label: "Displays & Hubs" },
  { id: "audio", label: "Audio" },
  { id: "furniture", label: "Seating" },
  { id: "lifestyle", label: "Lifestyle" },
];

export function ShoppingSidebar({
  activeSessionId,
  onSelectSession,
  onNewSession,
  onResetDemo,
  activeView,
  onSelectView,
  onSelectCategory,
  className = "",
}: ShoppingSidebarProps) {
  const {
    totalItems,
    formattedSubtotal,
    openCart,
    comparingProducts,
    openCompareModal,
  } = useShoppingCart();

  return (
    <aside
      className={`flex flex-col border-r border-[#EAE6F2] bg-white ${className}`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold tracking-tight text-[#211B2E] transition-opacity hover:opacity-80"
        >
          <span className="size-4 rounded-full agentcart-orb-sm" />
          <span>AgentCart</span>
        </Link>
        <button
          type="button"
          onClick={onResetDemo}
          title="Reset session"
          aria-label="Reset session"
          className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-[#777181] transition-colors hover:bg-[#F8F7FB] hover:text-[#211B2E]"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Primary View Switch */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 rounded-xl bg-[#F8F7FB] p-1 border border-[#EAE6F2]">
          <button
            type="button"
            onClick={() => onSelectView("chat")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              activeView === "chat"
                ? "bg-white text-[#211B2E] shadow-2xs"
                : "text-[#777181] hover:text-[#211B2E]"
            }`}
          >
            <MessageSquare className="size-3.5 text-[#5125A8]" />
            <span>Assistant</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView("catalog")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              activeView === "catalog"
                ? "bg-white text-[#211B2E] shadow-2xs"
                : "text-[#777181] hover:text-[#211B2E]"
            }`}
          >
            <LayoutGrid className="size-3.5 text-[#777181]" />
            <span>Catalog</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onNewSession}
          className="mt-3 flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#EAE6F2] bg-white text-xs font-semibold text-[#211B2E] transition-colors hover:border-[#6D45D9]/40 hover:bg-[#F2EDFC] hover:text-[#5125A8]"
        >
          <Plus className="size-3.5" />
          <span>New session</span>
        </button>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-2">
        <div>
          <p className="px-2 pb-2 text-[11px] font-bold tracking-wider text-[#777181] uppercase">
            Curated Setups
          </p>
          <div className="space-y-1">
            {MOCK_RECENT_SESSIONS.map((session) => {
              const isActive =
                activeView === "chat" && activeSessionId === session.id;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                    isActive
                      ? "bg-[#F2EDFC] font-semibold text-[#5125A8]"
                      : "text-[#211B2E] hover:bg-[#F8F7FB]"
                  }`}
                >
                  <span className="truncate">{session.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-2 pb-2 text-[11px] font-bold tracking-wider text-[#777181] uppercase">
            Categories
          </p>
          <div className="space-y-0.5">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory?.(category.id)}
                className="flex w-full cursor-pointer items-center rounded-xl px-3 py-1.5 text-left text-xs font-medium text-[#777181] transition-colors hover:bg-[#F8F7FB] hover:text-[#211B2E]"
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Cart & Compare Actions */}
      <div className="space-y-2 border-t border-[#EAE6F2] p-4">
        {comparingProducts.length > 0 && (
          <button
            type="button"
            onClick={openCompareModal}
            className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#EAE6F2] bg-white px-3.5 py-2 text-xs font-semibold text-[#211B2E] transition-colors hover:border-[#6D45D9]/40 hover:text-[#5125A8]"
          >
            <span className="inline-flex items-center gap-2">
              <Columns2 className="size-3.5 text-[#6D45D9]" />
              <span>Compare</span>
            </span>
            <span className="text-[#777181]">{comparingProducts.length}</span>
          </button>
        )}

        <button
          type="button"
          onClick={openCart}
          className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#211B2E] px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#342C44]"
        >
          <span className="inline-flex items-center gap-2">
            <ShoppingBag className="size-3.5" />
            <span>Cart {totalItems > 0 ? `(${totalItems})` : ""}</span>
          </span>
          <span className="tabular-nums font-bold">{formattedSubtotal}</span>
        </button>
      </div>
    </aside>
  );
}
