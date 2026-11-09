"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Check, ShoppingBag, Star, ShieldCheck, Truck, SlidersHorizontal } from "lucide-react";
import { Product } from "../types";
import { useShoppingCart } from "../context/cart-context";
import { Button } from "@/components/ui/button";

interface ProductDetailsDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailsDialog({
  product,
  isOpen,
  onClose,
}: ProductDetailsDialogProps) {
  const { addToCart, toggleCompare, isInCompare, isInCart } = useShoppingCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!isOpen || !product) return null;

  const inCompare = isInCompare(product.id);
  const inCart = isInCart(product.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-xs">
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#e8ece9] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-details-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full border border-[#e8ece9] bg-white text-[#727b76] shadow-xs transition-colors hover:bg-[#f8faf9] hover:text-[#202522]"
          aria-label="Close product details"
        >
          <X className="size-5" />
        </button>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Gallery Column */}
            <div className="flex flex-col gap-3">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-[#e8ece9] bg-[#f8faf9]">
                <Image
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 384px"
                  className="object-cover object-center"
                />
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative size-16 overflow-hidden rounded-lg border transition-all ${
                        selectedImageIndex === idx
                          ? "border-[#0f766e] ring-2 ring-[#0f766e]/20"
                          : "border-[#e8ece9] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Guarantees Box */}
              <div className="mt-2 space-y-2 rounded-xl border border-[#e8ece9] bg-[#f8faf9] p-3 text-xs text-[#727b76]">
                <div className="flex items-center gap-2">
                  <Truck className="size-4 text-[#0f766e]" />
                  <span>Free shipping on eligible orders over $50</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-[#0f766e]" />
                  <span>Verified mock catalog specification accuracy</span>
                </div>
              </div>
            </div>

            {/* Details Column */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0f766e]">
                    {product.brand}
                  </span>
                  <span className="text-xs text-[#727b76]">·</span>
                  <span className="text-xs capitalize text-[#727b76]">
                    {product.category}
                  </span>
                </div>

                <h3
                  id="product-details-title"
                  className="mt-1 text-xl font-bold tracking-tight text-[#202522]"
                >
                  {product.name}
                </h3>

                <div className="mt-2.5 flex items-center gap-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-[#202522]">
                      {product.rating}
                    </span>
                  </div>
                  <span className="text-xs text-[#727b76]">
                    ({product.reviewCount} customer reviews)
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    In Stock ({product.stockCount} units)
                  </span>
                </div>

                <div className="mt-4 border-y border-[#e8ece9] py-3">
                  <span className="text-xs text-[#727b76]">Price</span>
                  <p className="text-2xl font-bold text-[#202522]">
                    ${product.price.toFixed(2)}{" "}
                    <span className="text-xs font-normal text-[#727b76]">USD</span>
                  </p>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#727b76]">
                  {product.description}
                </p>

                {/* Pros and Cons */}
                <div className="mt-5 space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#202522]">
                      Key Advantages
                    </h4>
                    <ul className="mt-1.5 space-y-1 text-xs text-[#727b76]">
                      {product.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-[#0f766e]" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#202522]">
                      Considerations
                    </h4>
                    <ul className="mt-1.5 space-y-1 text-xs text-[#727b76]">
                      {product.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#727b76]" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="mt-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#202522]">
                    Specifications
                  </h4>
                  <div className="mt-2 divide-y divide-[#e8ece9] rounded-xl border border-[#e8ece9] bg-[#f8faf9] text-xs">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="flex justify-between px-3 py-1.5">
                        <span className="text-[#727b76]">{key}</span>
                        <span className="font-medium text-[#202522]">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <Button
                  onClick={() => addToCart(product)}
                  className="flex-1 bg-[#0f766e] text-white hover:bg-[#115e59]"
                  size="lg"
                >
                  <ShoppingBag className="size-4" />
                  <span>{inCart ? "Add Another to Cart" : "Add to Cart"}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => toggleCompare(product)}
                  className={`border-[#e8ece9] ${
                    inCompare ? "bg-[#eaf5f2] text-[#0f766e]" : "text-[#202522]"
                  }`}
                  size="lg"
                >
                  <SlidersHorizontal className="size-4" />
                  <span>{inCompare ? "In Comparison" : "Compare"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
