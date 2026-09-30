import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ExternalLink,
  ShoppingBag,
  CreditCard,
  GraduationCap,
  Calendar,
  Lock,
  ArrowRight,
  Share2,
  Check,
  Instagram,
  Youtube,
  Send,
  Sparkles,
  Download,
  CheckCircle2,
  ChevronRight,
  Eye
} from 'lucide-react';
import { CreatorProfile, StoreLink, DigitalProduct, PaymentPage, Course, BookingService, LeadMagnet, LockedContentItem } from '../types';
import confetti from 'canvas-confetti';
import { PrimeProfileLogo } from './PrimeProfileLogo';

interface PublicStoreViewProps {
  targetUsername: string;
  onNavigate: (route: string) => void;
}

export const PublicStoreView: React.FC<PublicStoreViewProps> = ({ targetUsername, onNavigate }) => {
  const { loadCreatorByUsername, recordPublicOrder, recordLeadSubmission } = useAuth();

  const [creatorData, setCreatorData] = useState<{
    profile: CreatorProfile | null;
    links: StoreLink[];
    products: DigitalProduct[];
    paymentPages: PaymentPage[];
    courses: Course[];
    bookings: BookingService[];
    leadMagnets: LeadMagnet[];
    lockedContents: LockedContentItem[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeLeadModal, setActiveLeadModal] = useState<LeadMagnet | null>(null);
  const [activeUnlockModal, setActiveUnlockModal] = useState<LockedContentItem | null>(null);
  const [unlockedSecrets, setUnlockedSecrets] = useState<Record<string, string>>({});

  // Lead opt-in form
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSuccess, setLeadSuccess] = useState(false);

  // Paywall unlock form
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [unlockSuccess, setUnlockSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const data = await loadCreatorByUsername(targetUsername);
      if (isMounted) {
        if (data && data.profile) {
          setCreatorData(data as any);
        }
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [targetUsername]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLeadModal || !leadEmail) return;

    await recordLeadSubmission(activeLeadModal.id, {
      name: leadName || 'Visitor',
      email: leadEmail,
      phone: leadPhone,
    });

    confetti({ particleCount: 80, spread: 60 });
    setLeadSuccess(true);
  };

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUnlockModal || !buyerEmail) return;

    await recordPublicOrder(
      {
        customerName: buyerName || 'Customer',
        customerEmail: buyerEmail,
        customerPhone: buyerPhone,
        itemType: 'locked_content',
        itemId: activeUnlockModal.id,
        itemTitle: activeUnlockModal.title,
        amount: activeUnlockModal.price,
        currency: activeUnlockModal.currency,
        status: 'Successful',
        paymentMethod: 'UPI / Card',
      },
      { name: buyerName, email: buyerEmail, phone: buyerPhone }
    );

    setUnlockedSecrets(prev => ({
      ...prev,
      [activeUnlockModal.id]: activeUnlockModal.secretContent,
    }));

    confetti({ particleCount: 100, spread: 70 });
    setUnlockSuccess(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading creator store...</span>
        </div>
      </div>
    );
  }

  const profile = creatorData?.profile;
  const links = creatorData?.links || [];
  const products = creatorData?.products || [];
  const allPaymentPages = creatorData?.paymentPages || [];
  // Only APPROVED & published payment links are live on the website
  const livePaymentPages = allPaymentPages.filter(p => p.moderationStatus === 'approved' && p.published !== false);
  const pendingPaymentPages = allPaymentPages.filter(p => p.moderationStatus === 'pending');
  const courses = creatorData?.courses || [];
  const bookings = creatorData?.bookings || [];
  const leadMagnets = creatorData?.leadMagnets || [];
  const lockedContents = creatorData?.lockedContents || [];

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black text-slate-800">Creator Profile Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">
          No bio store found at primeprofile.bio/{targetUsername}. You can claim this username today!
        </p>
        <button
          onClick={() => onNavigate('signup')}
          className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
        >
          Claim primeprofile.bio/{targetUsername}
        </button>
      </div>
    );
  }

  const themeClasses =
    profile.theme === 'dark'
      ? 'bg-slate-950 text-white'
      : profile.theme === 'neon'
      ? 'bg-[#0f0728] text-white'
      : profile.theme === 'emerald'
      ? 'bg-[#061e14] text-white'
      : profile.theme === 'sunset'
      ? 'bg-gradient-to-b from-[#2a0845] to-[#6441a5] text-white'
      : profile.theme === 'minimal'
      ? 'bg-slate-50 text-slate-900'
      : 'bg-[#0f141c] text-white';

  const cardClasses =
    profile.theme === 'minimal'
      ? 'bg-white border border-slate-200 text-slate-900 shadow-sm hover:border-blue-400'
      : 'bg-white/10 backdrop-blur-md border border-white/15 text-white hover:bg-white/15 shadow-lg';

  return (
    <div
      className={`min-h-screen py-10 px-4 transition-colors font-sans`}
      style={{ fontFamily: profile.fontFamily || 'Poppins' }}
    >
      <div className={`${themeClasses} fixed inset-0 -z-10`} />

      <div className="max-w-md mx-auto space-y-6">
        {/* Creator Bio Header */}
        <div className="text-center pt-4">
          <div className="relative inline-block">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white/20 shadow-xl"
            />
            <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full shadow">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>

          <h1 className="mt-3 text-xl font-black tracking-tight">{profile.name}</h1>
          <p className="text-xs opacity-75 font-mono">@{profile.username}</p>
          <p className="mt-2.5 text-xs opacity-90 leading-relaxed px-4">{profile.bio}</p>

          {/* Social Icons row */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {profile.socials?.instagram && (
              <a
                href={profile.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {profile.socials?.youtube && (
              <a
                href={profile.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
            {profile.socials?.telegram && (
              <a
                href={profile.socials.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <Send className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Free Lead Magnets banner */}
        {leadMagnets.length > 0 && (
          <div className="space-y-2">
            {leadMagnets.map((mag) => (
              <div
                key={mag.id}
                onClick={() => {
                  setActiveLeadModal(mag);
                  setLeadSuccess(false);
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xl cursor-pointer hover:opacity-95 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl">🎁</span>
                  <div className="min-w-0">
                    <div className="text-xs font-black uppercase tracking-wider text-rose-200">Free Instant Access</div>
                    <div className="text-xs font-bold truncate">{mag.title}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Main Store Links */}
        <div className="space-y-3">
          {links.map((link) => {
            if (!link.enabled) return null;

            if (link.type === 'header') {
              return (
                <div key={link.id} className="text-center text-[11px] font-black uppercase tracking-widest opacity-60 pt-4 pb-1">
                  {link.title}
                </div>
              );
            }

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                  link.type === 'highlight'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                    : cardClasses
                }`}
              >
                <span className="truncate">{link.title}</span>
                <ExternalLink className="w-4 h-4 opacity-70 ml-2 shrink-0" />
              </a>
            );
          })}
        </div>

        {/* Digital Products Section */}
        {products.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-center text-[11px] font-black uppercase tracking-widest opacity-60">
              Digital Products & E-Books
            </div>
            {products.map((prod) => (
              <div
                key={prod.id}
                onClick={() => onNavigate(`checkout-product-${prod.id}?creator=${encodeURIComponent(creatorData?.profile?.uid || "")}`)}
                className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition ${cardClasses}`}
              >
                <img
                  src={prod.coverImage}
                  alt={prod.title}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 shadow"
                />
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-xs font-bold line-clamp-1">{prod.title}</h4>
                  <p className="text-[11px] opacity-75 line-clamp-1 mt-0.5">{prod.description}</p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-sm font-extrabold text-emerald-400">
                      {prod.currency}{prod.price}
                    </span>
                    {prod.originalPrice && (
                      <span className="text-[10px] line-through opacity-50">
                        {prod.currency}{prod.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer shrink-0">
                  Buy
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Payment Pages (Sample Boxes, Sponsoring, Orders) */}
        {livePaymentPages.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-center text-[11px] font-black uppercase tracking-widest opacity-60">
              Featured Payment Pages
            </div>
            {livePaymentPages.map((page) => (
              <div
                key={page.id}
                onClick={() => onNavigate(`pay-${page.id}?creator=${encodeURIComponent(creatorData?.profile?.uid || "")}`)}
                className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition ${cardClasses}`}
              >
                <img
                  src={page.coverImage}
                  alt={page.title}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 shadow"
                />
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-xs font-bold line-clamp-1">{page.title}</h4>
                  <p className="text-[11px] opacity-75 line-clamp-1 mt-0.5">{page.description}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-extrabold text-emerald-400">
                      {page.currency}{page.price}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                      Live
                    </span>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl border border-white/20 shadow cursor-pointer shrink-0">
                  Order
                </button>
              </div>
            ))}
          </div>
        )}

        {/* If there are pending payment link requests waiting for approval in Admin Panel */}
        {pendingPaymentPages.length > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-300/60 rounded-2xl text-xs space-y-1.5 text-left shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{pendingPaymentPages.length} Payment Link Request(s) Pending Approval</span>
              </span>
              <button
                onClick={() => onNavigate('admin-panel')}
                className="font-bold text-[11px] text-amber-900 hover:text-amber-700 underline cursor-pointer"
              >
                Admin Panel →
              </button>
            </div>
            <p className="text-[10px] text-amber-800 leading-tight">
              Admin panel se approve hone ke baad hi ye payment link public buyers ke liye live hogi.
            </p>
          </div>
        )}

        {/* Courses Section */}
        {courses.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-center text-[11px] font-black uppercase tracking-widest opacity-60">
              Masterclasses & Courses
            </div>
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => onNavigate(`course-${course.id}`)}
                className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition ${cardClasses}`}
              >
                <img
                  src={course.coverImage}
                  alt={course.title}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 shadow"
                />
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded">
                    COURSE
                  </span>
                  <h4 className="text-xs font-bold line-clamp-1 mt-1">{course.title}</h4>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-sm font-extrabold text-emerald-400">
                      {course.currency}{course.price}
                    </span>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer shrink-0">
                  Enroll
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 1:1 Bookings Section */}
        {bookings.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-center text-[11px] font-black uppercase tracking-widest opacity-60">
              1:1 Consultations & Audits
            </div>
            {bookings.map((b) => (
              <div
                key={b.id}
                onClick={() => onNavigate(`booking-${b.id}?creator=${encodeURIComponent(creatorData?.profile?.uid || "")}`)}
                className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition ${cardClasses}`}
              >
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-[10px] text-blue-400 font-bold">{b.durationMinutes} Mins • {b.locationType}</div>
                  <h4 className="text-xs font-bold line-clamp-1 mt-0.5">{b.title}</h4>
                  <div className="mt-1">
                    <span className="text-sm font-extrabold text-emerald-400">{b.currency}{b.price}</span>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer shrink-0">
                  Book Slot
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Locked Content Paywalls */}
        {lockedContents.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-center text-[11px] font-black uppercase tracking-widest opacity-60">
              Locked Exclusive Resources
            </div>
            {lockedContents.map((lock) => {
              const isUnlocked = Boolean(unlockedSecrets[lock.id]);

              return (
                <div
                  key={lock.id}
                  className={`p-4 rounded-2xl text-left transition ${cardClasses}`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lock.title}</span>
                    </h4>
                    <span className="text-xs font-extrabold text-amber-400">{lock.currency}{lock.price}</span>
                  </div>

                  <p className="text-[11px] opacity-75 mt-1.5 leading-relaxed">{lock.previewText}</p>

                  {isUnlocked ? (
                    <div className="mt-3 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs space-y-1">
                      <div className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Content Unlocked:
                      </div>
                      <pre className="font-mono text-[11px] whitespace-pre-wrap text-emerald-200">
                        {unlockedSecrets[lock.id]}
                      </pre>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveUnlockModal(lock);
                        setUnlockSuccess(false);
                      }}
                      className="mt-3 w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow cursor-pointer"
                    >
                      Unlock for {lock.currency}{lock.price} 🔓
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Brand watermark */}
        <div className="pt-8 pb-6 flex flex-col items-center justify-center text-xs opacity-80 space-y-2">
          <div
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-sm cursor-pointer hover:opacity-100 transition shadow-sm border border-black/5 dark:border-white/10"
          >
            <span className="text-[10px] font-medium opacity-70">Powered by</span>
            <PrimeProfileLogo size="sm" variant={profile.theme === 'dark' ? 'dark' : 'light'} />
          </div>
          <div>
            <button
              onClick={() => onNavigate('signup')}
              className="text-[11px] opacity-70 hover:opacity-100 hover:underline cursor-pointer"
            >
              Claim your free bio store →
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Lead Magnet Opt-in */}
      {activeLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-center">
              <span className="text-3xl">🎁</span>
              <h3 className="text-base font-bold text-slate-900 mt-2">{activeLeadModal.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{activeLeadModal.description}</p>
            </div>

            {leadSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-emerald-900">Access Granted!</h4>
                <p className="text-[11px] text-emerald-700">
                  We've emailed your download link. You can also access it instantly below:
                </p>
                <a
                  href={activeLeadModal.freebieUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  Download Freebie Now
                </a>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveLeadModal(null)}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow"
                  >
                    {activeLeadModal.buttonText}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Locked Content Paywall Checkout */}
      {activeUnlockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-center">
              <span className="text-3xl">🔓</span>
              <h3 className="text-base font-bold text-slate-900 mt-2">Unlock: {activeUnlockModal.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{activeUnlockModal.previewText}</p>
              <div className="mt-2 text-xl font-black text-slate-900">
                {activeUnlockModal.currency}{activeUnlockModal.price}
              </div>
            </div>

            {unlockSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-emerald-900">Payment Successful!</h4>
                <p className="text-[11px] text-emerald-700">
                  Your secret resources are now unlocked on the page.
                </p>
                <button
                  onClick={() => setActiveUnlockModal(null)}
                  className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  View Secret Content
                </button>
              </div>
            ) : (
              <form onSubmit={handleUnlockSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email (For receipt)</label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Phone / UPI ID</label>
                  <input
                    type="text"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveUnlockModal(null)}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow cursor-pointer"
                  >
                    Pay & Unlock 🔓
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
