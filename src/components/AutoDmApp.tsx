import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MessageCircle,
  Instagram,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Settings,
  ShieldCheck,
  Send
} from 'lucide-react';

export const AutoDmApp: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [triggerKeyword, setTriggerKeyword] = useState('SAMPLE');
  const [autoDmText, setAutoDmText] = useState(
    'Hey! Here is your private direct access link to the 10 Sample Box & Wholesale Lookbook: https://primeprofile.bio/rohanstyle/pay/pay-1 Enjoy! 🎁'
  );
  const [sentCount, setSentCount] = useState(482);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">AutoDM Automation</h1>
        <p className="text-xs text-slate-500 mt-1">
          Automatically send direct messages with your PrimeProfile links whenever followers comment on your Instagram Reels or Posts.
        </p>
      </div>

      {/* Connection Status Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md">
            <Instagram className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Instagram Account: @rohanstyle</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Connected
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Webhook Active • 100% automated responses</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
            {sentCount} DMs Automated
          </span>
          <button
            onClick={() => setIsConnected(!isConnected)}
            className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>

      {/* Automation Trigger Form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Reel Comment Automation Rule</h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Trigger Comment Keyword
            </label>
            <div className="flex items-center gap-2 max-w-sm">
              <span className="text-xs text-slate-400">When comment contains:</span>
              <input
                type="text"
                required
                value={triggerKeyword}
                onChange={(e) => setTriggerKeyword(e.target.value)}
                placeholder="e.g. LINK or SAMPLE"
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl font-mono uppercase font-bold text-blue-600"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              e.g. Ask followers: "Comment 'SAMPLE' below and I'll DM you the direct wholesale supplier hamper link!"
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Automated Direct Message (DM) Response
            </label>
            <textarea
              rows={4}
              required
              value={autoDmText}
              onChange={(e) => setAutoDmText(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Rule saved and activated!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Save & Activate AutoDM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
