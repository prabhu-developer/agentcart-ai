import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  resolveGuestSession,
  attachGuestSessionCookie,
} from "@/lib/session/cart-session";
import {
  updateItemQuantity,
  removeItemFromCart,
  CartError,
} from "@/features/cart/services/cart-service";
import { updateCartItemSchema } from "@/features/cart/validators/cart-schemas";

interface RouteParams {
  params: Promise<{
    productId: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { guestId, isNew } = resolveGuestSession(request);
    const { productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product identifier is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = updateCartItemSchema.parse(body);

    const updatedCart = await updateItemQuantity(
      guestId,
      productId,
      validated.quantity
    );

    const response = NextResponse.json({
      success: true,
      data: updatedCart,
    });

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

    console.error("PATCH /api/cart/items/[productId] error:", error);
    const status = error instanceof CartError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : "Failed to update item quantity";
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { guestId, isNew } = resolveGuestSession(request);
    const { productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product identifier is required" },
        { status: 400 }
      );
    }

    const updatedCart = await removeItemFromCart(guestId, productId);

    const response = NextResponse.json({
      success: true,
      data: updatedCart,
    });

    if (isNew) {
      attachGuestSessionCookie(response, guestId);
    }

    return response;
  } catch (error: unknown) {
    console.error("DELETE /api/cart/items/[productId] error:", error);
    const status = error instanceof CartError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : "Failed to remove item from cart";
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
