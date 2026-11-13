"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Package,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Database,
} from "lucide-react";
import { Product } from "@/features/shopping/types";
import { fetchProductsFromAPI } from "../services/product-client";
import { ProductCard } from "@/features/shopping/components/product-card";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { label: "All Items", value: "" },
  { label: "Workspace", value: "workspace" },
  { label: "Electronics", value: "electronics" },
  { label: "Furniture", value: "furniture" },
  { label: "Accessories", value: "accessories" },
  { label: "Audio", value: "audio" },
  { label: "Lifestyle", value: "lifestyle" },
];

type SortOption = "newest" | "price_asc" | "price_desc" | "name_asc";

interface CatalogBrowserProps {
  initialCategory?: string;
  initialSearch?: string;
}

export function CatalogBrowser({
  initialCategory = "",
  initialSearch = "",
}: CatalogBrowserProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SortOption>("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    fetchProductsFromAPI({
      search: search.trim() || undefined,
      category: category || undefined,
      sort,
      inStock: inStockOnly ? true : undefined,
      page,
      limit: 12,
    })
      .then((res) => {
        if (isCancelled) return;
        if (res.success) {
          setProducts(res.data);
          setTotalPages(res.pagination.totalPages);
          setTotalItems(res.pagination.total);
          setError(null);
        } else {
          setError(res.error || "Failed to load products from database.");
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        setError(err instanceof Error ? err.message : "An unexpected network error occurred.");
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [search, category, sort, inStockOnly, page, reloadTrigger]);

  const handleRetry = () => {
    setIsLoading(true);
    setReloadTrigger((t) => t + 1);
  };

  const handleResetFilters = () => {
    setIsLoading(true);
    setSearch("");
    setCategory("");
    setSort("newest");
    setInStockOnly(false);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Filter and Search Controls */}
      <div className="rounded-2xl border border-[#EAE6F2] bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#777181]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setIsLoading(true);
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search products, specs, or categories..."
              className="h-10 w-full rounded-xl border border-[#EAE6F2] bg-[#F8F7FB] pl-10 pr-4 text-xs text-[#211B2E] placeholder:text-[#777181] outline-none transition-colors focus:border-[#6D45D9] focus:bg-white focus:ring-2 focus:ring-[#6D45D9]/15"
            />
          </div>

          {/* Controls Right */}
          <div className="flex flex-wrap items-center gap-3">
            {/* In Stock Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#211B2E]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setIsLoading(true);
                  setInStockOnly(e.target.checked);
                  setPage(1);
                }}
                className="size-4 rounded border-[#EAE6F2] text-[#5125A8] focus:ring-[#6D45D9]"
              />
              <span>In Stock Only</span>
            </label>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-[#777181]">
              <SlidersHorizontal className="size-3.5" />
              <select
                value={sort}
                onChange={(e) => {
                  setIsLoading(true);
                  setSort(e.target.value as SortOption);
                  setPage(1);
                }}
                className="rounded-xl border border-[#EAE6F2] bg-white px-3 py-2 text-xs font-semibold text-[#211B2E] outline-none transition-colors focus:border-[#6D45D9]"
              >
                <option value="newest">Sort: Newest Arrival</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Alphabetical: A-Z</option>
              </select>
            </div>

            {/* Reset */}
            {(search || category || inStockOnly || sort !== "newest") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 gap-1 border-[#EAE6F2] text-xs text-[#777181] hover:text-[#211B2E]"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-[#F8F7FB] pt-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#777181] mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                setIsLoading(true);
                setCategory(cat.value);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                category === cat.value
                  ? "bg-[#5125A8] text-white shadow-xs"
                  : "border border-[#EAE6F2] bg-white text-[#777181] hover:border-[#6D45D9]/40 hover:bg-[#F2EDFC] hover:text-[#5125A8]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Database Catalog Status Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-[#777181]">
        <div className="flex items-center gap-1.5">
          <Database className="size-3.5 text-[#5125A8]" />
          <span>
            {totalItems} {totalItems === 1 ? "product" : "products"} verified in catalog
          </span>
        </div>
        {totalPages > 1 && (
          <span className="font-medium">
            Page {page} of {totalPages}
          </span>
        )}
      </div>

      {/* Products Content */}
      {isLoading ? (
        /* Loading Skeleton */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-[#EAE6F2] bg-white p-4"
            >
              <div className="aspect-4/3 w-full rounded-xl bg-[#F8F7FB]" />
              <div className="mt-4 h-3 w-1/3 rounded-sm bg-[#EAE6F2]" />
              <div className="mt-2 h-4 w-3/4 rounded-sm bg-[#EAE6F2]" />
              <div className="mt-2 h-3 w-full rounded-sm bg-[#EAE6F2]/50" />
              <div className="mt-4 flex justify-between border-t border-[#F8F7FB] pt-3">
                <div className="h-4 w-16 rounded-sm bg-[#EAE6F2]" />
                <div className="h-7 w-20 rounded-md bg-[#EAE6F2]" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State with Retry */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center text-rose-900">
          <AlertCircle className="size-8 text-rose-600" />
          <h4 className="mt-3 text-base font-bold">Failed to Load Products</h4>
          <p className="mt-1 text-xs text-rose-700">{error}</p>
          <Button
            onClick={handleRetry}
            className="mt-4 bg-[#5125A8] text-white hover:bg-[#431E8C]"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#EAE6F2] bg-white p-12 text-center">
          <Package className="size-10 text-[#777181]/60" />
          <h4 className="mt-3 text-base font-bold text-[#211B2E]">
            No matching products found
          </h4>
          <p className="mt-1 max-w-sm text-xs text-[#777181]">
            Try adjusting your search query, clearing filters, or browsing a different category.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              setIsLoading(true);
              setPage((p) => Math.max(1, p - 1));
            }}
            className="gap-1 rounded-lg"
          >
            <ChevronLeft className="size-3.5" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setPage(p);
                }}
                className={`flex size-8 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                  page === p
                    ? "bg-[#5125A8] text-white shadow-2xs"
                    : "text-[#777181] hover:bg-[#F2EDFC] hover:text-[#5125A8]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => {
              setIsLoading(true);
              setPage((p) => Math.min(totalPages, p + 1));
            }}
            className="gap-1 rounded-lg"
          >
            <span>Next</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
