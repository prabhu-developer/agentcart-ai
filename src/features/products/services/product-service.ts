import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/models/product";
import { Category } from "@/models/category";
import { Brand } from "@/models/brand";
import { ProductQueryParams } from "../validators/product-query";
import { Product as FrontendProduct } from "@/features/shopping/types";

type ProductFilter = Record<string, unknown>;

interface RawProductDoc {
  _id: mongoose.Types.ObjectId | string;
  slug: string;
  sku: string;
  name: string;
  brand?: { _id?: mongoose.Types.ObjectId | string; name?: string; slug?: string; logo?: string } | string;
  category?: { _id?: mongoose.Types.ObjectId | string; name?: string; slug?: string } | string;
  priceMinor: number;
  compareAtPriceMinor?: number;
  currency?: string;
  description: string;
  shortDescription?: string;
  rating?: number;
  reviewCount?: number;
  stock: number;
  images?: string[];
  specifications?: Map<string, string> | Record<string, string>;
  pros?: string[];
  cons?: string[];
  highlights?: string[];
  isFeatured?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface SerializedProduct extends FrontendProduct {
  sku?: string;
  shortDescription?: string;
  compareAtPriceMinor?: number;
  compareAtPrice?: number;
  isFeatured?: boolean;
  brandDetails?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  categoryDetails?: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListResult {
  products: SerializedProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function escapeRegex(text: string): string {
  return text.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function serializeProduct(doc: RawProductDoc): SerializedProduct {
  const brandName =
    doc.brand && typeof doc.brand === "object" && doc.brand.name
      ? doc.brand.name
      : typeof doc.brand === "string"
      ? doc.brand
      : "";

  const categoryName =
    doc.category && typeof doc.category === "object" && doc.category.name
      ? doc.category.name
      : typeof doc.category === "string"
      ? doc.category
      : "";

  let specs: Record<string, string> = {};
  if (doc.specifications instanceof Map) {
    specs = Object.fromEntries(doc.specifications);
  } else if (doc.specifications && typeof doc.specifications === "object") {
    specs = { ...doc.specifications };
  }

  const priceMinor = Number(doc.priceMinor) || 0;
  const compareAtPriceMinor = doc.compareAtPriceMinor ? Number(doc.compareAtPriceMinor) : undefined;
  const stock = Number(doc.stock) || 0;

  return {
    id: doc._id.toString(),
    slug: doc.slug,
    sku: doc.sku,
    name: doc.name,
    brand: brandName,
    brandDetails:
      doc.brand && typeof doc.brand === "object" && doc.brand._id
        ? {
            id: doc.brand._id.toString(),
            name: doc.brand.name || "",
            slug: doc.brand.slug || "",
            logo: doc.brand.logo,
          }
        : undefined,
    category: (categoryName.toLowerCase() as FrontendProduct["category"]) || "workspace",
    categoryDetails:
      doc.category && typeof doc.category === "object" && doc.category._id
        ? {
            id: doc.category._id.toString(),
            name: doc.category.name || "",
            slug: doc.category.slug || "",
          }
        : undefined,
    price: Number((priceMinor / 100).toFixed(2)),
    priceMinor,
    compareAtPriceMinor,
    compareAtPrice: compareAtPriceMinor
      ? Number((compareAtPriceMinor / 100).toFixed(2))
      : undefined,
    currency: doc.currency || "USD",
    description: doc.description,
    shortDescription: doc.shortDescription || doc.description.slice(0, 120),
    rating: typeof doc.rating === "number" ? doc.rating : 4.8,
    reviewCount: typeof doc.reviewCount === "number" ? doc.reviewCount : 0,
    inStock: stock > 0,
    stockCount: stock,
    images: Array.isArray(doc.images) ? doc.images : [],
    specifications: specs,
    pros: Array.isArray(doc.pros) ? doc.pros : [],
    cons: Array.isArray(doc.cons) ? doc.cons : [],
    highlights: Array.isArray(doc.highlights) ? doc.highlights : [],
    isFeatured: Boolean(doc.isFeatured),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : undefined,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : undefined,
  };
}

export type ListProductsInput = Partial<ProductQueryParams>;

export async function listProducts(params: ListProductsInput = {}): Promise<ProductListResult> {
  await connectDB();

  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(1, params.limit ?? 12));
  const sort = params.sort ?? "newest";

  const query: ProductFilter = {
    isActive: true,
  };

  // 1. Text / keyword search
  if (params.search) {
    const escaped = escapeRegex(params.search.trim());
    query.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
      { tags: { $regex: escaped, $options: "i" } },
      { sku: { $regex: escaped, $options: "i" } },
    ];
  }

  // 2. Category filter by slug or ID
  if (params.category) {
    const catInput = params.category.trim();
    if (mongoose.Types.ObjectId.isValid(catInput)) {
      query.category = new mongoose.Types.ObjectId(catInput);
    } else {
      const categoryDoc = await Category.findOne({
        slug: catInput.toLowerCase(),
        isActive: true,
      })
        .select("_id")
        .lean();

      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // If no matching category doc, return empty result
        return {
          products: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }
    }
  }

  // 3. Brand filter by slug or ID
  if (params.brand) {
    const brandInput = params.brand.trim();
    if (mongoose.Types.ObjectId.isValid(brandInput)) {
      query.brand = new mongoose.Types.ObjectId(brandInput);
    } else {
      const brandDoc = await Brand.findOne({
        slug: brandInput.toLowerCase(),
        isActive: true,
      })
        .select("_id")
        .lean();

      if (brandDoc) {
        query.brand = brandDoc._id;
      } else {
        return {
          products: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }
    }
  }

  // 4. Price filter (supports minor units or dollar input)
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (params.minPrice !== undefined) {
      // If <= 500, convert dollar input to cents
      const minCents = params.minPrice <= 500 ? Math.round(params.minPrice * 100) : Math.round(params.minPrice);
      priceFilter.$gte = minCents;
    }
    if (params.maxPrice !== undefined) {
      const maxCents = params.maxPrice <= 500 ? Math.round(params.maxPrice * 100) : Math.round(params.maxPrice);
      priceFilter.$lte = maxCents;
    }
    query.priceMinor = priceFilter;
  }

  // 5. In-Stock filter
  if (params.inStock !== undefined) {
    if (params.inStock) {
      query.stock = { $gt: 0 };
    } else {
      query.stock = { $lte: 0 };
    }
  }

  // 6. Featured filter
  if (params.featured !== undefined) {
    query.isFeatured = params.featured;
  }

  // 7. Sort options
  let sortOptions: Record<string, mongoose.SortOrder> = { createdAt: -1 };
  if (sort === "price_asc") {
    sortOptions = { priceMinor: 1 };
  } else if (sort === "price_desc") {
    sortOptions = { priceMinor: -1 };
  } else if (sort === "name_asc") {
    sortOptions = { name: 1 };
  } else if (sort === "newest") {
    sortOptions = { createdAt: -1 };
  }

  // 8. Pagination execution
  const skip = (page - 1) * limit;

  const [total, rawDocs] = await Promise.all([
    Product.countDocuments(query),
    Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate("brand", "name slug logo")
      .populate("category", "name slug")
      .lean(),
  ]);

  const totalPages = Math.ceil(total / limit);
  const products = (rawDocs as unknown as RawProductDoc[]).map(serializeProduct);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function getProductByIdOrSlug(idOrSlug: string): Promise<SerializedProduct | null> {
  await connectDB();

  const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
  const query: ProductFilter = {
    isActive: true,
  };

  if (isObjectId) {
    query.$or = [{ _id: new mongoose.Types.ObjectId(idOrSlug) }, { slug: idOrSlug.toLowerCase() }];
  } else {
    query.slug = idOrSlug.toLowerCase();
  }

  const doc = await Product.findOne(query)
    .populate("brand", "name slug logo")
    .populate("category", "name slug")
    .lean();

  if (!doc) {
    return null;
  }

  return serializeProduct(doc as unknown as RawProductDoc);
}

export async function getFeaturedProducts(limit = 6): Promise<SerializedProduct[]> {
  await connectDB();

  const rawDocs = await Product.find({
    isActive: true,
    isFeatured: true,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("brand", "name slug logo")
    .populate("category", "name slug")
    .lean();

  return (rawDocs as unknown as RawProductDoc[]).map(serializeProduct);
}
