import { NextRequest, NextResponse } from "next/server";
import { getProductByIdOrSlug } from "@/features/products/services/product-service";

interface RouteContext {
  params: Promise<{
    productId: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { productId } = await context.params;

    if (!productId || typeof productId !== "string" || productId.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid product ID or slug is required",
        },
        { status: 400 }
      );
    }

    const product = await getProductByIdOrSlug(productId.trim());

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("GET /api/products/[productId] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve product details",
      },
      { status: 500 }
    );
  }
}
