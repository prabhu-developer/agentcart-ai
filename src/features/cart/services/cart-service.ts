import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Cart, ICart } from "@/models/cart";
import { getProductByIdOrSlug } from "@/features/products/services/product-service";
import {
  AuthoritativeCart,
  AuthoritativeCartItem,
  CheckoutPreparation,
} from "../types";

export class CartError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "CartError";
  }
}

/**
 * Retrieves the guest Cart document or creates an empty one if none exists.
 */
export async function getOrCreateCart(guestId: string): Promise<ICart> {
  await connectDB();

  let cart = await Cart.findOne({ guestId });
  if (!cart) {
    cart = await Cart.create({
      guestId,
      currency: "USD",
      items: [],
    });
  }
  return cart;
}

/**
 * Builds the complete, authoritative Cart state by verifying every item against current MongoDB product records.
 * Prices, stock levels, and active statuses are loaded live from the database.
 */
export async function getAuthoritativeCart(guestId: string): Promise<AuthoritativeCart> {
  await connectDB();

  const cart = await getOrCreateCart(guestId);
  const authoritativeItems: AuthoritativeCartItem[] = [];
  const validationIssues: string[] = [];

  let subtotalMinor = 0;
  let totalItems = 0;

  for (const item of cart.items) {
    const productIdStr = item.product.toString();
    const product = await getProductByIdOrSlug(productIdStr);

    if (!product) {
      validationIssues.push(`Product identifier "${productIdStr}" was not found in the catalog.`);
      continue;
    }

    const currentStock = product.stockCount;
    const inStock = product.inStock && currentStock > 0;
    let isAvailable = inStock;
    let issue: string | undefined = undefined;

    if (!inStock) {
      isAvailable = false;
      issue = `"${product.name}" is currently out of stock.`;
      validationIssues.push(issue);
    } else if (item.quantity > currentStock) {
      isAvailable = false;
      issue = `Requested ${item.quantity} units, but only ${currentStock} are available in stock.`;
      validationIssues.push(`"${product.name}": ${issue}`);
    }

    // Currency consistency check
    if (product.currency.toUpperCase() !== cart.currency.toUpperCase()) {
      isAvailable = false;
      issue = `Currency mismatch: product is in ${product.currency}, but cart is in ${cart.currency}.`;
      validationIssues.push(`"${product.name}": ${issue}`);
    }

    const priceMinor = product.priceMinor;
    const lineTotalMinor = priceMinor * item.quantity;

    if (!Number.isSafeInteger(lineTotalMinor)) {
      throw new CartError("Financial calculation integer overflow detected", 500);
    }

    subtotalMinor += lineTotalMinor;
    totalItems += item.quantity;

    authoritativeItems.push({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      images: product.images,
      price: product.price,
      priceMinor,
      currency: product.currency,
      quantity: item.quantity,
      lineTotal: Number((lineTotalMinor / 100).toFixed(2)),
      lineTotalMinor,
      inStock,
      availableStock: currentStock,
      isAvailable,
      validationIssue: issue,
      product,
    });
  }

  if (!Number.isSafeInteger(subtotalMinor)) {
    throw new CartError("Cart subtotal calculation overflow", 500);
  }

  const subtotal = Number((subtotalMinor / 100).toFixed(2));
  const isValidForCheckout =
    authoritativeItems.length > 0 && validationIssues.length === 0;

  return {
    id: cart._id.toString(),
    currency: cart.currency,
    items: authoritativeItems,
    totalItems,
    subtotal,
    subtotalMinor,
    formattedSubtotal: `$${subtotal.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    isValidForCheckout,
    validationIssues,
    updatedAt: cart.updatedAt ? cart.updatedAt.toISOString() : new Date().toISOString(),
  };
}

/**
 * Adds an item to the cart or increments its quantity.
 * Prices from the client are completely ignored; data is retrieved from MongoDB.
 */
export async function addItemToCart(
  guestId: string,
  productIdOrSlug: string,
  quantity: number = 1
): Promise<AuthoritativeCart> {
  if (quantity < 1 || !Number.isInteger(quantity)) {
    throw new CartError("Quantity must be a positive integer", 400);
  }

  await connectDB();
  const cart = await getOrCreateCart(guestId);

  // Fetch product to verify existence, stock, and currency
  const product = await getProductByIdOrSlug(productIdOrSlug);
  if (!product) {
    throw new CartError(`Product "${productIdOrSlug}" not found in catalog`, 404);
  }

  if (!product.inStock || product.stockCount <= 0) {
    throw new CartError(`"${product.name}" is currently out of stock`, 409, "OUT_OF_STOCK");
  }

  if (product.currency.toUpperCase() !== cart.currency.toUpperCase()) {
    throw new CartError(
      `Cannot add product in ${product.currency} to cart in ${cart.currency}`,
      409,
      "CURRENCY_MISMATCH"
    );
  }

  const existingIndex = cart.items.findIndex(
    (item) => item.product.toString() === product.id
  );

  let newQuantity = quantity;
  if (existingIndex > -1) {
    newQuantity = cart.items[existingIndex].quantity + quantity;
  }

  if (newQuantity > 99) {
    throw new CartError("Maximum quantity of 99 units per item exceeded", 400);
  }

  if (newQuantity > product.stockCount) {
    throw new CartError(
      `Cannot add ${quantity} more units. Only ${product.stockCount} available in stock (already in cart: ${
        existingIndex > -1 ? cart.items[existingIndex].quantity : 0
      }).`,
      409,
      "INSUFFICIENT_STOCK"
    );
  }

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity = newQuantity;
    cart.items[existingIndex].updatedAt = new Date();
  } else {
    cart.items.push({
      product: new mongoose.Types.ObjectId(product.id),
      quantity,
      addedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await cart.save();
  return getAuthoritativeCart(guestId);
}

/**
 * Updates an item's quantity in the cart.
 * Rejects zero or negative quantity (DELETE should be used for removal).
 */
export async function updateItemQuantity(
  guestId: string,
  productIdOrSlug: string,
  quantity: number
): Promise<AuthoritativeCart> {
  if (quantity < 1 || !Number.isInteger(quantity)) {
    throw new CartError(
      "Quantity must be a positive integer. Use DELETE /api/cart/items/[productId] to remove an item.",
      400
    );
  }

  if (quantity > 99) {
    throw new CartError("Maximum quantity of 99 units per item exceeded", 400);
  }

  await connectDB();
  const cart = await getOrCreateCart(guestId);

  const product = await getProductByIdOrSlug(productIdOrSlug);
  if (!product) {
    throw new CartError(`Product "${productIdOrSlug}" not found in catalog`, 404);
  }

  const existingIndex = cart.items.findIndex(
    (item) => item.product.toString() === product.id
  );

  if (existingIndex === -1) {
    throw new CartError(`Item "${product.name}" is not in the cart`, 404);
  }

  if (quantity > product.stockCount) {
    throw new CartError(
      `Requested ${quantity} units, but only ${product.stockCount} are available in stock.`,
      409,
      "INSUFFICIENT_STOCK"
    );
  }

  cart.items[existingIndex].quantity = quantity;
  cart.items[existingIndex].updatedAt = new Date();

  await cart.save();
  return getAuthoritativeCart(guestId);
}

/**
 * Removes a specific item from the cart.
 */
export async function removeItemFromCart(
  guestId: string,
  productIdOrSlug: string
): Promise<AuthoritativeCart> {
  await connectDB();
  const cart = await getOrCreateCart(guestId);

  const product = await getProductByIdOrSlug(productIdOrSlug);
  const targetId = product ? product.id : productIdOrSlug;

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== targetId
  );

  await cart.save();
  return getAuthoritativeCart(guestId);
}

/**
 * Clears all items from the current guest cart.
 */
export async function clearCart(guestId: string): Promise<AuthoritativeCart> {
  await connectDB();
  const cart = await getOrCreateCart(guestId);

  cart.items = [];
  await cart.save();

  return getAuthoritativeCart(guestId);
}

/**
 * Atomic bulk add operation for AI recommendations.
 * All proposed items are validated together. If any item is out of stock, inactive,
 * or has an invalid quantity, the entire operation is rejected without modifying the cart.
 */
export async function addBulkItemsToCart(
  guestId: string,
  items: Array<{ productId: string; quantity: number }>
): Promise<AuthoritativeCart> {
  if (!items || items.length === 0) {
    throw new CartError("At least one item is required for bulk add", 400);
  }

  await connectDB();
  const cart = await getOrCreateCart(guestId);

  // Phase 1: Pre-validate all items
  const resolvedItems: Array<{
    product: NonNullable<Awaited<ReturnType<typeof getProductByIdOrSlug>>>;
    quantity: number;
    newTotalQuantity: number;
  }> = [];

  for (const item of items) {
    if (item.quantity < 1 || !Number.isInteger(item.quantity)) {
      throw new CartError(`Invalid quantity for product ${item.productId}`, 400);
    }

    const product = await getProductByIdOrSlug(item.productId);
    if (!product) {
      throw new CartError(`Product "${item.productId}" was not found in catalog`, 404);
    }

    if (!product.inStock || product.stockCount <= 0) {
      throw new CartError(
        `Cannot add setup: "${product.name}" is currently out of stock.`,
        409,
        "OUT_OF_STOCK"
      );
    }

    if (product.currency.toUpperCase() !== cart.currency.toUpperCase()) {
      throw new CartError(
        `Currency mismatch: "${product.name}" uses ${product.currency}, but cart uses ${cart.currency}.`,
        409,
        "CURRENCY_MISMATCH"
      );
    }

    const existingIndex = cart.items.findIndex(
      (ci) => ci.product.toString() === product.id
    );
    const existingQty = existingIndex > -1 ? cart.items[existingIndex].quantity : 0;
    const newTotal = existingQty + item.quantity;

    if (newTotal > product.stockCount) {
      throw new CartError(
        `Cannot add setup: "${product.name}" only has ${product.stockCount} in stock (requested ${newTotal}).`,
        409,
        "INSUFFICIENT_STOCK"
      );
    }

    resolvedItems.push({
      product,
      quantity: item.quantity,
      newTotalQuantity: newTotal,
    });
  }

  // Phase 2: Apply all updates atomically to cart document
  for (const resolved of resolvedItems) {
    const existingIndex = cart.items.findIndex(
      (ci) => ci.product.toString() === resolved.product.id
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = resolved.newTotalQuantity;
      cart.items[existingIndex].updatedAt = new Date();
    } else {
      cart.items.push({
        product: new mongoose.Types.ObjectId(resolved.product.id),
        quantity: resolved.quantity,
        addedAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  await cart.save();
  return getAuthoritativeCart(guestId);
}

/**
 * Validates the cart for checkout preparation.
 * Re-queries all products to ensure prices, stock, and availability are 100% current.
 * Does NOT create orders or process payments.
 */
export async function validateCartForCheckout(
  guestId: string
): Promise<CheckoutPreparation> {
  const authoritativeCart = await getAuthoritativeCart(guestId);

  const issues = [...authoritativeCart.validationIssues];

  if (authoritativeCart.items.length === 0) {
    issues.push("Cannot prepare checkout for an empty cart.");
  }

  const isValid = issues.length === 0 && authoritativeCart.items.length > 0;

  return {
    cartId: authoritativeCart.id,
    currency: authoritativeCart.currency,
    subtotal: authoritativeCart.subtotal,
    subtotalMinor: authoritativeCart.subtotalMinor,
    formattedSubtotal: authoritativeCart.formattedSubtotal,
    totalItems: authoritativeCart.totalItems,
    items: authoritativeCart.items,
    isValid,
    issues,
    taxNotCalculated: true,
    shippingNotCalculated: true,
    preparationTimestamp: new Date().toISOString(),
  };
}
