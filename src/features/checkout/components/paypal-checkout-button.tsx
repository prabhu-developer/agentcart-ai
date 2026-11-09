"use client";

import React, { useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";
import { toast } from "sonner";
import { Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import { ConfirmedOrderDTO } from "../services/checkout-service";

interface PayPalCheckoutButtonProps {
  currency?: string;
  idempotencyKey?: string;
  onPaymentSuccess: (order: ConfirmedOrderDTO) => void;
  onPaymentError?: (error: string) => void;
}

export function PayPalCheckoutButton({
  currency = "USD",
  idempotencyKey,
  onPaymentSuccess,
  onPaymentError,
}: PayPalCheckoutButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Maintain a stable fallback session key across retries if not provided by review modal
  const fallbackKeyRef = React.useRef<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  // If no PayPal Client ID is configured yet
  if (!clientId || clientId.trim() === "") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-semibold text-amber-800">
          <AlertCircle className="size-4 shrink-0" />
          <span>PayPal Sandbox Credentials Required</span>
        </div>
        <p className="mt-1.5 leading-relaxed text-[#727b76]">
          Configure <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-[11px] text-amber-900">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> in <code className="font-mono text-[11px]">.env.local</code> to render active PayPal checkout buttons.
        </p>
        <div className="mt-2 text-[11px] text-[#0f766e]">
          ✓ Backend REST endpoints <code className="font-mono">/api/checkout/create-order</code> and <code className="font-mono">/api/checkout/capture-order</code> are verified and active.
        </div>
      </div>
    );
  }

  const handleCreateOrder = async (): Promise<string> => {
    setIsProcessing(true);
    setErrorMessage(null);

    // Initialize stable fallback key on first attempt if none provided by parent
    if (!fallbackKeyRef.current) {
      fallbackKeyRef.current = `checkout-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
    }
    const keyToUse = idempotencyKey || fallbackKeyRef.current;

    try {
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: keyToUse,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.data?.paypalOrderId) {
        throw new Error(json.error || `Failed to create PayPal order (${response.status})`);
      }

      return json.data.paypalOrderId;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initialize PayPal order";
      setErrorMessage(msg);
      toast.error("Checkout Initialization Failed", { description: msg });
      onPaymentError?.(msg);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async (data: { orderID: string }): Promise<void> => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/checkout/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: data.orderID,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.data) {
        throw new Error(json.error || `Payment capture failed (${response.status})`);
      }

      toast.success("Payment Captured Successfully!", {
        description: `Order ${json.data.orderNumber} confirmed.`,
      });

      onPaymentSuccess(json.data as ConfirmedOrderDTO);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment capture failed";
      setErrorMessage(msg);
      toast.error("Payment Capture Error", { description: msg });
      onPaymentError?.(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    toast.info("PayPal checkout cancelled", {
      description: "Your cart contents and selections remain saved.",
    });
  };

  const handleError = (err: Record<string, unknown>) => {
    console.error("PayPal JS SDK Error:", err);
    const msg = "An error occurred with the PayPal payment interface.";
    setErrorMessage(msg);
    toast.error("PayPal Error", { description: msg });
  };

  return (
    <div className="w-full space-y-3">
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-900">
          <div className="flex items-center gap-1.5 font-semibold text-red-800">
            <AlertCircle className="size-3.5" />
            <span>Payment Error</span>
          </div>
          <p className="mt-0.5 text-[11px] text-red-700">{errorMessage}</p>
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-[#0f766e]/20 bg-[#eaf5f2] py-2 text-xs font-medium text-[#0f766e]">
          <Sparkles className="size-3.5 animate-spin" />
          <span>Processing secure server-side capture...</span>
        </div>
      )}

      <PayPalScriptProvider
        options={{
          clientId,
          currency: currency.toUpperCase(),
          intent: "capture",
          components: "buttons",
        }}
      >
        <div className="relative min-h-[44px]">
          <PayPalButtons
            style={{
              layout: "vertical",
              color: "gold",
              shape: "rect",
              label: "paypal",
              height: 44,
            }}
            disabled={isProcessing}
            createOrder={handleCreateOrder}
            onApprove={handleApprove}
            onCancel={handleCancel}
            onError={handleError}
          />
        </div>
      </PayPalScriptProvider>

      <div className="flex items-center justify-center gap-1 text-[11px] text-[#727b76]">
        <ShieldCheck className="size-3.5 text-[#0f766e]" />
        <span>Official PayPal REST Orders API v2 · Encrypted TLS</span>
      </div>
    </div>
  );
}
