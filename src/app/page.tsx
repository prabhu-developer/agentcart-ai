import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, Columns2, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroPromptBox } from "@/components/home/hero-prompt-box";
import {
  MOCK_PRODUCTS,
  MOCK_SCENARIOS,
} from "@/features/shopping/data/mock-products";
import { ProductCard } from "@/features/shopping/components/product-card";
import { CartDrawer } from "@/features/shopping/components/cart-drawer";
import { ProductComparisonModal } from "@/features/shopping/components/product-comparison-modal";
import { ProductDetailsDialog } from "@/features/shopping/components/product-details-dialog";

const FEATURED_PICKS = MOCK_PRODUCTS.slice(0, 4);

const CATEGORIES = [
  { label: "Workspace", href: "/shop?category=workspace" },
  { label: "Electronics", href: "/shop?category=electronics" },
  { label: "Furniture", href: "/shop?category=furniture" },
  { label: "Accessories", href: "/shop?category=accessories" },
  { label: "Audio", href: "/shop?category=audio" },
];

const STEPS = [
  {
    step: "01",
    title: "Describe your goal",
    text: "Tell AgentCart what you need and your target budget in plain words. No complicated forms.",
  },
  {
    step: "02",
    title: "Compare and verify",
    text: "Review tailored multi-product setups, inspect side-by-side specifications, and keep remaining budget in sight.",
  },
  {
    step: "03",
    title: "Approve and checkout",
    text: "Approve curated items to your cart and complete checkout securely with integrated PayPal Sandbox.",
  },
];

