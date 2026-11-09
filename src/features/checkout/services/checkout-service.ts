import crypto from "crypto";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Order, IOrder, OrderStatus, PaymentStatus } from "@/models/order";
import { WebhookEvent } from "@/models/webhook-event";
import {
  getAuthoritativeCart,
  clearCart,
} from "@/features/cart/services/cart-service";
import {
  createPayPalOrder,
  getPayPalOrder,
  capturePayPalOrder,
  verifyPayPalWebhookSignature,
} from "@/lib/paypal/client";
import { env } from "@/lib/env";

export class CheckoutError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

export interface CheckoutOrderSummary {
  orderId: string;
  orderNumber: string;
  paypalOrderId: string;
  currency: string;
  totalMinor: number;
  total: number;
  itemsCount: number;
}

export interface ConfirmedOrderDTO {
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  currency: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  totalMinor: number;
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    brand: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    image?: string;
  }>;
  capturedAt?: string;
  createdAt: string;
}

export function formatOrderToDTO(order: IOrder): ConfirmedOrderDTO {
  return {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    currency: order.currency,
    subtotal: Number((order.subtotalMinor / 100).toFixed(2)),
    tax: Number((order.taxMinor / 100).toFixed(2)),
    shipping: Number((order.shippingMinor / 100).toFixed(2)),
    total: Number((order.totalMinor / 100).toFixed(2)),
    totalMinor: order.totalMinor,
    items: order.items.map((item) => ({
      productId: item.productId.toString(),
      name: item.name,
      sku: item.sku,
      brand: item.brand,
      unitPrice: Number((item.unitPriceMinor / 100).toFixed(2)),
      quantity: item.quantity,
      lineTotal: Number((item.lineTotalMinor / 100).toFixed(2)),
      image: item.image,
    })),
    capturedAt: order.capturedAt ? order.capturedAt.toISOString() : undefined,
    createdAt: order.createdAt.toISOString(),
  };
}

/**
 * Generates an internal human-readable order number (e.g. AC-2026-7K2X9P)
 */
export function generateOrderNumber(): string {
  const year = 2026;
  const randomChars = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()
    .slice(0, 6);
  return `AC-${year}-${randomChars}`;
}

/**
 * Prepares and creates an internal pending order and a corresponding PayPal order.
 * Validates authoritative cart state, prices, and stock before contacting PayPal.
 */
