import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  resolveGuestSession,
  attachGuestSessionCookie,
} from "@/lib/session/cart-session";
import {
  addItemToCart,
  CartError,
} from "@/features/cart/services/cart-service";
import { addCartItemSchema } from "@/features/cart/validators/cart-schemas";

export async function POST(request: NextRequest) {
  try {
    const { guestId, isNew } = resolveGuestSession(request);
    const body = await request.json();
    const validated = addCartItemSchema.parse(body);

    const updatedCart = await addItemToCart(
      guestId,
      validated.productId,
      validated.quantity
    );

    const response = NextResponse.json(
      {
        success: true,
        data: updatedCart,
      },
      { status: 201 }
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

    console.error("POST /api/cart/items error:", error);
    const status = error instanceof CartError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : "Failed to add item to cart";
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
