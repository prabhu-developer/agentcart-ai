"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShoppingBag,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
          className="flex h-full w-full flex-col justify-between border-l border-[#eef1ef] bg-white p-0 sm:max-w-md"
        >
          <div className="flex h-full flex-col overflow-hidden">
            {/* Header */}
            <SheetHeader className="border-b border-[#eef1ef] px-6 py-5">
              <div className="flex items-center justify-between pr-8">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="size-4 text-[#0f766e]" />
                  <SheetTitle className="text-base font-semibold text-[#181c1a]">
                    Cart
                  </SheetTitle>
                  <span className="text-xs font-medium text-[#727b76]">
                    ({totalItems})
                  </span>
                </div>

                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => clearCart()}
                    className="cursor-pointer text-xs font-medium text-[#727b76] transition-colors hover:text-[#181c1a]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <SheetDescription className="text-xs text-[#6b7470]">
                Review your items before checkout.
              </SheetDescription>

              {validationIssues.length > 0 && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-medium text-amber-800">
                    <AlertTriangle className="size-3.5" />
                    <span>Cart notices</span>
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
                  <div className="flex size-12 items-center justify-center rounded-full bg-[#f8faf9] text-[#8a948f]">
                    <ShoppingBag className="size-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-[#181c1a]">
                    Your cart is empty
                  </h3>
                  <p className="mt-1 max-w-xs text-xs text-[#6b7470]">
                    Ask AgentCart for a setup or browse the catalog to add items.
                  </p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-full bg-[#0f766e] px-4 text-xs font-medium text-white transition-colors hover:bg-[#0d655e]"
                  >
                    <span>Open Assistant</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#eef1ef]">
                  {items.map((item) => (
                    <CartItemRow key={item.product.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <SheetFooter className="border-t border-[#eef1ef] bg-[#fcfdfc] p-6">
                <div className="w-full space-y-2.5 text-xs text-[#6b7470]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium tabular-nums text-[#181c1a]">
                      {formattedSubtotal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-medium text-[#0f766e]">Free</span>
                  </div>
                  <div className="flex justify-between border-t border-[#eef1ef] pt-2.5 text-sm font-semibold text-[#181c1a]">
                    <span>Total</span>
                    <span className="text-base tabular-nums text-[#0f766e]">
                      {formattedSubtotal}
                    </span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleProceedToReview}
                      disabled={isValidating}
                      className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0f766e] px-5 text-sm font-medium text-white transition-colors hover:bg-[#0d655e] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Preparing review...</span>
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
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-label={confirmedOrder ? "Order confirmed" : "Checkout"}
          >
            <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#e8ece9] bg-white p-6 shadow-2xl sm:p-7">
            <button
              type="button"
              onClick={handleCloseModal}
              aria-label="Close checkout"
              className="absolute top-5 right-5 flex size-8 cursor-pointer items-center justify-center rounded-full border border-[#e8ece9] bg-white text-[#6b7470] transition-colors hover:text-[#181c1a]"
            >
              <X className="size-4" />
            </button>

            {confirmedOrder ? (
              /* Payment Success Receipt */
              <div className="space-y-5 pt-2 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#eaf5f2] text-[#0f766e]">
                  <CheckCircle2 className="size-6" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-[#181c1a]">
                    Order confirmed
                  </h3>
                  <p className="mt-1 font-mono text-xs font-medium text-[#0f766e]">
                    {confirmedOrder.orderNumber}
                  </p>
                </div>

                <div className="divide-y divide-[#eef1ef] rounded-2xl border border-[#eef1ef] bg-[#f8faf9]/75 px-4 py-3 text-left text-xs">
                  <div className="flex justify-between py-2">
                    <span className="text-[#6b7470]">Payment</span>
                    <span className="font-medium text-[#0f766e]">Paid via PayPal</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#6b7470]">Total</span>
                    <span className="font-semibold tabular-nums text-[#181c1a]">
                      ${confirmedOrder.total.toFixed(2)} {confirmedOrder.currency}
                    </span>
                  </div>
                </div>

                <div className="max-h-40 divide-y divide-[#eef1ef] overflow-y-auto rounded-2xl border border-[#eef1ef] px-4 py-2 text-left text-xs">
                  {confirmedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <span className="truncate text-[#181c1a]">
                        {item.quantity}× {item.name}
                      </span>
                      <span className="shrink-0 font-medium tabular-nums text-[#181c1a]">
                        ${item.lineTotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCloseSuccess}
                  className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-full bg-[#0f766e] px-5 text-sm font-medium text-white transition-colors hover:bg-[#0d655e]"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              /* Checkout Review & PayPal Payment */
              <div className="space-y-5">
                <div className="pr-8">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-semibold tracking-tight text-[#181c1a]">
                      {prepResult.isValid ? "Checkout" : "Review cart"}
                    </h3>
                    {!prepResult.isValid && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                        Needs attention
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#6b7470]">
                    Confirm your items and complete payment.
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
                <div className="max-h-44 divide-y divide-[#eef1ef] overflow-y-auto rounded-2xl border border-[#eef1ef] bg-[#f8faf9]/75 px-4 py-1 text-xs">
                  {prepResult.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#181c1a]">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[#6b7470]">
                          Qty {item.quantity} · ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold tabular-nums text-[#181c1a]">
                        ${item.lineTotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t border-[#eef1ef] pt-3 text-xs text-[#6b7470]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium tabular-nums text-[#181c1a]">
                      {prepResult.formattedSubtotal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping & tax</span>
                    <span className="font-medium text-[#0f766e]">Free</span>
                  </div>
                  <div className="flex justify-between border-t border-[#eef1ef] pt-2.5 text-sm font-semibold text-[#181c1a]">
                    <span>Total</span>
                    <span className="text-base tabular-nums text-[#0f766e]">
                      {prepResult.formattedSubtotal} {prepResult.currency}
                    </span>
                  </div>
                </div>

                {/* PayPal Checkout */}
                {prepResult.isValid ? (
                  <div className="border-t border-[#eef1ef] pt-4">
                    <PayPalCheckoutButton
                      currency={prepResult.currency}
                      idempotencyKey={checkoutAttemptKey}
                      onPaymentSuccess={handlePaymentSuccess}
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    Update your cart items to continue with payment.
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleBackToCart}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#6b7470] transition-colors hover:text-[#181c1a]"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>Back to cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="cursor-pointer text-xs font-medium text-[#727b76] transition-colors hover:text-[#181c1a]"
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
