import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Razorpay credentials stay on the backend. Test/live mode follows the Key ID.
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';
const PLATFORM_COMMISSION_PERCENT = Number(process.env.PLATFORM_COMMISSION_PERCENT || '8');
if (!Number.isFinite(PLATFORM_COMMISSION_PERCENT) || PLATFORM_COMMISSION_PERCENT < 0 || PLATFORM_COMMISSION_PERCENT > 100) {
  throw new Error('PLATFORM_COMMISSION_PERCENT must be between 0 and 100.');
}
const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

async function razorpayRequest(endpoint: string, body?: unknown) {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) throw new Error('Configure Razorpay Key ID and Key Secret on the server first.');
  const response = await fetch(`${RAZORPAY_BASE_URL}${endpoint}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json'
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.description || 'Razorpay request failed.');
  return data;
}

function validSignature(message: string | Buffer, signature: unknown, secret: string) {
  if (!secret || typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = crypto.createHmac('sha256', secret).update(message).digest();
  return crypto.timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}

// Middleware for parsing JSON with raw body capture for webhook signature verification
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// In-Memory Payouts & Orders Store (Server-side authoritative state)
interface ServerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  itemType: string;
  itemId: string;
  itemTitle: string;
  amount: number;
  currency: string;
  status: 'Successful' | 'Pending' | 'Failed';
  paymentMethod: string;
  gateway: 'razorpay';
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  signatureVerified: boolean;
  verifiedAt?: number;
  platformCommissionRate: number;
  platformCommissionAmount: number;
  creatorShareAmount: number;
  creatorId: string;
  creatorUsername: string;
  payoutStatus: 'pending' | 'paid';
  payoutId?: string;
  payoutReference?: string;
  paidAt?: number;
  createdAt: number;
  date: string;
}

interface ServerPayout {
  id: string;
  payoutNumber: string;
  creatorId: string;
  creatorUsername: string;
  creatorName: string;
  creatorEmail: string;
  amount: number;
  currency: string;
  orderIds: string[];
  status: 'pending' | 'paid' | 'failed';
  requestedAt?: number;
  paidAt?: number;
  paymentMethod: string;
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    upiId?: string;
  };
  transactionReference: string; // UTR or Bank Ref Number
  adminNotes?: string;
  createdAt: number;
}

// In-Memory Payouts & Orders Store (Server-side authoritative state)
const ordersStore: ServerOrder[] = [];
const payoutsStore: ServerPayout[] = [];

// Helper to calculate server-authoritative commission and creator share
function calculateOrderSplit(amount: number) {
  const rate = PLATFORM_COMMISSION_PERCENT / 100;
  const platformCommission = Math.round(amount * rate * 100) / 100;
  const creatorShare = Math.round((amount - platformCommission) * 100) / 100;
  return {
    platformCommissionRate: rate,
    platformCommissionAmount: platformCommission,
    creatorShareAmount: creatorShare
  };
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Catalog prices are read from the existing public Firestore catalog, never the buyer's amount.
async function catalogDocument(creatorId: string, collection?: string, itemId?: string) {
  const config = JSON.parse(await (await import('node:fs/promises')).readFile(path.join(__dirname, 'firebase-applet-config.json'), 'utf8'));
  const segments = ['creators', creatorId, ...(collection ? [collection, itemId!] : [])];
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/${encodeURIComponent(config.firestoreDatabaseId || '(default)')}/documents/${segments.map(encodeURIComponent).join('/')}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Published catalog item could not be loaded. Save it to Firestore before accepting payments.');
  const document = await response.json();
  return Object.fromEntries(Object.entries(document.fields || {}).map(([key, value]: [string, any]) =>
    [key, value.stringValue ?? value.doubleValue ?? (value.integerValue !== undefined ? Number(value.integerValue) : value.booleanValue)]));
}

app.get('/api/payments/razorpay/catalog/:creatorId/:itemType/:itemId', async (req: Request, res: Response): Promise<any> => {
  try {
    const { creatorId, itemType, itemId } = req.params;
    const collections: Record<string, string> = { product: 'products', payment_page: 'payment_pages', course: 'courses', booking: 'bookings' };
    if (!collections[itemType] || creatorId.includes('/') || itemId.includes('/')) return res.status(400).json({ error: 'Invalid catalog item.' });
    const [item, creator] = await Promise.all([catalogDocument(creatorId, collections[itemType], itemId), catalogDocument(creatorId)]);
    if (!item.published) return res.status(404).json({ error: 'This item is not published.' });
    const { title, price, currency, coverImage, description, subtitle, collectAddress, collectPhone, moderationStatus, rejectionReason, durationMinutes, locationType } = item;
    return res.json({ item: { title, price, currency, coverImage, description, subtitle, collectAddress, collectPhone, moderationStatus, rejectionReason, durationMinutes, locationType }, creatorUsername: creator.username });
  } catch (error: any) { return res.status(404).json({ error: error.message }); }
});

app.get('/api/payments/razorpay/config', (_req: Request, res: Response) => {
  res.json({ status: 'ok', razorpayConfigured: Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET),
    env: RAZORPAY_KEY_ID.startsWith('rzp_live_') ? 'LIVE' : 'TEST',
    platformCommissionPercent: PLATFORM_COMMISSION_PERCENT,
    routeActive: false, payoutModel: 'manual_admin_transfer_with_utr' });
});

app.post('/api/payments/razorpay/create-order', async (req: Request, res: Response): Promise<any> => {
  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) return res.status(503).json({ error: 'Razorpay is not configured. Add server credentials first.' });
    const { customerName, customerEmail, customerPhone, itemId, itemType, creatorId } = req.body;
    const collections: Record<string, string> = { product: 'products', payment_page: 'payment_pages', course: 'courses', booking: 'bookings' };
    if (!collections[itemType] || typeof creatorId !== 'string' || !creatorId || typeof itemId !== 'string' || !itemId || creatorId.includes('/') || itemId.includes('/')) {
      return res.status(400).json({ error: 'Valid creator and catalog item are required.' });
    }
    if (typeof customerName !== 'string' || !customerName.trim() || typeof customerEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return res.status(400).json({ error: 'Customer name and valid email are required.' });
    }
    const [item, creator] = await Promise.all([catalogDocument(creatorId, collections[itemType], itemId), catalogDocument(creatorId)]);
    if (!item.published || (itemType === 'payment_page' && item.moderationStatus !== 'approved')) {
      return res.status(400).json({ error: 'This item is not published or approved for payment.' });
    }
    const currency = item.currency === '₹' ? 'INR' : item.currency;
    if (currency !== 'INR') return res.status(400).json({ error: 'This checkout currently supports INR only.' });
    const amountPaise = Math.round(Number(item.price) * 100);
    if (!Number.isSafeInteger(amountPaise) || amountPaise < 100) return res.status(400).json({ error: 'Price must be at least ₹1.' });
    const amount = amountPaise / 100;
    const id = `ord-${crypto.randomUUID()}`;
    const gatewayOrder = await razorpayRequest('/orders', {
      amount: amountPaise, currency, receipt: `PP_${crypto.randomBytes(12).toString('hex')}`,
      notes: { itemId, itemType, creatorId }
    });
    if (!gatewayOrder.id || gatewayOrder.amount !== amountPaise || gatewayOrder.currency !== currency) throw new Error('Invalid gateway order response.');
    const now = Date.now();
    const order: ServerOrder = {
      id, orderNumber: `ORD-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
      customerName: customerName.trim(), customerEmail, customerPhone: String(customerPhone || ''),
      itemId, itemType, itemTitle: String(item.title || 'PrimeProfile Checkout'), amount, currency,
      status: 'Pending', paymentMethod: 'Razorpay', gateway: 'razorpay', gatewayOrderId: gatewayOrder.id,
      signatureVerified: false, ...calculateOrderSplit(amount), creatorId,
      creatorUsername: String(creator.username || ''), payoutStatus: 'pending', createdAt: now,
      date: new Date(now).toLocaleString('en-IN')
    };
    ordersStore.unshift(order);
    res.json({ success: true, keyId: RAZORPAY_KEY_ID, orderId: gatewayOrder.id, internalOrderId: id,
      amountPaise, amount, currency, itemTitle: order.itemTitle,
      env: RAZORPAY_KEY_ID.startsWith('rzp_live_') ? 'LIVE' : 'TEST' });
  } catch (error: any) {
    console.error('Razorpay order creation failed:', error.message);
    return res.status(502).json({ error: error.message || 'Unable to create payment order.' });
  }
});

