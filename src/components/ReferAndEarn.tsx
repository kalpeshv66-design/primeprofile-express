import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Coins,
  Copy,
  Check,
  Share2,
  Users,
  TrendingUp,
  Gift,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const ReferAndEarn: React.FC = () => {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralCode = profile?.username ? profile.username.toUpperCase().slice(0, 8) : 'PRIME101';
  const referralUrl = `https://primeprofile.bio/ref/${referralCode}`;

  const copyRef = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Refer & Earn</h1>
        <p className="text-xs text-slate-500 mt-1">
          Invite other creators, agency friends and coaches to PrimeProfile and earn 30% recurring monthly commissions.
        </p>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-xl space-y-3 relative z-10">
          <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Creator Affiliate Program
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Earn 30% Lifetime Recurring Commission
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Every creator that signs up using your personal link gets 20% off their first year, and you receive instant payouts every month directly to your UPI/bank account.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-1 w-full bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 rounded-xl text-xs font-mono truncate text-white">
              {referralUrl}
            </div>
            <button
              onClick={copyRef}
              className="w-full sm:w-auto px-4 py-2 bg-white text-blue-700 font-bold text-xs rounded-xl shadow hover:bg-blue-50 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Referral Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Referred Creators</div>
          <div className="text-3xl font-black text-slate-900 mt-1">14</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">8 on active Pro plans</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Lifetime Commissions</div>
          <div className="text-3xl font-black text-slate-900 mt-1">₹6,712</div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">Paid directly via UPI</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Upcoming Payout</div>
          <div className="text-3xl font-black text-emerald-600 mt-1">₹1,918</div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">Settles on 1st of month</div>
        </div>
      </div>
    </div>
  );
};
