"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useShoppingCart } from "../context/cart-context";
import { CartItemRow } from "./cart-item";

export function CartDrawer() {
  const {
    items,
    totalItems,
    formattedSubtotal,
    subtotal,
    estimatedShipping,
    estimatedTax,
    formattedTotal,
    isCartOpen,
    closeCart,
    clearCart,
  } = useShoppingCart();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const freeShippingThreshold = 50;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <>
      <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col justify-between border-l border-[#e8ece9] bg-white p-0 sm:max-w-md"
        >
          <div className="flex h-full flex-col overflow-hidden">
            {/* Header */}
            <SheetHeader className="border-b border-[#e8ece9] px-6 py-4">
              <div className="flex items-center justify-between pr-6">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#eaf5f2] text-[#0f766e]">
                    <ShoppingBag className="size-4" />
                  </div>
                  <SheetTitle className="text-base font-semibold text-[#202522]">
                    Shopping Cart ({totalItems})
                  </SheetTitle>
                </div>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-[#727b76] underline-offset-4 hover:text-rose-600 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <SheetDescription className="text-xs text-[#727b76]">
                Curated items ready for final review and PayPal checkout.
              </SheetDescription>

              {/* Free shipping banner */}
              {items.length > 0 && (
                <div className="mt-3 rounded-lg border border-[#e8ece9] bg-[#f8faf9] p-2.5 text-xs text-[#202522]">
                  <div className="flex items-center justify-between text-[11px] font-medium text-[#727b76]">
                    <span>
                      {subtotal >= freeShippingThreshold ? (
                        <span className="font-semibold text-[#0f766e]">
                          ✓ Qualified for Free Standard Shipping!
                        </span>
                      ) : (
                        `Add $${remainingForFreeShipping.toFixed(2)} more for Free Shipping`
                      )}
                    </span>
                    <span>{Math.round(progressToFreeShipping)}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#e8ece9]">
                    <div
                      className="h-full bg-[#0f766e] transition-all duration-300"
                      style={{ width: `${progressToFreeShipping}%` }}
                    />
                  </div>
                </div>
              )}
            </SheetHeader>

            {/* Cart Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl border border-[#e8ece9] bg-[#f8faf9] text-[#727b76]">
                    <ShoppingBag className="size-6 text-[#727b76]" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[#202522]">
                    Your cart is currently empty
                  </h3>
                  <p className="mt-1.5 max-w-xs text-xs text-[#727b76]">
                    Describe what you need in the shopping assistant to discover curated product recommendations.
                  </p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[#0f766e] px-4 py-2 text-xs font-medium text-white shadow-xs transition-colors hover:bg-[#115e59]"
                  >
                    <Sparkles className="size-3.5" />
                    Explore Assistant
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#e8ece9]">
                  {items.map((item) => (
                    <CartItemRow key={item.product.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <SheetFooter className="border-t border-[#e8ece9] bg-[#f8faf9] p-6">
                <div className="w-full space-y-2 text-xs text-[#727b76]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#202522]">{formattedSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span className="font-medium text-[#202522]">
                      {estimatedShipping === 0 ? (
                        <span className="text-[#0f766e]">FREE</span>
                      ) : (
                        `$${estimatedShipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax (8%)</span>
                    <span className="font-medium text-[#202522]">${estimatedTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#e8ece9] pt-2 text-sm font-semibold text-[#202522]">
                    <span>Total</span>
                    <span className="text-base text-[#0f766e]">{formattedTotal}</span>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() => setCheckoutModalOpen(true)}
                      className="w-full bg-[#0f766e] text-white hover:bg-[#115e59]"
                      size="lg"
                    >
                      <span>Proceed to Review</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-[#727b76]">
                    <ShieldCheck className="size-3.5 text-[#0f766e]" />
                    <span>Secure PayPal checkout integration ready for Phase 02</span>
                  </div>
                </div>
              </SheetFooter>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Phase 01 Boundary Modal for Checkout Review */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#e8ece9] bg-white p-6 shadow-xl">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#eaf5f2] text-[#0f766e]">
              <CheckCircle2 className="size-6" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[#202522]">
              Cart Order Prepared
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#727b76]">
              Your {totalItems} items ({formattedTotal}) are verified and organized in the local cart.
            </p>

            <div className="mt-4 rounded-xl border border-[#e8ece9] bg-[#f8faf9] p-3 text-xs text-[#202522]">
              <div className="font-medium text-[#0f766e]">Phase 01 UI Foundation Note:</div>
              <p className="mt-1 text-[#727b76]">
                Live PayPal order creation and webhook processing are strictly scoped for Phase 02. No actual transaction has taken place.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Button
                variant="outline"
                onClick={() => setCheckoutModalOpen(false)}
                className="border-[#e8ece9] text-[#202522]"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setCheckoutModalOpen(false);
                  closeCart();
                }}
                className="bg-[#0f766e] text-white hover:bg-[#115e59]"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
