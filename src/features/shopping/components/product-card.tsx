"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShoppingBag, Star, SlidersHorizontal, Info, Check } from "lucide-react";
import { Product } from "../types";
import { useShoppingCart } from "../context/cart-context";
import { Button } from "@/components/ui/button";
import { ProductDetailsDialog } from "./product-details-dialog";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleCompare, isInCompare, isInCart } = useShoppingCart();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const inCompare = isInCompare(product.id);
  const inCart = isInCart(product.id);

  const handleAdd = () => {
    setIsAdding(true);
    addToCart(product);
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e8ece9] bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0f766e]/30 hover:shadow-md">
        {/* Top Image & Badges */}
        <div>
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-[#e8ece9] bg-[#f8faf9]">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-102"
            />
            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
              <span className="rounded-md border border-white/60 bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#0f766e] backdrop-blur-xs">
                {product.brand}
              </span>
            </div>

            {/* Quick Details Trigger */}
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-lg border border-[#e8ece9] bg-white/90 text-[#727b76] opacity-0 shadow-xs backdrop-blur-xs transition-all group-hover:opacity-100 hover:text-[#202522]"
              aria-label={`View details for ${product.name}`}
            >
              <Info className="size-3.5" />
            </button>
          </div>

          {/* Title & Metadata */}
          <div className="mt-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#727b76]">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-xs">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-[#202522]">{product.rating}</span>
                <span className="text-[#727b76]">({product.reviewCount})</span>
              </div>
            </div>

            <h3
              onClick={() => setDetailsOpen(true)}
              className="mt-1 line-clamp-1 cursor-pointer text-sm font-semibold text-[#202522] transition-colors hover:text-[#0f766e]"
              title={product.name}
            >
              {product.name}
            </h3>

            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#727b76]">
              {product.description}
            </p>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-4 pt-3 border-t border-[#e8ece9]">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#727b76]">Price</span>
              <p className="text-base font-bold text-[#202522]">
                ${product.price.toFixed(2)}
              </p>
            </div>
            <span className="text-[11px] font-medium text-emerald-700">
              {product.inStock ? "In stock" : "Low stock"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleAdd}
              size="sm"
              className={`flex-1 transition-all ${
                isAdding
                  ? "bg-emerald-600 text-white"
                  : inCart
                  ? "bg-[#eaf5f2] text-[#0f766e] hover:bg-[#eaf5f2]/80"
                  : "bg-[#0f766e] text-white hover:bg-[#115e59]"
              }`}
            >
              {isAdding ? (
                <>
                  <Check className="size-3.5" />
                  <span>Added!</span>
                </>
              ) : inCart ? (
                <>
                  <ShoppingBag className="size-3.5" />
                  <span>In Cart (+1)</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="size-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleCompare(product)}
              className={`border-[#e8ece9] px-2.5 transition-colors ${
                inCompare
                  ? "border-[#0f766e] bg-[#eaf5f2] text-[#0f766e]"
                  : "text-[#727b76] hover:text-[#202522]"
              }`}
              title={inCompare ? "Remove from comparison" : "Compare this product"}
            >
              <SlidersHorizontal className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <ProductDetailsDialog
        product={product}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </>
  );
}