function confirmCapturedPayment(order: ServerOrder, payment: any) {
  if (!payment || payment.order_id !== order.gatewayOrderId || payment.amount !== Math.round(order.amount * 100) || payment.currency !== order.currency || payment.status !== 'captured') return false;
  // Retries and duplicate webhooks must preserve an already paid creator payout.
  if (order.status === 'Successful') return order.gatewayPaymentId === payment.id;
  order.status = 'Successful';
  order.gatewayPaymentId = payment.id;
  order.paymentMethod = `Razorpay ${payment.method || 'Payment'}`;
  order.signatureVerified = true;
  order.verifiedAt = Date.now();
  return true;
}

app.post('/api/payments/razorpay/verify-order', async (req: Request, res: Response): Promise<any> => {
  try {
    if (!RAZORPAY_KEY_SECRET) return res.status(503).json({ error: 'Razorpay is not configured.' });
    const { internalOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = ordersStore.find(o => o.id === internalOrderId);
    if (!order) return res.status(404).json({ error: 'Order not found. Contact support if money was deducted.' });
    if (razorpay_order_id !== order.gatewayOrderId || typeof razorpay_payment_id !== 'string' || !/^pay_[a-zA-Z0-9]+$/.test(razorpay_payment_id) || !validSignature(`${order.gatewayOrderId}|${razorpay_payment_id}`, razorpay_signature, RAZORPAY_KEY_SECRET)) {
      return res.status(401).json({ error: 'Invalid payment signature.' });
    }
    const payment = await razorpayRequest(`/payments/${razorpay_payment_id}`);
    if (!confirmCapturedPayment(order, payment)) return res.status(409).json({ error: 'Payment is not captured or does not match this order. Contact support if money was deducted.' });
    return res.json({ success: true, verified: true, order });
  } catch (error: any) {
    return res.status(502).json({ error: error.message || 'Payment verification failed.' });
  }
});

app.post('/api/payments/razorpay/webhook', (req: any, res: Response): any => {
  if (!RAZORPAY_WEBHOOK_SECRET) return res.status(503).json({ error: 'Webhook secret is not configured.' });
  if (!req.rawBody || !validSignature(req.rawBody, req.headers['x-razorpay-signature'], RAZORPAY_WEBHOOK_SECRET)) return res.status(401).json({ error: 'Invalid webhook signature.' });
  const payload = req.body;
  if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
    const payment = payload.payload?.payment?.entity;
    const order = ordersStore.find(o => o.gatewayOrderId === payment?.order_id);
    if (!order) return res.status(503).json({ error: 'Order unavailable. Retry webhook after restoring order state.' });
    if (!confirmCapturedPayment(order, payment)) return res.status(400).json({ error: 'Payment does not match stored order.' });
  }
  return res.json({ status: 'received' });
});