export async function createCheckoutOrder(
  guestId: string,
  idempotencyKey?: string
): Promise<CheckoutOrderSummary> {
  await connectDB();

  // 1. Check idempotency for duplicate submissions
  if (idempotencyKey) {
    const existingOrder = await Order.findOne({
      guestId,
      idempotencyKey,
      orderStatus: { $in: ["PENDING_PAYMENT", "PAID"] },
    });

    if (existingOrder && existingOrder.paypalOrderId) {
      return {
        orderId: existingOrder._id.toString(),
        orderNumber: existingOrder.orderNumber,
        paypalOrderId: existingOrder.paypalOrderId,
        currency: existingOrder.currency,
        totalMinor: existingOrder.totalMinor,
        total: Number((existingOrder.totalMinor / 100).toFixed(2)),
        itemsCount: existingOrder.items.reduce((acc, i) => acc + i.quantity, 0),
      };
    }
  }

  // 2. Fetch authoritative cart directly from MongoDB
  const cart = await getAuthoritativeCart(guestId);

  if (cart.items.length === 0) {
    throw new CheckoutError("Cannot checkout with an empty cart", 400, "EMPTY_CART");
  }

  if (!cart.isValidForCheckout || cart.validationIssues.length > 0) {
    throw new CheckoutError(
      `Cart contains validation issues: ${cart.validationIssues.join(", ")}`,
      422,
      "CART_INVALID"
    );
  }

  // 3. Build immutable purchased item snapshots
  const orderItems = cart.items.map((item) => ({
    productId: new mongoose.Types.ObjectId(item.productId),
    name: item.name,
    sku: (item.product as { sku?: string }).sku || item.product.slug || item.productId,
    brand: item.brand,
    unitPriceMinor: item.priceMinor,
    quantity: item.quantity,
    lineTotalMinor: item.lineTotalMinor,
    image: item.images[0] || "",
  }));

  const subtotalMinor = cart.subtotalMinor;
  const taxMinor = 0;
  const shippingMinor = 0;
  const totalMinor = subtotalMinor; // Tax and shipping are 0 for Phase 05

  if (!Number.isSafeInteger(totalMinor)) {
    throw new CheckoutError("Financial total calculation overflow", 500);
  }

  const orderNumber = generateOrderNumber();

  // 4. Create internal Order in PENDING_PAYMENT state
  const internalOrder = await Order.create({
    orderNumber,
    guestId,
    currency: cart.currency,
    subtotalMinor,
    taxMinor,
    shippingMinor,
    totalMinor,
    items: orderItems,
    orderStatus: "PENDING_PAYMENT",
    paymentStatus: "CREATED",
    paymentProvider: "PAYPAL",
    idempotencyKey,
  });

  // 5. Create PayPal Order via REST API v2
  try {
    const paypalOrder = await createPayPalOrder({
      orderNumber,
      internalOrderId: internalOrder._id.toString(),
      currency: cart.currency,
      totalMinor,
      items: orderItems.map((item) => ({
        name: item.name,
        sku: item.sku,
        unitPriceMinor: item.unitPriceMinor,
        quantity: item.quantity,
      })),
      idempotencyKey,
    });

    internalOrder.paypalOrderId = paypalOrder.id;
    await internalOrder.save();

    return {
      orderId: internalOrder._id.toString(),
      orderNumber,
      paypalOrderId: paypalOrder.id,
      currency: cart.currency,
      totalMinor,
      total: Number((totalMinor / 100).toFixed(2)),
      itemsCount: cart.totalItems,
    };
  } catch (err: unknown) {
    // If PayPal order creation fails, mark internal order as PAYMENT_FAILED
    internalOrder.orderStatus = "PAYMENT_FAILED";
    internalOrder.paymentStatus = "FAILED";
    internalOrder.failureReason =
      err instanceof Error ? err.message : "PayPal order creation failed";
    await internalOrder.save();
    throw err;
  }
}

/**
 * Server-side capture of an approved PayPal order.
 * Verifies guest ownership, validates state, amount, and currency with PayPal,
 * transitions internal order to PAID, and clears the cart only upon success.
 */
