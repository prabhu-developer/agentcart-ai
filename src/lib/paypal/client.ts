import { env } from "@/lib/env";

export class PayPalApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = "PayPalApiError";
  }
}

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface PayPalCreateOrderParams {
  orderNumber: string;
  internalOrderId: string;
  currency: string;
  totalMinor: number;
  items: Array<{
    name: string;
    sku: string;
    unitPriceMinor: number;
    quantity: number;
  }>;
  idempotencyKey?: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links?: Array<{ href: string; rel: string; method: string }>;
  purchase_units?: Array<{
    reference_id?: string;
    custom_id?: string;
    amount?: {
      currency_code: string;
      value: string;
    };
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        status_details?: {
          reason?: string;
        };
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
}

export interface PayPalWebhookVerificationParams {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
  webhookId: string;
  webhookEvent: Record<string, unknown>;
}

// In-memory token cache
let cachedToken: string | null = null;
let tokenExpiresAt = 0;
let tokenRefreshPromise: Promise<string> | null = null;

/**
 * Retrieves an active OAuth 2.0 access token from PayPal using client credentials.
 * Reuses valid cached tokens to avoid redundant token requests.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = env.PAYPAL_CLIENT_ID;
  const clientSecret = env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new PayPalApiError(
      "PayPal API credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) are not configured",
      500
    );
  }

  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  // Prevent multiple concurrent token fetches
  if (tokenRefreshPromise) {
    return tokenRefreshPromise;
  }

  tokenRefreshPromise = (async () => {
    try {
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
        "base64"
      );
      const url = `${env.PAYPAL_BASE_URL}/v1/oauth2/token`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });

      const data = (await response.json()) as OAuthTokenResponse & {
        error?: string;
        error_description?: string;
      };

      if (!response.ok || !data.access_token) {
        throw new PayPalApiError(
          data.error_description || "Failed to obtain PayPal access token",
          response.status,
          data
        );
      }

      cachedToken = data.access_token;
      // Subtract 60 seconds buffer before expiration
      tokenExpiresAt = Date.now() + Math.max(0, (data.expires_in - 60) * 1000);
      return cachedToken;
    } finally {
      tokenRefreshPromise = null;
    }
  })();

  return tokenRefreshPromise;
}

/**
 * Creates an order in PayPal with intent=CAPTURE using server-calculated minor units.
 */
export async function createPayPalOrder(
  params: PayPalCreateOrderParams
): Promise<PayPalOrderResponse> {
  const token = await getPayPalAccessToken();
  const url = `${env.PAYPAL_BASE_URL}/v2/checkout/orders`;

  const totalValue = (params.totalMinor / 100).toFixed(2);
  const itemsTotalValue = (params.totalMinor / 100).toFixed(2);

  const purchaseUnitItems = params.items.map((item) => ({
    name: item.name.slice(0, 127),
    sku: item.sku ? item.sku.slice(0, 127) : undefined,
    unit_amount: {
      currency_code: params.currency.toUpperCase(),
      value: (item.unitPriceMinor / 100).toFixed(2),
    },
    quantity: item.quantity.toString(),
    category: "PHYSICAL_GOODS",
  }));

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: "default",
        custom_id: params.internalOrderId,
        description: `AgentCart Order ${params.orderNumber}`,
        amount: {
          currency_code: params.currency.toUpperCase(),
          value: totalValue,
          breakdown: {
            item_total: {
              currency_code: params.currency.toUpperCase(),
              value: itemsTotalValue,
            },
            tax_total: {
              currency_code: params.currency.toUpperCase(),
              value: "0.00",
            },
            shipping: {
              currency_code: params.currency.toUpperCase(),
              value: "0.00",
            },
          },
        },
        items: purchaseUnitItems,
      },
    ],
    application_context: {
      brand_name: "AgentCart AI",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
    },
  };

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  if (params.idempotencyKey) {
    headers["PayPal-Request-Id"] = params.idempotencyKey;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  const data = (await response.json()) as PayPalOrderResponse & {
    name?: string;
    message?: string;
    details?: unknown;
  };

  if (!response.ok || !data.id) {
    throw new PayPalApiError(
      data.message || `PayPal order creation failed with status ${response.status}`,
      response.status,
      data
    );
  }

  return data;
}

/**
 * Retrieves details for a specific PayPal order by ID.
 */
export async function getPayPalOrder(
  paypalOrderId: string
): Promise<PayPalOrderResponse> {
  const token = await getPayPalAccessToken();
  const url = `${env.PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(
    paypalOrderId
  )}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  const data = (await response.json()) as PayPalOrderResponse & {
    message?: string;
  };

  if (!response.ok || !data.id) {
    throw new PayPalApiError(
      data.message || `Failed to retrieve PayPal order ${paypalOrderId}`,
      response.status,
      data
    );
  }

  return data;
}

/**
 * Captures payment for an approved PayPal order.
 */
export async function capturePayPalOrder(
  paypalOrderId: string,
  idempotencyKey?: string
): Promise<PayPalOrderResponse> {
  const token = await getPayPalAccessToken();
  const url = `${env.PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(
    paypalOrderId
  )}/capture`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  if (idempotencyKey) {
    headers["PayPal-Request-Id"] = idempotencyKey;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  const data = (await response.json()) as PayPalOrderResponse & {
    name?: string;
    message?: string;
    details?: unknown;
  };

  if (!response.ok || !data.id) {
    throw new PayPalApiError(
      data.message || `PayPal capture failed with status ${response.status}`,
      response.status,
      data
    );
  }

  return data;
}

/**
 * Cryptographically verifies a PayPal webhook event signature using PayPal's verification API.
 */
export async function verifyPayPalWebhookSignature(
  params: PayPalWebhookVerificationParams
): Promise<boolean> {
  const token = await getPayPalAccessToken();
  const url = `${env.PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`;

  const payload = {
    auth_algo: params.authAlgo,
    cert_url: params.certUrl,
    transmission_id: params.transmissionId,
    transmission_sig: params.transmissionSig,
    transmission_time: params.transmissionTime,
    webhook_id: params.webhookId,
    webhook_event: params.webhookEvent,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  const data = (await response.json()) as { verification_status?: string };

  return response.ok && data.verification_status === "SUCCESS";
}
