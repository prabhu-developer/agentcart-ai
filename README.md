# AgentCart

Minimalist AI personal shopping assistant powered by Next.js, MongoDB, OpenRouter, and PayPal Sandbox.

**Live Demo:** [https://agentcart-ai.netlify.app](https://agentcart-ai.netlify.app)

## Features

- **Natural-Language Shopping:** Describe a setup and budget to get curated product recommendations.
- **Real Catalog & Stock:** Powered by MongoDB with live pricing, specs, and inventory checks.
- **Side-by-Side Comparison:** Compare up to 4 products and track remaining budget in real time.
- **PayPal Sandbox Checkout:** Server-validated cart totals, PayPal Orders v2 creation/capture, and instant order confirmation.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend & DB:** Next.js Route Handlers, MongoDB, Mongoose, Zod
- **AI & Payments:** OpenRouter API, PayPal REST Orders v2 & `@paypal/react-paypal-js`

## Local Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment**
   Copy `.env.example` to `.env.local` and set your values:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   MONGODB_URI=your-mongodb-uri
   OPENROUTER_API_KEY=your-openrouter-api-key
   OPENROUTER_MODEL=openrouter/free
   PAYPAL_ENVIRONMENT=sandbox
   PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
   PAYPAL_CLIENT_ID=your-sandbox-client-id
   PAYPAL_CLIENT_SECRET=your-sandbox-client-secret
   PAYPAL_WEBHOOK_ID=your-sandbox-webhook-id
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-sandbox-client-id
   ```

3. **Seed products & start dev server**
   ```bash
   pnpm db:seed
   pnpm dev
   ```

## PayPal Sandbox Test Config

Use this test card and address with **Debit or Credit Card** checkout in PayPal Sandbox:

| Field | Value |
|---|---|
| **Type** | `MASTERCARD` |
| **Card Number** | `5385791723246805` |
| **Expiry** | `02/2031` |
| **CVC Code** | `Any 3 digits` |

**Test Address**
```text
John Doe
1234 Maple Street
Springfield, IL 62704
Phone: (217) 555-0198
```

## Scripts

```bash
pnpm dev        # Start development server
pnpm test       # Run unit & integration tests
pnpm typecheck  # TypeScript typecheck
pnpm lint       # ESLint check
pnpm build      # Production build
```

---

Developed by [prabhu.coder](https://prabhu-coder.netlify.app/) · MIT License
