"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Columns2, Menu, ShoppingBag, Sparkles, X } from "lucide-react";
import { useShoppingCart } from "@/features/shopping/context/cart-context";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  const { totalItems, openCart, comparingProducts, openCompareModal } =
    useShoppingCart();

  return (
    <header className="sticky top-0 z-40 border-b border-[#EAE6F2] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-[15px] font-bold tracking-tight text-[#211B2E]"
        >
          <span className="size-6 rounded-full agentcart-orb-sm transition-transform duration-200 group-hover:scale-105" />
          <span className="font-semibold tracking-tight">AgentCart</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 text-[13px] font-medium text-[#777181] md:flex">
          {isHome ? (
            <>
              <a
                href="#setups"
                className="transition-colors hover:text-[#5125A8]"
              >
                Curated setups
              </a>
              <a
                href="#how-it-works"
                className="transition-colors hover:text-[#5125A8]"
              >
                How it works
              </a>
              <Link
                href="/shop?category=all"
                className="transition-colors hover:text-[#5125A8]"
              >
                Catalog
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="transition-colors hover:text-[#5125A8]"
              >
                Overview
              </Link>
              <Link
                href="/shop?category=all"
                className="transition-colors hover:text-[#5125A8]"
              >
                Catalog
              </Link>
              <Link
                href="/shop"
                className="font-semibold text-[#5125A8]"
              >
                Workspace
              </Link>
            </>
          )}
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          {comparingProducts.length > 0 && (
            <button
              type="button"
              onClick={openCompareModal}
              aria-label="Compare selected products"
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-[#EAE6F2] bg-white px-3 text-xs font-semibold text-[#211B2E] transition-all hover:border-[#8B6CE8]/50 hover:bg-[#F2EDFC]/60 hover:text-[#5125A8]"
            >
              <Columns2 className="size-3.5 text-[#6D45D9]" />
              <span>Compare</span>
              <span className="ml-0.5 rounded-full bg-[#F2EDFC] px-1.5 py-0.2 text-[10px] font-bold text-[#6D45D9]">
                {comparingProducts.length}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={openCart}
            aria-label="Open cart"
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-[#EAE6F2] bg-white px-3.5 text-xs font-medium text-[#211B2E] transition-all hover:border-[#8B6CE8]/50 hover:bg-[#F2EDFC]/60 hover:text-[#5125A8]"
          >
            <ShoppingBag className="size-3.5 text-[#777181]" />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#5125A8] px-1 text-[10px] font-bold leading-none text-white">
                {totalItems}
              </span>
            )}
          </button>

          {isHome && (
            <Link
              href="/shop"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#5125A8] px-4 text-xs font-medium text-white shadow-[0_2px_8px_rgba(81,37,168,0.25)] transition-all hover:bg-[#431E8C]"
            >
              <Sparkles className="size-3.5 text-white/90" />
              <span>Start shopping</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-[#EAE6F2] text-[#777181] transition-colors hover:border-[#5125A8] hover:text-[#5125A8] md:hidden"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#EAE6F2] bg-white px-6 py-5 md:hidden shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1 text-sm text-[#211B2E]">
            {isHome ? (
              <>
                <a
                  href="#setups"
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-[#F8F7FB] py-3 font-medium transition-colors hover:text-[#5125A8]"
                >
                  Curated setups
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-[#F8F7FB] py-3 font-medium transition-colors hover:text-[#5125A8]"
                >
                  How it works
                </a>
              </>
            ) : (
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="border-b border-[#F8F7FB] py-3 font-medium transition-colors hover:text-[#5125A8]"
              >
                Overview
              </Link>
            )}
            <Link
              href="/shop?category=all"
              onClick={() => setMobileOpen(false)}
              className="border-b border-[#F8F7FB] py-3 font-medium transition-colors hover:text-[#5125A8]"
            >
              Catalog
            </Link>
            <div className="pt-3">
              <Link
                href="/shop"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#5125A8] text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#431E8C]"
              >
                <Sparkles className="size-3.5" />
                <span>Start shopping</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
