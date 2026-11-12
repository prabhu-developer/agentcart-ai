"use client";

import { useShoppingCart } from "@/features/shopping/context/cart-context";
import { Product } from "@/features/shopping/types";
import { Check, Plus, Scale, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleCompare, isInCompare, isInCart, openProductDetails } =
    useShoppingCart();
  const [justAdded, setJustAdded] = useState(false);

  const inCart = isInCart(product.id);
  const inCompare = isInCompare(product.id);
  const coverImage = product.images?.[0];

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompare(product);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#e5e9e7] bg-white transition-all duration-200 hover:border-[#cfd8d3] hover:shadow-[0_8px_28px_rgb(0,0,0,0.07)]">
      {/* Image area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f4f6f5]">
        <button
          type="button"
          onClick={() => openProductDetails(product)}
          aria-label={`View details for ${product.name}`}
          className="relative block size-full cursor-pointer text-left focus:outline-none"
        >
          {coverImage ? (
            <Image
              src={coverImage}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-[#7a8580]">
              No image
            </div>
          )}
        </button>

        {/* Out of stock badge */}
        {!product.inStock && (
          <span className="pointer-events-none absolute top-3 left-3 rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-medium text-[#374040] shadow-xs backdrop-blur-sm">
            Out of stock
          </span>
        )}

        {/* Compare button — always visible when active, only on hover otherwise */}
        <button
          type="button"
          onClick={handleToggleCompare}
          aria-label={inCompare ? `Remove ${product.name} from compare` : `Compare ${product.name}`}
          title={inCompare ? "Remove from compare" : "Compare"}
          className={`absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full border transition-all duration-150 ${
            inCompare
              ? "border-[#0a5c55] bg-[#0a5c55] text-white shadow-sm"
              : "border-[#e5e9e7] bg-white/90 text-[#7a8580] opacity-0 backdrop-blur-sm hover:border-[#0a5c55] hover:text-[#0a5c55] group-hover:opacity-100"
          }`}
        >
          <Scale className="size-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col justify-between gap-3 p-4 pt-3">
        <div className="space-y-1">
          <p className="text-[10px] tracking-[0.12em] uppercase font-semibold text-[#7a8580]">
            {product.brand}
          </p>
          <button
            type="button"
            onClick={() => openProductDetails(product)}
            className="line-clamp-2 cursor-pointer text-left text-[14px] font-medium leading-snug text-[#111817] transition-colors hover:text-[#0a5c55]"
          >
            {product.name}
          </button>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 pt-0.5">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] tabular-nums text-[#7a8580]">
                {product.rating.toFixed(1)}
                {product.reviewCount > 0 && (
                  <span className="ml-0.5">({product.reviewCount})</span>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[15px] font-bold tabular-nums text-[#111817]">
            ${product.price.toFixed(2)}
          </span>

          <button
            type="button"
            disabled={!product.inStock}
            onClick={handleAdd}
            className={`inline-flex h-8 cursor-pointer items-center gap-1 rounded-full px-3.5 text-xs font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
              justAdded || inCart
                ? "border border-[#0a5c55]/25 bg-[#edf7f5] text-[#0a5c55]"
                : "border border-[#e5e9e7] bg-white text-[#111817] hover:border-[#0a5c55] hover:bg-[#0a5c55] hover:text-white"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="size-3.5" />
                <span>Added</span>
              </>
            ) : inCart ? (
              <>
                <Check className="size-3.5" />
                <span>In cart</span>
              </>
            ) : (
              <>
                <Plus className="size-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
