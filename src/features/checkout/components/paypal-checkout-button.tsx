"use client";

import React, { useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { toast } from "sonner";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { ConfirmedOrderDTO } from "../services/checkout-service";

interface PayPalCheckoutButtonProps {
  currency?: string;
  idempotencyKey?: string;
  onPaymentSuccess: (order: ConfirmedOrderDTO) => void;
  onPaymentError?: (error: string) => void;
}

interface PayPalButtonsInnerProps {
  disabled: boolean;
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onCancel: () => void;
  onError: (err: Record<string, unknown>) => void;
}

function PayPalButtonsSection({
  disabled,
  createOrder,
  onApprove,
  onCancel,
  onError,
}: PayPalButtonsInnerProps) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isRejected) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <div className="flex items-center gap-1.5 font-medium text-amber-800">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>Unable to load PayPal</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-amber-800/90">
          Please check your network, disable ad blockers, and allow cookies for{" "}
          <span className="font-medium">paypal.com</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[48px]">
      {isPending && (
        <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#eef1ef] bg-[#f8faf9] text-xs text-[#6b7470]">
          <Loader2 className="size-3.5 animate-spin text-[#0f766e]" />
          <span>Loading PayPal...</span>
        </div>
      )}

      <PayPalButtons
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
          height: 44,
        }}
        disabled={disabled}
        createOrder={createOrder}
        onApprove={onApprove}
        onCancel={onCancel}
        onError={onError}
      />
    </div>
  );
}

export function PayPalCheckoutButton({
  currency = "USD",
  idempotencyKey,
  onPaymentSuccess,
  onPaymentError,
}: PayPalCheckoutButtonProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fallbackKeyRef = React.useRef<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  if (!clientId || clientId.trim() === "") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-semibold text-amber-800">
          <AlertCircle className="size-4 shrink-0" />
          <span>PayPal Sandbox Credentials Required</span>
        </div>
        <p className="mt-1.5 leading-relaxed text-[#727b76]">
          Configure{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-[11px] text-amber-900">
            NEXT_PUBLIC_PAYPAL_CLIENT_ID
          </code>{" "}
          in <code className="font-mono text-[11px]">.env.local</code> to enable
          PayPal checkout.
        </p>
      </div>
    );
  }

  const handleCreateOrder = async (): Promise<string> => {
    setStatusMessage("Preparing PayPal order...");
    setErrorMessage(null);

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
        throw new Error(
          json.error || `Failed to create PayPal order (${response.status})`
        );
      }

      return json.data.paypalOrderId;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to initialize PayPal order";
      setErrorMessage(msg);
      toast.error("Checkout initialization failed", { description: msg });
      onPaymentError?.(msg);
      throw err;
    } finally {
      setStatusMessage(null);
    }
  };

  const handleApprove = async (data: { orderID: string }): Promise<void> => {
    setIsCapturing(true);
    setStatusMessage("Completing payment...");
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
        throw new Error(
          json.error || `Payment capture failed (${response.status})`
        );
      }

      toast.success("Payment confirmed", {
        description: `Order ${json.data.orderNumber}`,
      });

      onPaymentSuccess(json.data as ConfirmedOrderDTO);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Payment capture failed";
      setErrorMessage(msg);
      toast.error("Payment capture failed", { description: msg });
      onPaymentError?.(msg);
    } finally {
      setIsCapturing(false);
      setStatusMessage(null);
    }
  };

  const handleCancel = () => {
    setStatusMessage(null);
    toast.info("Checkout cancelled", {
      description: "Your cart items are saved.",
    });
  };

  const handleError = (err: Record<string, unknown>) => {
    console.error("PayPal JS SDK Error:", err);
    setStatusMessage(null);
    const msg =
      "PayPal could not open or complete checkout. Check popup blockers or Sandbox buyer credentials.";
    setErrorMessage(msg);
    toast.error("PayPal error", { description: msg });
  };

  return (
    <div className="w-full space-y-3">
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900">
          <div className="flex items-center gap-1.5 font-medium text-red-800">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>Payment error</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-red-700">
            {errorMessage}
          </p>
        </div>
      )}

      {statusMessage && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-[#0f766e]/20 bg-[#eaf5f2] py-2 text-xs font-medium text-[#0f766e]">
          <Loader2 className="size-3.5 animate-spin" />
          <span>{statusMessage}</span>
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
        <PayPalButtonsSection
          disabled={isCapturing}
          createOrder={handleCreateOrder}
          onApprove={handleApprove}
          onCancel={handleCancel}
          onError={handleError}
        />
      </PayPalScriptProvider>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#727b76]">
        <ShieldCheck className="size-3.5 text-[#0f766e]" />
        <span>Secured by PayPal Sandbox · Use a Sandbox Personal account</span>
      </div>
    </div>
  );
}
