import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Cpu, CreditCard, HeartHandshake } from "lucide-react";
import { Container } from "@/components/shared/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e8ece9] bg-[#f8faf9] text-[#727b76]">
      <Container className="py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-[#0f766e] text-white">
                <Sparkles className="size-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#202522]">
                AgentCart
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#727b76]">
              Your AI-powered personal shopping assistant. Helping you articulate needs, discover high-quality products, compare choices, and shop within budget.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#727b76]">
              <span className="inline-flex items-center gap-1 rounded-md border border-[#e8ece9] bg-white px-2.5 py-1">
                <Shield className="size-3 text-[#0f766e]" />
                Transparent Pricing
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-[#e8ece9] bg-white px-2.5 py-1">
                <CreditCard className="size-3 text-[#0f766e]" />
                PayPal Sandbox Ready
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-[#e8ece9] bg-white px-2.5 py-1">
                <Cpu className="size-3 text-[#0f766e]" />
                OpenRouter Powered
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#202522]">
              Shopping
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/shop" className="transition-colors hover:text-[#202522]">
                  Shopping Workspace
                </Link>
              </li>
              <li>
                <Link href="/#scenarios" className="transition-colors hover:text-[#202522]">
                  Curated Setups
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="transition-colors hover:text-[#202522]">
                  Explore Categories
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="transition-colors hover:text-[#202522]">
                  How AgentCart Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#202522]">
              Categories
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/shop?category=workspace" className="transition-colors hover:text-[#202522]">
                  Workspace & Desks
                </Link>
              </li>
              <li>
                <Link href="/shop?category=electronics" className="transition-colors hover:text-[#202522]">
                  Monitors & Displays
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="transition-colors hover:text-[#202522]">
                  Peripherals & Audio
                </Link>
              </li>
              <li>
                <Link href="/shop?category=furniture" className="transition-colors hover:text-[#202522]">
                  Ergonomic Seating
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#202522]">
              Trust & Legal
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <span className="cursor-pointer transition-colors hover:text-[#202522]">
                  About AgentCart
                </span>
              </li>
              <li>
                <span className="cursor-pointer transition-colors hover:text-[#202522]">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="cursor-pointer transition-colors hover:text-[#202522]">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="cursor-pointer transition-colors hover:text-[#202522]">
                  Developer API Health
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#e8ece9] pt-8 sm:flex-row text-xs text-[#727b76]">
          <p>© 2026 AgentCart AI. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[11px]">
            <HeartHandshake className="size-3.5 text-[#0f766e]" />
            <span>Phase 01 UI Foundation · Light Theme Experience</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