// 5. Creator & Admin Orders List
app.get('/api/orders', (req: Request, res: Response) => {
  const { creatorUsername, status } = req.query;
  let filtered = [...ordersStore];

  if (creatorUsername) {
    filtered = filtered.filter(o => o.creatorUsername.toLowerCase() === String(creatorUsername).toLowerCase());
  }

  if (status) {
    filtered = filtered.filter(o => o.status.toLowerCase() === String(status).toLowerCase());
  }

  res.json({ orders: filtered });
});

// 6. Creator-wise Payable Summary & Payout Overview for Admin Dashboard
app.get('/api/payouts/summary', (req: Request, res: Response) => {
  // Aggregate orders by creator
  const creatorMap: { [username: string]: any } = {};

  ordersStore.forEach(order => {
    if (order.status !== 'Successful') return;

    const username = order.creatorUsername || 'rohanstyle';
    if (!creatorMap[username]) {
      creatorMap[username] = {
        creatorId: order.creatorId || 'demo-prime-creator-uid-101',
        creatorUsername: username,
        creatorName: `@${username}`,
        creatorEmail: `${username}@gmail.com`,
        totalSalesAmount: 0,
        totalPlatformCommission: 0,
        totalCreatorShare: 0,
        pendingPayableBalance: 0,
        paidBalance: 0,
        pendingOrdersCount: 0,
        paidOrdersCount: 0,
        pendingOrderIds: [],
        bankDetails: {
          accountHolderName: '',
          accountNumber: '',
          ifscCode: '',
          bankName: '',
          upiId: ''
        }
      };
    }

    const c = creatorMap[username];
    c.totalSalesAmount += order.amount;
    c.totalPlatformCommission += order.platformCommissionAmount;
    c.totalCreatorShare += order.creatorShareAmount;

    if (order.payoutStatus === 'paid') {
      c.paidBalance += order.creatorShareAmount;
      c.paidOrdersCount += 1;
    } else {
      c.pendingPayableBalance += order.creatorShareAmount;
      c.pendingOrdersCount += 1;
      c.pendingOrderIds.push(order.id);
    }
  });

  // Round values
  const summaries = Object.values(creatorMap).map((c: any) => ({
    ...c,
    totalSalesAmount: Math.round(c.totalSalesAmount * 100) / 100,
    totalPlatformCommission: Math.round(c.totalPlatformCommission * 100) / 100,
    totalCreatorShare: Math.round(c.totalCreatorShare * 100) / 100,
    pendingPayableBalance: Math.round(c.pendingPayableBalance * 100) / 100,
    paidBalance: Math.round(c.paidBalance * 100) / 100
  }));

  res.json({
    summaries,
    totalPlatformSales: summaries.reduce((acc, s) => acc + s.totalSalesAmount, 0),
    totalPlatformCommission: summaries.reduce((acc, s) => acc + s.totalPlatformCommission, 0),
    totalPendingPayable: summaries.reduce((acc, s) => acc + s.pendingPayableBalance, 0),
    totalPaidPayouts: summaries.reduce((acc, s) => acc + s.paidBalance, 0)
  });
});

