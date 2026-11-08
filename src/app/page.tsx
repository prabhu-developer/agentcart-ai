import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#080B14] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6">
        <header className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-violet-600">
              <Sparkles className="size-5" />
            </div>

            <span className="text-xl font-semibold tracking-tight">
              AgentCart
            </span>
          </Link>

          <span className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/60">
            AI-powered commerce
          </span>
        </header>

        <section
          id="how-it-works"
          className="flex flex-1 flex-col items-center justify-center py-24 text-center"
        >
          <div className="mb-8 flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
            <Sparkles className="size-4" />
            Shopping, reimagined with AI
          </div>

          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
            Tell us what you need.
            <span className="mt-3 block bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              We&apos;ll handle the shopping.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/50">
            Your intelligent shopping agent discovers products,
            compares options, optimizes your budget and prepares
            your purchase with PayPal.
          </p>

          <Link
            href="#how-it-works"
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-medium transition hover:bg-violet-500"
          >
            Explore AgentCart
            <ArrowUpRight className="size-4" />
          </Link>

          <p className="mt-5 text-xs text-white/30">
            Intelligent decisions. Transparent shopping. Secure checkout.
          </p>
        </section>

        <footer className="border-t border-white/10 py-6 text-center text-xs text-white/30">
          AgentCart · AI-powered agentic commerce
        </footer>
      </div>
    </main>
  );
}