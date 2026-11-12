import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
  { label: "Accessories", href: "/shop?category=accessories" },
  { label: "Furniture", href: "/shop?category=furniture" },
  { label: "Lifestyle", href: "/shop?category=lifestyle" },
];

const STEPS = [
  {
    step: "01",
    title: "Describe",
    text: "Share what you need and your target budget in plain language.",
  },
  {
    step: "02",
    title: "Compare",
    text: "Review tailored combinations, compare specs side by side, and check remaining budget.",
  },
  {
    step: "03",
    title: "Checkout",
    text: "Approve items into your cart and complete payment cleanly with PayPal.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#111817]">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pt-24 pb-24 text-center sm:pt-32 sm:pb-28">
          <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight text-[#111817] sm:text-6xl sm:leading-[1.08]">
            Shop thoughtfully,
            <br className="hidden sm:block" /> within budget.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#7a8580]">
            Tell AgentCart what you are building. Get curated products, clear
            comparisons, and effortless checkout.
          </p>

          <div className="mt-10">
            <HeroPromptBox />
          </div>
        </section>

        {/* Curated Setups */}
        <section
          id="setups"
          className="mx-auto max-w-6xl border-t border-[#e5e9e7] px-6 py-20"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#111817]">
                Curated setups
              </h2>
              <p className="mt-1 text-sm text-[#7a8580]">
                Start from a real-world goal and adjust to fit your budget.
              </p>
            </div>

            <Link
              href="/shop?category=all"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a5c55] transition-opacity hover:opacity-75"
            >
              <span>Browse catalog</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
            {MOCK_SCENARIOS.map((scenario) => (
              <Link
                key={scenario.id}
                href={`/shop?q=${encodeURIComponent(scenario.prompt)}`}
                className="group block"
              >
                {/* Image card */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#f4f6f5]">
                  <Image
                    src={scenario.image}
                    alt={scenario.title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  {/* Badge top-left */}
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase text-[#0a5c55] backdrop-blur-sm">
                    {scenario.tagline}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold tracking-tight text-[#111817] transition-colors group-hover:text-[#0a5c55]">
                    {scenario.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-[#7a8580]">
                    {scenario.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Catalog Selection */}
        <section className="mx-auto max-w-6xl border-t border-[#e5e9e7] px-6 py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#111817]">
                Selected pieces
              </h2>
              <p className="mt-1 text-sm text-[#7a8580]">
                Inspect specifications or add directly to your cart.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_PICKS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2.5">
            <span className="mr-2 text-xs tracking-[0.1em] text-[#7a8580] uppercase">
              Categories
            </span>
            {CATEGORIES.map((category) => (
              <Link
                key={category.label}
                href={category.href}
                className="rounded-full border border-[#e5e9e7] bg-[#fafafa] px-4 py-1.5 text-xs font-medium text-[#374040] transition-all hover:border-[#0a5c55] hover:bg-white hover:text-[#0a5c55]"
              >
                {category.label}
              </Link>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="mx-auto max-w-6xl border-t border-[#e5e9e7] px-6 py-20"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-[#111817]">
            How it works
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
            {STEPS.map((item) => (
              <div key={item.step} className="space-y-2.5">
                <span className="text-[11px] tabular-nums font-mono text-[#0a5c55]">
                  {item.step}
                </span>
                <h3 className="text-lg font-medium text-[#111817]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#7a8580]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl border-t border-[#e5e9e7] px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-[#111817] sm:text-3xl">
            Ready when you are.
          </h2>
          <div className="mt-7 flex items-center justify-center">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0a5c55] px-7 text-sm font-medium text-white transition-colors hover:bg-[#084f49]"
            >
              <span>Open Assistant</span>
              <ArrowRight className="size-4" />
            </Link>
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
