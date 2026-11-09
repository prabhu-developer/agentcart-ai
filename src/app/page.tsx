import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Wallet,
  ShoppingBag,
  CreditCard,
  Eye,
  Layers,
} from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroPromptBox } from "@/components/home/hero-prompt-box";
import { MOCK_SCENARIOS } from "@/features/shopping/data/mock-products";
import { CartDrawer } from "@/features/shopping/components/cart-drawer";
import { ProductComparisonModal } from "@/features/shopping/components/product-comparison-modal";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#202522]">
      <SiteHeader />

      <main className="flex-1">
        {/* ===================== HERO SECTION ===================== */}
        <section className="relative overflow-hidden border-b border-[#e8ece9] bg-gradient-to-b from-[#f8faf9] to-white py-16 sm:py-24 lg:py-28">
          <Container className="flex flex-col items-center text-center">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0f766e]/20 bg-[#eaf5f2] px-3.5 py-1 text-xs font-semibold text-[#0f766e] shadow-xs">
              <Sparkles className="size-3.5" />
              <span>Next-Generation AI Shopping Companion</span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-[#202522] sm:text-6xl lg:text-7xl">
              Shopping should feel{" "}
              <span className="text-[#0f766e]">effortless.</span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#727b76] sm:text-lg">
              Tell AgentCart what you&apos;re looking for. We&apos;ll help you discover, compare, and organize the right products within your budget.
            </p>

            {/* Natural-Language Input Box */}
            <div className="mt-10 flex w-full justify-center">
              <HeroPromptBox />
            </div>

            {/* Micro Highlights */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[#727b76]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-[#0f766e]" />
                <span>Zero manual catalog browsing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-[#0f766e]" />
                <span>Strict budget optimization</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-[#0f766e]" />
                <span>Side-by-side objective comparison</span>
              </div>
            </div>
          </Container>
        </section>

        {/* ===================== FEATURED SHOPPING SCENARIOS ===================== */}
        <section id="scenarios" className="border-b border-[#e8ece9] py-16 sm:py-24">
          <Container>
            <SectionHeading
              badge="Curated Collections"
              title="Featured Shopping Scenarios"
              description="Explore realistic, ready-to-personalize bundles tailored for modern remote professionals, creators, and everyday productivity."
            />

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {MOCK_SCENARIOS.map((scenario) => {
                const totalPrice = scenario.featuredProducts.reduce(
                  (sum, p) => sum + p.price,
                  0
                );
                return (
                  <div
                    key={scenario.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e8ece9] bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#0f766e]/30 hover:shadow-lg"
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="relative aspect-16/10 w-full overflow-hidden bg-[#f8faf9]">
                        <Image
                          src={scenario.image}
                          alt={scenario.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                          className="object-cover transition-transform duration-300 group-hover:scale-103"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="rounded-md border border-white/60 bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#0f766e] backdrop-blur-xs">
                            {scenario.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center justify-between text-xs text-[#727b76]">
                          <span>Budget target</span>
                          <span className="font-semibold text-[#202522]">
                            Under ${scenario.targetBudget}
                          </span>
                        </div>

                        <h3 className="mt-2 text-base font-bold text-[#202522]">
                          {scenario.title}
                        </h3>

                        <p className="mt-1.5 text-xs leading-relaxed text-[#727b76] line-clamp-2">
                          {scenario.description}
                        </p>

                        {/* Included Products List */}
                        <div className="mt-4 border-t border-[#e8ece9] pt-3">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#727b76]">
                            Includes ({scenario.featuredProducts.length} items):
                          </span>
                          <ul className="mt-1.5 space-y-1 text-xs text-[#202522]">
                            {scenario.featuredProducts.slice(0, 3).map((item) => (
                              <li key={item.id} className="flex justify-between truncate">
                                <span className="truncate text-[#727b76]">{item.name}</span>
                                <span className="font-medium shrink-0 ml-2">
                                  ${item.price.toFixed(0)}
                                </span>
                              </li>
                            ))}
                            {scenario.featuredProducts.length > 3 && (
                              <li className="text-[11px] text-[#0f766e]">
                                + {scenario.featuredProducts.length - 3} more curated items
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="border-t border-[#e8ece9] bg-[#f8faf9] p-4">
                      <div className="mb-3 flex items-baseline justify-between text-xs">
                        <span className="text-[#727b76]">Estimated Total:</span>
                        <span className="text-base font-bold text-[#0f766e]">
                          ${totalPrice.toFixed(2)}
                        </span>
                      </div>

                      <Link
                        href={`/shop?q=${encodeURIComponent(scenario.prompt)}`}
                        className="w-full"
                      >
                        <Button
                          className="w-full bg-[#0f766e] text-white hover:bg-[#115e59]"
                          size="sm"
                        >
                          <span>Explore This Setup</span>
                          <ArrowRight className="size-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* ===================== HOW IT WORKS ===================== */}
        <section id="how-it-works" className="border-b border-[#e8ece9] bg-[#f8faf9] py-16 sm:py-24">
          <Container>
            <SectionHeading
              badge="Transparent Process"
              title="How AgentCart Works"
              description="A conversational approach designed to save hours of tab-switching and buyer hesitation."
            />

            <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Step 1 */}
              <div className="relative rounded-2xl border border-[#e8ece9] bg-white p-6 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf5f2] text-sm font-bold text-[#0f766e]">
                  01
                </div>
                <h3 className="mt-4 text-base font-bold text-[#202522]">
                  1. Describe Your Needs
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#727b76]">
                  State what you are looking for in natural language — including your exact spending limit, preferences, and daily requirements.
                </p>
                <div className="mt-4 rounded-lg border border-[#e8ece9] bg-[#f8faf9] p-2.5 text-[11px] text-[#727b76] italic">
                  &ldquo;A clean workspace setup under $1,000 for programming.&rdquo;
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-2xl border border-[#e8ece9] bg-white p-6 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf5f2] text-sm font-bold text-[#0f766e]">
                  02
                </div>
                <h3 className="mt-4 text-base font-bold text-[#202522]">
                  2. Discover Relevant Products
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#727b76]">
                  AgentCart intelligently matches products, filters incompatible options, and structures a coherent set of recommendations.
                </p>
                <div className="mt-4 rounded-lg border border-[#e8ece9] bg-[#f8faf9] p-2.5 text-[11px] text-[#727b76] italic">
                  Verified stock, ergonomic ratings, and verified specs.
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-2xl border border-[#e8ece9] bg-white p-6 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf5f2] text-sm font-bold text-[#0f766e]">
                  03
                </div>
                <h3 className="mt-4 text-base font-bold text-[#202522]">
                  3. Compare Your Options
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#727b76]">
                  Compare specifications side-by-side with genuine pros and trade-offs before committing any dollars.
                </p>
                <div className="mt-4 rounded-lg border border-[#e8ece9] bg-[#f8faf9] p-2.5 text-[11px] text-[#727b76] italic">
                  Side-by-side display resolutions, battery life, and materials.
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative rounded-2xl border border-[#e8ece9] bg-white p-6 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf5f2] text-sm font-bold text-[#0f766e]">
                  04
                </div>
                <h3 className="mt-4 text-base font-bold text-[#202522]">
                  4. Review &amp; Checkout
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#727b76]">
                  Build your organized cart with live subtotal and shipping calculations, preparing for secure PayPal payment.
                </p>
                <div className="mt-4 rounded-lg border border-[#e8ece9] bg-[#f8faf9] p-2.5 text-[11px] text-[#727b76] italic">
                  Transparent breakdown without surprise checkout fees.
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ===================== PRODUCT CATEGORIES ===================== */}
        <section id="categories" className="border-b border-[#e8ece9] py-16 sm:py-24">
          <Container>
            <SectionHeading
              badge="Product Ecosystem"
              title="Curated Categories"
              description="High-grade hardware, ergonomic seating, and accessories chosen for performance and reliability."
            />

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/shop?category=workspace"
                className="group relative overflow-hidden rounded-2xl border border-[#e8ece9] bg-white p-6 shadow-xs transition-all hover:border-[#0f766e]/30 hover:shadow-md"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#eaf5f2] text-[#0f766e]">
                  <Layers className="size-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#202522] group-hover:text-[#0f766e]">
                  Workspace &amp; Monitors
                </h3>
                <p className="mt-1 text-xs text-[#727b76]">
                  QHD and 4K displays with high refresh rates and full ergonomic stands.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0f766e]">
                  Explore Category <ArrowRight className="size-3" />
                </span>
              </Link>

              <Link
                href="/shop?category=accessories"
                className="group relative overflow-hidden rounded-2xl border border-[#e8ece9] bg-white p-6 shadow-xs transition-all hover:border-[#0f766e]/30 hover:shadow-md"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#eaf5f2] text-[#0f766e]">
                  <Sparkles className="size-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#202522] group-hover:text-[#0f766e]">
                  Tactile Peripherals
                </h3>
                <p className="mt-1 text-xs text-[#727b76]">
                  Mechanical keyboards, precision wireless mice, and 100W USB-C hubs.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0f766e]">
                  Explore Category <ArrowRight className="size-3" />
                </span>
              </Link>

              <Link
                href="/shop?category=furniture"
                className="group relative overflow-hidden rounded-2xl border border-[#e8ece9] bg-white p-6 shadow-xs transition-all hover:border-[#0f766e]/30 hover:shadow-md"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#eaf5f2] text-[#0f766e]">
                  <ShieldCheck className="size-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#202522] group-hover:text-[#0f766e]">
                  Ergonomic Seating
                </h3>
                <p className="mt-1 text-xs text-[#727b76]">
                  Commercial-grade mesh chairs with dynamic lumbar relief for 8+ hour workdays.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0f766e]">
                  Explore Category <ArrowRight className="size-3" />
                </span>
              </Link>

              <Link
                href="/shop?category=lifestyle"
                className="group relative overflow-hidden rounded-2xl border border-[#e8ece9] bg-white p-6 shadow-xs transition-all hover:border-[#0f766e]/30 hover:shadow-md"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#eaf5f2] text-[#0f766e]">
                  <ShoppingBag className="size-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#202522] group-hover:text-[#0f766e]">
                  Travel &amp; Lifestyle
                </h3>
                <p className="mt-1 text-xs text-[#727b76]">
                  Weather-resistant tech backpacks, ANC travel headphones, and desk lamps.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0f766e]">
                  Explore Category <ArrowRight className="size-3" />
                </span>
              </Link>
            </div>
          </Container>
        </section>

        {/* ===================== TRUST & GUARANTEE ===================== */}
        <section id="guarantee" className="border-b border-[#e8ece9] bg-[#f8faf9] py-16 sm:py-24">
          <Container>
            <SectionHeading
              badge="Customer Trust"
              title="Shopping Grounded in Integrity"
              description="AgentCart puts customer decisions first with transparent pricing and objective evaluation."
            />

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#e8ece9] bg-white p-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf5f2] text-[#0f766e]">
                  <Wallet className="size-5" />
                </div>
                <h4 className="mt-3.5 text-sm font-bold text-[#202522]">
                  Transparent Product Pricing
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-[#727b76]">
                  No hidden markups or misleading discounts. Prices and savings are tracked with clear itemized breakdowns.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e8ece9] bg-white p-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf5f2] text-[#0f766e]">
                  <Eye className="size-5" />
                </div>
                <h4 className="mt-3.5 text-sm font-bold text-[#202522]">
                  Customer-Controlled Decisions
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-[#727b76]">
                  The AI proposes recommendations, but you have 100% control over every addition, substitution, or removal.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e8ece9] bg-white p-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf5f2] text-[#0f766e]">
                  <CreditCard className="size-5" />
                </div>
                <h4 className="mt-3.5 text-sm font-bold text-[#202522]">
                  PayPal Integration Ready
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-[#727b76]">
                  Built with enterprise-grade payment architecture designed for smooth, secure checkout transitions in Phase 02.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e8ece9] bg-white p-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf5f2] text-[#0f766e]">
                  <SlidersHorizontal className="size-5" />
                </div>
                <h4 className="mt-3.5 text-sm font-bold text-[#202522]">
                  Objective Comparisons
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-[#727b76]">
                  Every product lists realistic trade-offs and limitations alongside its strengths so you can buy with confidence.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* ===================== BOTTOM CTA ===================== */}
        <section className="py-20">
          <Container size="narrow" className="text-center">
            <div className="rounded-3xl border border-[#e8ece9] bg-[#f8faf9] p-8 sm:p-12 shadow-sm">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#0f766e] text-white">
                <Sparkles className="size-6" />
              </div>

              <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#202522] sm:text-3xl">
                Ready to shop without the headache?
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#727b76]">
                Launch the AgentCart workspace right now. Describe your ideal setup, review curated suggestions, and build your cart.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/shop">
                  <Button
                    size="lg"
                    className="h-11 bg-[#0f766e] px-6 text-sm font-semibold text-white hover:bg-[#115e59]"
                  >
                    <span>Launch Shopping Assistant</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>

                <Link href="#scenarios">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-11 border-[#e8ece9] px-6 text-sm text-[#202522]"
                  >
                    <span>Browse Scenarios</span>
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />

      {/* Global Drawers */}
      <CartDrawer />
      <ProductComparisonModal />
    </div>
  );
}
