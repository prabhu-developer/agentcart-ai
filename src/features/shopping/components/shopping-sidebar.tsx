"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  PlusCircle,
  MessageSquare,
  ShoppingBag,
  SlidersHorizontal,
  Monitor,
  Keyboard,
  Headphones,
  Armchair,
  Database,
  User,
} from "lucide-react";
import { MOCK_RECENT_SESSIONS } from "../data/mock-products";
import { useShoppingCart } from "../context/cart-context";

interface ShoppingSidebarProps {
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  activeView?: "chat" | "catalog";
  onSelectView?: (view: "chat" | "catalog") => void;
  onSelectCategory?: (category: string) => void;
  className?: string;
}

export function ShoppingSidebar({
  activeSessionId,
  onSelectSession,
  onNewSession,
  activeView = "chat",
  onSelectView,
  onSelectCategory,
  className,
}: ShoppingSidebarProps) {
  const { totalItems, formattedSubtotal, toggleCart, comparingProducts, openCompareModal } =
    useShoppingCart();

  return (
    <aside
      className={`flex h-full flex-col justify-between border-r border-[#e8ece9] bg-[#f8faf9] p-4 text-[#202522] ${
        className || ""
      }`}
    >
      <div className="flex flex-col gap-5 overflow-hidden">
        {/* Brand header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-[#0f766e] text-white">
              <Sparkles className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-[#202522]">
                AgentCart
              </span>
              <span className="-mt-1 text-[10px] font-medium tracking-wider text-[#727b76]">
                AI Commerce Space
              </span>
            </div>
          </Link>
        </div>

        {/* Workspace Mode Switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-[#e8ece9] bg-white p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onSelectView?.("chat")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
              activeView === "chat"
                ? "bg-[#0f766e] text-white shadow-xs"
                : "text-[#727b76] hover:text-[#202522]"
            }`}
          >
            <Sparkles className="size-3.5" />
            <span>Assistant</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView?.("catalog")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
              activeView === "catalog"
                ? "bg-[#0f766e] text-white shadow-xs"
                : "text-[#727b76] hover:text-[#202522]"
            }`}
          >
            <Database className="size-3.5" />
            <span>Catalog (DB)</span>
          </button>
        </div>

        {/* New Session Action */}
        <div>
          <button
            type="button"
            onClick={onNewSession}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8ece9] bg-white py-2 px-3 text-xs font-semibold text-[#0f766e] shadow-xs transition-colors hover:border-[#0f766e]/30 hover:bg-[#eaf5f2]"
          >
            <PlusCircle className="size-4" />
            <span>New Shopping Session</span>
          </button>
        </div>

        {/* Recent Sessions List */}
        <div className="flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#727b76]">
              Recent Sessions
            </span>
          </div>

          <div className="mt-1 flex flex-col gap-1 overflow-y-auto pr-1">
            {MOCK_RECENT_SESSIONS.map((session) => {
              const isActive = activeView === "chat" && session.id === activeSessionId;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => {
                    onSelectView?.("chat");
                    onSelectSession(session.id);
                  }}
                  className={`flex flex-col rounded-xl p-2.5 text-left transition-colors ${
                    isActive
                      ? "border border-[#0f766e]/20 bg-white shadow-xs text-[#202522]"
                      : "text-[#727b76] hover:bg-white/60 hover:text-[#202522]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare
                      className={`size-3.5 shrink-0 ${
                        isActive ? "text-[#0f766e]" : "text-[#727b76]"
                      }`}
                    />
                    <span className="truncate text-xs font-medium text-[#202522]">
                      {session.title}
                    </span>
                  </div>
                  <span className="mt-1 line-clamp-1 pl-5.5 text-[11px] text-[#727b76]">
                    {session.preview}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category shortcuts */}
        <div className="flex flex-col gap-1">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#727b76]">
            MongoDB Catalog
          </span>
          <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs">
            <button
              type="button"
              onClick={() => {
                onSelectView?.("catalog");
                onSelectCategory?.("workspace");
              }}
              className="flex items-center gap-2 rounded-lg border border-[#e8ece9] bg-white p-2 text-left text-[#727b76] transition-colors hover:text-[#202522]"
            >
              <Monitor className="size-3.5 text-[#0f766e]" />
              <span className="text-[11px]">Displays</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectView?.("catalog");
                onSelectCategory?.("workspace");
              }}
              className="flex items-center gap-2 rounded-lg border border-[#e8ece9] bg-white p-2 text-left text-[#727b76] transition-colors hover:text-[#202522]"
            >
              <Keyboard className="size-3.5 text-[#0f766e]" />
              <span className="text-[11px]">Keyboards</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectView?.("catalog");
                onSelectCategory?.("audio");
              }}
              className="flex items-center gap-2 rounded-lg border border-[#e8ece9] bg-white p-2 text-left text-[#727b76] transition-colors hover:text-[#202522]"
            >
              <Headphones className="size-3.5 text-[#0f766e]" />
              <span className="text-[11px]">Audio</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectView?.("catalog");
                onSelectCategory?.("furniture");
              }}
              className="flex items-center gap-2 rounded-lg border border-[#e8ece9] bg-white p-2 text-left text-[#727b76] transition-colors hover:text-[#202522]"
            >
              <Armchair className="size-3.5 text-[#0f766e]" />
              <span className="text-[11px]">Chairs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Profile & Cart Summary Area */}
      <div className="flex flex-col gap-2.5 border-t border-[#e8ece9] pt-4">
        {/* Comparison Trigger if any active */}
        {comparingProducts.length > 0 && (
          <button
            type="button"
            onClick={openCompareModal}
            className="flex items-center justify-between rounded-xl border border-[#0f766e]/20 bg-[#eaf5f2] px-3 py-2 text-xs font-semibold text-[#0f766e] transition-colors hover:bg-[#eaf5f2]/80"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-3.5" />
              <span>Active Comparison</span>
            </div>
            <span className="rounded-full bg-[#0f766e] px-1.5 py-0.2 text-[10px] text-white">
              {comparingProducts.length}
            </span>
          </button>
        )}

        {/* Cart Pill */}
        <button
          type="button"
          onClick={toggleCart}
          className="flex items-center justify-between rounded-xl border border-[#e8ece9] bg-white p-2.5 text-xs font-medium text-[#202522] shadow-xs transition-colors hover:border-[#0f766e]/30 hover:bg-[#f8faf9]"
        >
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#eaf5f2] text-[#0f766e]">
              <ShoppingBag className="size-3.5" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Review Cart</p>
              <p className="text-[10px] text-[#727b76]">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <span className="font-bold text-[#0f766e]">{formattedSubtotal}</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-[#e8ece9] text-[#727b76]">
              <User className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-[#202522]">MongoDB Connected</span>
              <span className="text-[10px] text-[#727b76]">Phase 02 Live Catalog</span>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
            Online
          </span>
        </div>
      </div>
    </aside>
  );
}
