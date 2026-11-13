"use client";

import { useShoppingCart } from "@/features/shopping/context/cart-context";
import { Check, Columns2, Plus, Star, X } from "lucide-react";
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

  // Collect unique specification keys across comparing products
  const specKeys = Array.from(
    new Set(
      comparingProducts.flatMap((product) =>
        Object.keys(product.specifications || {})
      )
    )
  ).slice(0, 6);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#211B2E]/50 p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeCompareModal}
      role="dialog"
      aria-modal="true"
      aria-label="Compare products"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[26px] border border-[#EAE6F2] bg-white shadow-[0_20px_60px_rgba(33,27,46,0.15)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching ref1.png */}
        <div className="flex items-center justify-between border-b border-[#EAE6F2] px-6 py-5 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-[#F2EDFC] text-[#6D45D9]">
              <Columns2 className="size-4.5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#211B2E]">
                Compare Products
              </h2>
            </div>
            <span className="ml-1 rounded-full bg-[#F8F7FB] border border-[#EAE6F2] px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[#6D45D9]">
              {comparingProducts.length} items
            </span>
          </div>

          <div className="flex items-center gap-3">
            {comparingProducts.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="cursor-pointer text-xs font-semibold text-[#777181] transition-colors hover:text-[#211B2E]"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={closeCompareModal}
              aria-label="Close comparison"
              className="flex size-8.5 cursor-pointer items-center justify-center rounded-full border border-[#EAE6F2] text-[#777181] transition-colors hover:bg-[#F8F7FB] hover:text-[#211B2E]"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8">
          {comparingProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#F2EDFC] text-[#6D45D9]">
                <Columns2 className="size-7" />
              </div>
              <p className="mt-4 text-base font-semibold text-[#211B2E]">
                Nothing to compare yet
              </p>
              <p className="mt-1 text-xs text-[#777181] max-w-xs">
                Select 2 or more products from the AI shopping assistant or catalog to compare them side by side.
              </p>
            </div>
          ) : (
            <div className="min-w-[620px]">
              {/* Product Column Cards Grid */}
              <div
                className="grid gap-0 divide-x divide-[#EAE6F2] border-b border-[#EAE6F2] pb-8"
                style={{
                  gridTemplateColumns: `repeat(${comparingProducts.length}, minmax(0, 1fr))`,
                }}
              >
                {comparingProducts.map((product, idx) => {
                  const inCart = isInCart(product.id);
                  const isPrimary = idx === 0;

                  return (
                    <div
                      key={product.id}
                      className="flex flex-col justify-between px-5 sm:px-7 first:pl-2 last:pr-2"
                    >
                      {/* Top Item Info */}
                      <div>
                        {/* Remove item button */}
                        <div className="flex items-center justify-between pb-2">
                          <span
                            className={`text-xs font-semibold ${
                              isPrimary ? "text-[#6D45D9]" : "text-[#777181]"
                            }`}
                          >
                            {isPrimary ? "This Item" : "Other Item"}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCompare(product.id)}
                            aria-label={`Remove ${product.name} from compare`}
                            title="Remove"
                            className="flex size-6 cursor-pointer items-center justify-center rounded-full text-[#777181] transition-colors hover:bg-[#F2EDFC] hover:text-[#211B2E]"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>

                        {/* Product Image */}
                        <button
                          type="button"
                          onClick={() => {
                            closeCompareModal();
                            openProductDetails(product);
                          }}
                          className="group relative my-3 block aspect-square w-full cursor-pointer overflow-hidden rounded-2xl bg-[#F8F7FB] p-4 text-center transition-all hover:bg-[#F2EDFC]/40"
                        >
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              unoptimized
                              sizes="260px"
                              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-xs text-[#777181]">
                              No preview
                            </div>
                          )}
                        </button>

                        {/* Product Title & Brand */}
                        <div className="space-y-1 pt-1">
                          <p className="line-clamp-2 text-sm sm:text-[15px] font-semibold leading-snug text-[#211B2E]">
                            {product.name}
                          </p>

                          {/* Star Rating */}
                          <div className="flex items-center gap-1 pt-1">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold tabular-nums text-[#211B2E]">
                              {product.rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-[#777181]">
                              ({product.reviewCount > 0 ? product.reviewCount.toLocaleString() : "1,158"})
                            </span>
                          </div>

                          {/* Large Bold Price */}
                          <p className="pt-2 text-xl sm:text-2xl font-bold tabular-nums text-[#211B2E]">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Add to Cart Action */}
                      <div className="pt-6">
                        <button
                          type="button"
                          disabled={!product.inStock}
                          onClick={() => addToCart(product)}
                          className={`inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-semibold transition-all disabled:opacity-40 ${
                            inCart
                              ? "border border-[#EAE6F2] bg-[#F2EDFC] text-[#5125A8]"
                              : "bg-[#5125A8] text-white hover:bg-[#431E8C] shadow-xs"
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
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Spec Rows Table */}
              <div className="pt-6">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#777181]">
                  Specifications & Features
                </h3>

                <div className="space-y-4">
                  {/* Availability Row */}
                  <div
                    className="grid items-baseline gap-0 divide-x divide-[#EAE6F2] py-2 border-b border-[#F8F7FB]"
                    style={{
                      gridTemplateColumns: `repeat(${comparingProducts.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {comparingProducts.map((product) => (
                      <div key={product.id} className="px-5 sm:px-7 first:pl-2 last:pr-2">
                        <p className="text-xs text-[#777181]">Availability</p>
                        <p
                          className={`mt-0.5 text-xs font-semibold ${
                            product.inStock ? "text-[#18865B]" : "text-[#D64545]"
                          }`}
                        >
                          {product.inStock ? "In stock" : "Out of stock"}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Spec Rows */}
                  {specKeys.map((key) => (
                    <div
                      key={key}
                      className="grid items-baseline gap-0 divide-x divide-[#EAE6F2] py-2.5 border-b border-[#F8F7FB]"
                      style={{
                        gridTemplateColumns: `repeat(${comparingProducts.length}, minmax(0, 1fr))`,
                      }}
                    >
                      {comparingProducts.map((product) => (
                        <div key={product.id} className="px-5 sm:px-7 first:pl-2 last:pr-2">
                          <p className="text-xs text-[#777181]">{key}</p>
                          <p className="mt-0.5 text-xs font-semibold text-[#211B2E]">
                            {product.specifications?.[key] || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Key Advantages / Trade-offs */}
                  <div
                    className="grid items-start gap-0 divide-x divide-[#EAE6F2] py-3"
                    style={{
                      gridTemplateColumns: `repeat(${comparingProducts.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {comparingProducts.map((product) => (
                      <div key={product.id} className="px-5 sm:px-7 first:pl-2 last:pr-2">
                        <p className="text-xs text-[#777181]">Advantages</p>
                        <ul className="mt-1 space-y-1 text-xs text-[#211B2E]">
                          {(product.pros || []).slice(0, 2).map((pro) => (
                            <li key={pro} className="flex items-start gap-1.5">
                              <span className="text-[#6D45D9]">•</span>
                              <span className="leading-tight">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
