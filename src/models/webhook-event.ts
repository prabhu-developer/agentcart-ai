import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWebhookEvent extends Document {
  eventId: string;
  eventType: string;
  orderId?: mongoose.Types.ObjectId;
  paypalOrderId?: string;
  status: "PROCESSING" | "PROCESSED" | "FAILED" | "IGNORED";
  processedAt: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookEventSchema = new Schema<IWebhookEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      sparse: true,
      index: true,
    },
    paypalOrderId: {
      type: String,
      sparse: true,
      index: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PROCESSING", "PROCESSED", "FAILED", "IGNORED"],
      required: true,
      index: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
    error: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const WebhookEvent: Model<IWebhookEvent> =
  mongoose.models.WebhookEvent ||
  mongoose.model<IWebhookEvent>("WebhookEvent", WebhookEventSchema);
