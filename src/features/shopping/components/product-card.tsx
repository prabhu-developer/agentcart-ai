"use client";

import { useShoppingCart } from "@/features/shopping/context/cart-context";
import { Product } from "@/features/shopping/types";
import { Check, Plus, Scale } from "lucide-react";
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
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#e8ece9] bg-white transition-all duration-200 hover:border-[#cfd8d3] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f8faf9]">
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
            <div className="flex size-full items-center justify-center text-xs text-[#8a948f]">
              No image
            </div>
          )}
        </button>

        {!product.inStock && (
          <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-[#6b7470] shadow-xs backdrop-blur-xs">
            Out of stock
          </span>
        )}

        <button
          type="button"
          onClick={handleToggleCompare}
          aria-label={inCompare ? `Remove ${product.name} from compare` : `Compare ${product.name}`}
          title={inCompare ? "Remove from compare" : "Compare"}
          className={`absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full border transition-all duration-150 ${inCompare
            ? "border-[#0f766e] bg-[#0f766e] text-white shadow-xs"
            : "border-[#e8ece9] bg-white/90 text-[#6b7470] opacity-90 backdrop-blur-xs hover:border-[#0f766e] hover:text-[#0f766e] group-hover:opacity-100"
            }`}
        >
          <Scale className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="space-y-1">
          <p className="text-[11px] font-medium tracking-wider text-[#727b76] uppercase">
            {product.brand}
          </p>
          <button
            type="button"
            onClick={() => openProductDetails(product)}
            className="line-clamp-2 cursor-pointer text-left text-[15px] leading-snug font-medium text-[#181c1a] transition-colors hover:text-[#0f766e]"
          >
            {product.name}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[15px] font-semibold tabular-nums text-[#181c1a]">
            ${product.price.toFixed(2)}
          </span>

          <button
            type="button"
            disabled={!product.inStock}
            onClick={handleAdd}
            className={`inline-flex h-8 cursor-pointer items-center gap-1 rounded-full px-3.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 ${justAdded || inCart
              ? "border border-[#0f766e]/25 bg-[#eaf5f2] text-[#0f766e]"
              : "border border-[#dce2de] bg-white text-[#181c1a] hover:border-[#0f766e] hover:bg-[#0f766e] hover:text-white"
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
