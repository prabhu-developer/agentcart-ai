"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Scale, ShoppingBag, X } from "lucide-react";
import { useShoppingCart } from "@/features/shopping/context/cart-context";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  const { totalItems, openCart, comparingProducts, openCompareModal } =
    useShoppingCart();

  return (
    <header className="sticky top-0 z-40 border-b border-[#e5e9e7] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-[#111817]"
        >
          <span className="size-2.5 rounded-sm bg-[#0a5c55]" />
          <span>AgentCart</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 text-sm text-[#7a8580] md:flex">
          {isHome ? (
            <>
              <a
                href="#setups"
                className="relative py-0.5 transition-colors hover:text-[#111817] after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#0a5c55] after:transition-all after:duration-200 hover:after:w-full"
              >
                Setups
              </a>
              <a
                href="#how-it-works"
                className="relative py-0.5 transition-colors hover:text-[#111817] after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#0a5c55] after:transition-all after:duration-200 hover:after:w-full"
              >
                How it works
              </a>
              <Link
                href="/shop?category=all"
                className="relative py-0.5 transition-colors hover:text-[#111817] after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#0a5c55] after:transition-all after:duration-200 hover:after:w-full"
              >
                Catalog
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="relative py-0.5 transition-colors hover:text-[#111817] after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#0a5c55] after:transition-all after:duration-200 hover:after:w-full"
              >
                Overview
              </Link>
              <Link
                href="/shop?category=all"
                className="relative py-0.5 transition-colors hover:text-[#111817] after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#0a5c55] after:transition-all after:duration-200 hover:after:w-full"
              >
                Catalog
              </Link>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {comparingProducts.length > 0 && (
            <button
              type="button"
              onClick={openCompareModal}
              aria-label="Compare selected products"
              className="hidden h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[#e5e9e7] bg-white px-3.5 text-xs font-medium text-[#374040] transition-all hover:border-[#0a5c55] hover:text-[#0a5c55] sm:inline-flex"
            >
              <Scale className="size-3.5 text-[#0a5c55]" />
              <span>{comparingProducts.length}</span>
            </button>
          )}

          <button
            type="button"
            onClick={openCart}
            aria-label="Open cart"
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[#e5e9e7] bg-white px-3.5 text-xs font-medium text-[#374040] transition-all hover:border-[#0a5c55] hover:text-[#0a5c55]"
          >
            <ShoppingBag className="size-3.5" />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#0a5c55] px-1 text-[10px] font-bold leading-none text-white">
                {totalItems}
              </span>
            )}
          </button>

          {isHome && (
            <Link
              href="/shop"
              className="hidden h-9 items-center rounded-full bg-[#0a5c55] px-4 text-xs font-medium text-white transition-colors hover:bg-[#084f49] sm:inline-flex"
            >
              Open Assistant
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-[#e5e9e7] text-[#7a8580] transition-colors hover:border-[#0a5c55] hover:text-[#0a5c55] md:hidden"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-[#e5e9e7] bg-white px-6 py-5 md:hidden">
          <div className="flex flex-col gap-1 text-sm text-[#374040]">
            {isHome ? (
              <>
                <a
                  href="#setups"
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-[#f4f6f5] py-3 transition-colors hover:text-[#0a5c55]"
                >
                  Setups
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-[#f4f6f5] py-3 transition-colors hover:text-[#0a5c55]"
                >
                  How it works
                </a>
              </>
            ) : (
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="border-b border-[#f4f6f5] py-3 transition-colors hover:text-[#0a5c55]"
              >
                Overview
              </Link>
            )}
            <Link
              href="/shop?category=all"
              onClick={() => setMobileOpen(false)}
              className="border-b border-[#f4f6f5] py-3 transition-colors hover:text-[#0a5c55]"
            >
              Catalog
            </Link>
            <div className="pt-3">
              <Link
                href="/shop"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-full items-center justify-center rounded-full bg-[#0a5c55] text-xs font-medium text-white transition-colors hover:bg-[#084f49]"
              >
                Open Assistant
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
