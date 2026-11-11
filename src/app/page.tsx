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
    <div className="min-h-screen bg-white text-[#181c1a]">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-20 text-center sm:pt-28 sm:pb-24">
          <p className="text-xs font-medium tracking-[0.14em] text-[#0f766e] uppercase">
            Personal AI Shopping
          </p>

          <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-[#181c1a] sm:text-5xl sm:leading-[1.1]">
            Shop thoughtfully, within budget.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#6b7470]">
            Tell AgentCart what you are building. Get curated products, clear comparisons, and effortless checkout.
          </p>

          <div className="mt-10">
            <HeroPromptBox />
          </div>
        </section>

        {/* Curated Setups */}
        <section
          id="setups"
          className="mx-auto max-w-6xl border-t border-[#eef1ef] px-6 py-20"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#181c1a]">
                Curated setups
              </h2>
              <p className="mt-1 text-sm text-[#6b7470]">
                Start from a real-world goal and adjust to fit your budget.
              </p>
            </div>

            <Link
              href="/shop?category=all"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0f766e] transition-opacity hover:opacity-80"
            >
              <span>Browse catalog</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
            {MOCK_SCENARIOS.map((scenario) => (
              <Link
                key={scenario.id}
                href={`/shop?q=${encodeURIComponent(scenario.prompt)}`}
                className="group block"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#f8faf9]">
                  <Image
                    src={scenario.image}
                    alt={scenario.title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </div>

                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h3 className="text-base font-medium text-[#181c1a] transition-colors group-hover:text-[#0f766e]">
                    {scenario.title}
                  </h3>
                  <span className="shrink-0 text-xs font-medium text-[#0f766e]">
                    {scenario.tagline}
                  </span>
                </div>

                <p className="mt-1 line-clamp-2 text-sm text-[#6b7470]">
                  {scenario.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Catalog Selection */}
        <section className="mx-auto max-w-6xl border-t border-[#eef1ef] px-6 py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#181c1a]">
                Selected pieces
              </h2>
              <p className="mt-1 text-sm text-[#6b7470]">
                Inspect specifications or add directly to your cart.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_PICKS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2.5">
            <span className="mr-2 text-xs text-[#8a948f]">Categories:</span>
            {CATEGORIES.map((category) => (
              <Link
                key={category.label}
                href={category.href}
                className="rounded-full border border-[#e8ece9] bg-[#fcfdfc] px-4 py-1.5 text-xs font-medium text-[#4b544f] transition-colors hover:border-[#0f766e] hover:bg-white hover:text-[#0f766e]"
              >
                {category.label}
              </Link>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="mx-auto max-w-6xl border-t border-[#eef1ef] px-6 py-20"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-[#181c1a]">
            How it works
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
            {STEPS.map((item) => (
              <div key={item.step} className="space-y-2">
                <span className="text-xs font-medium tabular-nums text-[#0f766e]">
                  {item.step}
                </span>
                <h3 className="text-base font-medium text-[#181c1a]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#6b7470]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quiet CTA */}
        <section className="mx-auto max-w-6xl border-t border-[#eef1ef] px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-[#181c1a] sm:text-3xl">
            Ready when you are.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#6b7470]">
            Start a shopping conversation or explore the full catalog at your own pace.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0f766e] px-6 text-sm font-medium text-white transition-colors hover:bg-[#0d655e]"
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
