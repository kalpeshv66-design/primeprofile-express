import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  LayoutDashboard,
  Store,
  CreditCard,
  GraduationCap,
  Users,
  Coins,
  Share2,
  ExternalLink,
  ChevronDown,
  LogOut,
  Settings,
  Sparkles,
  Link as LinkIcon,
  Magnet,
  Calendar,
  Lock,
  MessageCircle,
  HelpCircle,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { PrimeProfileLogo } from './PrimeProfileLogo';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNavigate: (route: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onNavigate }) => {
  const { profile, logout, isDemoUser, paymentPages, orders } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const pendingRequestsCount = paymentPages?.filter(p => p.moderationStatus === 'pending').length || 0;
  const pendingPayoutsCount = orders?.filter(o => o.status === 'Successful' && o.payoutStatus !== 'paid').length || 0;
  const totalPendingAdminTasks = pendingRequestsCount + pendingPayoutsCount;

  const username = profile?.username || 'rohanstyle';
  const name = profile?.name || 'Creator';
  const avatar = profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  const mainNavItems = [
    { id: 'getting-started', label: 'Getting Started', icon: LayoutDashboard },
    { id: 'store', label: 'Store', icon: Store },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    {
      id: 'admin-panel',
      label: 'Admin Panel',
      icon: ShieldCheck,
      badge: totalPendingAdminTasks > 0 ? `${totalPendingAdminTasks} Action${totalPendingAdminTasks > 1 ? 's' : ''}` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold animate-pulse',
    },
    { id: 'learn', label: 'Courses', icon: GraduationCap },
    { id: 'audience', label: 'Audience', icon: Users },
    { id: 'refer-earn', label: 'Refer & Earn', icon: Coins },
  ];

  const appNavItems = [
    { id: 'apps-autodm', label: 'AutoDM', icon: MessageCircle, badge: 'Growth' },
    { id: 'apps-superlinks', label: 'PrimeLinks', icon: LinkIcon, badge: 'Growth' },
    { id: 'apps-leadmagnet', label: 'Lead Magnet', icon: Magnet, badge: 'Growth' },
    { id: 'apps-paymentpages', label: 'Payment Pages', icon: CreditCard, badge: 'Earning' },
    { id: 'apps-bookings', label: 'Bookings', icon: Calendar, badge: '1:1' },
    { id: 'apps-lockedcontent', label: 'Locked Content', icon: Lock, badge: 'Paywall' },
  ];

  const handleLogout = async () => {
    await logout();
    onNavigate('landing');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0b0f17] text-slate-300 border-r border-slate-800 w-64 select-none">
      {/* Brand logo with animated icon */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
        <div
          onClick={() => {
            onSelectTab('getting-started');
            setMobileSidebarOpen(false);
          }}
        >
          <PrimeProfileLogo variant="dark" size="md" />
        </div>
      </div>

      {/* Navigation Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {/* Main core pages */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* YOUR APPS SECTION */}
        <div>
          <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
            Your Apps
          </div>
          <div className="space-y-1">
            {appNavItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    active
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              onSelectTab('explore-apps');
              setMobileSidebarOpen(false);
            }}
            className="w-full mt-2.5 py-2 px-3 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl text-xs font-semibold text-center transition bg-slate-900/60 cursor-pointer"
          >
            Explore All Apps
          </button>
        </div>
      </div>

      {/* Free Plan Pro Banner in sidebar matching screenshot */}
      <div className="p-3 border-t border-slate-800/80">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#064e3b]/40 via-slate-900 to-slate-900 border border-emerald-500/30 relative overflow-hidden">
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {profile?.plan === 'creator'
              ? "You're on Creator Plan"
              : profile?.plan === 'pro'
              ? "You're on Pro Plan"
              : "You're on Free Plan"}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            {profile?.plan === 'creator'
              ? "Advanced features & 5% platform fee active."
              : profile?.plan === 'pro'
              ? "0% platform fee & unlimited features active."
              : "Unlock unlimited access to all features and get paid."}
          </p>
          <button
            onClick={() => onSelectTab('pricing-upgrade')}
            className="mt-3 w-full py-2 px-3 bg-white text-slate-950 text-xs font-black rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
          >
            <span>{profile?.plan ? 'Manage Plan' : 'Explore Now'}</span>
            <span>🚀</span>
          </button>
        </div>
      </div>

      {/* User profile dropdown in bottom-left footer matching screenshot */}
      <div className="p-3 border-t border-slate-800 relative">
        <div
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 cursor-pointer transition"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={avatar}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
            />
            <div className="min-w-0 text-left">
              <div className="text-xs font-bold text-white truncate">{name}</div>
              <div className="text-[10px] text-slate-400 truncate">@{username}</div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Profile Popover Menu */}
        {profileMenuOpen && (
          <div className="absolute bottom-16 left-3 right-3 bg-slate-900 border border-slate-700 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 text-xs font-medium">
            <div className="px-3 py-2 border-b border-slate-800 text-[11px] text-slate-400">
              Signed in as <strong className="text-white">@{username}</strong>
              {isDemoUser && <span className="ml-1 text-[10px] bg-blue-900 text-blue-300 px-1 rounded">Demo</span>}
            </div>
            <button
              onClick={() => {
                onSelectTab('admin-panel');
                setProfileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 cursor-pointer font-bold text-xs"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Moderation</span>
              </div>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                onSelectTab('account-settings');
                setProfileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <Settings className="w-4 h-4" /> Account Settings
            </button>
            <button
              onClick={() => {
                onNavigate(`public-${username}`);
                setProfileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" /> View Live Bio Store
            </button>
            <button
              onClick={() => {
                onSelectTab('store-settings');
                setProfileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Feature Request
            </button>
            <button
              onClick={() => {
                onSelectTab('getting-started');
                setProfileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" /> Help Center
            </button>
            <div className="my-1 border-t border-slate-800" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/40 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top trigger bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#0b0f17] text-white border-b border-slate-800 sticky top-0 z-30">
        <div
          onClick={() => {
            onSelectTab('getting-started');
            setMobileSidebarOpen(false);
          }}
        >
          <PrimeProfileLogo variant="dark" size="sm" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(`public-${username}`)}
            className="text-xs bg-slate-800 text-blue-400 px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Bio
          </button>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-200"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-10 w-72 max-w-full">
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0">
        {navContent}
      </div>
    </>
  );
};
