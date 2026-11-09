import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  resolveGuestSession,
  attachGuestSessionCookie,
} from "@/lib/session/cart-session";
import {
  addBulkItemsToCart,
  CartError,
} from "@/features/cart/services/cart-service";
import { bulkAddCartItemsSchema } from "@/features/cart/validators/cart-schemas";

export async function POST(request: NextRequest) {
  try {
    const { guestId, isNew } = resolveGuestSession(request);
    const body = await request.json();
    const validated = bulkAddCartItemsSchema.parse(body);

    const updatedCart = await addBulkItemsToCart(guestId, validated.items);

    const response = NextResponse.json(
      {
        success: true,
        data: updatedCart,
      },
      { status: 200 }
    );

    if (isNew) {
      attachGuestSessionCookie(response, guestId);
    }

    return response;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request payload",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("POST /api/cart/items/bulk error:", error);
    const status = error instanceof CartError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : "Failed to add items to cart";
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
