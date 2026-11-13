import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#EAE6F2] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Brand + tagline */}
          <div className="flex items-center gap-3">
            <span className="size-5 rounded-full agentcart-orb-sm" />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#211B2E]">
                AgentCart AI
              </span>
              <span className="text-xs text-[#777181]">
                Verified catalog shopping · PayPal Sandbox integration
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#777181]">
            <Link
              href="/shop"
              className="transition-colors hover:text-[#5125A8]"
            >
              Shopping Workspace
            </Link>
            <Link
              href="/shop?category=all"
              className="transition-colors hover:text-[#5125A8]"
            >
              Catalog
            </Link>
            <a
              href="#setups"
              className="transition-colors hover:text-[#5125A8]"
            >
              Curated Setups
            </a>
            <span className="text-[#EAE6F2]">·</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAE6F2] bg-[#F8F7FB] px-2.5 py-0.5 text-[11px] font-semibold text-[#5125A8]">
              PayPal Sandbox Ready
            </span>
          </nav>
        </div>

        {/* Developer credit */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#F8F7FB] pt-6 sm:flex-row text-xs text-[#777181]">
          <p>© 2026 AgentCart AI. All rights reserved.</p>
          <p>
            Developed by{" "}
            <a
              href="https://prabhu-coder.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              title="Prabhu Kannan — Senior Software Engineer"
              className="font-medium text-[#211B2E] underline decoration-[#EAE6F2] underline-offset-4 transition-colors hover:text-[#5125A8] hover:decoration-[#5125A8]"
            >
              prabhu.coder
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
