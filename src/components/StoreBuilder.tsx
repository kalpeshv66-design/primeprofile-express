import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ExternalLink,
  Copy,
  Share2,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Check,
  Palette,
  BarChart3,
  Settings,
  Layers,
  Sparkles,
  Smartphone,
  Globe,
  ArrowUpRight,
  TrendingUp,
  Clock,
  MousePointer,
  HelpCircle,
  Upload,
  Link as LinkIcon,
  Camera,
  X
} from 'lucide-react';
import { StoreLink } from '../types';
import { AccountSettings } from './AccountSettings';
import { PrimeProfileLogo } from './PrimeProfileLogo';

interface StoreBuilderProps {
  initialSubTab?: 'store' | 'appearance' | 'analytics' | 'settings';
  onNavigate: (route: string) => void;
}

export const StoreBuilder: React.FC<StoreBuilderProps> = ({ initialSubTab = 'store', onNavigate }) => {
  const {
    profile,
    updateProfile,
    links,
    addLink,
    updateLink,
    deleteLink,
    products,
    paymentPages,
    courses,
    leadMagnets
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'store' | 'appearance' | 'analytics' | 'settings'>(initialSubTab);
  const [copied, setCopied] = useState(false);

  // New Content Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contentType, setContentType] = useState<'link' | 'header' | 'highlight'>('link');
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Edit Link Modal
  const [editingLink, setEditingLink] = useState<StoreLink | null>(null);

  // Header customization modal
  const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
  const [headerName, setHeaderName] = useState(profile?.name || '');
  const [headerBio, setHeaderBio] = useState(profile?.bio || '');
  const [headerAvatar, setHeaderAvatar] = useState(profile?.avatarUrl || '');
  const [avatarFileName, setAvatarFileName] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Sync state when modal opens or profile changes
  React.useEffect(() => {
    if (profile) {
      setHeaderName(profile.name || '');
      setHeaderBio(profile.bio || '');
      setHeaderAvatar(profile.avatarUrl || '');
    }
  }, [profile, isEditHeaderOpen]);

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please choose an image file (PNG, JPG, WEBP, GIF, etc.)');
        return;
      }
      setIsUploadingAvatar(true);
      setAvatarFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setHeaderAvatar(event.target.result as string);
        }
        setIsUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const username = profile?.username || 'rohanstyle';
  const publicStoreUrl = `https://primeprofile.bio/${username}`;

  const copyStoreLink = () => {
    navigator.clipboard.writeText(publicStoreUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addLink({
      title: newTitle.trim(),
      url: contentType === 'header' ? '' : (newUrl.trim() || 'https://'),
      type: contentType,
      enabled: true,
    });

    setNewTitle('');
    setNewUrl('');
    setIsAddModalOpen(false);
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;
    await updateLink(editingLink.id, {
      title: editingLink.title,
      url: editingLink.url,
      enabled: editingLink.enabled,
    });
    setEditingLink(null);
  };

  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: headerName,
      bio: headerBio,
      avatarUrl: headerAvatar,
    });
    setIsEditHeaderOpen(false);
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Bar with Tabs and Public URL pill matching screenshot */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-3 gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition ${
              activeTab === 'store'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Store
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition ${
              activeTab === 'appearance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition ${
              activeTab === 'analytics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Share & Live Link Widget */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm text-xs text-slate-700">
            <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <span className="font-mono truncate max-w-[200px]">{publicStoreUrl}</span>
            <button
              onClick={copyStoreLink}
              title="Copy Store URL"
              className="ml-2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <button
            onClick={() => onNavigate(`public-${username}`)}
            className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Open Bio</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STORE BUILDER */}
      {activeTab === 'store' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Store Configuration */}
          <div className="lg:col-span-7 space-y-5">
            {/* Live Store Banner matching screenshot */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-blue-950 truncate">
                <span className="text-base">🚀</span>
                <span className="truncate">Your Store is live: <strong className="font-mono">{publicStoreUrl}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsEditHeaderOpen(true)}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 rounded-lg cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={copyStoreLink}
                  className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm cursor-pointer"
                >
                  {copied ? 'Copied!' : 'Share Link'}
                </button>
              </div>
            </div>

            {/* Profile Header Info Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt="Avatar"
                  className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{profile?.name || username}</h3>
                  <p className="text-xs text-slate-500 font-mono">@{username}</p>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm line-clamp-1">{profile?.bio}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditHeaderOpen(true)}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit header</span>
              </button>
            </div>

            {/* Checklist: Get the most out of your Store matching screenshot */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Get the most out of your Store</h4>
                  <p className="text-xs text-slate-500">Use the following steps to elevate your store experience</p>
                </div>
                <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="Video Guide"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0" />
                  <span>Showcase your content by adding links</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0" />
                  <span>Add Lead Magnet to collect leads and grow audience</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0" />
                  <span>Create and sell products</span>
                </div>
              </div>
            </div>

            {/* + Add Content Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setContentType('link');
                  setIsAddModalOpen(true);
                }}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Content</span>
              </button>
              <button
                onClick={() => {
                  setContentType('header');
                  setIsAddModalOpen(true);
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition cursor-pointer"
              >
                Add a Header
              </button>
            </div>

            {/* Store Links List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                <span>Active Store Links & Sections ({links.length})</span>
                <span>Clicks</span>
              </div>

              {links.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
                  <LinkIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No links added yet. Click "+ Add Content" to get started.</p>
                </div>
              ) : (
                links.map((link) => (
                  <div
                    key={link.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between gap-3 hover:border-slate-300 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-slate-300 cursor-grab">⋮⋮</div>
                      <div className="min-w-0">
                        {link.type === 'header' ? (
                          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Header: {link.title}
                          </span>
                        ) : (
                          <>
                            <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                              {link.type === 'highlight' && (
                                <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                                  Highlight
                                </span>
                              )}
                              <span>{link.title}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono truncate">{link.url}</div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {link.clicks || 0}
                      </span>
                      <button
                        onClick={() => setEditingLink(link)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition cursor-pointer"
                        title="Edit link"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteLink(link.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        title="Delete link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Live Mobile Simulator Preview matching screenshot */}
          <div className="lg:col-span-5 flex flex-col items-center sticky top-6">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Live Mobile Bio Simulator</span>
            </div>

            {/* Mobile Device Mockup */}
            <div className="w-[310px] sm:w-[340px] bg-slate-900 rounded-[44px] p-3.5 shadow-2xl border-4 border-slate-800 relative">
              {/* Dynamic Island / Speaker */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full z-20" />

              {/* Screen Body */}
              <div
                className={`w-full min-h-[560px] rounded-[34px] overflow-hidden p-4 flex flex-col justify-between transition-colors shadow-inner ${
                  profile?.theme === 'dark'
                    ? 'bg-slate-950 text-white'
                    : profile?.theme === 'neon'
                    ? 'bg-purple-950 text-white'
                    : profile?.theme === 'emerald'
                    ? 'bg-emerald-950 text-white'
                    : 'bg-[#181d26] text-white'
                }`}
                style={{ fontFamily: profile?.fontFamily || 'Poppins' }}
              >
                <div>
                  {/* Top user header */}
                  <div className="text-center pt-8">
                    <img
                      src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-white/20 shadow-lg"
                    />
                    <h3 className="mt-3 text-sm font-bold text-white tracking-tight">{profile?.name || username}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">@{username}</p>
                    {profile?.bio && (
                      <p className="text-[11px] text-slate-300 mt-2 px-3 line-clamp-3 leading-relaxed">
                        {profile.bio}
                      </p>
                    )}
                  </div>

                  {/* Links & Content in simulator */}
                  <div className="mt-6 space-y-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {links.map((link) => {
                      if (!link.enabled) return null;
                      if (link.type === 'header') {
                        return (
                          <div key={link.id} className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-2 pb-1">
                            {link.title}
                          </div>
                        );
                      }
                      return (
                        <div
                          key={link.id}
                          className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold text-center transition flex items-center justify-between ${
                            link.type === 'highlight'
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                              : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                          }`}
                        >
                          <span className="truncate flex-1">{link.title}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-60 ml-1.5 shrink-0" />
                        </div>
                      );
                    })}

                    {/* Show quick sample product button in simulator */}
                    {products.length > 0 && (
                      <div className="pt-2">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 px-1">Featured Product</div>
                        <div className="bg-white/10 border border-white/15 p-2 rounded-xl flex items-center gap-2 text-left">
                          <img
                            src={products[0].coverImage}
                            alt="Cover"
                            className="w-9 h-9 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-bold truncate text-white">{products[0].title}</div>
                            <div className="text-[10px] text-emerald-400 font-bold">₹{products[0].price}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer in mobile simulator */}
                <div className="pt-4 pb-1 text-center border-t border-white/10 space-y-2">
                  <div className="flex justify-center">
                    <PrimeProfileLogo size="xs" variant="dark" />
                  </div>
                  <button
                    onClick={() => onNavigate(`public-${username}`)}
                    className="text-[10px] text-slate-400 hover:text-white transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    <span>Open Live Store</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPEARANCE (matching screenshot #3) */}
      {activeTab === 'appearance' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-8">
          <div>
            <h3 className="text-base font-bold text-slate-900">Customise Store Appearance</h3>
            <p className="text-xs text-slate-500 mt-1">Pick your theme style, brand accent color, and typography.</p>
          </div>

          {/* Theme Selector Carousel Pills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Store Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[
                { id: 'classic', label: 'Classic Dark', bg: 'bg-slate-900 text-white' },
                { id: 'minimal', label: 'Minimal White', bg: 'bg-slate-100 text-slate-900 border border-slate-300' },
                { id: 'glass', label: 'Frosted Glass', bg: 'bg-gradient-to-r from-blue-900 to-indigo-950 text-white' },
                { id: 'neon', label: 'Cyber Neon', bg: 'bg-purple-950 text-purple-300 border border-purple-500' },
                { id: 'sunset', label: 'Sunset Glow', bg: 'bg-gradient-to-r from-orange-500 to-rose-600 text-white' },
                { id: 'emerald', label: 'Emerald Mint', bg: 'bg-emerald-950 text-emerald-300 border border-emerald-500' },
              ].map((th) => (
                <button
                  key={th.id}
                  onClick={() => updateProfile({ theme: th.id as any })}
                  className={`p-3 rounded-2xl text-xs font-bold text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 h-20 ${
                    th.bg
                  } ${profile?.theme === th.id ? 'ring-4 ring-blue-500 shadow-lg scale-102' : 'opacity-80 hover:opacity-100'}`}
                >
                  <span>{th.label}</span>
                  {profile?.theme === th.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Font Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Typography
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Poppins', 'Inter', 'Plus Jakarta Sans', 'Outfit'].map((font) => (
                <button
                  key={font}
                  onClick={() => updateProfile({ fontFamily: font as any })}
                  className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                    profile?.fontFamily === font
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Accent Color */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Brand Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={profile?.brandColor || '#2563eb'}
                onChange={(e) => updateProfile({ brandColor: e.target.value })}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5"
              />
              <span className="text-xs font-mono font-bold text-slate-700 uppercase">
                {profile?.brandColor || '#2563eb'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS (matching screenshot #4) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Activity Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase">Visits</span>
                <Eye className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">1,482</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +24% this week</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase">Clicks</span>
                <MousePointer className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">418</div>
              <div className="text-[11px] text-blue-600 font-semibold mt-1">↑ +18% this week</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase">CTR</span>
                <TrendingUp className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">28.2%</div>
              <div className="text-[11px] text-purple-600 font-semibold mt-1">High conversion</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase">Avg Time to Click</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">4.8s</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">Direct bio traffic</div>
            </div>
          </div>

          {/* Chart representation */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Traffic Breakdown (Last 7 Days)</h3>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Unique Visits</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Link Clicks</span>
              </div>
            </div>

            <div className="h-48 flex items-end justify-between gap-2 pt-8 px-2 border-b border-slate-100">
              {[
                { day: 'Mon', visits: 180, clicks: 52 },
                { day: 'Tue', visits: 210, clicks: 64 },
                { day: 'Wed', visits: 195, clicks: 58 },
                { day: 'Thu', visits: 240, clicks: 75 },
                { day: 'Fri', visits: 280, clicks: 88 },
                { day: 'Sat', visits: 310, clicks: 96 },
                { day: 'Sun', visits: 267, clicks: 85 },
              ].map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    <div
                      style={{ height: `${(d.visits / 310) * 100}%` }}
                      className="w-3 sm:w-5 bg-emerald-300 rounded-t-sm"
                    />
                    <div
                      style={{ height: `${(d.clicks / 310) * 100}%` }}
                      className="w-3 sm:w-5 bg-blue-500 rounded-t-sm"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS (matching SuperProfile Account Settings: Profile, Billing, Payments, Integrations, Notification, Security) */}
      {activeTab === 'settings' && (
        <div className="pt-2">
          <AccountSettings onNavigate={onNavigate} />
        </div>
      )}

      {/* Modal: Add Content */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {contentType === 'header' ? 'Add Section Header' : 'Add Content Link'}
            </h3>

            <form onSubmit={handleCreateContent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder={contentType === 'header' ? 'e.g. MY MASTERCLASSES' : 'e.g. 🔥 Best Selling Wholesale Lookbook'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {contentType !== 'header' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">URL Destination</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Add to Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Link */}
      {editingLink && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Edit Item</h3>
            <form onSubmit={handleUpdateLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingLink.title}
                  onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Destination URL</label>
                <input
                  type="text"
                  value={editingLink.url}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Store Profile Header */}
      {isEditHeaderOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Store Profile Header</h3>
              <button
                type="button"
                onClick={() => setIsEditHeaderOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHeader} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={headerName}
                  onChange={(e) => setHeaderName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Profile Photo Upload Section (No URL link needed) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Profile Photo
                </label>

                {/* Hidden File Input for Device Upload */}
                <input
                  type="file"
                  ref={avatarFileInputRef}
                  accept="image/*"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                />

                <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl transition space-y-3">
                  <div className="flex items-center gap-4">
                    {/* Clickable Avatar Preview */}
                    <div
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="relative shrink-0 cursor-pointer group"
                      title="Click to change photo"
                    >
                      <img
                        src={headerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                        alt="Profile Avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md group-hover:opacity-90 transition"
                      />
                      <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                        <Camera className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Action Upload Button */}
                    <div className="flex-1 space-y-1">
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-400" />
                        <span>{isUploadingAvatar ? 'Loading...' : 'Upload Photo from Device'}</span>
                      </button>
                      <p className="text-[11px] text-slate-500 truncate">
                        {avatarFileName ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Selected: {avatarFileName}
                          </span>
                        ) : (
                          'PNG, JPG, WEBP, GIF up to 10MB'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Ready Presets Bar */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Or pick a sample photo:
                    </span>
                    <div className="flex items-center gap-2.5">
                      {[
                        { label: 'Shop Owner', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
                        { label: 'Creator Male', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
                        { label: 'Fashion Store', url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=200&q=80' },
                        { label: 'Digital Hub', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=200&q=80' },
                        { label: 'Studio Icon', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' }
                      ].map((preset, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => {
                            setHeaderAvatar(preset.url);
                            setAvatarFileName(null);
                          }}
                          className={`w-8 h-8 rounded-full overflow-hidden border-2 transition cursor-pointer ${
                            headerAvatar === preset.url ? 'border-blue-600 ring-2 ring-blue-500/30 scale-110' : 'border-slate-200 hover:border-slate-400'
                          }`}
                          title={preset.label}
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Short Bio</label>
                <textarea
                  rows={3}
                  value={headerBio}
                  onChange={(e) => setHeaderBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditHeaderOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 cursor-pointer transition"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
