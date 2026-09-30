import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Circle,
  Instagram,
  ShoppingBag,
  Store,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Zap,
  Play
} from 'lucide-react';

interface GettingStartedProps {
  onSelectTab: (tab: string) => void;
  onNavigate: (route: string) => void;
}

export const GettingStarted: React.FC<GettingStartedProps> = ({ onSelectTab, onNavigate }) => {
  const { profile } = useAuth();
  const username = profile?.username || 'rohanstyle';

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Pro Upgrade Banner matching screenshot */}
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-emerald-900 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-200 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            ✦ You're on Free Plan
          </span>
          <span>Unlock unlimited access to all features, custom domains & 0% transaction fee.</span>
        </div>
        <button
          onClick={() => onSelectTab('pricing-upgrade')}
          className="text-blue-600 font-bold hover:underline cursor-pointer whitespace-nowrap text-xs sm:text-sm"
        >
          Upgrade now →
        </button>
      </div>

      {/* Greeting Title */}
      <div className="text-center pt-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Hello, {username}! 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here is your roadmap to scaling your creator business.</p>
      </div>

      {/* Featured Video / Growth Card matching screenshot */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-full md:w-72 h-44 rounded-2xl overflow-hidden group cursor-pointer shadow-md shrink-0 bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"
            alt="Growth Hack"
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-3.5 text-white">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white">
                <Zap className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-xs font-bold">Organic Growth Hack</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg mx-auto">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>
            <div className="text-[11px] text-slate-300">PrimeProfile • 2 min masterclass</div>
          </div>
        </div>

        <div className="space-y-3 flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Grow your Instagram & Bio Traffic 🚀
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Here's how top creators grew to 100k+ followers in just one week by automating direct message funnels and launching attractive low-ticket sample boxes.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={() => onSelectTab('apps-autodm')}
              className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 hover:opacity-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
              <span>Connect your Instagram</span>
            </button>
            <button
              onClick={() => onSelectTab('store')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              Customize Bio Store
            </button>
          </div>
        </div>
      </div>

      {/* Gold Learn Banner matching screenshot */}
      <div className="bg-gradient-to-r from-[#2a2416] via-[#1f1a10] to-[#14120e] border border-amber-900/40 rounded-3xl p-4 sm:p-5 flex items-center justify-between text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-amber-200">Learn how to grow and sell with PrimeProfile</div>
            <div className="text-xs text-amber-400/80">Step-by-step master tutorials, tips and playbooks</div>
          </div>
        </div>
        <button
          onClick={() => onSelectTab('learn')}
          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
        >
          <span>Go to Learn</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Roadmap to making ₹₹₹ matching screenshot */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Roadmap to making ₹₹₹</span>
          </h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            2/3 completed
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full rounded-full w-2/3" />
        </div>

        {/* Roadmap Steps */}
        <div className="space-y-4 pt-2">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Setup automation on AutoDM</h4>
                <p className="text-xs text-slate-500 mt-0.5">Turn your Instagram engagement into potential leads with 100% automations.</p>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('apps-autodm')}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              Connect IG
            </button>
          </div>

          {/* Step 2 (Completed) */}
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Launch your Store</h4>
                <button
                  onClick={() => onSelectTab('store')}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Edit Store
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Make sure your social bio has it all - the only link-in-bio store you'll need.</p>
            </div>
          </div>

          {/* Step 3 (Completed) */}
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Create a product</h4>
                <button
                  onClick={() => onSelectTab('apps-paymentpages')}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Manage Products
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Launch Digital Products, Webinars, Courses, 1:1 coaching, and more.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Explore more apps section matching screenshot */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Explore more apps</h3>
          <button
            onClick={() => onSelectTab('explore-apps')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all 10+ apps</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => onSelectTab('apps-superlinks')}
            className="bg-white border border-slate-200 hover:border-blue-400 p-4 rounded-2xl shadow-sm cursor-pointer transition"
          >
            <div className="text-2xl mb-2">🔗</div>
            <h4 className="text-sm font-bold text-slate-900">Create PrimeLinks</h4>
            <p className="text-xs text-slate-500 mt-1">Shorten links & open apps directly on mobile.</p>
          </div>

          <div
            onClick={() => onSelectTab('apps-paymentpages')}
            className="bg-white border border-slate-200 hover:border-blue-400 p-4 rounded-2xl shadow-sm cursor-pointer transition"
          >
            <div className="text-2xl mb-2">📁</div>
            <h4 className="text-sm font-bold text-slate-900">Sell Digital Products</h4>
            <p className="text-xs text-slate-500 mt-1">Sell videos, photos, guides, e-books & templates.</p>
          </div>

          <div
            onClick={() => onSelectTab('learn')}
            className="bg-white border border-slate-200 hover:border-blue-400 p-4 rounded-2xl shadow-sm cursor-pointer transition"
          >
            <div className="text-2xl mb-2">🎓</div>
            <h4 className="text-sm font-bold text-slate-900">Launch your Course</h4>
            <p className="text-xs text-slate-500 mt-1">Create and sell full-length masterclasses.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
