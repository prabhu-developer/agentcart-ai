"use client";

import Link from "next/link";
import {
  LayoutGrid,
  MessageSquare,
  Plus,
  RotateCcw,
  Scale,
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
      className={`flex flex-col border-r border-[#eef1ef] bg-[#fcfdfc] ${className}`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-[#181c1a] transition-opacity hover:opacity-80"
        >
          AgentCart
        </Link>
        <button
          type="button"
          onClick={onResetDemo}
          title="Reset session"
          aria-label="Reset session"
          className="flex size-7 cursor-pointer items-center justify-center rounded-full text-[#8a948f] transition-colors hover:bg-[#f1f4f2] hover:text-[#181c1a]"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Primary View Switch */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 rounded-xl bg-[#f1f4f2] p-1">
          <button
            type="button"
            onClick={() => onSelectView("chat")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all ${
              activeView === "chat"
                ? "bg-white text-[#181c1a] shadow-xs"
                : "text-[#6b7470] hover:text-[#181c1a]"
            }`}
          >
            <MessageSquare className="size-3.5" />
            <span>Assistant</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView("catalog")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all ${
              activeView === "catalog"
                ? "bg-white text-[#181c1a] shadow-xs"
                : "text-[#6b7470] hover:text-[#181c1a]"
            }`}
          >
            <LayoutGrid className="size-3.5" />
            <span>Catalog</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onNewSession}
          className="mt-3 flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#e3e8e5] bg-white text-xs font-medium text-[#181c1a] transition-colors hover:border-[#0f766e] hover:text-[#0f766e]"
        >
          <Plus className="size-3.5" />
          <span>New search</span>
        </button>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-2">
        <div>
          <p className="px-2 pb-2 text-[11px] font-medium tracking-wider text-[#8a948f] uppercase">
            Setups
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
                      ? "bg-[#eaf5f2] font-medium text-[#0f766e]"
                      : "text-[#4b544f] hover:bg-[#f3f6f4] hover:text-[#181c1a]"
                  }`}
                >
                  <span className="truncate">{session.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-2 pb-2 text-[11px] font-medium tracking-wider text-[#8a948f] uppercase">
            Categories
          </p>
          <div className="space-y-0.5">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory?.(category.id)}
                className="flex w-full cursor-pointer items-center rounded-xl px-3 py-1.5 text-left text-xs text-[#6b7470] transition-colors hover:bg-[#f3f6f4] hover:text-[#181c1a]"
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Cart & Compare Actions */}
      <div className="space-y-2 border-t border-[#eef1ef] p-4">
        {comparingProducts.length > 0 && (
          <button
            type="button"
            onClick={openCompareModal}
            className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#e8ece9] bg-white px-3.5 py-2 text-xs font-medium text-[#181c1a] transition-colors hover:border-[#0f766e]"
          >
            <span className="inline-flex items-center gap-2">
              <Scale className="size-3.5 text-[#0f766e]" />
              Compare
            </span>
            <span className="text-[#727b76]">{comparingProducts.length}</span>
          </button>
        )}

        <button
          type="button"
          onClick={openCart}
          className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#181c1a] px-3.5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#0f766e]"
        >
          <span className="inline-flex items-center gap-2">
            <ShoppingBag className="size-3.5" />
            Cart {totalItems > 0 ? `(${totalItems})` : ""}
          </span>
          <span className="tabular-nums">{formattedSubtotal}</span>
        </button>
      </div>
    </aside>
  );
}
