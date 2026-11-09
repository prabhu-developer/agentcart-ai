"use client";

import React from "react";
import Image from "next/image";
import { X, Check, ShoppingBag, Star, SlidersHorizontal, Trash2 } from "lucide-react";
import { useShoppingCart } from "../context/cart-context";
import { Button } from "@/components/ui/button";

export function ProductComparisonModal() {
  const {
    comparingProducts,
    isCompareModalOpen,
    closeCompareModal,
    removeFromCompare,
    clearCompare,
    addToCart,
    isInCart,
  } = useShoppingCart();

  if (!isCompareModalOpen) return null;

  // Collect all unique specification keys across comparing products
  const allSpecKeys = Array.from(
    new Set(
      comparingProducts.flatMap((p) => Object.keys(p.specifications))
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-xs">
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#e8ece9] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="comparison-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8ece9] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#eaf5f2] text-[#0f766e]">
              <SlidersHorizontal className="size-5" />
            </div>
            <div>
              <h3 id="comparison-title" className="text-base font-bold text-[#202522]">
                Product Comparison Matrix ({comparingProducts.length}/4)
              </h3>
              <p className="text-xs text-[#727b76]">
                Objective side-by-side analysis of key technical specifications, pros, and trade-offs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {comparingProducts.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="text-xs text-[#727b76] underline-offset-4 hover:text-rose-600 hover:underline"
              >
                Clear Matrix
              </button>
            )}
            <button
              type="button"
              onClick={closeCompareModal}
              className="flex size-8 items-center justify-center rounded-lg border border-[#e8ece9] text-[#727b76] transition-colors hover:bg-[#f8faf9] hover:text-[#202522]"
              aria-label="Close comparison"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
          {comparingProducts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <SlidersHorizontal className="size-10 text-[#727b76]/60" />
              <h4 className="mt-3 text-base font-semibold text-[#202522]">
                No products selected for comparison
              </h4>
              <p className="mt-1 text-xs text-[#727b76]">
                Click the &ldquo;Compare&rdquo; button on any product card or recommendation to compare them side-by-side.
              </p>
              <Button
                onClick={closeCompareModal}
                className="mt-4 bg-[#0f766e] text-white hover:bg-[#115e59]"
                size="sm"
              >
                Return to Workspace
              </Button>
            </div>
          ) : (
            <div className="min-w-[640px]">
              {/* Product Headers Row */}
              <div
                className="grid gap-4 border-b border-[#e8ece9] pb-6"
                style={{
                  gridTemplateColumns: `160px repeat(${comparingProducts.length}, minmax(200px, 1fr))`,
                }}
              >
                <div className="flex flex-col justify-end text-xs font-semibold uppercase tracking-wider text-[#727b76]">
                  Products
                </div>

                {comparingProducts.map((product) => {
                  const inCart = isInCart(product.id);
                  return (
                    <div key={product.id} className="relative flex flex-col justify-between">
                      <button
                        type="button"
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute -top-2 right-0 flex size-6 items-center justify-center rounded-full border border-[#e8ece9] bg-white text-[#727b76] shadow-xs hover:text-rose-600"
                        title="Remove from comparison"
                      >
                        <Trash2 className="size-3" />
                      </button>

                      <div>
                        <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-[#e8ece9] bg-[#f8faf9]">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="240px"
                            className="object-cover"
                          />
                        </div>
                        <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#0f766e]">
                          {product.brand}
                        </p>
                        <h4 className="mt-0.5 line-clamp-1 text-sm font-semibold text-[#202522]">
                          {product.name}
                        </h4>
                        <p className="mt-1 text-base font-bold text-[#202522]">
                          ${product.price.toFixed(2)}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-[#727b76]">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-[#202522]">{product.rating}</span>
                          <span>({product.reviewCount})</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => addToCart(product)}
                        className="mt-3 w-full bg-[#0f766e] text-white hover:bg-[#115e59]"
                        size="sm"
                      >
                        <ShoppingBag className="size-3.5" />
                        <span>{inCart ? "In Cart" : "Add to Cart"}</span>
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Price & Category Comparison */}
              <div
                className="grid items-center gap-4 border-b border-[#e8ece9] py-3 text-xs"
                style={{
                  gridTemplateColumns: `160px repeat(${comparingProducts.length}, minmax(200px, 1fr))`,
                }}
              >
                <span className="font-medium text-[#727b76]">Category</span>
                {comparingProducts.map((p) => (
                  <span key={p.id} className="capitalize text-[#202522]">
                    {p.category}
                  </span>
                ))}
              </div>

              {/* Specifications Matrix */}
              {allSpecKeys.map((specKey) => (
                <div
                  key={specKey}
                  className="grid items-center gap-4 border-b border-[#e8ece9] py-3 text-xs"
                  style={{
                    gridTemplateColumns: `160px repeat(${comparingProducts.length}, minmax(200px, 1fr))`,
                  }}
                >
                  <span className="font-medium text-[#727b76]">{specKey}</span>
                  {comparingProducts.map((p) => (
                    <span key={p.id} className="text-[#202522]">
                      {p.specifications[specKey] || "—"}
                    </span>
                  ))}
                </div>
              ))}

              {/* Pros Comparison */}
              <div
                className="grid gap-4 border-b border-[#e8ece9] py-4 text-xs"
                style={{
                  gridTemplateColumns: `160px repeat(${comparingProducts.length}, minmax(200px, 1fr))`,
                }}
              >
                <span className="font-medium text-[#727b76]">Advantages</span>
                {comparingProducts.map((p) => (
                  <ul key={p.id} className="space-y-1.5 text-[#202522]">
                    {p.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-[#0f766e]" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>

              {/* Cons Comparison */}
              <div
                className="grid gap-4 py-4 text-xs"
                style={{
                  gridTemplateColumns: `160px repeat(${comparingProducts.length}, minmax(200px, 1fr))`,
                }}
              >
                <span className="font-medium text-[#727b76]">Trade-Offs</span>
                {comparingProducts.map((p) => (
                  <ul key={p.id} className="space-y-1.5 text-[#727b76]">
                    {p.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[#727b76]" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
