import { NextRequest, NextResponse } from "next/server";
import {
  resolveGuestSession,
  attachGuestSessionCookie,
} from "@/lib/session/cart-session";
import {
  listGuestOrders,
  CheckoutError,
} from "@/features/checkout/services/checkout-service";

export async function GET(request: NextRequest) {
  try {
    const { guestId, isNew } = resolveGuestSession(request);
    const orders = await listGuestOrders(guestId);

    const response = NextResponse.json({
      success: true,
      data: orders,
    });

    if (isNew) {
      attachGuestSessionCookie(response, guestId);
    }

    return response;
  } catch (error: unknown) {
    const statusCode =
      error instanceof CheckoutError ? error.statusCode : 500;
    const message =
      error instanceof Error ? error.message : "Failed to list orders";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: statusCode }
    );
  }
}
