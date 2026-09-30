# PrimeProfile: Razorpay setup

Cashfree collection routes and labels have been replaced with Razorpay Standard Checkout.
Keep existing Firebase configuration. This is a Node/Express full-stack project: static-only hosting or `vite preview` cannot run payment APIs.

## Google AI Studio

Import the updated source ZIP if your AI Studio import interface supports ZIPs. Otherwise replace these files from the ZIP in the existing project: server.ts, .env.example, src/lib/razorpayCheckout.ts, src/components/CheckoutView.tsx, src/components/PublicStoreView.tsx, src/components/PaymentPagesSection.tsx, src/components/PaymentsManager.tsx, src/components/AdminPanel.tsx, src/context/AuthContext.tsx, src/types/index.ts. Keep all files at the project root rather than inside an extra folder.

Add server-side secrets/environment variables (not frontend VITE_ variables):

```
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
PLATFORM_COMMISSION_PERCENT=8
```

Remove obsolete CASHFREE_* variables. Restart/redeploy after setting secrets.
For local use, copy .env.example to .env and run npm install, npm run dev.
Production: npm run build, then npm start. Use Node 22.12+.

## Dashboard and testing

1. Use Key ID and Key Secret from the SAME Razorpay Test account. Key ID prefix selects test/live automatically.
2. Enable automatic payment capture in Razorpay Dashboard. Authorized-only payments do not complete checkout.
3. Save and publish the actual product/payment page in Firestore. Payment pages must be approved. Local/demo-only items cannot collect payments. This implementation supports INR prices of at least ₹1.
4. Re-copy payment links: new links include `?creator=...` after the hash. Old links without a creator ID may require a newly copied link for signed-out buyers.
5. Pay using Razorpay's Test checkout. Check captured status and the gateway payment ID. Dismissed/failed/invalid-signature/uncaptured payments do not show success.
6. Configure an HTTPS webhook on the deployed backend:
   `https://YOUR_DOMAIN/api/payments/razorpay/webhook`
   Set the same RAZORPAY_WEBHOOK_SECRET and enable payment.captured and order.paid. Configure separately for each Razorpay mode.
7. Replace BOTH Test credentials with approved Live credentials only after testing.

Creator shares and commission are calculated by the server. Creator payouts still use the existing manual bank transfer/UTR workflow. Automatic Razorpay Route transfers are not integrated.

## Validation and existing production limitations

The backend route tests passed with mocked gateway/catalog responses: missing credentials, server catalog pricing, unpublished/unapproved items, gateway failure, invalid signature, mismatched order/amount, uncaptured payment, success, repeated verification, duplicate and tampered webhooks. TypeScript/TSX syntax was parsed across all source files. A full npm build/typecheck and a real Razorpay Test transaction could not be completed in the editing environment because dependency downloads were unavailable and account keys were not supplied. Run npm run lint and npm run build in AI Studio, then perform a test transaction.

Existing architecture still needs production hardening: server order/payout stores are in memory and are lost on restart or across multiple instances; order list/manual payout APIs lack server authentication; Firestore rules currently allow public order creation, so client-created records must not be treated as authoritative payout proof. The webhook updates the current server store, not durable Firestore orders. Before live collections/payouts, persist verified orders and payouts server-side and protect admin APIs and order writes. This gateway migration does not implement those separate architecture changes.

The separate locked-content unlock flow remains the existing local flow and is not connected to Razorpay. Do not use it as a paid access control until server-side authorization and protected delivery are implemented. Receipt emails are not sent by this app.

Official references:
https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
https://razorpay.com/docs/webhooks/validate-test/

Run the dependency-free mocked backend tests with Node 24:
`node tests/razorpay-payment.test.mjs`
