"use client";

import React, { createContext, useContext, useState, useMemo, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { CartItem, Product } from "../types";

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  formattedSubtotal: string;
  estimatedTax: number;
  estimatedShipping: number;
  estimatedTotal: number;
  formattedTotal: string;
  isCartOpen: boolean;
  isCompareModalOpen: boolean;
  comparingProducts: Product[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  toggleCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  openCompareModal: () => void;
  closeCompareModal: () => void;
  isInCompare: (productId: string) => boolean;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY_CART = "agentcart_cart_v1";
const EMPTY_ITEMS: CartItem[] = [];

let memoryItems: CartItem[] = [];
let listeners: Array<() => void> = [];

// Initialize memory cache on client
if (typeof window !== "undefined") {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY_CART);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        memoryItems = parsed;
      }
    }
  } catch {
    // Ignore read errors
  }
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function updateCartStore(nextItems: CartItem[]) {
  memoryItems = nextItems;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(nextItems));
    } catch {
      // Ignore write errors
    }
  }
  emitChange();
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): CartItem[] {
  return memoryItems;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_ITEMS;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [comparingProducts, setComparingProducts] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const addToCart = (product: Product, quantity = 1) => {
    const existingIndex = memoryItems.findIndex((item) => item.product.id === product.id);
    let next: CartItem[];
    if (existingIndex > -1) {
      next = memoryItems.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      next = [...memoryItems, { product, quantity }];
    }
    updateCartStore(next);

    toast.success(`Added ${product.name} to cart`, {
      description: `$${product.price.toFixed(2)} · In stock`,
      action: {
        label: "View Cart",
        onClick: () => setIsCartOpen(true),
      },
    });
  };

  const removeFromCart = (productId: string) => {
    const next = memoryItems.filter((item) => item.product.id !== productId);
    updateCartStore(next);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const next = memoryItems.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    updateCartStore(next);
  };

  const clearCart = () => {
    updateCartStore([]);
  };

  const toggleCompare = (product: Product) => {
    setComparingProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        toast.warning("Comparison limit reached", {
          description: "You can compare up to 4 products at the same time.",
        });
        return prev;
      }
      toast.info(`Added ${product.name} to comparison`, {
        action: {
          label: "View Comparison",
          onClick: () => setIsCompareModalOpen(true),
        },
      });
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setComparingProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => {
    setComparingProducts([]);
  };

  const isInCompare = (productId: string) => {
    return comparingProducts.some((p) => p.id === productId);
  };

  const isInCart = (productId: string) => {
    return items.some((item) => item.product.id === productId);
  };

  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return Number(
      items.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toFixed(2)
    );
  }, [items]);

  const estimatedShipping = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= 50 ? 0 : 9.99;
  }, [subtotal]);

  const estimatedTax = useMemo(() => {
    return Number((subtotal * 0.08).toFixed(2));
  }, [subtotal]);

  const estimatedTotal = useMemo(() => {
    if (subtotal === 0) return 0;
    return Number((subtotal + estimatedShipping + estimatedTax).toFixed(2));
  }, [subtotal, estimatedShipping, estimatedTax]);

  const value: CartContextValue = {
    items,
    totalItems,
    subtotal,
    formattedSubtotal: `$${subtotal.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    estimatedTax,
    estimatedShipping,
    estimatedTotal,
    formattedTotal: `$${estimatedTotal.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    isCartOpen,
    isCompareModalOpen,
    comparingProducts,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    toggleCart: () => setIsCartOpen((prev) => !prev),
    toggleCompare,
    removeFromCompare,
    clearCompare,
    openCompareModal: () => setIsCompareModalOpen(true),
    closeCompareModal: () => setIsCompareModalOpen(false),
    isInCompare,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useShoppingCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useShoppingCart must be used within a CartProvider");
  }
  return context;
}
