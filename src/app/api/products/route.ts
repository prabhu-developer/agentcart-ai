import { connection, NextRequest, NextResponse } from "next/server";
import { productQuerySchema } from "@/features/products/validators/product-query";
import { listProducts } from "@/features/products/services/product-service";

export async function GET(request: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    const parsed = productQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const result = await listProducts(parsed.data);

    return NextResponse.json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
