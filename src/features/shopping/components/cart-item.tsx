"use client";

import React from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "../types";
import { useShoppingCart } from "../context/cart-context";

interface CartItemProps {
  item: CartItemType;
}

export function CartItemRow({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useShoppingCart();
  const { product, quantity } = item;
  const lineTotal = (product.price * quantity).toFixed(2);

  return (
    <div className="flex items-center gap-3.5 border-b border-[#e8ece9] py-3.5 first:pt-1 last:border-b-0">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-[#e8ece9] bg-[#f8faf9]">
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
            <p className="text-xs font-medium uppercase tracking-wider text-[#727b76]">
              {product.brand}
            </p>
            <h4 className="truncate text-sm font-medium text-[#202522]">
              {product.name}
            </h4>
          </div>
          <button
            type="button"
            onClick={() => removeFromCart(product.id)}
            className="text-[#727b76] transition-colors hover:text-rose-600"
            aria-label={`Remove ${product.name} from cart`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center rounded-md border border-[#e8ece9] bg-[#f8faf9]">
            <button
              type="button"
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="flex size-7 items-center justify-center text-[#727b76] transition-colors hover:bg-white hover:text-[#202522]"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3" />
            </button>
            <span className="w-8 text-center text-xs font-semibold text-[#202522]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="flex size-7 items-center justify-center text-[#727b76] transition-colors hover:bg-white hover:text-[#202522]"
              aria-label="Increase quantity"
            >
              <Plus className="size-3" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#727b76]">${product.price.toFixed(2)} ea</span>
            <p className="text-sm font-semibold text-[#202522]">${lineTotal}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
