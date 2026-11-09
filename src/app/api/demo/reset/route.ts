import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/models/product";
import { clearCart } from "@/features/cart/services/cart-service";
import { resolveGuestSession, attachGuestSessionCookie } from "@/lib/session/cart-session";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { guestId, isNew } = resolveGuestSession(request);

    // Clear guest cart
    await clearCart(guestId).catch(() => {});

    // Ensure catalog is populated
    const productCount = await Product.countDocuments({ isActive: true });

    const response = NextResponse.json(
      {
        success: true,
        message: "Demo session reset successfully",
        data: {
          guestId,
          activeCatalogProducts: productCount,
          cartCleared: true,
        },
      },
      { status: 200 }
    );

    if (isNew) {
      attachGuestSessionCookie(response, guestId);
    }

    return response;
  } catch (error: unknown) {
    console.error("Demo reset error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to reset demo",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
