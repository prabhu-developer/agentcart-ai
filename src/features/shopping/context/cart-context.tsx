"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { toast } from "sonner";
import { CartItem, Product } from "../types";
import {
  fetchCart,
  apiAddToCart,
  apiUpdateQuantity,
  apiRemoveItem,
  apiClearCart,
  apiBulkAddToCart,
  apiValidateCheckout,
} from "@/features/cart/services/cart-client";
import {
  AuthoritativeCart,
  CheckoutPreparation,
} from "@/features/cart/types";

interface CartContextValue {
  items: CartItem[];
  authoritativeCart: AuthoritativeCart | null;
  totalItems: number;
  subtotal: number;
  formattedSubtotal: string;
  estimatedTax: number;
  estimatedShipping: number;
  estimatedTotal: number;
  formattedTotal: string;
  isLoadingCart: boolean;
  isValidForCheckout: boolean;
  validationIssues: string[];
  checkoutPreparation: CheckoutPreparation | null;
  isCartOpen: boolean;
  isCompareModalOpen: boolean;
  comparingProducts: Product[];
  addToCart: (product: Product, quantity?: number) => Promise<boolean>;
  addBulkToCart: (
    items: Array<{ productId: string; quantity: number }>
  ) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  validateForCheckout: () => Promise<CheckoutPreparation | null>;
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [authoritativeCart, setAuthoritativeCart] =
    useState<AuthoritativeCart | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [checkoutPreparation, setCheckoutPreparation] =
    useState<CheckoutPreparation | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [comparingProducts, setComparingProducts] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Stale response protection
  const latestMutationSeq = useRef(0);

  const applyAuthoritativeCart = useCallback((cart: AuthoritativeCart) => {
    setAuthoritativeCart(cart);
    setIsLoadingCart(false);
  }, []);

  // Refresh cart from backend API
  const refreshCart = useCallback(async () => {
    const seq = ++latestMutationSeq.current;
    try {
      const cart = await fetchCart();
      if (seq === latestMutationSeq.current) {
        applyAuthoritativeCart(cart);
      }
    } catch (err: unknown) {
      console.warn("Failed to load backend cart:", err);
      if (seq === latestMutationSeq.current) {
        setIsLoadingCart(false);
      }
    }
  }, [applyAuthoritativeCart]);

  // Initial load from backend API on mount
  useEffect(() => {
    let isMounted = true;
    const seq = ++latestMutationSeq.current;

    fetchCart()
      .then((cart) => {
        if (isMounted && seq === latestMutationSeq.current) {
          applyAuthoritativeCart(cart);
        }
      })
      .catch((err) => {
        console.warn("Failed to load initial cart:", err);
        if (isMounted && seq === latestMutationSeq.current) {
          setIsLoadingCart(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [applyAuthoritativeCart]);

  // Map authoritative items to frontend CartItem format
  const items: CartItem[] = useMemo(() => {
    if (!authoritativeCart) return [];
    return authoritativeCart.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));
  }, [authoritativeCart]);

  const totalItems = authoritativeCart?.totalItems || 0;
  const subtotal = authoritativeCart?.subtotal || 0;
  const formattedSubtotal = authoritativeCart?.formattedSubtotal || "$0.00";
  const isValidForCheckout = authoritativeCart?.isValidForCheckout ?? false;
  const validationIssues = authoritativeCart?.validationIssues || [];

  // Estimated shipping & tax for display purposes only
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

  const formattedTotal = `$${estimatedTotal.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const addToCart = async (
    product: Product,
    quantity = 1
  ): Promise<boolean> => {
    const seq = ++latestMutationSeq.current;
    try {
      const updated = await apiAddToCart(product.id, quantity);
      if (seq === latestMutationSeq.current) {
        applyAuthoritativeCart(updated);
      }
      toast.success(`Added ${product.name} to cart`, {
        description: `$${product.price.toFixed(2)} · Verified stock from MongoDB`,
        action: {
          label: "View Cart",
          onClick: () => setIsCartOpen(true),
        },
      });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add item";
      toast.error("Could not add item to cart", {
        description: message,
      });
      return false;
    }
  };

  const addBulkToCart = async (
    bulkItems: Array<{ productId: string; quantity: number }>
  ): Promise<boolean> => {
    const seq = ++latestMutationSeq.current;
    try {
      const updated = await apiBulkAddToCart(bulkItems);
      if (seq === latestMutationSeq.current) {
        applyAuthoritativeCart(updated);
      }
      toast.success(`Added all ${bulkItems.length} items to your cart`, {
        description: "Entire setup verified with live stock and pricing.",
        action: {
          label: "View Cart",
          onClick: () => setIsCartOpen(true),
        },
      });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add setup";
      toast.error("Setup could not be added", {
        description: message,
      });
      return false;
    }
  };

  const removeFromCart = async (productId: string): Promise<void> => {
    const seq = ++latestMutationSeq.current;
    try {
      const updated = await apiRemoveItem(productId);
      if (seq === latestMutationSeq.current) {
        applyAuthoritativeCart(updated);
      }
      toast.info("Item removed from cart");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to remove item";
      toast.error("Failed to remove item", { description: message });
    }
  };

  const updateQuantity = async (
    productId: string,
    quantity: number
  ): Promise<void> => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    const seq = ++latestMutationSeq.current;
    try {
      const updated = await apiUpdateQuantity(productId, quantity);
      if (seq === latestMutationSeq.current) {
        applyAuthoritativeCart(updated);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update quantity";
      toast.error("Stock limitation", { description: message });
    }
  };

  const clearCart = async (): Promise<void> => {
    const seq = ++latestMutationSeq.current;
    try {
      const updated = await apiClearCart();
      if (seq === latestMutationSeq.current) {
        applyAuthoritativeCart(updated);
      }
      toast.info("Cart cleared");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to clear cart";
      toast.error("Failed to clear cart", { description: message });
    }
  };

  const validateForCheckout = async (): Promise<CheckoutPreparation | null> => {
    try {
      const prep = await apiValidateCheckout();
      setCheckoutPreparation(prep);
      return prep;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Checkout validation failed";
      toast.error("Checkout Validation", { description: message });
      return null;
    }
  };

  // Product Comparison state (preserved from Phase 01)
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

  const value: CartContextValue = {
    items,
    authoritativeCart,
    totalItems,
    subtotal,
    formattedSubtotal,
    estimatedTax,
    estimatedShipping,
    estimatedTotal,
    formattedTotal,
    isLoadingCart,
    isValidForCheckout,
    validationIssues,
    checkoutPreparation,
    isCartOpen,
    isCompareModalOpen,
    comparingProducts,
    addToCart,
    addBulkToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    validateForCheckout,
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
