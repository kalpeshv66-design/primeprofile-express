import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Search,
  Filter,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Receipt,
  FileCheck,
  Wallet,
  Sparkles,
  Info
} from 'lucide-react';
import { PaymentPage, OrderTransaction, PayoutRecord } from '../types';

interface PaymentsManagerProps {
  onNavigate: (route: string) => void;
}

export const PaymentsManager: React.FC<PaymentsManagerProps> = ({ onNavigate }) => {
  const { paymentPages, addPaymentPage, deletePaymentPage, orders, payouts, profile } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'payouts' | 'pages'>('overview');
  const [filterType, setFilterType] = useState<'all' | 'pending_payout' | 'paid' | 'abandoned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create payment page modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(190);
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80');
  const [buttonText, setButtonText] = useState('Pay & Order Now');
  const [collectAddress, setCollectAddress] = useState(true);
  const [collectPhone, setCollectPhone] = useState(true);

  // Selected Order for Receipt / Details modal
  const [selectedOrder, setSelectedOrder] = useState<OrderTransaction | null>(null);

  // Filter orders belonging to this creator (or all in demo mode)
  const creatorUsername = (profile?.username || 'rohanstyle').toLowerCase();
  const creatorOrders = orders.filter(o =>
    !o.creatorUsername || o.creatorUsername.toLowerCase() === creatorUsername
  );

  // Calculate Authoritative Financials
  const successfulOrders = creatorOrders.filter(o => o.status === 'Successful');

  const totalSalesGross = successfulOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

  const totalPlatformCommission = successfulOrders.reduce((sum, o) => {
    if (o.platformCommissionAmount !== undefined) return sum + o.platformCommissionAmount;
    return sum + Math.round(o.amount * 0.08 * 100) / 100;
  }, 0);

  const totalCreatorNetShare = successfulOrders.reduce((sum, o) => {
    if (o.creatorShareAmount !== undefined) return sum + o.creatorShareAmount;
    return sum + Math.round(o.amount * 0.92 * 100) / 100;
  }, 0);

  // Pending Payout (Orders marked pending)
  const pendingOrders = successfulOrders.filter(o => o.payoutStatus !== 'paid');
  const pendingPayableBalance = pendingOrders.reduce((sum, o) => {
    if (o.creatorShareAmount !== undefined) return sum + o.creatorShareAmount;
    return sum + Math.round(o.amount * 0.92 * 100) / 100;
  }, 0);

  // Paid Balance (Orders marked paid with UTR)
  const paidOrders = successfulOrders.filter(o => o.payoutStatus === 'paid');
  const paidBalance = paidOrders.reduce((sum, o) => {
    if (o.creatorShareAmount !== undefined) return sum + o.creatorShareAmount;
    return sum + Math.round(o.amount * 0.92 * 100) / 100;
  }, 0);

  // Filter creator payouts history
  const creatorPayouts = payouts.filter(p =>
    !p.creatorUsername || p.creatorUsername.toLowerCase() === creatorUsername
  );

  // Filtered orders list
  const filteredOrders = creatorOrders.filter((o) => {
    if (filterType === 'pending_payout' && (o.status !== 'Successful' || o.payoutStatus === 'paid')) return false;
    if (filterType === 'paid' && (o.status !== 'Successful' || o.payoutStatus !== 'paid')) return false;
    if (filterType === 'abandoned' && o.status !== 'Pending') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.itemTitle.toLowerCase().includes(q) ||
        (o.payoutReference && o.payoutReference.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q))
      );
    }
    return true;
  });

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addPaymentPage({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      currency: profile?.currency || '₹',
      coverImage: coverImage.trim(),
      buttonText: buttonText.trim(),
      collectAddress,
      collectPhone,
      published: false,
      moderationStatus: 'pending',
      submittedAt: Date.now(),
      creatorName: profile?.name || 'Creator',
      creatorEmail: profile?.email || 'creator@primeprofile.bio',
    });

    setTitle('');
    setDescription('');
    setPrice(190);
    setIsModalOpen(false);
  };

  const copyCheckoutLink = (pageId: string) => {
    const cleanId = pageId.startsWith('pay-') ? pageId : `pay-${pageId}`;
    const url = `${window.location.origin}${window.location.pathname}#${cleanId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(pageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingLinksCount = paymentPages.filter(p => p.moderationStatus === 'pending').length;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1.5">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>Razorpay Payment Gateway & Creator Settlements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Payments & Payouts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time sales tracking, commission calculations, pending payable balances, and bank transfer settlement records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pendingLinksCount > 0 && (
            <button
              onClick={() => onNavigate('admin-panel')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
              <span>{pendingLinksCount} Links in Admin Approval →</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('admin-panel')}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Admin Dashboard</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Payment Page</span>
          </button>
        </div>
      </div>

      {/* Honest Workflow Notice Banner (No fake auto-payout claim) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-blue-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Razorpay Payment Gateway
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30">
                <Building2 className="w-3 h-3 text-amber-400" />
                Manual Bank Transfer Payout Workflow
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Customer Payments via Razorpay PG & Manual Admin Bank Transfers
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              PrimeProfile currently accepts buyer payments via <strong>Razorpay Payment Gateway</strong> (UPI, Cards, NetBanking). Because Razorpay Route is not active yet, creator payouts are manually transferred by PrimeProfile Admin directly to your registered bank account via NEFT/IMPS/UPI with an authentic Bank UTR number. (Payment and payout records are maintained separately for future Razorpay Route integration).
            </p>
          </div>

          <div className="shrink-0 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-right">
            <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Platform Commission</div>
            <div className="text-2xl font-black text-white">8%</div>
            <div className="text-[11px] text-emerald-300 font-semibold">Creator Keeps 92%</div>
          </div>
        </div>
      </div>

      {/* 4 Financial Metric Cards with "Pending payout" & "Paid" Statuses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Gross Sales */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales (Gross)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            ₹{totalSalesGross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {successfulOrders.length} completed customer orders
          </div>
        </div>

        {/* 2. Platform Commission (8%) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">PrimeProfile Fee (8%)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            ₹{totalPlatformCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">
            Platform hosting, checkout & verification
          </div>
        </div>

        {/* 3. Pending Payout (Awaiting Bank Transfer) */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 shadow-sm hover:border-amber-300 transition relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Pending Payout</span>
            <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-2">
            ₹{pendingPayableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-800 font-semibold mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Awaiting Admin Bank Transfer ({pendingOrders.length} orders)</span>
          </div>
        </div>

        {/* 4. Paid Out (Settled with Bank Transfer UTR) */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Paid (Settled)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-200/80 text-emerald-800 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-2">
            ₹{paidBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-800 font-semibold mt-1">
            ✓ Transferred to Bank Account ({paidOrders.length} orders settled)
          </div>
        </div>
      </div>

      {/* Navigation Subtabs Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'overview'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Orders & Sales ({creatorOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('payouts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'payouts'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Payout History ({creatorPayouts.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('pages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'pages'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payment Pages ({paymentPages.length})</span>
          </button>
        </div>

        {/* Bank Account Info Quick Tag */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <span>
            Settlement Account:{' '}
            <strong>
              {profile?.settlement?.accountNumber
                ? `${profile.settlement.bankName || 'Bank'} (****${profile.settlement.accountNumber.slice(-4)})`
                : profile?.settlement?.upiId || 'Not Configured (Add in Settings)'}
            </strong>
          </span>
        </div>
      </div>

      {/* SUBTAB 1: TRANSACTIONS & ORDERS */}
      {activeSubTab === 'overview' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                  filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Orders ({creatorOrders.length})
              </button>
              <button
                onClick={() => setFilterType('pending_payout')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1 ${
                  filterType === 'pending_payout'
                    ? 'bg-amber-500 text-amber-950 font-black'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Pending Payout ({pendingOrders.length})</span>
              </button>
              <button
                onClick={() => setFilterType('paid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1 ${
                  filterType === 'paid'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Paid Out ({paidOrders.length})</span>
              </button>
              <button
                onClick={() => setFilterType('abandoned')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                  filterType === 'abandoned' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Abandoned / Pending
              </button>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search order #, customer, UTR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Order #</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Item Title</th>
                  <th className="py-3 px-4">Gross Amount</th>
                  <th className="py-3 px-4">Split (8% / 92%)</th>
                  <th className="py-3 px-4">Gateway</th>
                  <th className="py-3 px-4">Payout Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No orders found matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const commission = ord.platformCommissionAmount !== undefined
                      ? ord.platformCommissionAmount
                      : Math.round(ord.amount * 0.08 * 100) / 100;
                    const creatorShare = ord.creatorShareAmount !== undefined
                      ? ord.creatorShareAmount
                      : Math.round(ord.amount * 0.92 * 100) / 100;

                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 font-mono text-[11px]">{ord.orderNumber}</div>
                          <div className="text-[10px] text-slate-400">{ord.date}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{ord.customerName}</div>
                          <div className="text-[11px] text-slate-500">{ord.customerEmail}</div>
                          {ord.customerPhone && (
                            <div className="text-[10px] text-blue-600 font-mono">{ord.customerPhone}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded mr-1 font-semibold text-slate-700">
                            {ord.itemType}
                          </span>
                          <span className="font-medium text-slate-800 line-clamp-1">{ord.itemTitle}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-slate-900 text-sm">
                            ₹{ord.amount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-emerald-600 text-xs">
                            +₹{creatorShare} (Creator)
                          </div>
                          <div className="text-[10px] text-slate-400">
                            -₹{commission} (8% Fee)
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Razorpay PG
                          </span>
                          {ord.signatureVerified && (
                            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                              ✓ Verified
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {ord.payoutStatus === 'paid' ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Paid</span>
                              </span>
                              {ord.payoutReference && (
                                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                                  Ref: {ord.payoutReference}
                                </div>
                              )}
                            </div>
                          ) : ord.status === 'Successful' ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pending Payout</span>
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Awaiting Bank Transfer
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px]">{ord.status}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition"
                            title="View Receipt & Breakdown"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PAYOUT HISTORY (MANUAL BANK TRANSFERS COMPLETED BY ADMIN) */}
      {activeSubTab === 'payouts' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Settled Payouts History</h3>
              <p className="text-xs text-slate-500">
                Official record of manual bank transfers executed by PrimeProfile Admin into your account with bank UTR transaction references.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              Total Settled: ₹{paidBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Payout #</th>
                  <th className="py-3 px-4">Date Transferred</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Bank Account / UPI</th>
                  <th className="py-3 px-4">Bank Ref / UTR</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {creatorPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No settled payouts yet. Your pending balance will appear here once Admin completes your bank transfer.
                    </td>
                  </tr>
                ) : (
                  creatorPayouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.payoutNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-600 text-sm">
                        ₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{p.bankDetails?.bankName || 'HDFC Bank'}</div>
                        <div className="font-mono text-[10px] text-slate-500">
                          {p.bankDetails?.accountNumber ? `A/C: ****${p.bankDetails.accountNumber.slice(-4)}` : p.bankDetails?.upiId || 'Direct Bank'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-blue-700 font-bold bg-blue-50/50 px-2 py-1 rounded">
                        {p.transactionReference}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {p.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>PAID</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                        {p.adminNotes || 'Settled via NetBanking IMPS transfer'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: PAYMENT PAGES */}
      {activeSubTab === 'pages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Payment Pages</h3>
              <p className="text-xs text-slate-500">Create independent checkout links to sell sample boxes, services, and digital products.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Payment Page</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentPages.map((page) => (
              <div
                key={page.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <img
                    src={page.coverImage}
                    alt={page.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      {page.moderationStatus === 'pending' ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>Pending Admin Approval</span>
                        </span>
                      ) : page.moderationStatus === 'rejected' ? (
                        <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Rejected
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Live on Website</span>
                        </span>
                      )}
                      <span className="text-slate-400 font-semibold text-[11px]">{page.salesCount} Orders</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 line-clamp-2">{page.title}</h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{page.description}</p>
                    
                    <div className="mt-4 flex items-baseline justify-between">
                      <span className="text-2xl font-black text-slate-900">{page.currency}{page.price}</span>
                      <span className="text-emerald-600 text-xs font-bold">{page.currency}{page.revenue} revenue</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onNavigate(`pay-${page.id}`)}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Checkout</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyCheckoutLink(page.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer"
                      title="Copy Shareable Link"
                    >
                      {copiedId === page.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    </button>
                    <button
                      onClick={() => deletePaymentPage(page.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      title="Delete page"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create Payment Page */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Create New Payment Page</h3>
            <p className="text-xs text-slate-500">
              New links are submitted to Admin review and go live upon approval.
            </p>
            <form onSubmit={handleCreatePage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Page Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sample Product Box or Collaboration Slot"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what the customer receives after making payment..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Button CTA</label>
                  <input
                    type="text"
                    required
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={collectPhone}
                    onChange={(e) => setCollectPhone(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Collect Customer Phone / WhatsApp Number</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={collectAddress}
                    onChange={(e) => setCollectAddress(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Collect Shipping Delivery Address</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow cursor-pointer"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details & Settlement Breakdown Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Receipt & Commission Split</span>
                <h3 className="text-lg font-black text-slate-900">{selectedOrder.orderNumber}</h3>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                selectedOrder.payoutStatus === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-900'
              }`}>
                {selectedOrder.payoutStatus === 'paid' ? 'Paid to Bank' : 'Pending Payout'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Customer</span>
                <span className="font-bold text-slate-900">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Email & Contact</span>
                <span className="font-mono text-slate-700">{selectedOrder.customerEmail} {selectedOrder.customerPhone && `• ${selectedOrder.customerPhone}`}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Item Purchased</span>
                <span className="font-semibold text-slate-800 text-right max-w-[240px] truncate">{selectedOrder.itemTitle}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Gateway Order ID</span>
                <span className="font-mono text-[11px] text-blue-600">{selectedOrder.gatewayOrderId || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Gateway Payment ID</span>
                <span className="font-mono text-[11px] text-slate-700">{selectedOrder.gatewayPaymentId || 'Verified via PG'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">HMAC Webhook Signature</span>
                <span className="font-bold text-emerald-600">✓ Server Verified</span>
              </div>

              {/* Commission and Creator Share Breakdown */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100 mt-2">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Buyer Payment</span>
                  <span className="font-bold text-slate-900">₹{selectedOrder.amount}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>PrimeProfile Platform Fee (8%)</span>
                  <span className="font-semibold text-purple-700">
                    -₹{(selectedOrder.platformCommissionAmount !== undefined ? selectedOrder.platformCommissionAmount : Math.round(selectedOrder.amount * 0.08 * 100) / 100)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm">
                  <span className="text-emerald-800">Creator Net Share (92%)</span>
                  <span className="text-emerald-700">
                    +₹{(selectedOrder.creatorShareAmount !== undefined ? selectedOrder.creatorShareAmount : Math.round(selectedOrder.amount * 0.92 * 100) / 100)}
                  </span>
                </div>
              </div>

              {/* Payout Reference / UTR Details */}
              {selectedOrder.payoutStatus === 'paid' ? (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-[11px] space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Settled to Creator Bank Account</span>
                  </div>
                  <div className="text-emerald-800">
                    Bank UTR Reference: <strong className="font-mono text-emerald-950">{selectedOrder.payoutReference}</strong>
                  </div>
                  <div className="text-[10px] text-emerald-700">
                    Settlement completed via manual IMPS/NEFT bank transfer.
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-[11px] space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pending Bank Transfer Payout</span>
                  </div>
                  <div className="text-amber-800">
                    Your net share of ₹{(selectedOrder.creatorShareAmount || Math.round(selectedOrder.amount * 0.92 * 100) / 100)} will be transferred to your registered bank account by Admin.
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
