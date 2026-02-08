# Stripe setup for ExpertResume US

This app is configured to use **Stripe** instead of Razorpay. Do the following to go live.

## 1. Stripe account and keys

- Create or use a Stripe account at https://dashboard.stripe.com (US).
- In **Developers → API keys**, copy:
  - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - **Secret key** → `STRIPE_SECRET_KEY`
- Add them to `.env.local` (see `.env.example`).

## 2. Products and prices (USD)

In **Stripe Dashboard → Products** create products and prices for:

- **Free** – no price (or $0).
- **Pro / Career Booster** – e.g. $29/month (recurring) and optionally $49 one-time.
- **One-time pack** – e.g. $49 one-time.

Note the **Price IDs** (e.g. `price_xxx`) for use in checkout.

## 3. Checkout flow

- **Existing Razorpay usage**: Checkout and payment verification currently live in:
  - `app/checkout/ClientCheckout.js`, `app/checkout/HighConversionCheckout.js`
  - `app/api/create-order/route.js`
  - `app/components/PaymentForm.js`, `app/components/PremiumPdfPreview.js`, `app/components/ResumeSlideshowModal.js`
- **Stripe integration**:
  - Use **Stripe Checkout** (hosted page) or **Stripe Elements** (embedded).
  - Add or reuse: `app/api/create-stripe-checkout/route.js` to create a Checkout Session and redirect to Stripe.
  - Add: `app/api/stripe-webhook/route.js` to handle `checkout.session.completed` and grant access (e.g. update Firebase plan, quotas).
  - In the client, replace Razorpay calls with: create Checkout Session via your API → redirect to `session.url` (or embed Elements and confirm PaymentIntent).

## 4. Webhook

- In **Developers → Webhooks** add endpoint: `https://your-domain.com/api/stripe-webhook`.
- Events: `checkout.session.completed`, and optionally `invoice.paid`, `customer.subscription.updated`.
- Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET` in `.env.local`.
- Verify signature in the webhook handler with `stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET)`.

## 5. Post-payment logic

- In the webhook (or in your create-checkout API after redirect), map Stripe `client_reference_id` or metadata to your user/order.
- Update user plan in Firebase (or your DB) and any quota/entitlement logic that today runs after Razorpay verification.

## 6. Feature flag

- `app/lib/appConfig.js` has `USE_STRIPE = true`. Payment components should branch on this (or on `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) to call Stripe instead of Razorpay.
