import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Zap,
  ShoppingBag,
  CreditCard,
  GraduationCap,
  Calendar,
  Lock,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  Globe,
  Star,
  Users,
  Play
} from 'lucide-react';
import { PrimeProfileLogo } from './PrimeProfileLogo';
import { UpgradeToCreatorPlanModal } from './UpgradeToCreatorPlanModal';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { loginWithDemo } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [demoLoading, setDemoLoading] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [modalDefaultPlan, setModalDefaultPlan] = useState<'creator' | 'pro'>('creator');

  const handleQuickDemo = async () => {
    setDemoLoading(true);
    await loginWithDemo();
    setDemoLoading(false);
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white text-xs sm:text-sm font-medium py-2 px-4 text-center flex items-center justify-center gap-2">
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase">New</span>
        <span>PrimeProfile 2.0 is live! Zero platform fee on your first ₹50,000 revenue.</span>
        <button
          onClick={handleQuickDemo}
          className="underline ml-2 hover:text-blue-100 font-semibold cursor-pointer"
        >
          Try Demo Account →
        </button>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div onClick={() => onNavigate('landing')}>
            <PrimeProfileLogo variant="light" size="md" />
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition">Features</a>
            <a href="#monetization" className="hover:text-blue-600 transition">Monetize</a>
            <a href="#demo" className="hover:text-blue-600 transition">Live Demo</a>
            <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('admin-panel')}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-xl transition border border-amber-300 cursor-pointer shadow-xs"
              title="Moderate and approve creator payment links"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Panel</span>
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 cursor-pointer transition"
            >
              Log In
            </button>
            <button
              onClick={handleQuickDemo}
              disabled={demoLoading}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition border border-blue-200 cursor-pointer"
            >
              {demoLoading ? 'Loading...' : 'Instant Demo'}
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-md shadow-blue-600/25 transition cursor-pointer"
            >
              Claim Your Link <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            The All-In-One Creator Store & Bio Link Ecosystem
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Monetize your audience with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">one powerful link</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Sell digital products, accept custom payments, deliver video courses, book 1:1 sessions, and collect leads directly from your Instagram & YouTube bio.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <div className="flex items-center bg-white border-2 border-blue-600/40 rounded-2xl shadow-xl shadow-blue-500/5 p-1.5 w-full">
              <span className="text-sm font-semibold text-slate-400 pl-3">primeprofile.bio/</span>
              <input
                type="text"
                placeholder="yourname"
                defaultValue="rohanstyle"
                id="hero-username-input"
                className="w-full px-2 py-2 text-sm font-semibold text-slate-800 focus:outline-none bg-transparent"
              />
              <button
                onClick={() => {
                  const val = (document.getElementById('hero-username-input') as HTMLInputElement)?.value || 'yourname';
                  onNavigate(`public-${val}`);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl whitespace-nowrap transition cursor-pointer shadow-md shadow-blue-600/20"
              >
                View Live
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Free Forever Tier</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Instant UPI & Cards</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Setup in 2 mins</span>
          </div>

          {/* Interactive Demo Showcase */}
          <div className="mt-14 relative max-w-5xl mx-auto" id="demo">
            <div className="bg-slate-900 rounded-3xl p-3 shadow-2xl border border-slate-800 ring-1 ring-white/10">
              <div className="bg-slate-950 rounded-2xl p-4 sm:p-6 text-left flex flex-col lg:flex-row items-center gap-8">
                {/* Mobile Preview Frame */}
                <div className="w-[280px] sm:w-[320px] bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-700 flex-shrink-0 relative">
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-950 rounded-full z-20" />
                  <div className="bg-slate-800 rounded-[28px] overflow-hidden p-4 text-center min-h-[500px] flex flex-col justify-between text-white border border-slate-700/50">
                    <div>
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                        alt="Avatar"
                        className="w-16 h-16 rounded-full mx-auto border-2 border-blue-500 object-cover mt-4 shadow-md"
                      />
                      <h4 className="mt-2 text-sm font-bold text-white">rohanstyle</h4>
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">Style Lookbooks, Presets & E-Commerce Masterclasses ✨</p>
                      
                      {/* Demo Store Links */}
                      <div className="mt-4 space-y-2">
                        <div className="bg-blue-600 text-white text-xs font-semibold py-2.5 px-3 rounded-xl shadow-md text-left flex items-center justify-between">
                          <span>📦 10 Sample Box Online</span>
                          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">₹190</span>
                        </div>
                        <div className="bg-slate-700/70 hover:bg-slate-700 text-white text-xs font-medium py-2.5 px-3 rounded-xl border border-slate-600/50 text-left flex items-center justify-between">
                          <span>📁 500+ Vendor Directory</span>
                          <span className="text-[10px] text-emerald-400 font-bold">₹499</span>
                        </div>
                        <div className="bg-slate-700/70 hover:bg-slate-700 text-white text-xs font-medium py-2.5 px-3 rounded-xl border border-slate-600/50 text-left flex items-center justify-between">
                          <span>🎓 E-Com Masterclass</span>
                          <span className="text-[10px] text-blue-300 font-bold">Course</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 pt-3 border-t border-slate-700/60 flex items-center justify-center gap-1">
                      <span>Powered by</span>
                      <strong className="text-white">PrimeProfile</strong>
                    </div>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="text-white space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                    <TrendingUp className="w-3.5 h-3.5" /> High Conversion Bio-Store
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Replace 6 different apps with 1 clean PrimeProfile dashboard
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                    Stop sending followers to clumsy WhatsApp chats, external Google Forms, or multiple checkout providers. With PrimeProfile, you keep 100% control of your customer data, revenue payouts, and brand appearance.
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xl font-bold text-white">₹1.8L+</div>
                      <div className="text-xs text-slate-400 mt-0.5">Avg. Monthly Creator Earnings</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xl font-bold text-white">4.2x</div>
                      <div className="text-xs text-slate-400 mt-0.5">Higher Click-To-Sale Rate</div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleQuickDemo}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-3 rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" /> Open Live Creator Dashboard
                    </button>
                    <button
                      onClick={() => onNavigate('public-rohanstyle')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm px-5 py-3 rounded-xl transition border border-slate-700 cursor-pointer"
                    >
                      Open Public Bio Store
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-white border-y border-slate-200" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Built For Creators & Coaches</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything you need to turn followers into paying customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 1. Bio Store Builder */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Custom Bio Store Builder</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Add links, headers, highlighted banners, social accounts, custom themes, fonts, and live mobile simulator preview.
              </p>
            </div>

            {/* 2. Digital Products */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sell Digital Products</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Deliver PDFs, templates, audio files, design assets, and zip files automatically upon customer checkout.
              </p>
            </div>

            {/* 3. Payment Pages */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Custom Payment Pages</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Build high-converting checkout landing pages for physical sample boxes, brand promotions, and services.
              </p>
            </div>

            {/* 4. Video Courses */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Courses & Masterclasses</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Organize lessons into modules and chapters with built-in video player, student tracker, and gated access.
              </p>
            </div>

            {/* 5. 1:1 Bookings */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1:1 Call Bookings</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Set your consulting fees, available days, and time slots. Syncs Google Meet / Zoom links automatically.
              </p>
            </div>

            {/* 6. Locked Content & Lead Magnets */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Locked Content & Leads</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Lock premium secret contacts or guides behind a micro-payment or collect verified emails and phone numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-50" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Simple Transparent Pricing</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Start for free, scale when you earn
            </p>
            <div className="mt-6 inline-flex p-1 bg-slate-200 rounded-xl">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-white shadow text-slate-900' : 'text-slate-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  billingCycle === 'yearly' ? 'bg-white shadow text-slate-900' : 'text-slate-600'
                }`}
              >
                Annual (Save 17%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* 1. Free Starter Plan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Starter Free</h3>
                <p className="text-xs text-slate-500 mt-1">Perfect for new creators launching their first bio link</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹0</span>
                  <span className="text-xs text-slate-500 font-semibold">/forever</span>
                </div>

                <ul className="mt-8 space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited Store Links</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1 Digital Product</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1 Payment Page</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Standard 10% Platform Fee</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 0% Fee on first ₹50,000</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> PrimeProfile watermark</li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('signup')}
                className="mt-8 w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-900 transition cursor-pointer"
              >
                Get Started Free
              </button>
            </div>

            {/* 2. Creator Plan (Exact match with logged-in Upgrade Modal) */}
            <div className="bg-white rounded-3xl p-8 border-2 border-blue-600 shadow-xl relative flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow">
                Most Popular
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Creator Plan</h3>
                  <span className="text-[11px] font-black bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                    Try for ₹99
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Full access to AutoDM, courses, digital downloads & lower 5% fee</p>
                <div className="mt-6">
                  {billingCycle === 'monthly' ? (
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-4xl font-black text-slate-900">₹499</span>
                      <span className="text-xs text-slate-500 font-semibold">/month.</span>
                      <span className="text-xs font-bold text-blue-600">Try for ₹99</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-slate-900">₹4,999</span>
                      <span className="text-xs text-slate-500 font-semibold">/year (Save 17%)</span>
                    </div>
                  )}
                </div>

                <ul className="mt-8 space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2.5 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>Unlimited access to Advance AutoDM features</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>Sell Digital Products, Courses, Events & 1:1 bookings</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>Unlimited Leads via Lead Magnets</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>Reduced Platform Fee at 5%</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>Priority Next-Day Payment Settlements</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>Custom Themes, Fonts & Buttons</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setModalDefaultPlan('creator');
                  setIsUpgradeModalOpen(true);
                }}
                className="mt-8 w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upgrade to Creator (Try for ₹99)</span>
              </button>
            </div>

            {/* 3. Pro Plan (Exact match with logged-in Upgrade Modal) */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Pro Plan</h3>
                  <span className="text-[11px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full">
                    0% Commission
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">For scale creators who want 0% fee, custom domains & white-label</p>
                <div className="mt-6">
                  {billingCycle === 'monthly' ? (
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-4xl font-black text-slate-900">₹999</span>
                      <span className="text-xs text-slate-500 font-semibold">/month.</span>
                      <span className="text-xs font-bold text-indigo-600">Try for ₹199</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-slate-900">₹9,999</span>
                      <span className="text-xs text-slate-500 font-semibold">/year (Save 17%)</span>
                    </div>
                  )}
                </div>

                <ul className="mt-8 space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2.5 font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>0% Platform Fee on all creator earnings</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>Custom Domain connection (yourbrand.com)</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>White-label Bio Store (remove watermark)</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>Dedicated 24/7 Priority Account Manager</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>Instant VIP Payout Settlements</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>Multi-user team & staff access</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setModalDefaultPlan('pro');
                  setIsUpgradeModalOpen(true);
                }}
                className="mt-8 w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Upgrade to Pro (Try for ₹199)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <PrimeProfileLogo variant="dark" size="sm" />
            <span className="text-xs text-slate-500">© 2026 PrimeProfile Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <span className="hover:text-white cursor-pointer" onClick={() => onNavigate('login')}>Creator Login</span>
            <span className="hover:text-white cursor-pointer" onClick={() => onNavigate('signup')}>Create Store</span>
            <span className="hover:text-white cursor-pointer" onClick={() => onNavigate('public-rohanstyle')}>Live Bio Demo</span>
          </div>
        </div>
      </footer>

      {/* Interactive Upgrade Modal matching the post-login experience */}
      <UpgradeToCreatorPlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        defaultPlan={modalDefaultPlan}
      />
    </div>
  );
};
