import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  resolveGuestSession,
  attachGuestSessionCookie,
} from "@/lib/session/cart-session";
import {
  createCheckoutOrder,
  CheckoutError,
} from "@/features/checkout/services/checkout-service";
import { PayPalApiError } from "@/lib/paypal/client";

const createOrderBodySchema = z.object({
  idempotencyKey: z.string().trim().max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { guestId, isNew } = resolveGuestSession(request);

    let bodyJson: unknown = {};
    try {
      bodyJson = await request.json();
    } catch {
      bodyJson = {};
    }

    const validated = createOrderBodySchema.parse(bodyJson);

    const summary = await createCheckoutOrder(
      guestId,
      validated.idempotencyKey
    );

    const response = NextResponse.json(
      {
        success: true,
        data: summary,
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

    console.error("POST /api/checkout/create-order error:", error);

    const statusCode =
      error instanceof CheckoutError
        ? error.statusCode
        : error instanceof PayPalApiError
        ? error.statusCode
        : 500;

    const message =
      error instanceof Error ? error.message : "Failed to create checkout order";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: statusCode }
    );
  }
}
