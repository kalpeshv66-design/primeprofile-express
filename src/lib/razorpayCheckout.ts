export interface RazorpayResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface CheckoutOptions {
  key: string; order_id: string; amount: number; currency: string;
  name: string; description: string; image?: string;
  prefill: { name: string; email: string; contact?: string };
  theme?: { color: string };
  handler: (result: RazorpayResult) => void;
  modal: { ondismiss: () => void };
}
interface CheckoutInstance {
  open: () => void;
  close: () => void;
  on: (event: string, handler: (event: { error?: { description?: string } }) => void) => void;
}
declare global {
  interface Window { Razorpay?: new (options: CheckoutOptions) => CheckoutInstance }
}
let loading: Promise<void> | null = null;
export function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => fail(), 20000);
    function fail() {
      window.clearTimeout(timeout);
      script.remove();
      reject(new Error('Razorpay checkout could not load. Check your connection and retry.'));
    }
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => { window.clearTimeout(timeout); window.Razorpay ? resolve() : fail(); };
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch(error => { loading = null; throw error; });
  return loading;
}
export async function openRazorpay(options: Omit<CheckoutOptions, 'handler' | 'modal'>): Promise<RazorpayResult> {
  await loadRazorpay();
  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay!({
      ...options,
      handler: resolve,
      modal: { ondismiss: () => reject(new Error('Checkout closed. Payment has not been confirmed.')) }
    });
    checkout.on('payment.failed', event => {
      checkout.close();
      reject(new Error(event.error?.description || 'Payment failed. Please retry.'));
    });
    checkout.open();
  });
}
