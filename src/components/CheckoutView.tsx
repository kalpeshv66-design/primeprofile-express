import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  QrCode,
  CreditCard,
  Building,
  Smartphone,
  Calendar,
  Clock,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { openRazorpay, loadRazorpay } from '../lib/razorpayCheckout';
import { PrimeProfileLogo } from './PrimeProfileLogo';

interface CheckoutViewProps {
  type: 'product' | 'payment_page' | 'course' | 'booking';
  itemId: string;
  onNavigate: (route: string) => void;
}

async function readApiJson(response: Response) {
  const raw = await response.text();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(response.status === 404
      ? 'PrimeProfile payment API is not running on this deployment.'
      : 'Payment server returned an invalid response.');
  }
  try { return raw ? JSON.parse(raw) : {}; }
  catch { throw new Error('Payment server returned invalid JSON.'); }
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ type, itemId, onNavigate }) => {
  const {
    products,
    paymentPages,
    courses,
    bookings,
    profile,
    recordPublicOrder,
  } = useAuth();

  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);
  const rawItemId = itemId;
  const query = new URLSearchParams(rawItemId.split('?')[1] || '');
  const creatorId = query.get('creator') || profile?.uid || '';
  itemId = rawItemId.split('?')[0];
  const [publicItem, setPublicItem] = useState<any>(null);
  const [catalogReady, setCatalogReady] = useState(false);
  useEffect(() => {
    let active = true;
    setCatalogReady(false);
    setCheckoutNotice(null);
    setPublicItem(null);
    if (!creatorId) {
      setCheckoutNotice('This payment link needs a creator ID. Ask the creator to copy a new payment link.');
      return;
    }
    fetch(`/api/payments/razorpay/catalog/${encodeURIComponent(creatorId)}/${type}/${encodeURIComponent(itemId)}`)
      .then(async response => {
        const data = await readApiJson(response);
        if (!response.ok) throw new Error(data.error || 'Unable to load checkout item.');
        if (active) { setPublicItem(data.item); setCatalogReady(true); }
      }).catch(error => { if (active) setCheckoutNotice(error.message); });
    return () => { active = false; };
  }, [creatorId, type, itemId]);


  // Find target item with robust identifier matching
  let itemTitle = 'Product Checkout';
  let itemPrice = 190;
  let itemCurrency = profile?.currency || '₹';
  let itemImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80';
  let itemDesc = 'Instant digital access upon payment confirmation.';
  let itemCollectAddress = false;
  let itemCollectPhone = true;
  let itemModerationStatus: 'approved' | 'rejected' | 'pending' = 'approved';
  let itemRejectionReason = '';
  let resolvedPageId = itemId;

  if (type === 'product') {
    const p = products.find(prod => prod.id === itemId);
    if (p) {
      itemTitle = p.title;
      itemPrice = p.price;
      itemCurrency = p.currency;
      itemImage = p.coverImage;
      itemDesc = p.description;
    }
  } else if (type === 'payment_page') {
    const cleanId = itemId.replace(/^pay-/, '');
    let pp = paymentPages.find(page => 
      page.id === itemId || 
      page.id === `pay-${itemId}` || 
      `pay-${page.id}` === itemId ||
      page.id === cleanId ||
      page.id === `pay-${cleanId}` ||
      page.id.replace(/^pay-/, '') === cleanId ||
      page.id.toLowerCase() === itemId.toLowerCase()
    );

    // Fallback search in localStorage if not yet synced in state
    if (!pp) {
      try {
        const saved = localStorage.getItem('primeprofile_payment_pages');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            pp = parsed.find((page: any) => 
              page.id === itemId || 
              page.id === `pay-${itemId}` || 
              `pay-${page.id}` === itemId ||
              page.id === cleanId ||
              page.id === `pay-${cleanId}` ||
              page.id.replace(/^pay-/, '') === cleanId
            );
          }
        }
      } catch (e) {}
    }

    if (pp) {
      resolvedPageId = pp.id;
      itemTitle = pp.title;
      itemPrice = pp.price;
      itemCurrency = pp.currency;
      itemImage = pp.coverImage;
      itemDesc = pp.description;
      itemCollectAddress = pp.collectAddress;
      itemCollectPhone = pp.collectPhone;
      itemModerationStatus = pp.moderationStatus || (pp.published ? 'approved' : 'pending');
      itemRejectionReason = pp.rejectionReason || '';
    }
  } else if (type === 'course') {
    const c = courses.find(course => course.id === itemId);
    if (c) {
      itemTitle = c.title;
      itemPrice = c.price;
      itemCurrency = c.currency;
      itemImage = c.coverImage;
      itemDesc = c.subtitle || c.description;
    }
  } else if (type === 'booking') {
    const b = bookings.find(book => book.id === itemId);
    if (b) {
      itemTitle = b.title;
      itemPrice = b.price;
      itemCurrency = b.currency;
      itemDesc = `${b.durationMinutes} Minutes • ${b.locationType} session`;
    }
  }

  if (publicItem) {
    itemTitle = publicItem.title;
    itemPrice = publicItem.price;
    itemCurrency = publicItem.currency;
    itemImage = publicItem.coverImage || itemImage;
    itemDesc = publicItem.description || publicItem.subtitle || itemDesc;
    itemCollectPhone = publicItem.collectPhone ?? true;
    itemCollectAddress = publicItem.collectAddress ?? false;
    itemModerationStatus = publicItem.moderationStatus || 'pending';
    itemRejectionReason = publicItem.rejectionReason || '';
    resolvedPageId = itemId;
  }

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any | null>(null);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catalogReady) { setCheckoutNotice('Wait for the published checkout item to load.'); return; }
    if (type === 'payment_page' && itemModerationStatus === 'pending') {
      setCheckoutNotice('This payment link is awaiting approval and cannot accept payments yet.');
      return;
    }
    if (type === 'payment_page' && itemModerationStatus === 'rejected') {
      setCheckoutNotice('✕ This payment link has been disabled by Admin and cannot accept payments.');
      return;
    }
    setLoading(true);
    setCheckoutNotice(null);

    try {
      // No simulated success: only a captured payment verified by the backend completes checkout.
      await loadRazorpay();
      const createRes = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName, customerEmail, customerPhone,
          itemId: resolvedPageId || itemId, itemType: type,
          creatorId,
        })
      });
      const createData = await readApiJson(createRes);
      if (!createRes.ok || !createData.success) throw new Error(createData.error || 'Could not create payment order.');
      const paymentResult = await openRazorpay({
        key: createData.keyId, order_id: createData.orderId,
        amount: createData.amountPaise, currency: createData.currency,
        name: 'PrimeProfile', description: createData.itemTitle,
        image: '/favicon.svg',
        prefill: { name: customerName, email: customerEmail, ...(customerPhone ? { contact: customerPhone } : {}) },
        theme: { color: '#2563eb' }
      });
      const verifyRes = await fetch('/api/payments/razorpay/verify-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalOrderId: createData.internalOrderId, ...paymentResult })
      });
      const verified = await readApiJson(verifyRes);
      if (!verifyRes.ok || !verified.verified || verified.order?.status !== 'Successful') {
        throw new Error(verified.error || 'Payment could not be verified. Contact support if money was deducted.');
      }
      const confirmed = verified.order;
      // The backend has confirmed capture. Optional browser-side updates must not
      // turn a successful charge into a failure or offer another payment attempt.
      setOrderComplete(confirmed);
      void recordPublicOrder({
        ...confirmed,
        itemType: type,
      }, { name: customerName, email: customerEmail, phone: customerPhone })
        .catch(() => console.warn('Payment confirmed; dashboard synchronization failed.'));
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch {
        // Animation is optional and has no bearing on payment status.
      }

    } catch (err) {
      setCheckoutNotice(err instanceof Error ? err.message : 'Payment failed. Please retry.');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-6">
          <div
            onClick={() => onNavigate(`public-${profile?.username || 'rohanstyle'}`)}
          >
            <PrimeProfileLogo variant="light" size="sm" badge="Checkout" />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit SSL Secure Checkout</span>
          </div>
        </div>

        {orderComplete ? (
          /* Payment Success Confirmation View */
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Payment Successful</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Thank you for your order!</h2>
              <p className="text-xs text-slate-500 mt-1">Order receipt #{orderComplete.orderNumber} • {orderComplete.customerEmail}</p>
            </div>

            {/* Receipt Summary Box */}
            <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Item Purchased</span>
                <span className="font-bold text-slate-900 text-right">{orderComplete.itemTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-bold text-emerald-600">{orderComplete.currency}{orderComplete.amount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-mono text-slate-700">{orderComplete.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Payment Gateway</span>
                <span className="font-semibold text-indigo-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Razorpay PG (Verified)</span>
                </span>
              </div>
              {orderComplete.gatewayOrderId && (
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Razorpay Order ID</span>
                  <span className="font-mono text-[10px] text-slate-700">{orderComplete.gatewayOrderId}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Customer</span>
                <span className="font-medium text-slate-800">{orderComplete.customerName}</span>
              </div>
            </div>

            {/* Actions for customer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {type === 'product' && (
                <a
                  href="https://drive.google.com/sample-download.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Digital Asset</span>
                </a>
              )}

              {type === 'course' && (
                <button
                  onClick={() => onNavigate(`course-${itemId}`)}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Learning Now</span>
                </button>
              )}

              <button
                onClick={() => onNavigate(`public-${profile?.username || 'rohanstyle'}`)}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Return to Store
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <div className="space-y-6">
            {/* Checkout notification message */}
            {checkoutNotice && (
              <div className="p-4 rounded-2xl bg-indigo-900 text-white flex items-center justify-between gap-3 shadow-lg text-xs font-semibold animate-in fade-in">
                <span>{checkoutNotice}</span>
                <button
                  type="button"
                  onClick={() => setCheckoutNotice(null)}
                  className="text-white/60 hover:text-white font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Moderation Review Alert Banners */}
            {type === 'payment_page' && itemModerationStatus === 'pending' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Payment Link Under Review (Pending Approval)</h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Yeh payment link request Admin Panel me bhej di gayi hai. Admin dwara approve hone ke baad hi website par payments live honge.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {type === 'payment_page' && itemModerationStatus === 'rejected' && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Payment Link Disabled by Admin</h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    {itemRejectionReason || 'This link has been flagged or paused for revisions.'}
                  </p>
                </div>
              </div>
            )}

            {catalogReady && type === 'payment_page' && itemModerationStatus === 'approved' && (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Live Payment Page • Ready for Instant Customer Checkout</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Live & Active
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Customer Information & Payment methods */}
            <div className="md:col-span-7 space-y-6">
              <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                {/* 1. Contact Details */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                    <span>Contact Information</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        required={itemCollectPhone}
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {itemCollectAddress && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Shipping Address (For physical delivery)
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="House/Shop No, Street, City, State, Pin Code"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {type === 'booking' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Select Preferred Time Slot
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['11:00 AM', '02:00 PM', '05:00 PM', '07:30 PM'].map((slot) => (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-3 text-xs rounded-xl border font-semibold transition cursor-pointer flex items-center justify-between ${
                              selectedSlot === slot
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span>{slot}</span>
                            <Clock className="w-3 h-3 opacity-60" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Payment Method */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
                    <span>Select Payment Option</span>
                  </h3>

                  <div className="space-y-2">
                    {/* UPI */}
                    <div
                      onClick={() => setSelectedPaymentMethod('upi')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                        selectedPaymentMethod === 'upi'
                          ? 'border-blue-600 bg-blue-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">UPI / QR (GPay, PhonePe, Paytm)</div>
                          <div className="text-[11px] text-slate-500">Zero surcharge, instant confirmation</div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={selectedPaymentMethod === 'upi'}
                        onChange={() => setSelectedPaymentMethod('upi')}
                        className="text-blue-600"
                      />
                    </div>

                    <p className="text-xs text-slate-500">Choose your final payment method and enter payment details securely inside Razorpay checkout.</p>

                    {/* Cards */}
                    <div
                      onClick={() => setSelectedPaymentMethod('card')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                        selectedPaymentMethod === 'card'
                          ? 'border-blue-600 bg-blue-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Credit / Debit Cards</div>
                          <div className="text-[11px] text-slate-500">Visa, Mastercard, RuPay, Amex</div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={selectedPaymentMethod === 'card'}
                        onChange={() => setSelectedPaymentMethod('card')}
                        className="text-blue-600"
                      />
                    </div>

                    {/* Netbanking */}
                    <div
                      onClick={() => setSelectedPaymentMethod('netbanking')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                        selectedPaymentMethod === 'netbanking'
                          ? 'border-blue-600 bg-blue-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-amber-600" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Net Banking</div>
                          <div className="text-[11px] text-slate-500">All major Indian and international banks</div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={selectedPaymentMethod === 'netbanking'}
                        onChange={() => setSelectedPaymentMethod('netbanking')}
                        className="text-blue-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !catalogReady || (type === 'payment_page' && itemModerationStatus !== 'approved')}
                    className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-4"
                  >
                    {loading ? (
                      <span>Processing Payment...</span>
                    ) : (
                      <>
                        <span>Pay {itemCurrency}{itemPrice} Securely</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Order Summary Card */}
            <div className="md:col-span-5 space-y-4 sticky top-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Summary</h3>

                <div className="flex gap-3">
                  <img
                    src={itemImage}
                    alt={itemTitle}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">{itemTitle}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{itemDesc}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">{itemCurrency}{itemPrice}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Platform Fee</span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax / GST</span>
                    <span className="font-semibold text-slate-900">Included</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                    <span>Total Amount</span>
                    <span className="text-lg text-emerald-600">{itemCurrency}{itemPrice}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant delivery guarantee. Powered by PrimeProfile Payments.</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

