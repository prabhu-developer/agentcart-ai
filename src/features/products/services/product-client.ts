import { Product } from "@/features/shopping/types";

export interface FetchProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export interface FetchProductDetailResponse {
  success: boolean;
  data?: Product;
  error?: string;
}

export async function fetchProductsFromAPI(params?: {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
  page?: number;
  limit?: number;
}): Promise<FetchProductsResponse> {
  const query = new URLSearchParams();

  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  if (params?.brand) query.set("brand", params.brand);
  if (params?.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params?.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
  if (params?.inStock !== undefined) query.set("inStock", String(params.inStock));
  if (params?.featured !== undefined) query.set("featured", String(params.featured));
  if (params?.sort) query.set("sort", params.sort);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const url = `/api/products?${query.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to fetch products: ${response.status}`);
  }

  return response.json();
}

export async function fetchProductByIdFromAPI(
  productId: string
): Promise<Product | null> {
  const response = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch product details: ${response.status}`);
  }

  const json: FetchProductDetailResponse = await response.json();
  return json.data || null;
}
