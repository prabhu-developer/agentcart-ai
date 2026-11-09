import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  resolveGuestSession,
  attachGuestSessionCookie,
} from "@/lib/session/cart-session";
import {
  captureCheckoutOrder,
  CheckoutError,
} from "@/features/checkout/services/checkout-service";
import { PayPalApiError } from "@/lib/paypal/client";

const captureOrderBodySchema = z.object({
  orderId: z
    .string()
    .trim()
    .min(1, "PayPal orderId is required"),
});

export async function POST(request: NextRequest) {
  try {
    const { guestId, isNew } = resolveGuestSession(request);

    const bodyJson = await request.json();
    const validated = captureOrderBodySchema.parse(bodyJson);

    const confirmedOrder = await captureCheckoutOrder(
      guestId,
      validated.orderId
    );

    const response = NextResponse.json(
      {
        success: true,
        data: confirmedOrder,
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

    console.error("POST /api/checkout/capture-order error:", error);

    const statusCode =
      error instanceof CheckoutError
        ? error.statusCode
        : error instanceof PayPalApiError
        ? error.statusCode
        : 500;

    const message =
      error instanceof Error ? error.message : "Failed to capture payment";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: statusCode }
    );
  }
}
