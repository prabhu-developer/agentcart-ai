import { NextRequest, NextResponse } from "next/server";
import {
  resolveGuestSession,
  attachGuestSessionCookie,
} from "@/lib/session/cart-session";
import {
  validateCartForCheckout,
  CartError,
} from "@/features/cart/services/cart-service";

export async function POST(request: NextRequest) {
  try {
    const { guestId, isNew } = resolveGuestSession(request);
    const preparation = await validateCartForCheckout(guestId);

    const response = NextResponse.json(
      {
        success: preparation.isValid,
        data: preparation,
        error: preparation.isValid ? undefined : "Cart cannot be validated for checkout",
        issues: preparation.issues,
      },
      { status: preparation.isValid ? 200 : 422 }
    );

    if (isNew) {
      attachGuestSessionCookie(response, guestId);
    }

    return response;
  } catch (error: unknown) {
    console.error("POST /api/cart/validate error:", error);
    const status = error instanceof CartError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : "Failed to validate cart";
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
