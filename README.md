# AgentCart AI — Personal Shopping Assistant & PayPal Orders v2 Integration

AgentCart is an AI-powered personal shopping concierge built for the PayPal AI Hackathon using Next.js App Router, React 19, TypeScript, Tailwind CSS, MongoDB/Mongoose, OpenRouter LLM, and official PayPal REST Orders API v2.

---

## 1. System Architecture

```text
Browser
  ↓ (User Reviews Verified MongoDB Products)
Backend Checkout Preparation (POST /api/checkout/create-order)
  ↓ (Validates items, stock, prices, currency, minor-unit total)
PayPal REST API v2 Order Creation
  ↓ (Server returns PayPal Order ID to JS SDK)
PayPal JavaScript SDK (Customer approves popup in Sandbox)
  ↓ (SDK triggers onApprove callback with orderID)
Backend Capture & Verification (POST /api/checkout/capture-order)
  ↓ (Validates amount, currency, custom_id, captures payment)
MongoDB Order Persistence & Cart Clearing
  ↓ (Status transitions to PAID, guest cart cleared)
Receipt Display & Webhook Idempotency (POST /api/webhooks/paypal)
```

---

## 2. PayPal Sandbox Setup Guide

### A. Create a PayPal Developer Account & Application
1. Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).
2. Navigate to **Apps & Credentials** and ensure the **Sandbox** toggle is selected.
3. Click **Create App**:
   - **App Name:** `AgentCart AI Assistant`
   - **App Type:** `Merchant`
4. Copy the generated credentials:
   - **Client ID**
   - **Secret Key**

### B. Configure Environment Variables
Create or update `.env.local` with the copied values:

```bash
# PayPal REST API v2 Sandbox Configuration
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-client-secret
PAYPAL_WEBHOOK_ID=your-sandbox-webhook-id

# Public Client ID for PayPal JavaScript SDK
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-sandbox-client-id
```

### C. Testing with Sandbox Accounts
1. In the PayPal Developer Dashboard, navigate to **Sandbox** → **Accounts**.
2. Identify:
   - **Personal (Buyer) Account**: Used to simulate the customer approving payment in the popup.
   - **Business (Merchant) Account**: Receives captured funds.
3. In AgentCart, open the cart drawer, click **Proceed to Review**, and select **PayPal**.
4. Log in using your Sandbox Buyer email and password to complete the simulated checkout.

---

## 3. Webhook Configuration

1. In your PayPal App settings, click **Add Webhook**.
2. **Webhook URL:** `https://your-domain.com/api/webhooks/paypal` (for local development, use a tunnel like ngrok).
3. **Event Subscriptions:** Subscribe to the following core events:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`
4. Copy the generated **Webhook ID** and paste it into `PAYPAL_WEBHOOK_ID` in `.env.local`.

---

## 4. Switching to Production (Live Mode) Safely

To transition to production:
1. In the PayPal Developer Dashboard, switch to **Live** mode.
2. Create a Live App and obtain Live Client ID and Secret.
3. Set production environment variables:
   - `PAYPAL_ENVIRONMENT=live`
   - `PAYPAL_CLIENT_ID=<live_client_id>`
   - `PAYPAL_CLIENT_SECRET=<live_client_secret>`
   - `NEXT_PUBLIC_PAYPAL_CLIENT_ID=<live_client_id>`
   - `PAYPAL_WEBHOOK_ID=<live_webhook_id>`
4. Live API endpoints automatically resolve to `https://api-m.paypal.com`.

---

## 5. Development & Testing Commands

```bash
# Install dependencies
pnpm install

# Seed the product catalog
pnpm db:seed

# Run the local development server
pnpm dev

# Run automated tests (Unit & Integration tests)
pnpm test

# Run TypeScript type check
pnpm typecheck

# Run ESLint validation
pnpm lint

# Production Next.js Turbopack build
pnpm build
```
