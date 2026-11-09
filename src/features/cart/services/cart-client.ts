import { AuthoritativeCart, CheckoutPreparation } from "../types";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  issues?: string[];
}

export async function fetchCart(): Promise<AuthoritativeCart> {
  const res = await fetch("/api/cart", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const json = (await res.json()) as ApiResponse<AuthoritativeCart>;
  if (!res.ok || !json.data) {
    throw new Error(json.error || `Failed to fetch cart: ${res.status}`);
  }
  return json.data;
}

export async function apiAddToCart(
  productId: string,
  quantity: number = 1
): Promise<AuthoritativeCart> {
  const res = await fetch("/api/cart/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
  });

  const json = (await res.json()) as ApiResponse<AuthoritativeCart>;
  if (!res.ok || !json.data) {
    throw new Error(json.error || `Failed to add item to cart: ${res.status}`);
  }
  return json.data;
}

export async function apiUpdateQuantity(
  productId: string,
  quantity: number
): Promise<AuthoritativeCart> {
  const res = await fetch(`/api/cart/items/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });

  const json = (await res.json()) as ApiResponse<AuthoritativeCart>;
  if (!res.ok || !json.data) {
    throw new Error(json.error || `Failed to update item quantity: ${res.status}`);
  }
  return json.data;
}

export async function apiRemoveItem(
  productId: string
): Promise<AuthoritativeCart> {
  const res = await fetch(`/api/cart/items/${encodeURIComponent(productId)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  const json = (await res.json()) as ApiResponse<AuthoritativeCart>;
  if (!res.ok || !json.data) {
    throw new Error(json.error || `Failed to remove item from cart: ${res.status}`);
  }
  return json.data;
}

export async function apiClearCart(): Promise<AuthoritativeCart> {
  const res = await fetch("/api/cart", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  const json = (await res.json()) as ApiResponse<AuthoritativeCart>;
  if (!res.ok || !json.data) {
    throw new Error(json.error || `Failed to clear cart: ${res.status}`);
  }
  return json.data;
}

export async function apiBulkAddToCart(
  items: Array<{ productId: string; quantity: number }>
): Promise<AuthoritativeCart> {
  const res = await fetch("/api/cart/items/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });

  const json = (await res.json()) as ApiResponse<AuthoritativeCart>;
  if (!res.ok || !json.data) {
    throw new Error(json.error || `Failed to bulk add items to cart: ${res.status}`);
  }
  return json.data;
}

export async function apiValidateCheckout(): Promise<CheckoutPreparation> {
  const res = await fetch("/api/cart/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const json = (await res.json()) as ApiResponse<CheckoutPreparation>;
  if (!json.data) {
    throw new Error(json.error || `Failed to validate checkout: ${res.status}`);
  }
  return json.data;
}
