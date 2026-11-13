import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/features/shopping/context/cart-context";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgentCart — Shopping, figured out.",
  description:
    "Intelligent shopping assistant that finds the right products and builds a setup around your budget with verified MongoDB catalog data.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      style={{ colorScheme: "light" }}
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        inter.variable,
        "bg-[#F8F7FB] text-[#211B2E]"
      )}
    >
      <body className="min-h-full flex flex-col bg-[#F8F7FB] text-[#211B2E]">
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