// 7. Manual Payout Action by Admin (Bank Transfer Completed with Transaction Reference)
app.post('/api/payouts/manual-transfer', (req: Request, res: Response): any => {
  try {
    const {
      creatorUsername,
      creatorId = 'demo-prime-creator-uid-101',
      creatorName = 'Creator',
      creatorEmail = 'creator@primeprofile.bio',
      amount,
      orderIds = [],
      transactionReference,
      paymentMethod = 'Bank Transfer (NEFT/IMPS/RTGS)',
      bankDetails,
      adminNotes
    } = req.body;

    if (!transactionReference || !transactionReference.trim()) {
      return res.status(400).json({
        error: 'Bank Transaction Reference / UTR Number is required to confirm manual payout.'
      });
    }

    const payoutNum = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;
    const payoutId = `payo-${Date.now()}`;
    const paidAt = Date.now();

    // Mark matched orders as paid
    const updatedOrderIds: string[] = [];
    ordersStore.forEach(order => {
      const match =
        (orderIds.length > 0 && orderIds.includes(order.id)) ||
        (orderIds.length === 0 && order.creatorUsername.toLowerCase() === creatorUsername.toLowerCase() && order.payoutStatus !== 'paid');

      if (match) {
        order.payoutStatus = 'paid';
        order.payoutId = payoutId;
        order.payoutReference = transactionReference.trim();
        order.paidAt = paidAt;
        updatedOrderIds.push(order.id);
      }
    });

    const newPayout: ServerPayout = {
      id: payoutId,
      payoutNumber: payoutNum,
      creatorId,
      creatorUsername: creatorUsername || 'rohanstyle',
      creatorName,
      creatorEmail,
      amount: parseFloat(amount) || 0,
      currency: '₹',
      orderIds: updatedOrderIds,
      status: 'paid',
      requestedAt: paidAt - 1000 * 60 * 30,
      paidAt,
      paymentMethod,
      bankDetails: bankDetails || {
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        upiId: ''
      },
      transactionReference: transactionReference.trim(),
      adminNotes: adminNotes || 'Manual bank transfer executed by Admin.',
      createdAt: paidAt
    };

    payoutsStore.unshift(newPayout);

    return res.json({
      success: true,
      message: `✓ Payout of ₹${newPayout.amount} marked as PAID with Ref: ${transactionReference}`,
      payout: newPayout,
      updatedOrdersCount: updatedOrderIds.length
    });
  } catch (error: any) {
    console.error('Error processing manual payout:', error);
    return res.status(500).json({ error: error.message || 'Error processing manual payout transfer.' });
  }
});

// 8. Payout History List
app.get('/api/payouts/history', (req: Request, res: Response) => {
  const { creatorUsername } = req.query;
  let list = [...payoutsStore];

  if (creatorUsername) {
    list = list.filter(p => p.creatorUsername.toLowerCase() === String(creatorUsername).toLowerCase());
  }

  res.json({ payouts: list });
});

// -------------------------------------------------------------
// VITE DEV SERVER OR PRODUCTION STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode with Vite Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built assets from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PrimeProfile Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[Razorpay PG] Mode: ${RAZORPAY_KEY_ID.startsWith('rzp_live_') ? 'LIVE' : 'TEST'}`);
    console.log(`[Commission Rate] ${PLATFORM_COMMISSION_PERCENT}% platform fee`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

