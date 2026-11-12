"use client";

import { useShoppingCart } from "@/features/shopping/context/cart-context";
import { Product } from "@/features/shopping/types";
import { Check, Plus, Scale, Star, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ProductDetailsDialogProps {
  product?: Product | null;
  open?: boolean;
  onClose?: () => void;
}

export function ProductDetailsDialog({
  product: propProduct,
  open: propOpen,
  onClose: propOnClose,
}: ProductDetailsDialogProps = {}) {
  const {
    selectedProductForDetails,
    closeProductDetails,
    addToCart,
    toggleCompare,
    isInCompare,
    isInCart,
  } = useShoppingCart();

  const activeProduct = propProduct ?? selectedProductForDetails;
  const isOpen = propOpen ?? Boolean(activeProduct);
  const handleClose = propOnClose ?? closeProductDetails;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !activeProduct) return null;

  return (
    <ProductDetailsContent
      key={activeProduct.id}
      product={activeProduct}
      onClose={handleClose}
      onAddToCart={() => addToCart(activeProduct)}
      onToggleCompare={() => toggleCompare(activeProduct)}
      inCompare={isInCompare(activeProduct.id)}
      inCart={isInCart(activeProduct.id)}
    />
  );
}

interface ProductDetailsContentProps {
  product: Product;
  onClose: () => void;
  onAddToCart: () => void;
  onToggleCompare: () => void;
  inCompare: boolean;
  inCart: boolean;
}

function ProductDetailsContent({
  product,
  onClose,
  onAddToCart,
  onToggleCompare,
  inCompare,
  inCart,
}: ProductDetailsContentProps) {
  const images = product.images?.length ? product.images : [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const specEntries = Object.entries(product.specifications || {}).slice(0, 6);
  const highlights = (product.highlights?.length ? product.highlights : product.pros || []).slice(
    0,
    3
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div
        className="relative max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#e5e9e7] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full border border-[#e5e9e7] bg-white/95 text-[#7a8580] transition-colors hover:text-[#111817]"
        >
          <X className="size-4" />
        </button>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 md:gap-8 md:p-8">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#e5e9e7] bg-[#f4f6f5]">
              {images[selectedIndex] ? (
                <Image
                  src={images[selectedIndex]}
                  alt={product.name}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-xs text-[#7a8580]">
                  No image available
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2">
                {images.slice(0, 4).map((src, idx) => (
                  <button
                    key={src + idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative size-14 cursor-pointer overflow-hidden rounded-xl border transition-all ${
                      selectedIndex === idx
                        ? "border-[#0a5c55] ring-1 ring-[#0a5c55]"
                        : "border-[#e5e9e7] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      unoptimized
                      sizes="56px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5 pr-6">
                <p className="text-[10px] font-semibold tracking-[0.14em] text-[#7a8580] uppercase">
                  {product.brand} · {product.category}
                </p>
                <h2 className="text-xl sm:text-2xl leading-snug font-bold text-[#111817]">
                  {product.name}
                </h2>
                <div className="flex items-center gap-3 pt-0.5 text-xs text-[#7a8580]">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#111817]">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    {product.rating.toFixed(1)}
                  </span>
                  <span>·</span>
                  <span
                    className={
                      product.inStock
                        ? "font-semibold text-[#0a5c55]"
                        : "text-[#7a8580]"
                    }
                  >
                    {product.inStock ? "In stock" : "Out of stock"}
                  </span>
                </div>
              </div>

              <div className="text-3xl font-bold tabular-nums text-[#111817]">
                ${product.price.toFixed(2)}
              </div>

              <p className="text-sm leading-relaxed text-[#525b56]">
                {product.description}
              </p>

              {highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {highlights.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#e5e9e7] bg-[#fafafa] px-3 py-1 text-xs font-medium text-[#374040]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {specEntries.length > 0 && (
                <div className="divide-y divide-[#e5e9e7] border-t border-[#e5e9e7] pt-2">
                  {specEntries.map(([key, val]) => (
                    <div
                      key={key}
                      className="flex items-baseline justify-between gap-4 py-2 text-xs"
                    >
                      <span className="text-[#7a8580]">{key}</span>
                      <span className="text-right font-medium text-[#111817]">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={!product.inStock}
                onClick={onAddToCart}
                className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#0a5c55] px-5 text-sm font-semibold text-white transition-all hover:bg-[#084f49] disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
              >
                {inCart ? (
                  <>
                    <Check className="size-4" />
                    <span>In cart</span>
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    <span>Add to cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onToggleCompare}
                className={`inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full border px-4.5 text-sm font-medium transition-all ${
                  inCompare
                    ? "border-[#0a5c55] bg-[#edf7f5] text-[#0a5c55]"
                    : "border-[#e5e9e7] bg-white text-[#111817] hover:border-[#0a5c55] hover:text-[#0a5c55]"
                }`}
              >
                <Scale className="size-4" />
                <span>{inCompare ? "Comparing" : "Compare"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