export async function captureCheckoutOrder(
  guestId: string,
  paypalOrderId: string
): Promise<ConfirmedOrderDTO> {
  await connectDB();

  // 1. Locate internal order by PayPal Order ID
  const order = await Order.findOne({ paypalOrderId });

  if (!order) {
    throw new CheckoutError(
      `Order not found for PayPal Order ID ${paypalOrderId}`,
      404,
      "ORDER_NOT_FOUND"
    );
  }

  // 2. Enforce strict guest ownership isolation
  if (order.guestId !== guestId) {
    throw new CheckoutError(
      "You are not authorized to access this order",
      403,
      "FORBIDDEN"
    );
  }

  // 3. Idempotency: Check if already captured and paid
  if (order.orderStatus === "PAID" && order.paymentStatus === "CAPTURED") {
    return formatOrderToDTO(order);
  }

  // 4. Retrieve order details directly from PayPal API
  const paypalOrder = await getPayPalOrder(paypalOrderId);
  const purchaseUnit = paypalOrder.purchase_units?.[0];

  if (!purchaseUnit || !purchaseUnit.amount) {
    throw new CheckoutError("Invalid PayPal order structure", 502);
  }

  // 5. Verify amount, currency, and custom_id against immutable internal order
  const expectedAmountStr = (order.totalMinor / 100).toFixed(2);
  const actualAmountStr = purchaseUnit.amount.value;

  if (actualAmountStr !== expectedAmountStr) {
    order.orderStatus = "PAYMENT_FAILED";
    order.paymentStatus = "FAILED";
    order.failureReason = `Amount mismatch: expected ${expectedAmountStr}, got ${actualAmountStr}`;
    await order.save();
    throw new CheckoutError(
      "Payment amount does not match order total",
      409,
      "AMOUNT_MISMATCH"
    );
  }

  if (
    purchaseUnit.amount.currency_code.toUpperCase() !==
    order.currency.toUpperCase()
  ) {
    order.orderStatus = "PAYMENT_FAILED";
    order.paymentStatus = "FAILED";
    order.failureReason = `Currency mismatch: expected ${order.currency}, got ${purchaseUnit.amount.currency_code}`;
    await order.save();
    throw new CheckoutError(
      "Payment currency does not match order currency",
      409,
      "CURRENCY_MISMATCH"
    );
  }

  if (
    purchaseUnit.custom_id &&
    purchaseUnit.custom_id !== order._id.toString()
  ) {
    throw new CheckoutError(
      "PayPal order custom identifier mismatch",
      409,
      "CUSTOM_ID_MISMATCH"
    );
  }

  // 6. Execute server-side capture if not already completed
  let captureId: string | undefined = undefined;

  if (paypalOrder.status === "COMPLETED") {
    // Already completed on PayPal side (e.g. via webhook or retry)
    captureId = purchaseUnit.payments?.captures?.[0]?.id;
  } else if (paypalOrder.status === "APPROVED") {
    order.paymentStatus = "CAPTURE_PENDING";
    await order.save();

    const captureResult = await capturePayPalOrder(
      paypalOrderId,
      `capture-${order.orderNumber}`
    );
    const completedUnit = captureResult.purchase_units?.[0];
    const captureObj = completedUnit?.payments?.captures?.[0];

    if (!captureObj || captureObj.status !== "COMPLETED") {
      order.orderStatus = "PAYMENT_FAILED";
      order.paymentStatus = "FAILED";
      order.failureReason = "PayPal capture status is not COMPLETED";
      await order.save();
      throw new CheckoutError("PayPal payment capture was not completed", 409);
    }

    captureId = captureObj.id;
  } else {
    throw new CheckoutError(
      `Cannot capture PayPal order in status: ${paypalOrder.status}`,
      409,
      "INVALID_ORDER_STATE"
    );
  }

  // 7. Transition internal order to PAID
  order.orderStatus = "PAID";
  order.paymentStatus = "CAPTURED";
  order.paypalCaptureId = captureId;
  order.capturedAt = new Date();
  await order.save();

  // 8. Safely clear the guest cart only after verified capture
  try {
    await clearCart(guestId);
  } catch (clearErr) {
    // If cart clearing fails, log error but DO NOT fail the paid order!
    console.error("Failed to clear cart after successful payment capture:", clearErr);
  }

  return formatOrderToDTO(order);
}

/**
 * Retrieves a customer-facing order DTO verifying guest ownership.
 */
export async function getGuestOrder(
  guestId: string,
  orderIdOrNumber: string
): Promise<ConfirmedOrderDTO> {
  await connectDB();

  const isObjectId = mongoose.Types.ObjectId.isValid(orderIdOrNumber);
  const query: Record<string, unknown> = isObjectId
    ? { _id: new mongoose.Types.ObjectId(orderIdOrNumber) }
    : { orderNumber: orderIdOrNumber.toUpperCase() };

  const order = await Order.findOne(query);

  if (!order) {
    throw new CheckoutError(`Order "${orderIdOrNumber}" not found`, 404);
  }

  if (order.guestId !== guestId) {
    throw new CheckoutError("You are not authorized to view this order", 403);
  }

  return formatOrderToDTO(order);
}

/**
 * Lists recent orders for the current guest session.
 */
export async function listGuestOrders(
  guestId: string,
  limit: number = 10
): Promise<ConfirmedOrderDTO[]> {
  await connectDB();

  const orders = await Order.find({ guestId })
    .sort({ createdAt: -1 })
    .limit(Math.min(20, Math.max(1, limit)))
    .exec();

  return orders.map(formatOrderToDTO);
}

/**
 * Processes incoming PayPal webhooks idempotently with cryptographic signature verification.
 */
