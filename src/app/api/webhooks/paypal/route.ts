import { NextRequest, NextResponse } from "next/server";
import {
  processPayPalWebhookEvent,
  CheckoutError,
} from "@/features/checkout/services/checkout-service";
import { PayPalApiError } from "@/lib/paypal/client";

export async function POST(request: NextRequest) {
  try {
    const authAlgo = request.headers.get("paypal-auth-algo") || "";
    const certUrl = request.headers.get("paypal-cert-url") || "";
    const transmissionId = request.headers.get("paypal-transmission-id") || "";
    const transmissionSig =
      request.headers.get("paypal-transmission-sig") || "";
    const transmissionTime =
      request.headers.get("paypal-transmission-time") || "";

    if (
      !authAlgo ||
      !certUrl ||
      !transmissionId ||
      !transmissionSig ||
      !transmissionTime
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required PayPal webhook verification headers",
        },
        { status: 400 }
      );
    }

    const webhookEvent = (await request.json()) as Record<string, unknown>;

    const result = await processPayPalWebhookEvent(
      {
        authAlgo,
        certUrl,
        transmissionId,
        transmissionSig,
        transmissionTime,
      },
      webhookEvent
    );

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("PayPal Webhook processing error:", error);

    const statusCode =
      error instanceof CheckoutError
        ? error.statusCode
        : error instanceof PayPalApiError
        ? error.statusCode
        : 500;

    const message =
      error instanceof Error ? error.message : "Webhook processing failed";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: statusCode }
    );
  }
}
