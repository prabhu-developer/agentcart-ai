import { NextRequest, NextResponse } from "next/server";
import {
  resolveGuestSession,
  attachGuestSessionCookie,
} from "@/lib/session/cart-session";
import {
  getAuthoritativeCart,
  clearCart,
  CartError,
} from "@/features/cart/services/cart-service";

export async function GET(request: NextRequest) {
  try {
    const { guestId, isNew } = resolveGuestSession(request);
    const cart = await getAuthoritativeCart(guestId);

    const response = NextResponse.json({
      success: true,
      data: cart,
    });

    if (isNew) {
      attachGuestSessionCookie(response, guestId);
    }

    return response;
  } catch (error: unknown) {
    console.error("GET /api/cart error:", error);
    const status = error instanceof CartError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : "Failed to load cart";
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { guestId, isNew } = resolveGuestSession(request);
    const cart = await clearCart(guestId);

    const response = NextResponse.json({
      success: true,
      data: cart,
    });

    if (isNew) {
      attachGuestSessionCookie(response, guestId);
    }

    return response;
  } catch (error: unknown) {
    console.error("DELETE /api/cart error:", error);
    const status = error instanceof CartError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : "Failed to clear cart";
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
