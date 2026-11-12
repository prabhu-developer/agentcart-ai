"use client";

import { useShoppingCart } from "@/features/shopping/context/cart-context";
import { Check, Plus, Scale, Star, X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export function ProductComparisonModal() {
  const {
    comparingProducts,
    isCompareModalOpen,
    closeCompareModal,
    removeFromCompare,
    clearCompare,
    addToCart,
    isInCart,
    openProductDetails,
  } = useShoppingCart();

  useEffect(() => {
    if (!isCompareModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCompareModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isCompareModalOpen, closeCompareModal]);

  if (!isCompareModalOpen) return null;

  const specKeys = Array.from(
    new Set(
      comparingProducts.flatMap((product) =>
        Object.keys(product.specifications || {})
      )
    )
  ).slice(0, 6);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={closeCompareModal}
      role="dialog"
      aria-modal="true"
      aria-label="Compare products"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#e5e9e7] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e5e9e7] px-6 py-4.5 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#edf7f5] text-[#0a5c55]">
              <Scale className="size-4" />
            </div>
            <h2 className="text-base font-semibold text-[#111817]">
              Product Matrix Comparison
            </h2>
            <span className="rounded-full bg-[#fafafa] border border-[#e5e9e7] px-2 py-0.5 text-xs font-semibold tabular-nums text-[#0a5c55]">
              {comparingProducts.length} / 4
            </span>
          </div>

          <div className="flex items-center gap-3">
            {comparingProducts.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="cursor-pointer text-xs font-medium text-[#7a8580] transition-colors hover:text-[#111817]"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={closeCompareModal}
              aria-label="Close comparison"
              className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-[#e5e9e7] text-[#7a8580] transition-colors hover:text-[#111817]"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {comparingProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Scale className="size-8 text-[#9ca5a0]" />
              <p className="mt-3 text-sm font-semibold text-[#111817]">
                Nothing to compare yet
              </p>
              <p className="mt-1 text-xs text-[#7a8580]">
                Select up to 4 products from chat recommendations or the catalog.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#e5e9e7]">
                    <th className="w-36 py-3 pr-4 align-bottom text-xs font-semibold tracking-wider text-[#7a8580] uppercase">
                      Product
                    </th>
                    {comparingProducts.map((product) => (
                      <th
                        key={product.id}
                        className="min-w-[180px] px-3 pb-4 align-top font-normal"
                      >
                        <div className="relative flex flex-col gap-2.5">
                          <button
                            type="button"
                            onClick={() => removeFromCompare(product.id)}
                            aria-label={`Remove ${product.name}`}
                            className="absolute top-1.5 right-1.5 z-10 flex size-6 cursor-pointer items-center justify-center rounded-full bg-white/95 text-[#7a8580] shadow-2xs hover:text-[#111817]"
                          >
                            <X className="size-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              closeCompareModal();
                              openProductDetails(product);
                            }}
                            className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-xl border border-[#e5e9e7] bg-[#f4f6f5]"
                          >
                            {product.images?.[0] && (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                unoptimized
                                sizes="220px"
                                className="object-cover"
                              />
                            )}
                          </button>

                          <div>
                            <p className="text-[10px] font-semibold tracking-[0.12em] text-[#7a8580] uppercase">
                              {product.brand}
                            </p>
                            <p className="line-clamp-2 text-sm font-medium text-[#111817]">
                              {product.name}
                            </p>
                            <p className="mt-1 text-sm font-bold tabular-nums text-[#111817]">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e5e9e7] text-xs">
                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-[#7a8580]">Rating</td>
                    {comparingProducts.map((product) => (
                      <td key={product.id} className="px-3 py-3.5 text-[#111817]">
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          {product.rating.toFixed(1)}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 pr-4 font-medium text-[#7a8580]">Availability</td>
                    {comparingProducts.map((product) => (
                      <td
                        key={product.id}
                        className={`px-3 py-3.5 font-semibold ${
                          product.inStock ? "text-[#0a5c55]" : "text-[#7a8580]"
                        }`}
                      >
                        {product.inStock ? "In stock" : "Out of stock"}
                      </td>
                    ))}
                  </tr>

                  {specKeys.map((key) => (
                    <tr key={key}>
                      <td className="py-3.5 pr-4 font-medium text-[#7a8580]">{key}</td>
                      {comparingProducts.map((product) => (
                        <td key={product.id} className="px-3 py-3.5 text-[#111817]">
                          {product.specifications?.[key] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}

                  <tr>
                    <td className="py-3.5 pr-4 align-top font-medium text-[#7a8580]">Key Features</td>
                    {comparingProducts.map((product) => (
                      <td key={product.id} className="px-3 py-3.5 align-top text-[#525b56]">
                        <ul className="space-y-1">
                          {(product.pros || []).slice(0, 2).map((pro) => (
                            <li key={pro}>· {pro}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-4 pr-4" />
                    {comparingProducts.map((product) => {
                      const inCart = isInCart(product.id);
                      return (
                        <td key={product.id} className="px-3 py-4">
                          <button
                            type="button"
                            disabled={!product.inStock}
                            onClick={() => addToCart(product)}
                            className={`inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all disabled:opacity-40 ${
                              inCart
                                ? "border border-[#0a5c55]/20 bg-[#edf7f5] text-[#0a5c55]"
                                : "bg-[#0a5c55] text-white hover:bg-[#084f49]"
                            }`}
                          >
                            {inCart ? (
                              <>
                                <Check className="size-3.5" />
                                <span>In cart</span>
                              </>
                            ) : (
                              <>
                                <Plus className="size-3.5" />
                                <span>Add to cart</span>
                              </>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
