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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-xs"
      onClick={closeCompareModal}
      role="dialog"
      aria-modal="true"
      aria-label="Compare products"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#e8ece9] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#eef1ef] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Scale className="size-4 text-[#0f766e]" />
            <h2 className="text-base font-semibold text-[#181c1a]">
              Compare
            </h2>
            <span className="text-xs text-[#727b76]">
              {comparingProducts.length} / 4
            </span>
          </div>

          <div className="flex items-center gap-3">
            {comparingProducts.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="cursor-pointer text-xs font-medium text-[#727b76] transition-colors hover:text-[#181c1a]"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={closeCompareModal}
              aria-label="Close comparison"
              className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-[#e8ece9] text-[#6b7470] transition-colors hover:text-[#181c1a]"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {comparingProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Scale className="size-7 text-[#9ca5a0]" />
              <p className="mt-3 text-sm font-medium text-[#181c1a]">
                Nothing to compare yet
              </p>
              <p className="mt-1 text-xs text-[#727b76]">
                Select up to 4 products from the catalog or chat recommendations.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#eef1ef]">
                    <th className="w-36 py-3 pr-4 align-bottom text-xs font-medium text-[#727b76]">
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
                            className="absolute top-1.5 right-1.5 z-10 flex size-6 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#6b7470] shadow-xs hover:text-[#181c1a]"
                          >
                            <X className="size-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              closeCompareModal();
                              openProductDetails(product);
                            }}
                            className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-xl bg-[#f8faf9]"
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
                            <p className="text-[11px] font-medium tracking-wider text-[#727b76] uppercase">
                              {product.brand}
                            </p>
                            <p className="line-clamp-2 text-sm font-medium text-[#181c1a]">
                              {product.name}
                            </p>
                            <p className="mt-1 text-sm font-semibold tabular-nums text-[#181c1a]">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#eef1ef] text-xs">
                  <tr>
                    <td className="py-3 pr-4 text-[#727b76]">Rating</td>
                    {comparingProducts.map((product) => (
                      <td key={product.id} className="px-3 py-3 text-[#181c1a]">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Star className="size-3.5 fill-[#0f766e] text-[#0f766e]" />
                          {product.rating.toFixed(1)}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3 pr-4 text-[#727b76]">Availability</td>
                    {comparingProducts.map((product) => (
                      <td
                        key={product.id}
                        className={`px-3 py-3 font-medium ${product.inStock ? "text-[#0f766e]" : "text-[#727b76]"
                          }`}
                      >
                        {product.inStock ? "In stock" : "Out of stock"}
                      </td>
                    ))}
                  </tr>

                  {specKeys.map((key) => (
                    <tr key={key}>
                      <td className="py-3 pr-4 text-[#727b76]">{key}</td>
                      {comparingProducts.map((product) => (
                        <td key={product.id} className="px-3 py-3 text-[#181c1a]">
                          {product.specifications?.[key] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}

                  <tr>
                    <td className="py-3 pr-4 align-top text-[#727b76]">Strengths</td>
                    {comparingProducts.map((product) => (
                      <td key={product.id} className="px-3 py-3 align-top text-[#4b544f]">
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
                            className={`inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1 rounded-full px-3 text-xs font-medium transition-colors disabled:opacity-40 ${inCart
                              ? "bg-[#eaf5f2] text-[#0f766e]"
                              : "bg-[#0f766e] text-white hover:bg-[#0d655e]"
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
