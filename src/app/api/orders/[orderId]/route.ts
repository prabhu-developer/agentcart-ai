import { NextRequest, NextResponse } from "next/server";
import {
  resolveGuestSession,
  attachGuestSessionCookie,
} from "@/lib/session/cart-session";
import {
  getGuestOrder,
  CheckoutError,
} from "@/features/checkout/services/checkout-service";

interface RouteParams {
  params: Promise<{
    orderId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { guestId, isNew } = resolveGuestSession(request);
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order identifier is required" },
        { status: 400 }
      );
    }

    const orderDTO = await getGuestOrder(guestId, orderId);

    const response = NextResponse.json({
      success: true,
      data: orderDTO,
    });

    if (isNew) {
      attachGuestSessionCookie(response, guestId);
    }

    return response;
  } catch (error: unknown) {
    const statusCode =
      error instanceof CheckoutError ? error.statusCode : 500;
    const message =
      error instanceof Error ? error.message : "Failed to retrieve order";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: statusCode }
    );
  }
}
