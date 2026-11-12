"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useShoppingCart } from "../context/cart-context";
import { CartItem as CartItemType } from "../types";

interface CartItemProps {
  item: CartItemType;
}

export function CartItemRow({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useShoppingCart();
  const { product, quantity } = item;
  const lineTotal = (product.price * quantity).toFixed(2);

  return (
    <div className="flex items-center gap-3.5 border-b border-[#e5e9e7] py-3.5 first:pt-1 last:border-b-0">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-[#e5e9e7] bg-[#f4f6f5]">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="64px"
          className="object-cover object-center"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a8580]">
              {product.brand}
            </p>
            <h4 className="truncate text-sm font-medium text-[#111817]">
              {product.name}
            </h4>
          </div>
          <button
            type="button"
            onClick={() => removeFromCart(product.id)}
            className="cursor-pointer text-[#9ca5a0] transition-colors hover:text-rose-600"
            aria-label={`Remove ${product.name} from cart`}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center rounded-full border border-[#e5e9e7] bg-[#fafafa]">
            <button
              type="button"
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="flex size-6.5 cursor-pointer items-center justify-center rounded-full text-[#7a8580] transition-colors hover:bg-white hover:text-[#111817]"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3" />
            </button>
            <span className="w-7 text-center text-xs font-semibold tabular-nums text-[#111817]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="flex size-6.5 cursor-pointer items-center justify-center rounded-full text-[#7a8580] transition-colors hover:bg-white hover:text-[#111817]"
              aria-label="Increase quantity"
            >
              <Plus className="size-3" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#7a8580]">
              ${product.price.toFixed(2)} ea
            </span>
            <p className="text-sm font-bold tabular-nums text-[#111817]">
              ${lineTotal}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
