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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div
        className="relative max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#e8ece9] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full border border-[#e8ece9] bg-white/95 text-[#6b7470] transition-colors hover:text-[#181c1a]"
        >
          <X className="size-4" />
        </button>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 md:gap-8 md:p-8">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#f8faf9]">
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
                <div className="flex size-full items-center justify-center text-xs text-[#8a948f]">
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
                    className={`relative size-14 cursor-pointer overflow-hidden rounded-lg border transition-all ${selectedIndex === idx
                      ? "border-[#0f766e] ring-1 ring-[#0f766e]"
                      : "border-[#e8ece9] opacity-70 hover:opacity-100"
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
                <p className="text-[11px] font-medium tracking-wider text-[#727b76] uppercase">
                  {product.brand} · {product.category}
                </p>
                <h2 className="text-xl leading-snug font-semibold text-[#181c1a]">
                  {product.name}
                </h2>
                <div className="flex items-center gap-3 pt-0.5 text-xs text-[#6b7470]">
                  <span className="inline-flex items-center gap-1 font-medium text-[#181c1a]">
                    <Star className="size-3.5 fill-[#0f766e] text-[#0f766e]" />
                    {product.rating.toFixed(1)}
                  </span>
                  <span>·</span>
                  <span className={product.inStock ? "text-[#0f766e]" : "text-[#6b7470]"}>
                    {product.inStock ? "In stock" : "Out of stock"}
                  </span>
                </div>
              </div>

              <div className="text-2xl font-semibold tabular-nums text-[#181c1a]">
                ${product.price.toFixed(2)}
              </div>

              <p className="text-sm leading-relaxed text-[#6b7470]">
                {product.description}
              </p>

              {highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {highlights.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-[#f8faf9] px-2.5 py-1 text-xs text-[#4b544f]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {specEntries.length > 0 && (
                <div className="divide-y divide-[#eef1ef] border-t border-[#eef1ef] pt-2">
                  {specEntries.map(([key, val]) => (
                    <div
                      key={key}
                      className="flex items-baseline justify-between gap-4 py-2 text-xs"
                    >
                      <span className="text-[#727b76]">{key}</span>
                      <span className="text-right font-medium text-[#181c1a]">{val}</span>
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
                className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#0f766e] px-5 text-sm font-medium text-white transition-colors hover:bg-[#0d655e] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {inCart ? (
                  <>
                    <Check className="size-4" />
                    <span>Add another</span>
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
                className={`inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${inCompare
                  ? "border-[#0f766e] bg-[#eaf5f2] text-[#0f766e]"
                  : "border-[#e8ece9] bg-white text-[#181c1a] hover:border-[#cfd8d3]"
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
