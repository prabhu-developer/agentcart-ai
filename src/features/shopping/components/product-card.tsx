
"use client";

import { Button } from "@/components/ui/button";
import { Check, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useShoppingCart } from "../context/cart-context";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useShoppingCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md">

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 300px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Product Info */}
      <div className="space-y-3 p-3">

        <h3 className="truncate text-sm font-medium text-gray-900">
          {product.name}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </p>

          <Button
            size="sm"
            onClick={handleAdd}
            className="h-8 px-3"
          >
            {isAdding ? (
              <>
                <Check className="mr-1 size-3.5" />
                Added
              </>
            ) : (
              <>
                <ShoppingBag className="mr-1 size-3.5" />
                Add
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