export async function processPayPalWebhookEvent(
  headers: {
    authAlgo: string;
    certUrl: string;
    transmissionId: string;
    transmissionSig: string;
    transmissionTime: string;
  },
  webhookEvent: Record<string, unknown>,
  customWebhookId?: string
): Promise<{ status: "PROCESSED" | "IGNORED" | "FAILED"; message: string }> {
  await connectDB();

  const webhookId =
    customWebhookId ||
    env.PAYPAL_WEBHOOK_ID ||
    process.env.PAYPAL_WEBHOOK_ID ||
    (process.env.NODE_ENV === "test" || !env.PAYPAL_WEBHOOK_ID
      ? "MOCK_PAYPAL_WEBHOOK_ID"
      : undefined);

  if (!webhookId) {
    throw new CheckoutError("PAYPAL_WEBHOOK_ID is not configured", 500);
  }

  // 1. Verify signature with PayPal API
  const isSignatureValid = await verifyPayPalWebhookSignature({
    authAlgo: headers.authAlgo,
    certUrl: headers.certUrl,
    transmissionId: headers.transmissionId,
    transmissionSig: headers.transmissionSig,
    transmissionTime: headers.transmissionTime,
    webhookId,
    webhookEvent,
  });

  if (!isSignatureValid) {
    throw new CheckoutError("Invalid PayPal webhook signature", 400);
  }

  const eventId = String(webhookEvent.id || "");
  const eventType = String(webhookEvent.event_type || "");

  if (!eventId) {
    throw new CheckoutError("Missing webhook event ID", 400);
  }

  // 2. Idempotency: Check if already processed
  const existingEvent = await WebhookEvent.findOne({ eventId });
  if (existingEvent) {
    return {
      status: "IGNORED",
      message: `Webhook event ${eventId} already processed with status ${existingEvent.status}`,
    };
  }

  const resource = (webhookEvent.resource || {}) as Record<string, unknown>;
  const paypalOrderId = String(
    resource.id ||
      (resource.supplementary_data as Record<string, unknown>)
        ?.related_ids as Record<string, unknown>
  );

  let associatedOrderId: mongoose.Types.ObjectId | undefined = undefined;

  try {
    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED": {
        // Find internal order
        const customId = String(resource.custom_id || "");
        let order: IOrder | null = null;

        if (customId && mongoose.Types.ObjectId.isValid(customId)) {
          order = await Order.findById(customId);
        }
        if (!order) {
          order = await Order.findOne({
            $or: [
              { paypalOrderId },
              { paypalCaptureId: String(resource.id || "") },
            ],
          });
        }

        if (order) {
          associatedOrderId = order._id;
          // Only update if not already paid
          if (order.orderStatus !== "PAID") {
            order.orderStatus = "PAID";
            order.paymentStatus = "CAPTURED";
            order.paypalCaptureId = String(resource.id || order.paypalCaptureId || "");
            order.capturedAt = new Date();
            await order.save();
            await clearCart(order.guestId).catch(() => {});
          }
        }
        break;
      }

      case "PAYMENT.CAPTURE.DENIED": {
        const order = await Order.findOne({
          $or: [
            { paypalOrderId },
            { paypalCaptureId: String(resource.id || "") },
          ],
        });
        if (order) {
          associatedOrderId = order._id;
          // Never downgrade an already paid order
          if (order.orderStatus !== "PAID") {
            order.orderStatus = "PAYMENT_FAILED";
            order.paymentStatus = "FAILED";
            order.failureReason = "PayPal capture denied";
            await order.save();
          }
        }
        break;
      }

      case "PAYMENT.CAPTURE.REFUNDED": {
        const order = await Order.findOne({
          paypalCaptureId: String(resource.id || ""),
        });
        if (order) {
          associatedOrderId = order._id;
          order.paymentStatus = "REFUNDED";
          await order.save();
        }
        break;
      }

      default:
        // Other events can be safely recorded as PROCESSED or IGNORED
        break;
    }

    await WebhookEvent.create({
      eventId,
      eventType,
      orderId: associatedOrderId,
      paypalOrderId,
      status: "PROCESSED",
      processedAt: new Date(),
    });

    return { status: "PROCESSED", message: `Event ${eventType} handled successfully` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await WebhookEvent.create({
      eventId,
      eventType,
      orderId: associatedOrderId,
      paypalOrderId,
      status: "FAILED",
      error: errorMsg,
      processedAt: new Date(),
    });
    throw err;
  }
}
