"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Receipt,
} from "lucide-react";
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
import { CheckoutPreparation } from "@/features/cart/types";
import { PayPalCheckoutButton } from "@/features/checkout/components/paypal-checkout-button";
import { ConfirmedOrderDTO } from "@/features/checkout/services/checkout-service";

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
    validationIssues,
    validateForCheckout,
    refreshCart,
  } = useShoppingCart();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [prepResult, setPrepResult] = useState<CheckoutPreparation | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrderDTO | null>(null);

  const freeShippingThreshold = 50;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleProceedToReview = async () => {
    setIsValidating(true);
    setConfirmedOrder(null);
    const result = await validateForCheckout();
    setIsValidating(false);
    if (result) {
      setPrepResult(result);
      setCheckoutModalOpen(true);
    }
  };

  const handlePaymentSuccess = (order: ConfirmedOrderDTO) => {
    setConfirmedOrder(order);
    refreshCart();
  };

  const handleCloseSuccess = () => {
    setConfirmedOrder(null);
    setCheckoutModalOpen(false);
    closeCart();
  };

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
                    onClick={() => clearCart()}
                    className="text-xs text-[#727b76] underline-offset-4 hover:text-rose-600 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <SheetDescription className="text-xs text-[#727b76]">
                Server-validated cart items backed by real-time MongoDB inventory.
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

              {/* Active Cart Validation Issues Alert */}
              {validationIssues.length > 0 && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                    <AlertTriangle className="size-3.5" />
                    <span>Cart Inventory Notices:</span>
                  </div>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px] text-amber-700">
                    {validationIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
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
                    Describe what you need in the AI shopping assistant to discover curated, budget-optimized product recommendations.
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
                    <span>Authoritative Subtotal</span>
                    <span className="font-semibold text-[#202522]">{formattedSubtotal}</span>
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
                    <span>Estimated Total</span>
                    <span className="text-base text-[#0f766e]">{formattedTotal}</span>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleProceedToReview}
                      disabled={isValidating}
                      className="w-full bg-[#0f766e] text-white hover:bg-[#115e59]"
                      size="lg"
                    >
                      {isValidating ? (
                        <>
                          <Sparkles className="size-4 animate-spin" />
                          <span>Validating with MongoDB...</span>
                        </>
                      ) : (
                        <>
                          <span>Proceed to Review</span>
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-[#727b76]">
                    <ShieldCheck className="size-3.5 text-[#0f766e]" />
                    <span>Server-authoritative cart with minor-unit precision</span>
                  </div>
                </div>
              </SheetFooter>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Phase 05 Server Checkout & PayPal Payment Modal */}
      {checkoutModalOpen && prepResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#e8ece9] bg-white p-6 shadow-2xl">
            {confirmedOrder ? (
              /* Payment Success Receipt Screen */
              <div className="text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#eaf5f2] text-[#0f766e]">
                  <CheckCircle2 className="size-7" />
                </div>

                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <Receipt className="size-3.5" />
                  Payment Captured & Verified
                </span>

                <h3 className="mt-2 text-xl font-bold text-[#202522]">
                  Thank you for your order!
                </h3>
                <p className="mt-1 font-mono text-sm font-semibold text-[#0f766e]">
                  {confirmedOrder.orderNumber}
                </p>

                <div className="mt-4 rounded-xl border border-[#e8ece9] bg-[#f8faf9] p-4 text-left text-xs space-y-2">
                  <div className="flex justify-between font-medium text-[#727b76]">
                    <span>Payment Status</span>
                    <span className="font-semibold text-emerald-700">PAID (PayPal)</span>
                  </div>
                  <div className="flex justify-between font-medium text-[#727b76]">
                    <span>Total Amount Paid</span>
                    <span className="font-bold text-[#202522]">
                      ${confirmedOrder.total.toFixed(2)} {confirmedOrder.currency}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-[#727b76]">
                    <span>Items Purchased</span>
                    <span className="text-[#202522]">{confirmedOrder.items.length} products</span>
                  </div>
                </div>

                {/* Purchased items list */}
                <div className="mt-3 max-h-40 overflow-y-auto divide-y divide-[#e8ece9] rounded-xl border border-[#e8ece9] bg-white p-3 text-left text-xs">
                  {confirmedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 first:pt-0 last:pb-0">
                      <span className="truncate pr-2 text-[#202522]">
                        {item.quantity}× {item.name}
                      </span>
                      <span className="font-semibold text-[#202522]">
                        ${item.lineTotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={handleCloseSuccess}
                    className="w-full bg-[#0f766e] text-white hover:bg-[#115e59]"
                    size="lg"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            ) : (
              /* Pre-Checkout Review & PayPal Payment Screen */
              <>
                <div className="flex items-center justify-between border-b border-[#e8ece9] pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl ${
                        prepResult.isValid
                          ? "bg-[#eaf5f2] text-[#0f766e]"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {prepResult.isValid ? (
                        <CheckCircle2 className="size-5" />
                      ) : (
                        <AlertTriangle className="size-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#202522]">
                        {prepResult.isValid
                          ? "Validated Checkout Review"
                          : "Cart Requires Attention"}
                      </h3>
                      <p className="text-xs text-[#727b76]">
                        Pre-checkout verification via MongoDB backend service
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      prepResult.isValid
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {prepResult.isValid ? "Eligible for Checkout" : "Issues Detected"}
                  </span>
                </div>

                {/* Validation issues if any */}
                {prepResult.issues.length > 0 && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    <span className="font-semibold text-amber-800">
                      Validation issues detected before checkout:
                    </span>
                    <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px] text-amber-700">
                      {prepResult.issues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Itemized Line Items */}
                <div className="mt-4 max-h-48 overflow-y-auto divide-y divide-[#e8ece9] rounded-xl border border-[#e8ece9] bg-[#f8faf9] p-3 text-xs">
                  {prepResult.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate font-semibold text-[#202522]">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[#727b76]">
                          ${item.price.toFixed(2)} × {item.quantity} · {item.brand}
                        </p>
                      </div>
                      <span className="shrink-0 font-bold text-[#202522]">
                        ${item.lineTotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Financial Totals */}
                <div className="mt-3 rounded-xl border border-[#e8ece9] bg-white p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#727b76]">
                    <span>Authoritative Subtotal</span>
                    <span className="font-bold text-[#202522]">
                      {prepResult.formattedSubtotal} ({prepResult.currency})
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#727b76]">
                    <span>Tax & Shipping</span>
                    <span className="italic">$0.00 (not currently charged)</span>
                  </div>
                  <div className="flex justify-between border-t border-[#e8ece9] pt-1.5 font-bold text-[#202522]">
                    <span>Final Checkout Total</span>
                    <span className="text-[#0f766e]">
                      {prepResult.formattedSubtotal} {prepResult.currency}
                    </span>
                  </div>
                </div>

                {/* PayPal Buttons or Close */}
                {prepResult.isValid ? (
                  <div className="mt-4 border-t border-[#e8ece9] pt-4">
                    <PayPalCheckoutButton
                      currency={prepResult.currency}
                      onPaymentSuccess={handlePaymentSuccess}
                    />
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    Please resolve the issues above in your cart before proceeding with payment.
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-2.5">
                  <Button
                    variant="outline"
                    onClick={() => setCheckoutModalOpen(false)}
                    className="border-[#e8ece9] text-[#202522]"
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
