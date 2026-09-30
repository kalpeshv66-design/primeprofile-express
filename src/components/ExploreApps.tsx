import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MessageCircle,
  Link as LinkIcon,
  Magnet,
  CreditCard,
  Calendar,
  GraduationCap,
  Lock,
  Send,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

interface ExploreAppsProps {
  onSelectTab: (tab: string) => void;
}

export const ExploreApps: React.FC<ExploreAppsProps> = ({ onSelectTab }) => {
  const { profile, updateProfile } = useAuth();
  const [toggleState, setToggleState] = useState(
    profile?.enabledApps || {
      autoDm: true,
      superLinks: true,
      leadMagnet: true,
      paymentPages: true,
      bookings: true,
      courses: true,
      events: true,
      lockedContent: true,
      communities: true,
    }
  );

  const toggleApp = async (key: keyof typeof toggleState) => {
    const updated = { ...toggleState, [key]: !toggleState[key] };
    setToggleState(updated);
    await updateProfile({ enabledApps: updated });
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Title Header matching screenshot #9 & #10 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Explore All Apps</h1>
        <p className="text-xs text-slate-500 mt-1">Supercharge your creator business with growth automations and monetization tools.</p>
      </div>

      {/* SECTION 1: FOR GROWTH */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">For Growth</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AutoDM */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 hover:border-slate-300 transition">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">AutoDM</h4>
                <p className="text-xs text-slate-500 mt-0.5">Set Instagram automations to engage with audience.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('apps-autodm')}
                className="text-xs font-bold text-blue-600 hover:underline mr-1 cursor-pointer"
              >
                Configure
              </button>
              <button
                onClick={() => toggleApp('autoDm')}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  toggleState.autoDm ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    toggleState.autoDm ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* PrimeLinks */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 hover:border-slate-300 transition">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-sm">
                <LinkIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">PrimeLinks</h4>
                <p className="text-xs text-slate-500 mt-0.5">Shorten or enable open in app for any of your URLs.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('apps-superlinks')}
                className="text-xs font-bold text-blue-600 hover:underline mr-1 cursor-pointer"
              >
                Open
              </button>
              <button
                onClick={() => toggleApp('superLinks')}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  toggleState.superLinks ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    toggleState.superLinks ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Lead Magnets */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 hover:border-slate-300 transition">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
                <Magnet className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Lead Magnets</h4>
                <p className="text-xs text-slate-500 mt-0.5">Run giveaway campaigns or take unlimited registrations.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('apps-leadmagnet')}
                className="text-xs font-bold text-blue-600 hover:underline mr-1 cursor-pointer"
              >
                Manage
              </button>
              <button
                onClick={() => toggleApp('leadMagnet')}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  toggleState.leadMagnet ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    toggleState.leadMagnet ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: FOR MONETIZATION */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">For Monetization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment Pages */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 hover:border-slate-300 transition">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-sm">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Payment Pages</h4>
                <p className="text-xs text-slate-500 mt-0.5">Sell E-books, PDF files, Images, videos, and more.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('apps-paymentpages')}
                className="text-xs font-bold text-blue-600 hover:underline mr-1 cursor-pointer"
              >
                Manage
              </button>
              <button
                onClick={() => toggleApp('paymentPages')}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  toggleState.paymentPages ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    toggleState.paymentPages ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 hover:border-slate-300 transition">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Bookings</h4>
                <p className="text-xs text-slate-500 mt-0.5">Set up a new 1-on-1 session to offer to your visitors.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('apps-bookings')}
                className="text-xs font-bold text-blue-600 hover:underline mr-1 cursor-pointer"
              >
                Manage
              </button>
              <button
                onClick={() => toggleApp('bookings')}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  toggleState.bookings ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    toggleState.bookings ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Courses */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 hover:border-slate-300 transition">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Courses</h4>
                <p className="text-xs text-slate-500 mt-0.5">Sell access to your video collection or online classes.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('apps-courses')}
                className="text-xs font-bold text-blue-600 hover:underline mr-1 cursor-pointer"
              >
                Manage
              </button>
              <button
                onClick={() => toggleApp('courses')}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  toggleState.courses ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    toggleState.courses ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Locked Content */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 hover:border-slate-300 transition">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Locked Content</h4>
                <p className="text-xs text-slate-500 mt-0.5">Lock any file or secret for a price. Visitors unlock to view.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('apps-lockedcontent')}
                className="text-xs font-bold text-blue-600 hover:underline mr-1 cursor-pointer"
              >
                Manage
              </button>
              <button
                onClick={() => toggleApp('lockedContent')}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  toggleState.lockedContent ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    toggleState.lockedContent ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Suggest feature footer note matching screenshot */}
      <div className="text-center text-xs text-slate-400 pt-4">
        Got an app idea for PrimeProfile?{' '}
        <a
          href="mailto:support@primeprofile.bio?subject=New%20App%20Suggestion%20for%20PrimeProfile"
          className="text-blue-600 hover:underline cursor-pointer font-semibold"
        >
          Tell us about it here
        </a>
      </div>
    </div>
  );
};
