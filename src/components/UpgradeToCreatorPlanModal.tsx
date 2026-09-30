import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Check, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UpgradeToCreatorPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: 'creator' | 'pro';
}

export const UpgradeToCreatorPlanModal: React.FC<UpgradeToCreatorPlanModalProps> = ({
  isOpen,
  onClose,
  defaultPlan = 'creator'
}) => {
  const { profile, updateProfile } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState<'creator' | 'pro'>(defaultPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Processing state
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradedSuccess, setUpgradedSuccess] = useState(false);

  // Social proof rotating ticker (Matching Screenshot 2 & 3)
  const socialProofs = [
    { country: '🇮🇳', name: 'Manju', city: 'Gorakhpur', plan: 'creator', time: '10m ago' },
    { country: '🇮🇳', name: 'Akash', city: 'Udupi', plan: 'creator', time: '12m ago' },
    { country: '🇮🇳', name: 'Rohit', city: 'Surat', plan: 'creator', time: '4m ago' },
    { country: '🇮🇳', name: 'Sneha', city: 'Bengaluru', plan: 'pro', time: '8m ago' },
    { country: '🇮🇳', name: 'Kavita', city: 'Jaipur', plan: 'creator', time: '15m ago' },
  ];
  const [proofIndex, setProofIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setProofIndex((prev) => (prev + 1) % socialProofs.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();

    if (!code) return;

    if (code === 'CREATOR99' || code === 'PRIME99' || code === 'SAVE50') {
      setAppliedDiscount(50);
      setCouponSuccess('Coupon applied! 50% extra discount added.');
    } else if (code === 'SPECIAL' || code === 'VIP100') {
      setAppliedDiscount(100);
      setCouponSuccess('100% Promo applied for first month!');
    } else {
      setCouponError('Invalid coupon code. Try CREATOR99 or SAVE50');
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      if (profile) {
        await updateProfile({
          ...profile,
          plan: selectedPlan
        });
      }

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 }
      });

      setUpgradedSuccess(true);
      setTimeout(() => {
        setIsUpgrading(false);
        onClose();
        setUpgradedSuccess(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsUpgrading(false);
    }
  };

  const currentProof = socialProofs[proofIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-[480px] shadow-2xl overflow-hidden relative border border-slate-100 my-8">
        {/* Close Button Top Right (Matching Screenshot 2 & 3) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-sm transition cursor-pointer border border-slate-200/60"
        >
          <X className="w-4 h-4" />
        </button>

        {upgradedSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              Welcome to {selectedPlan === 'creator' ? 'Creator' : 'Pro'} Plan!
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              All advanced monetization tools, lower fees, and unlimited features are now active on your account.
            </p>
          </div>
        ) : (
          <>
            {/* Top Light Blue Gradient Banner with 3D Faceted Diamond (Exact Match) */}
            <div className="pt-8 pb-4 px-6 text-center relative bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-white">
              {/* Faceted Blue Gem/Diamond SVG */}
              <div className="mx-auto w-24 h-24 relative flex items-center justify-center mb-3">
                <svg
                  viewBox="0 0 120 120"
                  className="w-20 h-20 drop-shadow-[0_12px_20px_rgba(56,189,248,0.45)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Top Crown Facets */}
                  <polygon points="35,32 85,32 100,52 20,52" fill="#38bdf8" />
                  <polygon points="35,32 60,32 50,52 20,52" fill="#7dd3fc" />
                  <polygon points="60,32 85,32 100,52 70,52" fill="#0284c7" />
                  <polygon points="50,52 60,32 70,52" fill="#bae6fd" />

                  {/* Table (Flat top reflection) */}
                  <polygon points="42,32 78,32 68,44 52,44" fill="#f0f9ff" opacity="0.8" />

                  {/* Bottom Pavilion Facets */}
                  <polygon points="20,52 50,52 60,96" fill="#0284c7" />
                  <polygon points="50,52 70,52 60,96" fill="#38bdf8" />
                  <polygon points="70,52 100,52 60,96" fill="#0369a1" />
                  <polygon points="20,52 35,52 60,96" fill="#075985" opacity="0.6" />
                  <polygon points="85,52 100,52 60,96" fill="#0c4a6e" opacity="0.7" />

                  {/* Gleams / Highlights */}
                  <circle cx="48" cy="46" r="3" fill="#ffffff" opacity="0.9" />
                  <circle cx="72" cy="60" r="2.5" fill="#ffffff" opacity="0.8" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Upgrade to Creator Plan
              </h2>

              {/* Plan Switcher: Creator | Pro (Matching Screenshot 2 & 3) */}
              <div className="mt-5 max-w-[340px] mx-auto bg-slate-100 p-1 rounded-2xl flex items-center shadow-inner">
                <button
                  type="button"
                  onClick={() => setSelectedPlan('creator')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    selectedPlan === 'creator'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Creator
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan('pro')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    selectedPlan === 'pro'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Pro
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 pb-6 pt-1 space-y-5">
              {/* Billing Cycle Toggle: Monthly [switch] Annual */}
              <div className="flex items-center justify-center gap-3 text-xs font-semibold text-slate-600">
                <span className={billingCycle === 'monthly' ? 'text-slate-900 font-bold' : 'text-slate-400'}>
                  Monthly
                </span>
                <button
                  type="button"
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                    billingCycle === 'annual' ? 'bg-slate-900' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                      billingCycle === 'annual' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={billingCycle === 'annual' ? 'text-slate-900 font-bold' : 'text-slate-400'}>
                  Annual
                </span>
              </div>

              {/* Pricing Display (Matching Screenshot 2 & 3) */}
              <div className="text-center">
                {selectedPlan === 'creator' ? (
                  billingCycle === 'monthly' ? (
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="text-xl sm:text-2xl font-black text-slate-900">₹499</span>
                      <span className="text-xs text-slate-500 font-medium">/ month.</span>
                      <span className="text-xs font-bold text-slate-900">Try for ₹99.</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="text-xl sm:text-2xl font-black text-slate-900">₹4,999</span>
                      <span className="text-xs text-slate-500 font-medium">/ year</span>
                    </div>
                  )
                ) : (
                  /* Pro Plan Pricing */
                  billingCycle === 'monthly' ? (
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="text-xl sm:text-2xl font-black text-slate-900">₹999</span>
                      <span className="text-xs text-slate-500 font-medium">/ month.</span>
                      <span className="text-xs font-bold text-slate-900">Try for ₹199.</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="text-xl sm:text-2xl font-black text-slate-900">₹9,999</span>
                      <span className="text-xs text-slate-500 font-medium">/ year</span>
                    </div>
                  )
                )}
              </div>

              {/* Feature Checklist with Sky-Blue Checkmarks (Matching Screenshots 2 & 3) */}
              <div className="space-y-3 pt-1">
                {selectedPlan === 'creator' ? (
                  <>
                    <div className="flex items-start gap-3 text-xs text-slate-800">
                      <div className="text-sky-500 shrink-0 mt-0.5">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="font-bold leading-tight">Unlimited access to Advance AutoDM features</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-slate-800">
                      <div className="text-sky-500 shrink-0 mt-0.5">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="font-bold leading-tight">
                        Sell Digital Products, Courses, Events, 1:1 sessions, and more
                      </span>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-slate-800">
                      <div className="text-sky-500 shrink-0 mt-0.5">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="font-bold leading-tight">Unlimited Leads via Lead Magnets</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-slate-800">
                      <div className="text-sky-500 shrink-0 mt-0.5">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="font-bold leading-tight">Reduced Platform Fee at 5%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3 text-xs text-slate-800">
                      <div className="text-sky-500 shrink-0 mt-0.5">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="font-bold leading-tight">0% Platform Fee on all creator earnings</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-slate-800">
                      <div className="text-sky-500 shrink-0 mt-0.5">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="font-bold leading-tight">Custom Domain connection (yourbrand.com)</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-slate-800">
                      <div className="text-sky-500 shrink-0 mt-0.5">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="font-bold leading-tight">White-label Bio Store (remove PrimeProfile badge)</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-slate-800">
                      <div className="text-sky-500 shrink-0 mt-0.5">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="font-bold leading-tight">Dedicated 24/7 Priority Creator Account Manager</span>
                    </div>
                  </>
                )}
              </div>

              {/* Discount Code Box (Matching Screenshot 2 & 3) */}
              <div className="pt-1">
                {!showCouponInput ? (
                  <div
                    onClick={() => setShowCouponInput(true)}
                    className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between text-xs cursor-pointer hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-2 text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <Sparkles className="w-3 h-3 text-slate-600" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">Have a Discount Code?</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 hover:text-blue-600">Add</span>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="p-2 bg-white border border-slate-300 rounded-2xl flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-400 ml-2" />
                      <input
                        type="text"
                        placeholder="Enter coupon (e.g. CREATOR99)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full text-xs font-mono font-bold uppercase outline-none bg-transparent"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                    {couponSuccess && (
                      <p className="text-[11px] text-emerald-600 font-medium pl-2">{couponSuccess}</p>
                    )}
                    {couponError && (
                      <p className="text-[11px] text-rose-500 font-medium pl-2">{couponError}</p>
                    )}
                  </form>
                )}
              </div>

              {/* Primary Action Button (Matching Screenshot 2 & 3) */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isUpgrading ? (
                    <span>Processing Upgrade...</span>
                  ) : billingCycle === 'monthly' ? (
                    <span>Start at just ₹99 for the first month</span>
                  ) : (
                    <span>Upgrade to {selectedPlan === 'creator' ? 'Creator Plan' : 'Pro Plan'}</span>
                  )}
                </button>

                {/* Subtext below button */}
                <div className="text-[11px] text-slate-400 text-center leading-relaxed">
                  {billingCycle === 'monthly' ? (
                    <span>You'll be charged ₹499 from the next month. We'll remind you. Cancel anytime.</span>
                  ) : (
                    <span>Save instantly – get 12 months for less than what you'd spend monthly.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Social Proof Live Banner at Bottom (Matching Screenshot 2 & 3) */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5 truncate">
                <span>{currentProof.country}</span>
                <span className="font-semibold text-slate-800">{currentProof.name},</span>
                <span className="text-slate-500">from {currentProof.city},</span>
                <span className="text-slate-600">just purchased the {currentProof.plan} plan</span>
              </div>
              <span className="text-slate-400 shrink-0 font-medium text-[10px] ml-2">
                {currentProof.time}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
