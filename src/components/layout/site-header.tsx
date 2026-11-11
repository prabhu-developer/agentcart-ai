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
    <header className="sticky top-0 z-40 border-b border-[#eef1ef] bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-tight text-[#181c1a]"
        >
          <span className="size-2 rounded-full bg-[#0f766e]" />
          <span>AgentCart</span>
        </Link>

        {/* Minimal Navigation */}
        <nav className="hidden items-center gap-8 text-sm text-[#6b7470] md:flex">
          {isHome ? (
            <>
              <a
                href="#setups"
                className="transition-colors hover:text-[#181c1a]"
              >
                Setups
              </a>
              <a
                href="#how-it-works"
                className="transition-colors hover:text-[#181c1a]"
              >
                How it works
              </a>
              <Link
                href="/shop?category=all"
                className="transition-colors hover:text-[#181c1a]"
              >
                Catalog
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className="transition-colors hover:text-[#181c1a]">
                Overview
              </Link>
              <Link
                href="/shop?category=all"
                className="transition-colors hover:text-[#181c1a]"
              >
                Catalog
              </Link>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {comparingProducts.length > 0 && (
            <button
              type="button"
              onClick={openCompareModal}
              aria-label="Compare selected products"
              className="hidden h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[#e3e8e5] bg-white px-3.5 text-xs font-medium text-[#181c1a] transition-colors hover:border-[#0f766e] hover:text-[#0f766e] sm:inline-flex"
            >
              <Scale className="size-3.5 text-[#0f766e]" />
              <span>{comparingProducts.length}</span>
            </button>
          )}

          <button
            type="button"
            onClick={openCart}
            aria-label="Open cart"
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[#e3e8e5] bg-white px-3.5 text-xs font-medium text-[#181c1a] transition-colors hover:border-[#cfd8d3]"
          >
            <ShoppingBag className="size-3.5" />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-[#0f766e] text-[10px] font-semibold text-white">
                {totalItems}
              </span>
            )}
          </button>

          {isHome && (
            <Link
              href="/shop"
              className="hidden h-9 items-center rounded-full bg-[#181c1a] px-4 text-xs font-medium text-white transition-colors hover:bg-[#0f766e] sm:inline-flex"
            >
              Open Assistant
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-[#e3e8e5] text-[#4b544f] md:hidden"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-[#eef1ef] bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm text-[#4b544f]">
            {isHome ? (
              <>
                <a
                  href="#setups"
                  onClick={() => setMobileOpen(false)}
                  className="py-1 hover:text-[#181c1a]"
                >
                  Setups
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileOpen(false)}
                  className="py-1 hover:text-[#181c1a]"
                >
                  How it works
                </a>
              </>
            ) : (
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="py-1 hover:text-[#181c1a]"
              >
                Overview
              </Link>
            )}
            <Link
              href="/shop?category=all"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#181c1a]"
            >
              Catalog
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className="mt-1 inline-flex h-9 items-center justify-center rounded-full bg-[#181c1a] text-xs font-medium text-white"
            >
              Open Assistant
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
