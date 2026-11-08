import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        description: {
            type: String,
            required: true,
        },

        brand: {
            type: String,
            default: "",
        },

        category: {
            type: String,
            required: true,
            index: true,
        },

        priceMinor: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            required: true,
            default: "USD",
        },

        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        specifications: {
            type: Map,
            of: String,
            default: {},
        },

        tags: {
            type: [String],
            default: [],
        },

        images: {
            type: [String],
            default: [],
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

ProductSchema.index({
    name: "text",
    description: "text",
    brand: "text",
    category: "text",
    tags: "text",
});

export const Product =
    mongoose.models.Product ||
    mongoose.model("Product", ProductSchema);