import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e5e9e7] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Brand + tagline */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold tracking-tight text-[#111817]">
              AgentCart
            </span>
            <span className="text-xs text-[#7a8580]">
              AI-powered · PayPal Sandbox
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center gap-6 text-xs text-[#7a8580]">
            <Link
              href="/shop"
              className="transition-colors hover:text-[#0a5c55]"
            >
              Assistant
            </Link>
            <a
              href="#setups"
              className="transition-colors hover:text-[#0a5c55]"
            >
              Setups
            </a>
            <span className="text-[#e5e9e7]">·</span>
            <span className="text-[#7a8580]">PayPal Sandbox</span>
          </nav>
        </div>

        {/* Developer credit */}
        <div className="mt-8 border-t border-[#f4f6f5] pt-6 text-xs text-[#7a8580]">
          Developed by{" "}
          <a
            href="https://prabhu-coder.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            title="Prabhu Kannan — Senior Software Engineer"
            className="font-medium text-[#374040] underline decoration-[#e5e9e7] underline-offset-4 transition-colors hover:text-[#0a5c55] hover:decoration-[#0a5c55]"
          >
            prabhu.coder
          </a>
        </div>
      </div>
    </footer>
  );
}
