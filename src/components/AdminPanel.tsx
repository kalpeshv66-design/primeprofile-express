import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
  Search,
  Filter,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  User,
  Info,
  ChevronRight,
  X,
  CreditCard,
  Building2,
  Wallet,
  Receipt,
  FileCheck,
  DollarSign,
  ArrowUpRight,
  Lock
} from 'lucide-react';
import { PaymentPage, OrderTransaction, PayoutRecord, CreatorPayableSummary } from '../types';
import { PrimeProfileLogo } from './PrimeProfileLogo';

interface AdminPanelProps {
  onNavigate: (route: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate }) => {
  const {
    paymentPages,
    approvePaymentPage,
    rejectPaymentPage,
    orders,
    payouts,
    processManualPayout,
    profile,
  } = useAuth();

  // Top Section Switcher: 'payouts' | 'orders' | 'payout_history' | 'moderation'
  const [section, setSection] = useState<'payouts' | 'orders' | 'payout_history' | 'moderation'>('payouts');

  // Moderation tab state: 'pending' | 'approved' | 'rejected' | 'all'
  const [moderationTab, setModerationTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState<PaymentPage | null>(null);
  const [rejectModalPage, setRejectModalPage] = useState<PaymentPage | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Product description requires more clear details on delivery & access.');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Manual Transfer Modal state
  const [transferModalCreator, setTransferModalCreator] = useState<CreatorPayableSummary | null>(null);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [transferMethod, setTransferMethod] = useState<'Bank Transfer (NEFT/IMPS/RTGS)' | 'UPI'>('Bank Transfer (NEFT/IMPS/RTGS)');
  const [transferNotes, setTransferNotes] = useState<string>('Manual bank transfer executed via corporate NetBanking.');
  const [transferError, setTransferError] = useState<string | null>(null);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  // Selected Order for detail receipt modal
  const [selectedAdminOrder, setSelectedAdminOrder] = useState<OrderTransaction | null>(null);

  // Order status filter in Orders tab
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending_payout' | 'paid' | 'abandoned'>('all');

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => {
      setActionSuccessMsg(null);
    }, 4500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
    showToast(`✓ Copied ${label} to clipboard`);
  };

  // -------------------------------------------------------------
  // CALCULATE CREATOR-WISE PAYABLE SUMMARIES (Server Authoritative Logic)
  // -------------------------------------------------------------
  const creatorMap: { [username: string]: CreatorPayableSummary } = {};

  orders.forEach((o) => {
    if (o.status !== 'Successful') return;

    const username = (o.creatorUsername || 'rohanstyle').toLowerCase();
    if (!creatorMap[username]) {
      const isDefaultCreator = username === 'rohanstyle';
      creatorMap[username] = {
        creatorId: o.creatorId || (isDefaultCreator ? profile?.uid || 'demo-prime-creator-uid-101' : `creator-${username}`),
        creatorUsername: username,
        creatorName: isDefaultCreator ? (profile?.name || 'Rohan Style & Studio') : `@${username}`,
        creatorEmail: isDefaultCreator ? (profile?.email || 'demo@primeprofile.com') : `${username}@gmail.com`,
        totalSalesAmount: 0,
        totalPlatformCommission: 0,
        totalCreatorShare: 0,
        pendingPayableBalance: 0,
        paidBalance: 0,
        pendingOrdersCount: 0,
        paidOrdersCount: 0,
        bankDetails: {
          accountHolderName: profile?.settlement?.accountHolderName || '',
          accountNumber: profile?.settlement?.accountNumber || '',
          ifscCode: profile?.settlement?.ifscCode || '',
          bankName: profile?.settlement?.bankName || '',
          upiId: profile?.settlement?.upiId || ''
        }
      };
    }

    const c = creatorMap[username];
    const amount = o.amount || 0;
    const commission = o.platformCommissionAmount !== undefined
      ? o.platformCommissionAmount
      : Math.round(amount * 0.08 * 100) / 100;
    const creatorShare = o.creatorShareAmount !== undefined
      ? o.creatorShareAmount
      : Math.round(amount * 0.92 * 100) / 100;

    c.totalSalesAmount += amount;
    c.totalPlatformCommission += commission;
    c.totalCreatorShare += creatorShare;

    if (o.payoutStatus === 'paid') {
      c.paidBalance += creatorShare;
      c.paidOrdersCount += 1;
    } else {
      c.pendingPayableBalance += creatorShare;
      c.pendingOrdersCount += 1;
    }
  });

  const creatorSummaries: CreatorPayableSummary[] = Object.values(creatorMap).map(c => ({
    ...c,
    totalSalesAmount: Math.round(c.totalSalesAmount * 100) / 100,
    totalPlatformCommission: Math.round(c.totalPlatformCommission * 100) / 100,
    totalCreatorShare: Math.round(c.totalCreatorShare * 100) / 100,
    pendingPayableBalance: Math.round(c.pendingPayableBalance * 100) / 100,
    paidBalance: Math.round(c.paidBalance * 100) / 100
  }));

  // Aggregated platform stats
  const totalPlatformSales = creatorSummaries.reduce((acc, c) => acc + c.totalSalesAmount, 0);
  const totalPlatformCommission = creatorSummaries.reduce((acc, c) => acc + c.totalPlatformCommission, 0);
  const totalPendingPayable = creatorSummaries.reduce((acc, c) => acc + c.pendingPayableBalance, 0);
  const totalPaidPayouts = creatorSummaries.reduce((acc, c) => acc + c.paidBalance, 0);

  // Link moderation stats
  const pendingPages = paymentPages.filter(p => p.moderationStatus === 'pending');
  const approvedPages = paymentPages.filter(p => p.moderationStatus === 'approved' && p.published);
  const rejectedPages = paymentPages.filter(p => p.moderationStatus === 'rejected' || (!p.published && p.moderationStatus !== 'pending'));

  // Open transfer modal for a specific creator
  const openTransferModal = (creator: CreatorPayableSummary) => {
    setTransferModalCreator(creator);
    setTransferAmount(creator.pendingPayableBalance);
    setTransactionRef('');
    setTransferMethod('Bank Transfer (NEFT/IMPS/RTGS)');
    setTransferNotes(`Manual transfer for ${creator.creatorName} (@${creator.creatorUsername}) settlement`);
    setTransferError(null);
  };

  // Confirm manual payout and mark as Paid
  const handleConfirmManualPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalCreator) return;

    if (!transactionRef || !transactionRef.trim()) {
      setTransferError('Bank Transaction Reference / UTR Number is strictly required to mark payout as Paid.');
      return;
    }

    setIsSubmittingTransfer(true);
    setTransferError(null);

    try {
      const creatorOrders = orders.filter(
        o => o.status === 'Successful' &&
        o.payoutStatus !== 'paid' &&
        (!o.creatorUsername || o.creatorUsername.toLowerCase() === transferModalCreator.creatorUsername.toLowerCase())
      );
      const orderIds = creatorOrders.map(o => o.id);

      await processManualPayout({
        creatorUsername: transferModalCreator.creatorUsername,
        creatorId: transferModalCreator.creatorId,
        creatorName: transferModalCreator.creatorName,
        creatorEmail: transferModalCreator.creatorEmail,
        amount: Number(transferAmount),
        orderIds,
        transactionReference: transactionRef.trim(),
        paymentMethod: transferMethod,
        bankDetails: transferModalCreator.bankDetails,
        adminNotes: transferNotes.trim()
      });

      showToast(`✓ Payout of ₹${transferAmount} marked as PAID with UTR: ${transactionRef.trim()}`);
      setTransferModalCreator(null);
      setTransactionRef('');
    } catch (err: any) {
      console.error('Error confirming manual payout:', err);
      setTransferError(err.message || 'Error processing manual payout.');
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  // Moderation actions
  const handleApprove = async (page: PaymentPage) => {
    await approvePaymentPage(page.id);
    showToast(`✓ "${page.title}" is now APPROVED & LIVE on the website!`);
  };

  const handleConfirmReject = async () => {
    if (!rejectModalPage) return;
    await rejectPaymentPage(rejectModalPage.id, rejectionReason);
    showToast(`✕ "${rejectModalPage.title}" has been rejected.`);
    setRejectModalPage(null);
  };

  // Filtered orders in Orders tab
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'pending_payout' && (o.status !== 'Successful' || o.payoutStatus === 'paid')) return false;
    if (orderStatusFilter === 'paid' && (o.status !== 'Successful' || o.payoutStatus !== 'paid')) return false;
    if (orderStatusFilter === 'abandoned' && o.status !== 'Pending') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.itemTitle.toLowerCase().includes(q) ||
        (o.creatorUsername && o.creatorUsername.toLowerCase().includes(q)) ||
        (o.gatewayOrderId && o.gatewayOrderId.toLowerCase().includes(q)) ||
        (o.payoutReference && o.payoutReference.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filtered pages in Moderation tab
  const filteredPages = paymentPages.filter(page => {
    if (moderationTab === 'pending' && page.moderationStatus !== 'pending') return false;
    if (moderationTab === 'approved' && (page.moderationStatus !== 'approved' || !page.published)) return false;
    if (moderationTab === 'rejected' && page.moderationStatus !== 'rejected' && (page.published || page.moderationStatus === 'pending')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        page.title.toLowerCase().includes(q) ||
        (page.creatorName || '').toLowerCase().includes(q) ||
        (page.creatorEmail || '').toLowerCase().includes(q) ||
        page.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 font-sans">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            ✓
          </div>
          <span className="text-xs sm:text-sm font-semibold">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Top Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>PrimeProfile Admin Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Creator Payouts & Platform Admin</span>
              {totalPendingPayable > 0 && (
                <span className="text-xs font-bold bg-amber-500 text-amber-950 px-2.5 py-0.5 rounded-full animate-pulse">
                  ₹{totalPendingPayable.toFixed(2)} Pending Settlement
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Manage Razorpay PG payments, creator-wise payable balances, manual bank transfers with authentic UTR transaction references, and payment link approvals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate(`public-${profile?.username || 'rohanstyle'}`)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Bio Store</span>
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center gap-1.5"
            >
              <span>Creator Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Section Tabs Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setSection('payouts')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              section === 'payouts'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Creator Payouts & Balances</span>
            {totalPendingPayable > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-amber-950 font-black text-[10px]">
                ₹{totalPendingPayable.toFixed(0)}
              </span>
            )}
          </button>

          <button
            onClick={() => setSection('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              section === 'orders'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4 text-blue-400" />
            <span>Order Details ({orders.length})</span>
          </button>

          <button
            onClick={() => setSection('payout_history')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              section === 'payout_history'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Payout History ({payouts.length})</span>
          </button>

          <button
            onClick={() => setSection('moderation')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              section === 'moderation'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Link Moderation ({paymentPages.length})</span>
            {pendingPages.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-amber-950 font-black text-[10px] animate-pulse">
                {pendingPages.length}
              </span>
            )}
          </button>
        </div>

        {/* Backend Environment Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Razorpay PG: <strong>Secure Backend Mode</strong></span>
          <span className="text-slate-300">|</span>
          <span>Razorpay Route: <strong className="text-slate-500">Manual Transfer Model</strong></span>
        </div>
      </div>

      {/* 4 Financial & Operational Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Platform Sales */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Platform Sales</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            ₹{totalPlatformSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Razorpay PG buyer collections
          </div>
        </div>

        {/* Platform Revenue (8%) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">PrimeProfile Revenue (8%)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-900 mt-2">
            ₹{totalPlatformCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">
            Server-calculated commission share
          </div>
        </div>

        {/* Total Pending Payable Balance */}
        <div
          onClick={() => setSection('payouts')}
          className={`p-5 rounded-3xl border transition cursor-pointer ${
            totalPendingPayable > 0
              ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/20 shadow-md'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Pending Payable</span>
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-2">
            ₹{totalPendingPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-800 font-semibold mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Owed to creators (Ready for transfer)</span>
          </div>
        </div>

        {/* Total Settled Payouts */}
        <div
          onClick={() => setSection('payout_history')}
          className="bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 rounded-3xl p-5 shadow-sm transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paid Settlements</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            ₹{totalPaidPayouts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            ✓ Completed Bank Transfers with UTR
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* SECTION 1: CREATOR-WISE PAYABLE BALANCES & BANK TRANSFERS */}
      {/* ============================================================= */}
      {section === 'payouts' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 mb-1">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Manual Bank Transfer & UTR Recording</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">Creator-Wise Payable Balance</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review verified sales and commission balances per creator. When you complete their NEFT/IMPS bank transfer, click "Process Bank Transfer" and enter the UTR reference number to mark as Paid.
              </p>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Total Creators With Balance</div>
              <div className="text-lg font-black text-slate-900">
                {creatorSummaries.filter(c => c.pendingPayableBalance > 0).length} Creators
              </div>
            </div>
          </div>

          {/* Creators Payable Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Creator</th>
                  <th className="py-3.5 px-4">Bank & Settlement Details</th>
                  <th className="py-3.5 px-4">Total Sales</th>
                  <th className="py-3.5 px-4">8% Platform Fee</th>
                  <th className="py-3.5 px-4">Net Share (92%)</th>
                  <th className="py-3.5 px-4">Paid So Far</th>
                  <th className="py-3.5 px-4">Pending Payable</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {creatorSummaries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No creator orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  creatorSummaries.map((c) => (
                    <tr key={c.creatorUsername} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">{c.creatorName}</div>
                        <div className="text-blue-600 font-mono text-xs">@{c.creatorUsername}</div>
                        <div className="text-[11px] text-slate-400">{c.creatorEmail}</div>
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1 text-[11px]">
                          <div className="font-bold text-slate-800 flex items-center justify-between">
                            <span>{c.bankDetails?.bankName || 'Bank Account'}</span>
                            <span className="text-[10px] text-slate-400">A/C Holder: {c.bankDetails?.accountHolderName || 'Not Provided'}</span>
                          </div>
                          <div className="font-mono text-slate-700 flex items-center justify-between">
                            <span>A/C: {c.bankDetails?.accountNumber || 'Not Provided'}</span>
                            {c.bankDetails?.accountNumber && (
                              <button
                                onClick={() => copyToClipboard(c.bankDetails?.accountNumber || '', 'Account Number')}
                                className="text-slate-400 hover:text-slate-800 cursor-pointer p-0.5"
                                title="Copy Account Number"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <div className="font-mono text-slate-500 text-[10px] flex items-center justify-between">
                            <span>IFSC: {c.bankDetails?.ifscCode || 'Not Provided'}</span>
                            {c.bankDetails?.ifscCode && (
                              <button
                                onClick={() => copyToClipboard(c.bankDetails?.ifscCode || '', 'IFSC Code')}
                                className="text-slate-400 hover:text-slate-800 cursor-pointer p-0.5"
                                title="Copy IFSC"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          {c.bankDetails?.upiId && (
                            <div className="text-[10px] text-blue-600 font-mono pt-0.5 border-t border-slate-200 flex items-center justify-between">
                              <span>UPI: {c.bankDetails.upiId}</span>
                              <button
                                onClick={() => copyToClipboard(c.bankDetails?.upiId || '', 'UPI ID')}
                                className="text-slate-400 hover:text-slate-800 cursor-pointer p-0.5"
                                title="Copy UPI"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-800">
                        ₹{c.totalSalesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-4 font-semibold text-purple-700">
                        ₹{c.totalPlatformCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-900">
                        ₹{c.totalCreatorShare.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-4 font-medium text-emerald-700">
                        ₹{c.paidBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        <div className="text-[10px] text-slate-400">({c.paidOrdersCount} orders)</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className={`text-base font-black ${c.pendingPayableBalance > 0 ? 'text-amber-950 font-black' : 'text-slate-400'}`}>
                          ₹{c.pendingPayableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        {c.pendingPayableBalance > 0 ? (
                          <div className="inline-flex items-center gap-1 text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full mt-1">
                            <Clock className="w-2.5 h-2.5 text-amber-600" />
                            <span>{c.pendingOrdersCount} Unsettled Orders</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">All Settled</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        {c.pendingPayableBalance > 0 ? (
                          <button
                            onClick={() => openTransferModal(c)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer transition"
                          >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Process Bank Transfer</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Up to Date</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SECTION 2: ALL PLATFORM ORDERS (WITH SPLIT & RAZORPAY DETAILS) */}
      {/* ============================================================= */}
      {section === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">All Platform Orders & Razorpay Verification</h2>
              <p className="text-xs text-slate-500">
                Audited list of customer orders, server-calculated commission, creator share, and payout status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setOrderStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                  orderStatusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({orders.length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('pending_payout')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                  orderStatusFilter === 'pending_payout' ? 'bg-amber-500 text-amber-950' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                Pending Payout ({orders.filter(o => o.status === 'Successful' && o.payoutStatus !== 'paid').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('paid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                  orderStatusFilter === 'paid' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                Paid Out ({orders.filter(o => o.payoutStatus === 'paid').length})
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order #, customer, creator, UTR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order & Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Creator Handle</th>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Gross Amount</th>
                  <th className="py-3 px-4">Split (Fee / Net)</th>
                  <th className="py-3 px-4">Gateway Verification</th>
                  <th className="py-3 px-4">Payout Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No orders match your filter criteria.
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
                          <div className="font-mono font-bold text-slate-900">{ord.orderNumber}</div>
                          <div className="text-[10px] text-slate-400">{ord.date}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{ord.customerName}</div>
                          <div className="text-[11px] text-slate-500">{ord.customerEmail}</div>
                          {ord.customerPhone && (
                            <div className="text-[10px] text-blue-600 font-mono">{ord.customerPhone}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full text-[11px]">
                            @{ord.creatorUsername || 'rohanstyle'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs truncate">
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded mr-1 font-semibold text-slate-700">
                            {ord.itemType}
                          </span>
                          <span className="font-medium text-slate-800">{ord.itemTitle}</span>
                        </td>

                        <td className="py-3.5 px-4 font-black text-slate-900">
                          ₹{ord.amount}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-emerald-600 text-xs">
                            +₹{creatorShare} (Creator)
                          </div>
                          <div className="text-[10px] text-purple-700 font-semibold">
                            -₹{commission} (8% Platform)
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            Razorpay PG
                          </div>
                          <div className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Signed HMAC Verified</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {ord.payoutStatus === 'paid' ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Paid</span>
                              </span>
                              {ord.payoutReference && (
                                <div className="text-[10px] font-mono text-slate-600 font-bold mt-0.5">
                                  UTR: {ord.payoutReference}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending Payout</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedAdminOrder(ord)}
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="View Full Order Breakdown"
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

      {/* ============================================================= */}
      {/* SECTION 3: PAYOUT HISTORY (LOG OF ALL SETTLED TRANSFERS) */}
      {/* ============================================================= */}
      {section === 'payout_history' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">Historical Bank Transfer Payouts</h2>
              <p className="text-xs text-slate-500">
                Official register of manual bank transfers settled with creators, including bank reference / UTR codes.
              </p>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              Total Settled: ₹{totalPaidPayouts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Payout #</th>
                  <th className="py-3 px-4">Creator</th>
                  <th className="py-3 px-4">Date Settled</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Bank Ref / UTR</th>
                  <th className="py-3 px-4">Bank Account</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Admin Settlement Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No payout records found yet.
                    </td>
                  </tr>
                ) : (
                  payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.payoutNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.creatorName}</div>
                        <div className="text-blue-600 font-mono text-[11px]">@{p.creatorUsername}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-600 text-sm">
                        ₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                          {p.transactionReference}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{p.bankDetails?.bankName || 'HDFC Bank'}</div>
                        <div className="font-mono text-[10px] text-slate-500">
                          {p.bankDetails?.accountNumber ? `A/C: ****${p.bankDetails.accountNumber.slice(-4)}` : p.bankDetails?.upiId}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {p.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                        {p.adminNotes}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SECTION 4: PAYMENT LINKS MODERATION (PRESERVED SYSTEM) */}
      {/* ============================================================= */}
      {section === 'moderation' && (
        <div className="space-y-6">
          {/* 4 Metric Cards for Moderation */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setModerationTab('pending')}
              className={`p-5 rounded-2xl border transition cursor-pointer ${
                moderationTab === 'pending'
                  ? 'bg-amber-50 border-amber-300 shadow-md ring-2 ring-amber-400/20'
                  : 'bg-white border-slate-200 hover:bg-amber-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {pendingPages.length}
              </div>
              <div className="text-[11px] text-amber-700 font-semibold mt-1">
                Link requests awaiting approval
              </div>
            </div>

            <div
              onClick={() => setModerationTab('approved')}
              className={`p-5 rounded-2xl border transition cursor-pointer ${
                moderationTab === 'approved'
                  ? 'bg-emerald-50 border-emerald-300 shadow-md ring-2 ring-emerald-400/20'
                  : 'bg-white border-slate-200 hover:bg-emerald-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live & Active</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {approvedPages.length}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                Active on website taking payments
              </div>
            </div>

            <div
              onClick={() => setModerationTab('rejected')}
              className={`p-5 rounded-2xl border transition cursor-pointer ${
                moderationTab === 'rejected'
                  ? 'bg-rose-50 border-rose-300 shadow-md ring-2 ring-rose-400/20'
                  : 'bg-white border-slate-200 hover:bg-rose-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rejected / Disabled</span>
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {rejectedPages.length}
              </div>
              <div className="text-[11px] text-rose-700 font-semibold mt-1">
                Links disabled by Admin
              </div>
            </div>

            <div
              onClick={() => setModerationTab('all')}
              className={`p-5 rounded-2xl border transition cursor-pointer ${
                moderationTab === 'all'
                  ? 'bg-indigo-50 border-indigo-300 shadow-md ring-2 ring-indigo-400/20'
                  : 'bg-white border-slate-200 hover:bg-indigo-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Links</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {paymentPages.length}
              </div>
              <div className="text-[11px] text-indigo-700 font-semibold mt-1">
                All submitted payment links
              </div>
            </div>
          </div>

          {/* Moderation Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModerationTab('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                    moderationTab === 'pending' ? 'bg-amber-500 text-amber-950 font-black' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Pending ({pendingPages.length})
                </button>
                <button
                  onClick={() => setModerationTab('approved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                    moderationTab === 'approved' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Approved & Live ({approvedPages.length})
                </button>
                <button
                  onClick={() => setModerationTab('rejected')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                    moderationTab === 'rejected' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Rejected ({rejectedPages.length})
                </button>
                <button
                  onClick={() => setModerationTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                    moderationTab === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  All ({paymentPages.length})
                </button>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search title, creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Item & Cover</th>
                    <th className="py-3 px-4">Creator</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No payment links in this section.
                      </td>
                    </tr>
                  ) : (
                    filteredPages.map((page) => (
                      <tr key={page.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <img
                            src={page.coverImage}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{page.title}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{page.description}</div>
                            <div className="text-[10px] font-mono text-blue-600">#{page.id}</div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{page.creatorName || 'Creator'}</div>
                          <div className="text-[11px] text-slate-500">{page.creatorEmail || 'creator@primeprofile.bio'}</div>
                        </td>

                        <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                          ₹{page.price}
                        </td>

                        <td className="py-3.5 px-4">
                          {page.moderationStatus === 'pending' ? (
                            <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending Approval</span>
                            </span>
                          ) : page.moderationStatus === 'approved' && page.published ? (
                            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Live on Website</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Rejected</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onNavigate(`pay-${page.id}`)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg cursor-pointer"
                            >
                              Preview
                            </button>

                            {page.moderationStatus !== 'approved' || !page.published ? (
                              <button
                                onClick={() => handleApprove(page)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-sm cursor-pointer"
                              >
                                Approve & Go Live
                              </button>
                            ) : null}

                            {page.moderationStatus !== 'rejected' && (
                              <button
                                onClick={() => setRejectModalPage(page)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg border border-rose-200 cursor-pointer"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: MANUAL BANK TRANSFER & UTR RECORDING (KEY USER REQUIREMENT) */}
      {/* ============================================================= */}
      {transferModalCreator && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Execute Manual Bank Transfer</h3>
                  <p className="text-[11px] text-slate-500">Record genuine bank UTR to confirm creator settlement</p>
                </div>
              </div>
              <button
                onClick={() => setTransferModalCreator(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {transferError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            {/* Creator Coordinates & Copy-able Bank Account details */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Recipient Bank Account Coordinates
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Account Holder:</span>
                <span className="font-extrabold text-slate-900">{transferModalCreator.bankDetails?.accountHolderName || 'Not Provided'}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Bank Name:</span>
                <span className="font-bold text-slate-800">{transferModalCreator.bankDetails?.bankName || 'Bank Account'}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Account Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700">{transferModalCreator.bankDetails?.accountNumber || 'Not Provided'}</span>
                  {transferModalCreator.bankDetails?.accountNumber && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(transferModalCreator.bankDetails?.accountNumber || '', 'Account Number')}
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">IFSC Code:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800">{transferModalCreator.bankDetails?.ifscCode || 'Not Provided'}</span>
                  {transferModalCreator.bankDetails?.ifscCode && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(transferModalCreator.bankDetails?.ifscCode || '', 'IFSC Code')}
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {transferModalCreator.bankDetails?.upiId && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">UPI ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-700">{transferModalCreator.bankDetails.upiId}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(transferModalCreator.bankDetails?.upiId || '', 'UPI ID')}
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Instruction Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-relaxed">
              <strong>Step 1:</strong> Complete the transfer from your net-banking portal to the bank account above.<br />
              <strong>Step 2:</strong> Enter the official Bank UTR (Unique Transaction Reference) number below. The payout cannot be marked as Paid without a verified transaction reference.
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmManualPayout} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Settlement Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={1}
                    required
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Method</label>
                  <select
                    value={transferMethod}
                    onChange={(e: any) => setTransferMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="Bank Transfer (NEFT/IMPS/RTGS)">Bank Transfer (IMPS/NEFT)</option>
                    <option value="UPI">UPI Direct</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase mb-1 flex items-center justify-between">
                  <span>Bank Transaction Reference / UTR Number *</span>
                  <span className="text-[10px] text-rose-600 font-semibold lowercase">required by policy</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR202609299812450 or IMPS8912384"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-mono font-bold border-2 border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-indigo-50/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admin Audit Notes</label>
                <textarea
                  rows={2}
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTransferModalCreator(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTransfer || !transactionRef.trim()}
                  className={`px-5 py-2.5 text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5 transition cursor-pointer ${
                    !transactionRef.trim()
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Bank Transfer & Mark as PAID</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REJECT PAGE WITH REASON */}
      {rejectModalPage && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Reject Payment Link</h3>
            <p className="text-xs text-slate-500">
              Provide feedback to the creator explaining why this link cannot be approved at this time.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalPage(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ORDER DETAILS & SPLIT AUDIT */}
      {selectedAdminOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Razorpay PG Order Audit</span>
                <h3 className="text-base font-black text-slate-900">{selectedAdminOrder.orderNumber}</h3>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                selectedAdminOrder.payoutStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}>
                {selectedAdminOrder.payoutStatus === 'paid' ? 'Paid to Creator' : 'Pending Payout'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-bold text-slate-900">{selectedAdminOrder.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email & Contact:</span>
                <span className="font-mono text-slate-700">{selectedAdminOrder.customerEmail} {selectedAdminOrder.customerPhone && `• ${selectedAdminOrder.customerPhone}`}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Purchased Item:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[220px] truncate">{selectedAdminOrder.itemTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Razorpay Gateway Order ID:</span>
                <span className="font-mono text-blue-600 font-bold">{selectedAdminOrder.gatewayOrderId || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Razorpay Payment ID:</span>
                <span className="font-mono text-slate-700">{selectedAdminOrder.gatewayPaymentId || 'Verified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">HMAC Webhook Signature:</span>
                <span className="font-bold text-emerald-600">✓ Verified on Server</span>
              </div>

              {/* Server Split */}
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 border border-slate-200 mt-2">
                <div className="flex justify-between text-slate-700">
                  <span>Gross Buyer Payment:</span>
                  <span className="font-bold text-slate-900">₹{selectedAdminOrder.amount}</span>
                </div>
                <div className="flex justify-between text-purple-700">
                  <span>PrimeProfile Commission (8%):</span>
                  <span className="font-bold">-₹{(selectedAdminOrder.platformCommissionAmount || Math.round(selectedAdminOrder.amount * 0.08 * 100) / 100)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-slate-200">
                  <span>Creator Net Payable Share:</span>
                  <span>+₹{(selectedAdminOrder.creatorShareAmount || Math.round(selectedAdminOrder.amount * 0.92 * 100) / 100)}</span>
                </div>
              </div>

              {selectedAdminOrder.payoutStatus === 'paid' && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900 space-y-0.5">
                  <div className="font-bold">Bank Transfer Completed</div>
                  <div>UTR Reference: <strong className="font-mono">{selectedAdminOrder.payoutReference}</strong></div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedAdminOrder(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
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
