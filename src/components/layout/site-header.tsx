"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, ArrowRight, Menu, X, Sparkles, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShoppingCart } from "@/features/shopping/context/cart-context";
import { Container } from "@/components/shared/container";

export function SiteHeader() {
  const pathname = usePathname();
  const { totalItems, toggleCart, comparingProducts, openCompareModal } = useShoppingCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isShopPage = pathname === "/shop";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e8ece9] bg-white/95 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#0f766e] text-white shadow-xs transition-transform group-hover:scale-105">
                <Sparkles className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-[#202522]">
                  AgentCart
                </span>
                <span className="hidden -mt-1 text-[10px] font-medium tracking-wider text-[#727b76] sm:inline-block">
                  AI Personal Shopping
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {!isShopPage && (
              <nav className="hidden items-center gap-6 md:flex">
                <Link
                  href="/#how-it-works"
                  className="text-sm font-medium text-[#727b76] transition-colors hover:text-[#202522]"
                >
                  How it works
                </Link>
                <Link
                  href="/#scenarios"
                  className="text-sm font-medium text-[#727b76] transition-colors hover:text-[#202522]"
                >
                  Featured Scenarios
                </Link>
                <Link
                  href="/#categories"
                  className="text-sm font-medium text-[#727b76] transition-colors hover:text-[#202522]"
                >
                  Categories
                </Link>
                <Link
                  href="/#guarantee"
                  className="text-sm font-medium text-[#727b76] transition-colors hover:text-[#202522]"
                >
                  Trust & Security
                </Link>
              </nav>
            )}
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Compare Pill (if any items in compare) */}
            {comparingProducts.length > 0 && (
              <button
                type="button"
                onClick={openCompareModal}
                className="hidden items-center gap-1.5 rounded-full border border-[#0f766e]/20 bg-[#eaf5f2] px-3 py-1.5 text-xs font-semibold text-[#0f766e] transition-colors hover:bg-[#eaf5f2]/80 sm:flex"
              >
                <SlidersHorizontal className="size-3.5" />
                <span>Compare ({comparingProducts.length})</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              type="button"
              onClick={toggleCart}
              className="relative flex size-10 items-center justify-center rounded-xl border border-[#e8ece9] bg-white text-[#202522] transition-colors hover:border-[#0f766e]/30 hover:bg-[#f8faf9]"
              aria-label="Open cart"
            >
              <ShoppingBag className="size-4 text-[#202522]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#0f766e] text-[10px] font-bold text-white shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Go to Shop CTA */}
            {!isShopPage ? (
              <Link href="/shop" className="hidden sm:inline-flex">
                <Button className="bg-[#0f766e] text-white hover:bg-[#115e59]">
                  <span>Launch Assistant</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/" className="hidden sm:inline-flex">
                <Button variant="outline" className="border-[#e8ece9] text-[#202522]">
                  <span>Product Overview</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex size-10 items-center justify-center rounded-xl border border-[#e8ece9] text-[#202522] md:hidden"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-[#e8ece9] py-4 md:hidden">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#727b76] hover:bg-[#f8faf9] hover:text-[#202522]"
              >
                How it works
              </Link>
              <Link
                href="/#scenarios"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#727b76] hover:bg-[#f8faf9] hover:text-[#202522]"
              >
                Featured Scenarios
              </Link>
              <Link
                href="/#categories"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#727b76] hover:bg-[#f8faf9] hover:text-[#202522]"
              >
                Categories
              </Link>
              <Link
                href="/#guarantee"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#727b76] hover:bg-[#f8faf9] hover:text-[#202522]"
              >
                Trust & Security
              </Link>
              {comparingProducts.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openCompareModal();
                  }}
                  className="flex items-center justify-between rounded-lg bg-[#eaf5f2] px-3 py-2 text-left text-sm font-medium text-[#0f766e]"
                >
                  <span>Compare Products</span>
                  <span className="rounded-full bg-[#0f766e] px-2 py-0.5 text-xs text-white">
                    {comparingProducts.length}
                  </span>
                </button>
              )}
              <div className="pt-2">
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f766e] py-2.5 text-sm font-semibold text-white shadow-xs"
                >
                  <span>Launch Shopping Assistant</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}
