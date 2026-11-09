import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  addedAt: Date;
  updatedAt: Date;
}

export interface ICart extends Document {
  guestId: string;
  userId?: mongoose.Types.ObjectId;
  currency: string;
  items: ICartItem[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      max: [99, "Quantity cannot exceed 99 units"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be an integer",
      },
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    guestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
      index: true,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: "USD",
      trim: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index deletes expired carts automatically
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate product entries in the same cart
CartSchema.pre("save", function () {
  const seen = new Set<string>();
  for (const item of this.items) {
    const idStr = item.product.toString();
    if (seen.has(idStr)) {
      throw new Error(`Duplicate product found in cart: ${idStr}`);
    }
    seen.add(idStr);
  }
  // Refresh expiresAt whenever cart is modified
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
});

export const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);
