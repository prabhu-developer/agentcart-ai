"use client";

import { useShoppingCart } from "@/features/shopping/context/cart-context";
import { Product } from "@/features/shopping/types";
import { Check, Columns2, Plus, Star } from "lucide-react";
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
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#EAE6F2] bg-white transition-all duration-200 hover:border-[#8B6CE8]/50 hover:shadow-[0_8px_24px_rgba(33,27,46,0.06)]">
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F8F7FB]">
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
            <div className="flex size-full items-center justify-center text-xs text-[#777181]">
              No image
            </div>
          )}
        </button>

        {/* Out of stock badge */}
        {!product.inStock && (
          <span className="pointer-events-none absolute top-3 left-3 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-medium text-[#D64545] shadow-xs border border-[#FCDADA]">
            Out of stock
          </span>
        )}

        {/* Compare button toggle */}
        <button
          type="button"
          onClick={handleToggleCompare}
          aria-label={inCompare ? `Remove ${product.name} from compare` : `Compare ${product.name}`}
          title={inCompare ? "Remove from comparison" : "Compare product"}
          className={`absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-xl border transition-all duration-150 ${
            inCompare
              ? "border-[#5125A8] bg-[#5125A8] text-white shadow-xs"
              : "border-[#EAE6F2] bg-white/95 text-[#777181] opacity-0 backdrop-blur-sm hover:border-[#6D45D9] hover:text-[#5125A8] group-hover:opacity-100"
          }`}
        >
          <Columns2 className="size-3.5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#777181]">
            {product.brand}
          </p>
          <button
            type="button"
            onClick={() => openProductDetails(product)}
            className="line-clamp-2 cursor-pointer text-left text-[14px] font-semibold leading-snug text-[#211B2E] transition-colors hover:text-[#5125A8]"
          >
            {product.name}
          </button>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 pt-0.5">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span className="text-[12px] font-medium tabular-nums text-[#211B2E]">
                {product.rating.toFixed(1)}
              </span>
              {product.reviewCount > 0 && (
                <span className="text-[11px] text-[#777181]">
                  ({product.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[#F8F7FB] pt-3">
          <span className="text-[16px] font-bold tabular-nums text-[#211B2E]">
            ${product.price.toFixed(2)}
          </span>

          <button
            type="button"
            disabled={!product.inStock}
            onClick={handleAdd}
            className={`inline-flex h-8.5 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
              justAdded || inCart
                ? "border border-[#EAE6F2] bg-[#F2EDFC] text-[#5125A8]"
                : "border border-[#EAE6F2] bg-white text-[#211B2E] hover:border-[#5125A8] hover:bg-[#5125A8] hover:text-white"
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
