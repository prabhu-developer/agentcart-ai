"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CheckoutPreparation } from "@/features/cart/types";
import { PayPalCheckoutButton } from "@/features/checkout/components/paypal-checkout-button";
import { ConfirmedOrderDTO } from "@/features/checkout/services/checkout-service";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useShoppingCart } from "../context/cart-context";
import { CartItemRow } from "./cart-item";

export function CartDrawer() {
  const {
    items,
    totalItems,
    formattedSubtotal,
    isCartOpen,
    openCart,
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
  const [checkoutAttemptKey, setCheckoutAttemptKey] = useState<string>("");

  useEffect(() => {
    if (!checkoutModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmedOrder) {
          setConfirmedOrder(null);
        }
        setCheckoutModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [checkoutModalOpen, confirmedOrder]);

  const handleProceedToReview = async () => {
    setIsValidating(true);
    setConfirmedOrder(null);
    const result = await validateForCheckout();
    setIsValidating(false);
    if (result) {
      setPrepResult(result);
      setCheckoutAttemptKey(
        `checkout-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`
      );
      closeCart();
      setCheckoutModalOpen(true);
    }
  };

  const handleBackToCart = () => {
    setCheckoutModalOpen(false);
    openCart();
  };

  const handleCloseModal = () => {
    if (confirmedOrder) {
      setConfirmedOrder(null);
    }
    setCheckoutModalOpen(false);
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
          className="flex h-full w-full flex-col justify-between border-l border-[#EAE6F2] bg-white p-0 sm:max-w-md shadow-2xl"
        >
          <div className="flex h-full flex-col overflow-hidden">
            {/* Header */}
            <SheetHeader className="border-b border-[#EAE6F2] px-6 py-5 bg-white">
              <div className="flex items-center justify-between pr-8">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-[#F2EDFC] text-[#5125A8]">
                    <ShoppingBag className="size-4.5" />
                  </div>
                  <div>
                    <SheetTitle className="text-base font-bold text-[#211B2E]">
                      Shopping Cart
                    </SheetTitle>
                  </div>
                  <span className="rounded-full bg-[#F2EDFC] px-2.5 py-0.5 text-xs font-bold tabular-nums text-[#5125A8]">
                    {totalItems}
                  </span>
                </div>

                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => clearCart()}
                    className="cursor-pointer text-xs font-semibold text-[#777181] transition-colors hover:text-[#211B2E]"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <SheetDescription className="text-xs text-[#777181] pt-1">
                Review your items before server-authoritative checkout.
              </SheetDescription>

              {validationIssues.length > 0 && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                    <AlertTriangle className="size-3.5" />
                    <span>Cart notice</span>
                  </div>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-amber-700">
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
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-[#F8F7FB] text-[#777181]">
                    <ShoppingBag className="size-6 text-[#5125A8]" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[#211B2E]">
                    Your cart is empty
                  </h3>
                  <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[#777181]">
                    Ask AgentCart for a setup recommendation or describe your target budget in the workspace.
                  </p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="mt-6 inline-flex h-9.5 items-center gap-2 rounded-xl bg-[#5125A8] px-4.5 text-xs font-semibold text-white transition-all hover:bg-[#431E8C]"
                  >
                    <span>Open Assistant</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#EAE6F2]">
                  {items.map((item) => (
                    <CartItemRow key={item.product.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <SheetFooter className="border-t border-[#EAE6F2] bg-[#F8F7FB] p-6">
                <div className="w-full space-y-3 text-xs text-[#211B2E]">
                  <div className="flex justify-between">
                    <span className="text-[#777181]">Subtotal</span>
                    <span className="font-semibold tabular-nums text-[#211B2E]">
                      {formattedSubtotal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#777181]">Shipping</span>
                    <span className="font-semibold text-[#18865B]">Free</span>
                  </div>
                  <div className="flex justify-between border-t border-[#EAE6F2] pt-3 text-sm font-semibold text-[#211B2E]">
                    <span>Total</span>
                    <span className="text-base font-bold tabular-nums text-[#5125A8]">
                      {formattedSubtotal}
                    </span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleProceedToReview}
                      disabled={isValidating}
                      className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#5125A8] px-5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#431E8C] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Preparing checkout...</span>
                        </>
                      ) : (
                        <>
                          <span>Proceed to checkout</span>
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </SheetFooter>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Checkout Review & PayPal Payment Modal */}
      {checkoutModalOpen &&
        prepResult &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-[#211B2E]/50 p-4 backdrop-blur-md animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label={confirmedOrder ? "Order confirmed" : "Checkout"}
          >
            <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] border border-[#EAE6F2] bg-white p-6 shadow-2xl sm:p-7 animate-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Close checkout"
                className="absolute top-5 right-5 flex size-8.5 cursor-pointer items-center justify-center rounded-full border border-[#EAE6F2] bg-white text-[#777181] transition-colors hover:bg-[#F8F7FB] hover:text-[#211B2E]"
              >
                <X className="size-4" />
              </button>

              {confirmedOrder ? (
                /* Payment Success Receipt (Screen 5) */
                <div className="space-y-5 pt-2 text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#EDFAF2] text-[#16A34A] border border-[#D5F5E3]">
                    <CheckCircle2 className="size-7" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-[#211B2E]">
                      Order confirmed
                    </h3>
                    <p className="mt-1 font-mono text-xs font-semibold text-[#5125A8]">
                      {confirmedOrder.orderNumber}
                    </p>
                  </div>

                  <div className="divide-y divide-[#EAE6F2] rounded-2xl border border-[#EAE6F2] bg-[#F8F7FB] px-4 py-3 text-left text-xs">
                    <div className="flex justify-between py-2">
                      <span className="text-[#777181]">Payment status</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#18865B]">
                        <ShieldCheck className="size-3.5" />
                        <span>Paid via PayPal Sandbox</span>
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-[#777181]">Authoritative total</span>
                      <span className="font-bold tabular-nums text-[#211B2E]">
                        ${confirmedOrder.total.toFixed(2)} {confirmedOrder.currency}
                      </span>
                    </div>
                  </div>

                  <div className="max-h-40 divide-y divide-[#EAE6F2] overflow-y-auto rounded-2xl border border-[#EAE6F2] px-4 py-2 text-left text-xs">
                    {confirmedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 py-2"
                      >
                        <span className="truncate text-[#211B2E] font-medium">
                          {item.quantity}× {item.name}
                        </span>
                        <span className="shrink-0 font-bold tabular-nums text-[#211B2E]">
                          ${item.lineTotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseSuccess}
                    className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-[#5125A8] px-5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#431E8C]"
                  >
                    Return to shopping
                  </button>
                </div>
              ) : (
                /* Checkout Review & PayPal Payment (Screen 4) */
                <div className="space-y-5">
                  <div className="pr-8">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-bold tracking-tight text-[#211B2E]">
                        {prepResult.isValid ? "Review & Checkout" : "Review Cart"}
                      </h3>
                      {!prepResult.isValid && (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                          Attention required
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[#777181]">
                      Prices and inventory verified against authoritative MongoDB catalog.
                    </p>
                  </div>

                  {prepResult.issues.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                      <ul className="list-disc space-y-1 pl-4 text-[11px] text-amber-800">
                        {prepResult.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Itemized Summary */}
                  <div className="max-h-44 divide-y divide-[#EAE6F2] overflow-y-auto rounded-2xl border border-[#EAE6F2] bg-[#F8F7FB] px-4 py-1 text-xs">
                    {prepResult.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between gap-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#211B2E]">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-[#777181]">
                            Qty {item.quantity} · ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <span className="shrink-0 font-bold tabular-nums text-[#211B2E]">
                          ${item.lineTotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 border-t border-[#EAE6F2] pt-3 text-xs text-[#211B2E]">
                    <div className="flex justify-between">
                      <span className="text-[#777181]">Subtotal</span>
                      <span className="font-semibold tabular-nums text-[#211B2E]">
                        {prepResult.formattedSubtotal}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777181]">Shipping & tax</span>
                      <span className="font-semibold text-[#18865B]">Free</span>
                    </div>
                    <div className="flex justify-between border-t border-[#EAE6F2] pt-2.5 text-sm font-bold text-[#211B2E]">
                      <span>Authoritative total</span>
                      <span className="text-base font-bold tabular-nums text-[#5125A8]">
                        {prepResult.formattedSubtotal} {prepResult.currency}
                      </span>
                    </div>
                  </div>

                  {/* PayPal Checkout Button */}
                  {prepResult.isValid ? (
                    <div className="border-t border-[#EAE6F2] pt-4">
                      <div className="mb-2 text-center text-[11px] text-[#777181]">
                        Simulated PayPal Sandbox transaction · No real charges
                      </div>
                      <PayPalCheckoutButton
                        currency={prepResult.currency}
                        idempotencyKey={checkoutAttemptKey}
                        onPaymentSuccess={handlePaymentSuccess}
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                      Please adjust your cart items before proceeding with payment.
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleBackToCart}
                      className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#777181] transition-colors hover:text-[#211B2E]"
                    >
                      <ArrowLeft className="size-3.5" />
                      <span>Back to cart</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="cursor-pointer text-xs font-semibold text-[#777181] transition-colors hover:text-[#211B2E]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
