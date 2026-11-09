import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const GUEST_CART_COOKIE_NAME = "agentcart_guest_session";
export const GUEST_CART_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Validates whether a guest identifier matches a secure UUID format.
 * Prevents directory traversal, SQL/NoSQL injection, or spoofing through arbitrary cookie strings.
 */
export function isValidGuestId(guestId: string): boolean {
  if (!guestId || typeof guestId !== "string") return false;
  // Standard UUID v4 regex
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(guestId);
}

/**
 * Extracts existing guest ID from the request cookie, or generates a new cryptographically secure UUID.
 */
export function resolveGuestSession(request: NextRequest): {
  guestId: string;
  isNew: boolean;
} {
  const existingCookie = request.cookies.get(GUEST_CART_COOKIE_NAME)?.value;

  if (existingCookie && isValidGuestId(existingCookie)) {
    return {
      guestId: existingCookie,
      isNew: false,
    };
  }

  return {
    guestId: crypto.randomUUID(),
    isNew: true,
  };
}

/**
 * Attaches or refreshes the HttpOnly guest session cookie on a NextResponse.
 */
export function attachGuestSessionCookie(response: NextResponse, guestId: string): void {
  response.cookies.set({
    name: GUEST_CART_COOKIE_NAME,
    value: guestId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_CART_MAX_AGE,
  });
}
