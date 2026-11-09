import mongoose, { Schema, Document, Model } from "mongoose";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PAYMENT_FAILED"
  | "CANCELLED";

export type PaymentStatus =
  | "CREATED"
  | "APPROVED"
  | "CAPTURE_PENDING"
  | "CAPTURED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  brand: string;
  unitPriceMinor: number;
  quantity: number;
  lineTotalMinor: number;
  image?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  guestId: string;
  userId?: mongoose.Types.ObjectId;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  currency: string;
  subtotalMinor: number;
  taxMinor: number;
  shippingMinor: number;
  totalMinor: number;
  items: IOrderItem[];
  paymentProvider: "PAYPAL";
  capturedAt?: Date;
  failureReason?: string;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      default: "",
      trim: true,
    },
    unitPriceMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "unitPriceMinor must be an integer",
      },
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "quantity must be an integer",
      },
    },
    lineTotalMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "lineTotalMinor must be an integer",
      },
    },
    image: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    guestId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
      index: true,
    },
    paypalOrderId: {
      type: String,
      sparse: true,
      index: true,
      trim: true,
    },
    paypalCaptureId: {
      type: String,
      sparse: true,
      index: true,
      trim: true,
    },
    orderStatus: {
      type: String,
      enum: ["PENDING_PAYMENT", "PAID", "PAYMENT_FAILED", "CANCELLED"],
      default: "PENDING_PAYMENT",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: [
        "CREATED",
        "APPROVED",
        "CAPTURE_PENDING",
        "CAPTURED",
        "FAILED",
        "CANCELLED",
        "REFUNDED",
      ],
      default: "CREATED",
      index: true,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: "USD",
      trim: true,
    },
    subtotalMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "subtotalMinor must be an integer",
      },
    },
    taxMinor: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "taxMinor must be an integer",
      },
    },
    shippingMinor: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "shippingMinor must be an integer",
      },
    },
    totalMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "totalMinor must be an integer",
      },
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => Array.isArray(v) && v.length > 0,
        message: "Order must have at least one item",
      },
    },
    paymentProvider: {
      type: String,
      enum: ["PAYPAL"],
      default: "PAYPAL",
    },
    capturedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
      trim: true,
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient order lookups
OrderSchema.index({ guestId: 1, createdAt: -1 });
OrderSchema.index({ guestId: 1, idempotencyKey: 1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