const TAG_STYLES: Record<number, string> = {
  0: "bg-[#FDF2F4] text-[#E11D48] border-[#FDE2E7]",
  1: "bg-[#EDFAF2] text-[#16A34A] border-[#D5F5E3]",
  2: "bg-[#EEF4FF] text-[#2563EB] border-[#DBEAFE]",
  3: "bg-[#FEFCE8] text-[#CA8A04] border-[#FEF08A]",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8F7FB] text-[#211B2E]">
      <SiteHeader />

      <main>
        {/* Hero Section */}
        <section className="relative mx-auto max-w-5xl px-4 pt-20 pb-20 text-center sm:px-6 sm:pt-28 sm:pb-24 lg:px-8">
          {/* Subtle iridescent glow indicator */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#EAE6F2] bg-white px-3.5 py-1 text-xs font-medium text-[#211B2E] shadow-2xs">
            <span className="size-2.5 rounded-full agentcart-orb-sm" />
            <span className="text-[#5125A8] font-semibold">AgentCart AI</span>
            <span className="text-[#777181]">· Personal shopping assistant</span>
          </div>

          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-[#211B2E] sm:text-6xl sm:leading-[1.12]">
            Shopping, figured out.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#777181] sm:text-lg">
            Tell us what you&apos;re looking for. Your AI shopping assistant finds
            the right products and builds a setup around your budget.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#5125A8] px-6 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(81,37,168,0.25)] transition-all hover:bg-[#431E8C]"
            >
              <span>Start shopping</span>
              <ArrowRight className="size-4" />
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#EAE6F2] bg-white px-6 text-sm font-semibold text-[#211B2E] shadow-2xs transition-all hover:border-[#8B6CE8]/50 hover:bg-[#F2EDFC]/60 hover:text-[#5125A8]"
            >
              <span>Explore how it works</span>
            </a>
          </div>

          {/* Interactive shopping prompt */}
          <div className="mt-12">
            <HeroPromptBox />
          </div>
        </section>

        {/* Featured Guides / Curated Setups (matching ref2.png layout & cards) */}
        <section
          id="setups"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-[#6D45D9]">
                <Sparkles className="size-3.5" />
                <span>Featured Setups</span>
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#211B2E] sm:text-3xl">
                Curated configurations
              </h2>
              <p className="mt-1.5 text-sm text-[#777181]">
                Start from a verified brief and let AI adjust every piece to your target budget.
              </p>
            </div>

            <Link
              href="/shop?category=all"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5125A8] transition-opacity hover:opacity-80"
            >
              <span>Browse full catalog</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {MOCK_SCENARIOS.map((scenario, idx) => {
              const tagStyle = TAG_STYLES[idx % 4];
              return (
                <Link
                  key={scenario.id}
                  href={`/shop?q=${encodeURIComponent(scenario.prompt)}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#EAE6F2] bg-white p-4 transition-all duration-200 hover:border-[#8B6CE8]/50 hover:shadow-[0_8px_24px_rgba(33,27,46,0.06)]"
                >
                  {/* Image container */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#F8F7FB]">
                    <Image
                      src={scenario.image}
                      alt={scenario.title}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  {/* Card bottom details */}
                  <div className="mt-4 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-[#211B2E] transition-colors group-hover:text-[#5125A8]">
                            {scenario.title}
                          </h3>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${tagStyle}`}
                          >
                            {scenario.tagline}
                          </span>
                        </div>
                        <div className="flex size-7 items-center justify-center rounded-lg border border-[#EAE6F2] bg-[#F8F7FB] text-[#777181] transition-colors group-hover:border-[#5125A8] group-hover:bg-[#F2EDFC] group-hover:text-[#5125A8]">
                          <ArrowUpRight className="size-4" />
                        </div>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-[#777181] line-clamp-2">
                        {scenario.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#F8F7FB] pt-3 text-xs">
                      <span className="font-semibold text-[#5125A8]">
                        Budget target: {scenario.tagline.includes("$") ? scenario.tagline : "Custom"}
                      </span>
                      <span className="text-[#777181]">
                        {scenario.featuredProducts?.length || 4} curated pieces
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Selected Catalog Pieces */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-[#6D45D9]">
                <Columns2 className="size-3.5" />
                <span>Verified Pieces</span>
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#211B2E] sm:text-3xl">
                Featured catalog picks
              </h2>
              <p className="mt-1.5 text-sm text-[#777181]">
                Real-time MongoDB inventory with authoritative pricing. Compare specs or add directly to your cart.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="rounded-lg border border-[#EAE6F2] bg-white px-3 py-1.5 text-xs font-medium text-[#211B2E] transition-all hover:border-[#8B6CE8]/50 hover:bg-[#F2EDFC] hover:text-[#5125A8]"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_PICKS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="rounded-3xl border border-[#EAE6F2] bg-white p-8 sm:p-12 shadow-[0_4px_20px_rgba(33,27,46,0.03)]">
            <div className="max-w-xl">
              <span className="text-xs font-semibold tracking-wider uppercase text-[#6D45D9]">
                Process
              </span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#211B2E] sm:text-3xl">
                How AgentCart works
              </h2>
              <p className="mt-2 text-sm text-[#777181]">
                Intelligent orchestration grounded in real products, server-authoritative calculations, and customer approval.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              {STEPS.map((item) => (
                <div
                  key={item.step}
                  className="relative rounded-2xl border border-[#EAE6F2] bg-[#F8F7FB] p-6 transition-all hover:border-[#8B6CE8]/40"
                >
                  <span className="font-mono text-xs font-bold text-[#6D45D9]">
                    {item.step}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-[#211B2E]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#777181]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#EAE6F2] pt-6 text-xs text-[#777181]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#18865B]" />
                <span>Zero hallucinated prices or mock inventory</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#18865B]" />
                <span>Explicit user confirmation before cart changes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#18865B]" />
                <span>Tested PayPal Sandbox checkout</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#211B2E] px-6 py-16 text-white shadow-xl sm:px-12 sm:py-20">
            {/* Subtle background glow */}
            <div className="absolute -top-24 -left-24 size-72 rounded-full bg-[#6D45D9]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 size-72 rounded-full bg-[#8B6CE8]/20 blur-3xl pointer-events-none" />

            <div className="relative mx-auto max-w-2xl">
              <span className="size-8 rounded-full agentcart-orb inline-block mb-4" />
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Ready when you are.
              </h2>
              <p className="mt-3 text-sm text-[#A9A4B3] sm:text-base">
                Start a shopping session. Describe your setup requirements and watch AgentCart assemble the ideal combination within budget.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link
                  href="/shop"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-[#211B2E] shadow-sm transition-all hover:bg-[#F2EDFC] hover:text-[#5125A8]"
                >
                  <Sparkles className="size-4 text-[#6D45D9]" />
                  <span>Start shopping</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <CartDrawer />
      <ProductComparisonModal />
      <ProductDetailsDialog />
    </div>
  );
}
