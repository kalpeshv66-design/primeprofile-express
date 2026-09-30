import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Eye,
  Play,
  BookOpen,
  Info,
  Layers,
  Upload,
  X,
  Share2,
  CheckCircle2,
  MoreVertical,
  Check,
  Copy,
  Edit2,
  Trash2,
  Settings as SettingsIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  ChevronDown,
  ChevronUp,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
  HelpCircle,
  Percent,
  SlidersHorizontal,
  Table,
  AlignLeft,
  Calendar,
  ExternalLink,
  ArrowRight,
  ArrowLeftRight,
  ShieldCheck,
  Clock,
  XCircle
} from 'lucide-react';
import { PaymentPage } from '../types';
import { DigitalProductBuilder } from './DigitalProductBuilder';
import { PrimeProfileLogo } from './PrimeProfileLogo';

interface PaymentPagesSectionProps {
  onNavigate: (route: string) => void;
}

export const PaymentPagesSection: React.FC<PaymentPagesSectionProps> = ({ onNavigate }) => {
  const {
    paymentPages,
    addPaymentPage,
    updatePaymentPage,
    deletePaymentPage,
    approvePaymentPage,
    rejectPaymentPage,
    requestPaymentPageApproval,
    profile,
    orders,
    addProduct
  } = useAuth();

  // Listing filter tabs: 'published' | 'unpublished' | 'draft' | 'all'
  const [filterTab, setFilterTab] = useState<'published' | 'unpublished' | 'draft' | 'all'>('published');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Modal 1: "What do you want to sell?"
  const [isSellTypeModalOpen, setIsSellTypeModalOpen] = useState(false);

  // Digital Product Builder (Matching 8 Screenshots)
  const [isDigitalBuilderOpen, setIsDigitalBuilderOpen] = useState(false);
  const [editingDigitalPage, setEditingDigitalPage] = useState<PaymentPage | null>(null);

  // Classic Digital Product Modal (Matching "Pahle tha vesa")
  const [isDigitalModalOpen, setIsDigitalModalOpen] = useState(false);
  const [digitalTitle, setDigitalTitle] = useState('');
  const [digitalDescription, setDigitalDescription] = useState('');
  const [digitalPrice, setDigitalPrice] = useState<number>(199);
  const [digitalOriginalPrice, setDigitalOriginalPrice] = useState<number>(499);
  const [digitalCoverImage, setDigitalCoverImage] = useState('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80');
  const [digitalButtonText, setDigitalButtonText] = useState('Pay & Order Now');
  const [digitalFileType, setDigitalFileType] = useState<'file' | 'link'>('file');
  const [digitalFileUrl, setDigitalFileUrl] = useState('');
  const [digitalUploadedFileName, setDigitalUploadedFileName] = useState('');
  const [digitalCollectPhone, setDigitalCollectPhone] = useState(true);
  const [digitalCollectAddress, setDigitalCollectAddress] = useState(false);
  const digitalFileInputRef = useRef<HTMLInputElement | null>(null);
  const digitalCoverInputRef = useRef<HTMLInputElement | null>(null);

  // Full Screen Builder: 'page' | 'checkout' | 'settings'
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderTab, setBuilderTab] = useState<'page' | 'checkout' | 'settings'>('page');

  // TAB 1: PAGE DETAILS (Matching Image 2)
  const [pageTitle, setPageTitle] = useState('Your Payment Page Title Here');
  const [category, setCategory] = useState('Select Category');
  const [coverImageUrl, setCoverImageUrl] = useState('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1280&q=80');
  const [pageDescription, setPageDescription] = useState(
    'Describe your page to let attendees know what to expect. Include highlights like the purpose, key activities, or notable materials. Make it engaging and informative to generate interest and excitement.'
  );

  // File upload ref for cover image
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // TAB 2: CHECKOUT DETAILS (Matching Images 3, 4, 5)
  const [checkoutTarget, setCheckoutTarget] = useState('Single or multiple digital files');
  const [hiddenMessage, setHiddenMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string; type: 'image' | 'video' | 'file'; size: string }[]>([
    { id: 'f-1', name: 'Master_Design_Assets_Pack_v2.zip', type: 'file', size: '42.8 MB' }
  ]);
  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);
  const [hiddenFileTypeToUpload, setHiddenFileTypeToUpload] = useState<'image' | 'video' | 'file'>('file');

  // Accordion steps
  const [step1Open, setStep1Open] = useState(true);
  const [step2Open, setStep2Open] = useState(false);
  const [step3Open, setStep3Open] = useState(false);

  // Product/Service details in step 2
  const [productSummary, setProductSummary] = useState('Premium all-in-one digital creator kit with commercial rights and instant download access.');
  
  // Pricing & Settings in step 3
  const [priceAmount, setPriceAmount] = useState<number>(199);
  const [originalPrice, setOriginalPrice] = useState<number>(499);
  const [limitStock, setLimitStock] = useState(false);
  const [stockCount, setStockCount] = useState<number>(100);

  // CTA text
  const [ctaButtonText, setCtaButtonText] = useState('Make Payment');

  // Discounts
  const [discounts, setDiscounts] = useState<{ code: string; percent: number; maxUses: number }[]>([
    { code: 'EARLYBIRD', percent: 20, maxUses: 50 }
  ]);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [newDiscountCode, setNewDiscountCode] = useState('');
  const [newDiscountPercent, setNewDiscountPercent] = useState(15);

  // User details
  const [emailOtpEnabled, setEmailOtpEnabled] = useState(false);
  const [phoneOtpEnabled, setPhoneOtpEnabled] = useState(false);
  const [extraFields, setExtraFields] = useState<string[]>([]);
  const [isAddExtraFieldModalOpen, setIsAddExtraFieldModalOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');

  // After successful payment
  const [showCustomSuccessMessage, setShowCustomSuccessMessage] = useState(false);
  const [customSuccessMessage, setCustomSuccessMessage] = useState('Thank you for purchasing! Check your email or download your files directly below.');
  const [redirectToWebsite, setRedirectToWebsite] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('https://');

  // Advanced Options
  const [enableGst, setEnableGst] = useState(false);

  // TAB 3: SETTINGS (Matching Image 6)
  const [pageExpiry, setPageExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('2026-12-31T23:59');
  const [customTerms, setCustomTerms] = useState(false);
  const [termsContent, setTermsContent] = useState('All digital products are non-refundable once downloaded. Instant support available 24/7.');
  const [brandColour, setBrandColour] = useState('#2D1832');
  const [darkTheme, setDarkTheme] = useState(false);
  const [deactivateSales, setDeactivateSales] = useState(false);
  const [buyerQuestions, setBuyerQuestions] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [pixelId, setPixelId] = useState('');
  const [ga4Id, setGa4Id] = useState('');

  // Handle Cover Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoverImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Hidden Files Upload
  const handleHiddenFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newItems = Array.from(files).map((f) => {
        const sizeStr = f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${(f.size / 1024).toFixed(1)} KB`;
        return {
          id: 'f-' + Date.now() + Math.random().toString(36).substr(2, 4),
          name: f.name,
          type: hiddenFileTypeToUpload,
          size: sizeStr
        };
      });
      setAttachedFiles((prev) => [...prev, ...newItems]);
    }
  };

  // Stats calculation matching Image 1
  const totalSale = orders.filter(o => o.itemType === 'payment_page').length || 1;
  const totalRevenue = orders
    .filter(o => o.itemType === 'payment_page' && o.status === 'Successful')
    .reduce((sum, o) => sum + o.amount, 0) || 171;
  const conversionRate = '0%';

  // Filtered pages for listing table
  const filteredPages = paymentPages.filter((p) => {
    if (filterTab === 'published' && !(p.published && p.moderationStatus === 'approved')) return false;
    if (filterTab === 'unpublished' && p.moderationStatus !== 'pending') return false;
    if (filterTab === 'draft' && (p.published || p.moderationStatus === 'pending')) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.price.toString().includes(q)
      );
    }
    return true;
  });

  const copyCheckoutUrl = (id: string) => {
    const cleanId = id.startsWith('pay-') ? id : `pay-${id}`;
    const url = `${window.location.origin}${window.location.pathname}#${cleanId}?creator=${encodeURIComponent(profile?.uid || "")}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePagePublished = async (id: string, currentPublished: boolean) => {
    const page = paymentPages.find(p => p.id === id);
    if (page?.moderationStatus !== 'approved') {
      // If not approved yet, instant approve via admin workflow
      await approvePaymentPage(id);
    } else {
      await updatePaymentPage(id, { published: !currentPublished });
    }
  };

  const handleStartCreation = (type: string) => {
    setIsSellTypeModalOpen(false);
    if (type === 'digital') {
      // Exactly matching User's 8 Screenshots: The Full No-Code Digital Product Builder!
      setEditingDigitalPage(null);
      setIsDigitalBuilderOpen(true);
    } else {
      // List Multiple Products (Opens catalog builder)
      setEditingPageId(null);
      setPageTitle('Your Payment Page Title Here');
      setCategory('Select Category');
      setCoverImageUrl('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1280&q=80');
      setPageDescription('Describe your page to let attendees know what to expect. Include highlights like the purpose, key activities, or notable materials. Make it engaging and informative to generate interest and excitement.');
      setPriceAmount(199);
      setCtaButtonText('Make Payment');
      setBuilderTab('page');
      setIsBuilderOpen(true);
    }
  };

  const handleCreateDigitalProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!digitalTitle.trim()) return;

    await addPaymentPage({
      title: digitalTitle.trim(),
      description: digitalDescription.trim() || 'Instant downloadable access with full support.',
      price: Number(digitalPrice) || 199,
      currency: profile?.currency || '₹',
      coverImage: digitalCoverImage,
      buttonText: digitalButtonText.trim() || 'Pay & Order Now',
      collectAddress: digitalCollectAddress,
      collectPhone: digitalCollectPhone,
      published: false,
      moderationStatus: 'pending',
      submittedAt: Date.now(),
      creatorName: profile?.name || 'Creator',
      creatorEmail: profile?.email || 'creator@primeprofile.bio',
    });

    if (addProduct) {
      await addProduct({
        title: digitalTitle.trim(),
        description: digitalDescription.trim() || 'Instant downloadable access with full support.',
        price: Number(digitalPrice) || 199,
        originalPrice: Number(digitalOriginalPrice) || undefined,
        currency: profile?.currency || '₹',
        coverImage: digitalCoverImage,
        fileType: digitalFileType === 'file' ? 'zip' : 'link',
        fileUrl: digitalFileUrl || 'https://drive.google.com',
        category: 'Digital Products',
        published: true,
      });
    }

    setIsDigitalModalOpen(false);
  };

  const handleEditPage = (page: PaymentPage) => {
    setEditingDigitalPage(page);
    setIsDigitalBuilderOpen(true);
    setOpenDropdownId(null);
  };

  const handlePublishPage = async () => {
    if (editingPageId) {
      await updatePaymentPage(editingPageId, {
        title: pageTitle || 'Untitled Payment Page',
        description: pageDescription,
        price: Number(priceAmount) || 199,
        currency: profile?.currency || '₹',
        coverImage: coverImageUrl,
        buttonText: ctaButtonText || 'Make Payment',
        collectPhone: true,
        published: true,
      });
    } else {
      await addPaymentPage({
        title: pageTitle || 'Your Payment Page Title Here',
        description: pageDescription,
        price: Number(priceAmount) || 199,
        currency: profile?.currency || '₹',
        coverImage: coverImageUrl,
        buttonText: ctaButtonText || 'Make Payment',
        collectAddress: false,
        collectPhone: true,
        published: false,
        moderationStatus: 'pending',
        submittedAt: Date.now(),
        creatorName: profile?.name || 'Creator',
        creatorEmail: profile?.email || 'creator@primeprofile.bio',
      });
    }

    setEditingPageId(null);
    setIsBuilderOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* 1. TOP HEADER & CREATE BUTTON (Matching Image 1) */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Payment Pages</h1>
          <p className="text-xs text-slate-500 mt-0.5">Create high-converting checkout landing pages for digital downloads, bundles and services.</p>
        </div>

        <button
          onClick={() => setIsSellTypeModalOpen(true)}
          className="bg-black hover:bg-slate-900 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Payment Page</span>
        </button>
      </div>

      {/* Admin Moderation Workflow Notice Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-indigo-800/40 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
              <span>Admin Moderation System Active</span>
              {paymentPages.filter(p => p.moderationStatus === 'pending').length > 0 && (
                <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                  {paymentPages.filter(p => p.moderationStatus === 'pending').length} Waiting Approval
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Koi bhi naya payment page banne ke baad Admin Panel me request aati hai. Admin approve karega tabhi link website par live hogi.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('admin-panel')}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-md"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Open Admin Panel ({paymentPages.filter(p => p.moderationStatus === 'pending').length}) →</span>
        </button>
      </div>

      {/* 2. STATS CARDS (TOTAL SALE & CONVERSION - Exact Matching Image 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* TOTAL SALE Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>TOTAL SALE</span>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="my-5">
            <div className="text-4xl font-extrabold text-slate-900">{totalSale}</div>
          </div>
          <div className="text-xs text-slate-400 font-normal">same as last week</div>
        </div>

        {/* CONVERSION Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>CONVERSION</span>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="my-5">
            <div className="text-4xl font-extrabold text-slate-900">{conversionRate}</div>
          </div>
          <div className="text-xs text-slate-400 font-normal">same as last week</div>
        </div>

        {/* TOTAL REVENUE Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>TOTAL REVENUE</span>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="my-5">
            <div className="text-4xl font-extrabold text-slate-900">₹{totalRevenue}</div>
          </div>
          <div className="text-xs text-slate-400 font-normal">verified settled payouts</div>
        </div>
      </div>

      {/* 3. TABS: Published | Unpublished / Pending | Draft / Inactive */}
      <div className="flex items-center gap-2 pt-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setFilterTab('published')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            filterTab === 'published' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>Published ({paymentPages.filter(p => p.published && p.moderationStatus === 'approved').length})</span>
        </button>
        <button
          onClick={() => setFilterTab('unpublished')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            filterTab === 'unpublished' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>Under Review ({paymentPages.filter(p => p.moderationStatus === 'pending').length})</span>
          {paymentPages.filter(p => p.moderationStatus === 'pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setFilterTab('draft')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            filterTab === 'draft' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>Draft / Inactive ({paymentPages.filter(p => !p.published && p.moderationStatus !== 'pending').length})</span>
        </button>
        <button
          onClick={() => setFilterTab('all')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            filterTab === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>All ({paymentPages.length})</span>
        </button>
      </div>

      {/* 4. SEARCH & FILTER TOOLBAR (Matching Image 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* Toolbar actions on right */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-600 font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-600 font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort</span>
          </button>
          <button
            onClick={() => {
              const headers = "Order ID,Product Title,Customer Name,Customer Email,Customer Phone,Amount,Status,Date\n";
              const rows = orders.map(o => `"${o.orderNumber}","${o.itemTitle}","${o.customerName}","${o.customerEmail}","${o.customerPhone || ''}","${o.currency} ${o.amount}","${o.status}","${new Date(o.createdAt).toLocaleDateString()}"`).join("\n");
              const blob = new Blob([headers + rows], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `PrimeProfile_Orders_${new Date().toISOString().slice(0, 10)}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-600 font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 5. PAYMENT PAGES DATA TABLE (Matching Image 1) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6 font-bold">PAYMENT PAGE {paymentPages.length}</th>
                <th className="py-3.5 px-4 font-bold">PRICE</th>
                <th className="py-3.5 px-4 font-bold">SALE</th>
                <th className="py-3.5 px-4 font-bold">REVENUE</th>
                <th className="py-3.5 px-4 font-bold">
                  <span className="flex items-center gap-1">
                    PAYMENTS <Info className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="py-3.5 px-6 text-right font-bold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPages.map((page, idx) => (
                <tr key={page.id} className="hover:bg-slate-50/80 transition group">
                  {/* Thumbnail & Title */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={page.coverImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=120&q=80'}
                        alt={page.title}
                        className="w-11 h-11 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div>
                        <div
                          onClick={() => handleEditPage(page)}
                          className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer text-xs"
                        >
                          {page.title}
                        </div>
                        {page.moderationStatus === 'pending' ? (
                          <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-0.5">
                            <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                            <span>Pending Admin Review</span>
                          </div>
                        ) : page.moderationStatus === 'rejected' ? (
                          <div className="flex items-center gap-1 text-[11px] text-rose-500 font-medium mt-0.5">
                            <XCircle className="w-3 h-3 text-rose-500" />
                            <span>Rejected by Admin</span>
                          </div>
                        ) : page.published ? (
                          <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active in Bio</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                            Draft / Unpublished
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4 font-bold text-slate-900">
                    {page.currency}{page.price}
                  </td>

                  {/* Sale */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      👥 {page.salesCount} ↗
                    </span>
                  </td>

                  {/* Revenue */}
                  <td className="py-4 px-4 font-bold text-slate-900">
                    {page.currency}{page.revenue}
                  </td>

                  {/* Payments status */}
                  <td className="py-4 px-4">
                    {page.moderationStatus === 'pending' ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Waiting Approval</span>
                      </span>
                    ) : page.moderationStatus === 'rejected' || !page.published ? (
                      <button
                        onClick={() => togglePagePublished(page.id, page.published)}
                        className="cursor-pointer hover:underline"
                        title="Click to toggle or approve"
                      >
                        <span className="text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-[11px]">
                          Disabled
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => togglePagePublished(page.id, page.published)}
                        className="cursor-pointer hover:underline"
                      >
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px] inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Enabled</span>
                        </span>
                      </button>
                    )}
                  </td>

                  {/* Actions: Share, Copy, Three dots */}
                  <td className="py-4 px-6 text-right relative">
                    <div className="flex items-center justify-end gap-2">
                      {page.moderationStatus === 'pending' && (
                        <button
                          onClick={() => approvePaymentPage(page.id)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                          title="Instant Admin Approve"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve (Admin)</span>
                        </button>
                      )}

                      <button
                        onClick={() => copyCheckoutUrl(page.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>

                      <button
                        onClick={() => copyCheckoutUrl(page.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        title="Copy Checkout Link"
                      >
                        {copiedId === page.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === page.id ? null : page.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openDropdownId === page.id && (
                          <div className="absolute right-0 top-8 z-40 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 w-40 text-left">
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                onNavigate(`pay-${page.id}`);
                              }}
                              className="w-full px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>View Live</span>
                            </button>
                            <button
                              onClick={() => handleEditPage(page)}
                              className="w-full px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit Page</span>
                            </button>
                            <div className="border-t border-slate-100 my-1" />
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                deletePaymentPage(page.id);
                              }}
                              className="w-full px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: "What do you want to sell?" (EXACT MATCHING IMAGE 1)             */}
      {/* ========================================================================= */}
      {isSellTypeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">What do you want to sell?</h3>
              <button
                onClick={() => setIsSellTypeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 pt-5">
              {/* Option 1: Digital Products (Green Icon) */}
              <div
                onClick={() => handleStartCreation('digital')}
                className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition cursor-pointer flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Download className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">Digital Products</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Sell images, videos, music, docs, and more.</p>
                </div>
              </div>

              {/* Option 2: List Multiple Products (Blue Icon) */}
              <div
                onClick={() => handleStartCreation('multiple')}
                className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 transition cursor-pointer flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Layers className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">List Multiple Products</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Offer an e-commerce style experience</p>
                </div>
              </div>

              {/* Option 3: Existing Product (Pink Icon) */}
              <div
                onClick={() => handleStartCreation('existing')}
                className="p-4 rounded-2xl border border-slate-200 hover:border-pink-500 hover:bg-pink-50/20 transition cursor-pointer flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 border border-pink-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <ArrowLeftRight className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-pink-700 transition">Existing Product</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Give access to your existing cosmofeed product.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLASSIC DIGITAL PRODUCT MODAL (PAHLE THA VESA - AS IT WAS BEFORE)         */}
      {/* ========================================================================= */}
      {isDigitalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                  <Download className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Create Digital Product</h3>
                  <p className="text-xs text-slate-500">Sell files, templates, e-books & guides with instant download</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDigitalModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDigitalProduct} className="space-y-4">
              {/* Product Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Page / Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3,00000+ Templates for Graphic Designers or E-book"
                  value={digitalTitle}
                  onChange={(e) => setDigitalTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain what the customer receives after making payment..."
                  value={digitalDescription}
                  onChange={(e) => setDigitalDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={digitalPrice}
                    onChange={(e) => setDigitalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={digitalOriginalPrice}
                    onChange={(e) => setDigitalOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs text-slate-500 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. 499 (Optional strikethrough)"
                  />
                </div>
              </div>

              {/* Deliverable File / Download Link */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Deliverable File / Secret Link *
                </label>
                
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setDigitalFileType('file')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                      digitalFileType === 'file' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Direct Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setDigitalFileType('link')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                      digitalFileType === 'link' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Google Drive / Link
                  </button>
                </div>

                {digitalFileType === 'file' ? (
                  <div>
                    <input
                      type="file"
                      ref={digitalFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setDigitalUploadedFileName(file.name);
                          setDigitalFileUrl(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                    <div
                      onClick={() => digitalFileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-3.5 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition flex flex-col items-center justify-center gap-1"
                    >
                      <Upload className="w-5 h-5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">
                        {digitalUploadedFileName || 'Click to upload your product file (ZIP, PDF, DOC, Video)'}
                      </span>
                      <span className="text-[10px] text-slate-400">Buyers will get instant download access after paying</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/... or Notion Link"
                      value={digitalFileUrl}
                      onChange={(e) => setDigitalFileUrl(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Cover Image */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Cover Image
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={digitalCoverImage}
                    alt="Cover"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={digitalCoverInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setDigitalCoverImage(ev.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => digitalCoverInputRef.current?.click()}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition"
                      >
                        Upload Cover
                      </button>
                      <input
                        type="text"
                        placeholder="Or paste image URL"
                        value={digitalCoverImage}
                        onChange={(e) => setDigitalCoverImage(e.target.value)}
                        className="flex-1 px-3 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Button CTA text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Button CTA Label
                </label>
                <input
                  type="text"
                  required
                  value={digitalButtonText}
                  onChange={(e) => setDigitalButtonText(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl text-slate-900"
                  placeholder="e.g. Pay & Order Now"
                />
              </div>

              {/* Customer Checkboxes */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={digitalCollectPhone}
                    onChange={(e) => setDigitalCollectPhone(e.target.checked)}
                    className="rounded text-blue-600 cursor-pointer"
                  />
                  <span>Collect Customer Phone / WhatsApp Number</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={digitalCollectAddress}
                    onChange={(e) => setDigitalCollectAddress(e.target.checked)}
                    className="rounded text-blue-600 cursor-pointer"
                  />
                  <span>Collect Shipping Delivery Address</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDigitalModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Publish Digital Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NO-CODE DIGITAL PRODUCT BUILDER (MATCHING USER'S 8 SCREENSHOTS)             */}
      {/* ========================================================================= */}
      {isDigitalBuilderOpen && (
        <DigitalProductBuilder
          initialPage={editingDigitalPage}
          onClose={() => {
            setIsDigitalBuilderOpen(false);
            setEditingDigitalPage(null);
          }}
          onPublished={(pageId) => {
            setIsDigitalBuilderOpen(false);
            setEditingDigitalPage(null);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* FULL-SCREEN BUILDER: PAGE | CHECKOUT | SETTINGS (EXACT MATCHING IMAGES 2-6) */}
      {/* ========================================================================= */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-y-auto">
          {/* Top Bar (Matching Images 2-6) */}
          <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-2xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
              {/* Left Brand */}
              <PrimeProfileLogo variant="light" size="sm" />

              {/* Center 3 Tabs: Page | Checkout | Settings */}
              <div className="flex items-center gap-8 text-sm font-bold">
                <button
                  type="button"
                  onClick={() => setBuilderTab('page')}
                  className={`h-16 flex items-center px-1 border-b-2 transition cursor-pointer ${
                    builderTab === 'page'
                      ? 'border-pink-500 text-slate-900 font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Page
                </button>
                <button
                  type="button"
                  onClick={() => setBuilderTab('checkout')}
                  className={`h-16 flex items-center px-1 border-b-2 transition cursor-pointer ${
                    builderTab === 'checkout'
                      ? 'border-pink-500 text-slate-900 font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Checkout
                </button>
                <button
                  type="button"
                  onClick={() => setBuilderTab('settings')}
                  className={`h-16 flex items-center px-1 border-b-2 transition cursor-pointer ${
                    builderTab === 'settings'
                      ? 'border-pink-500 text-slate-900 font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Settings
                </button>
              </div>

              {/* Right: Publish page (Pink pill) + Gear + Close */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePublishPage}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs sm:text-sm px-6 py-2 rounded-full shadow-md shadow-pink-500/25 transition cursor-pointer"
                >
                  Publish page
                </button>
                <button
                  type="button"
                  onClick={() => setBuilderTab('settings')}
                  className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition cursor-pointer"
                  title="Page Settings"
                >
                  <SettingsIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition cursor-pointer"
                  title="Close builder"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Builder Canvas Area */}
          <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
            {/* ------------------------------------------------------------- */}
            {/* TAB 1: PAGE (EXACT MATCHING IMAGE 2)                           */}
            {/* ------------------------------------------------------------- */}
            {builderTab === 'page' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-10 space-y-8 animate-in fade-in">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Title</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={75}
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      placeholder="Please enter page title"
                      className="w-full px-4 py-3 text-sm text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 placeholder-slate-400"
                    />
                    <span className="absolute right-3.5 top-3.5 text-xs text-slate-400 font-medium">
                      {pageTitle.length}/75
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none px-4 py-3 text-sm text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 bg-white pr-10 cursor-pointer"
                    >
                      <option value="Select Category">Select Category</option>
                      <option value="Graphic Design & Templates">Graphic Design & Templates</option>
                      <option value="E-books & Digital Guides">E-books & Digital Guides</option>
                      <option value="Coding, Software & Presets">Coding, Software & Presets</option>
                      <option value="Music, Sound Effects & Audio">Music, Sound Effects & Audio</option>
                      <option value="Masterclasses & Video Tutorials">Masterclasses & Video Tutorials</option>
                      <option value="Consultations & Coaching">Consultations & Coaching</option>
                      <option value="Others">Others</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-4 pointer-events-none" />
                  </div>
                </div>

                {/* Cover image/video */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Cover image/video</label>
                  <div className="border border-dashed border-slate-300 rounded-2xl p-8 text-center flex flex-col items-center justify-center bg-slate-50/50">
                    <input
                      type="file"
                      ref={photoInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {coverImageUrl ? (
                      <div className="w-full max-w-md space-y-3">
                        <img
                          src={coverImageUrl}
                          alt="Cover preview"
                          className="w-full h-48 object-cover rounded-xl border border-slate-200 shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="w-full py-2.5 px-6 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-full transition shadow-xs cursor-pointer"
                        >
                          Change Cover Image
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="py-3 px-8 bg-black hover:bg-slate-900 text-white font-bold text-sm rounded-full transition shadow-xs cursor-pointer"
                      >
                        Upload Image
                      </button>
                    )}

                    <p className="text-xs text-slate-400 mt-3 font-normal">
                      Media should be horizontal, at least 1280x720px, and 72 DPI (dots per inch) for images
                    </p>
                  </div>
                </div>

                {/* Description with Rich Text Toolbar (Matching Image 2) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Description</label>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-pink-500">
                    {/* Rich text toolbar */}
                    <div className="bg-slate-50/80 border-b border-slate-200 p-2.5 flex flex-wrap items-center gap-2 text-slate-600">
                      <button type="button" className="p-1.5 hover:bg-slate-200 rounded font-bold text-xs" title="Bold">
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1.5 hover:bg-slate-200 rounded font-bold text-xs" title="Underline">
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1.5 hover:bg-slate-200 rounded italic text-xs" title="Italic">
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1.5 hover:bg-slate-200 rounded line-through text-xs" title="Strikethrough">
                        <Strikethrough className="w-3.5 h-3.5" />
                      </button>
                      <div className="h-4 w-px bg-slate-300 mx-1" />
                      <button type="button" className="p-1.5 hover:bg-slate-200 rounded" title="Bullet List">
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1.5 hover:bg-slate-200 rounded" title="Ordered List">
                        <ListOrdered className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1.5 hover:bg-slate-200 rounded" title="Add Link">
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="h-4 w-px bg-slate-300 mx-1" />
                      <span className="text-xs text-slate-500 font-medium px-1 flex items-center gap-1">
                        Size <ChevronDown className="w-3 h-3 text-slate-400" />
                      </span>
                      <span className="text-xs text-slate-500 font-medium px-1 flex items-center gap-1">
                        Formats <ChevronDown className="w-3 h-3 text-slate-400" />
                      </span>
                      <div className="h-4 w-px bg-slate-300 mx-1" />
                      <button type="button" className="p-1.5 hover:bg-slate-200 rounded" title="Table">
                        <Table className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1.5 hover:bg-slate-200 rounded" title="Insert Image">
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1.5 hover:bg-slate-200 rounded" title="Insert Video">
                        <VideoIcon className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1.5 hover:bg-slate-200 rounded" title="Align text">
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Text content area */}
                    <textarea
                      rows={6}
                      value={pageDescription}
                      onChange={(e) => setPageDescription(e.target.value)}
                      placeholder="Describe what customers will receive..."
                      className="w-full p-4 text-sm text-slate-900 focus:outline-none resize-y"
                    />
                  </div>
                </div>

                {/* Bottom navigation pill */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setBuilderTab('checkout')}
                    className="bg-slate-900 hover:bg-black text-white font-bold text-xs px-6 py-2.5 rounded-full transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: CHECKOUT (EXACT MATCHING IMAGES 3, 4, 5)                */}
            {/* ------------------------------------------------------------- */}
            {builderTab === 'checkout' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-10 space-y-10 animate-in fade-in">
                {/* 1. Stepper Sections with Left Connector (Matching Image 3) */}
                <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {/* Step ①: What's this payment page for? */}
                  <div className="relative">
                    <div className="absolute -left-8 top-0 w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-900">What's this payment page for?</h4>
                      
                      <div>
                        <select
                          value={checkoutTarget}
                          onChange={(e) => setCheckoutTarget(e.target.value)}
                          className="w-full appearance-none px-4 py-2.5 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 bg-white pr-10 cursor-pointer"
                        >
                          <option value="Single or multiple digital files">Single or multiple digital files</option>
                          <option value="Secret link or gated url">Secret link or gated url</option>
                          <option value="Telegram / Discord community invite">Telegram / Discord community invite</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-500 font-medium mb-1.5">
                          Select the type of digital files you want to sell
                        </label>
                        <textarea
                          rows={3}
                          value={hiddenMessage}
                          onChange={(e) => setHiddenMessage(e.target.value)}
                          placeholder="Type your hidden message here"
                          className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-900"
                        />
                      </div>

                      {/* Attachment buttons: Image | Video | File */}
                      <input
                        type="file"
                        ref={hiddenFileInputRef}
                        onChange={handleHiddenFileUpload}
                        className="hidden"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setHiddenFileTypeToUpload('image');
                            hiddenFileInputRef.current?.click();
                          }}
                          className="py-2 px-3 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span>Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHiddenFileTypeToUpload('video');
                            hiddenFileInputRef.current?.click();
                          }}
                          className="py-2 px-3 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <VideoIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span>Video</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHiddenFileTypeToUpload('file');
                            hiddenFileInputRef.current?.click();
                          }}
                          className="py-2 px-3 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>File</span>
                        </button>
                      </div>

                      {/* Display attached files list */}
                      {attachedFiles.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {attachedFiles.map((f) => (
                            <div key={f.id} className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                              <span className="font-medium text-slate-700 truncate max-w-xs">{f.name} ({f.size})</span>
                              <button
                                type="button"
                                onClick={() => setAttachedFiles(attachedFiles.filter(item => item.id !== f.id))}
                                className="text-rose-500 hover:text-rose-700 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div>
                        <button
                          type="button"
                          onClick={() => setStep1Open(false)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step ②: Product/Service Details */}
                  <div className="relative pt-4">
                    <div className="absolute -left-8 top-4 w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div
                      onClick={() => setStep2Open(!step2Open)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <h4 className="text-sm font-bold text-slate-900">Product/Service Details</h4>
                      {step2Open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>

                    {step2Open && (
                      <div className="space-y-3 pt-3">
                        <textarea
                          rows={2}
                          value={productSummary}
                          onChange={(e) => setProductSummary(e.target.value)}
                          placeholder="Brief key details for checkout summary"
                          className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Step ③: Pricing & Settings */}
                  <div className="relative pt-4">
                    <div className="absolute -left-8 top-4 w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div
                      onClick={() => setStep3Open(!step3Open)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <h4 className="text-sm font-bold text-slate-900">Pricing & Settings</h4>
                      {step3Open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>

                    {step3Open && (
                      <div className="space-y-4 pt-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹)</label>
                            <input
                              type="number"
                              value={priceAmount}
                              onChange={(e) => setPriceAmount(Number(e.target.value))}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Original Price (₹)</label>
                            <input
                              type="number"
                              value={originalPrice}
                              onChange={(e) => setOriginalPrice(Number(e.target.value))}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* + Add another product (Image 3) */}
                <div>
                  <button
                    type="button"
                    onClick={() => alert('Multiple products cart experience activated for this checkout!')}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full transition cursor-pointer"
                  >
                    + Add another product
                  </button>
                </div>

                {/* Call to action (Image 3) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Call to action</label>
                  <input
                    type="text"
                    value={ctaButtonText}
                    onChange={(e) => setCtaButtonText(e.target.value)}
                    placeholder="Make Payment"
                    className="w-full px-4 py-3 text-xs text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 font-bold"
                  />
                </div>

                {/* Add/Manage Discounts (Image 4) */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-800">Add/Manage Discounts</h4>
                  <button
                    type="button"
                    onClick={() => setIsDiscountModalOpen(true)}
                    className="text-xs text-blue-600 hover:underline font-bold cursor-pointer block"
                  >
                    + Create new discount
                  </button>
                  <p className="text-[11px] text-slate-400">
                    Payment page links to pre-apply discount code will be available after creating discounts
                  </p>

                  {/* List active discount codes */}
                  {discounts.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {discounts.map((d) => (
                        <span key={d.code} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold rounded-lg">
                          <Percent className="w-3 h-3 text-blue-500" />
                          <span>{d.code} (-{d.percent}%)</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* User details (Image 4 & 5) */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-800">User details</h4>
                  <p className="text-[11px] text-slate-400">
                    Your users will have to provide these details before making the payment. Email and Phone Number are mandatory.
                  </p>

                  {/* Email row */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs font-semibold text-slate-700 px-3 py-1 bg-white border border-slate-200 rounded-lg">
                      Email
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-slate-500 font-medium">OTP Verification</span>
                      <input
                        type="checkbox"
                        checked={emailOtpEnabled}
                        onChange={(e) => setEmailOtpEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 relative" />
                    </label>
                  </div>

                  {/* Phone row */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs font-semibold text-slate-700 px-3 py-1 bg-white border border-slate-200 rounded-lg">
                      Phone
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-slate-500 font-medium">OTP Verification</span>
                      <input
                        type="checkbox"
                        checked={phoneOtpEnabled}
                        onChange={(e) => setPhoneOtpEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 relative" />
                    </label>
                  </div>

                  {/* Extra fields pill */}
                  {extraFields.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-xs font-semibold text-slate-700 px-3 py-1 bg-white border border-slate-200 rounded-lg">{f}</span>
                      <button
                        type="button"
                        onClick={() => setExtraFields(extraFields.filter((_, idx) => idx !== i))}
                        className="text-xs text-rose-500 hover:underline font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setIsAddExtraFieldModalOpen(true)}
                    className="w-full py-2.5 border border-dashed border-slate-300 hover:border-slate-400 text-slate-600 rounded-full text-xs font-semibold transition cursor-pointer"
                  >
                    + Add extra fields
                  </button>
                </div>

                {/* After successful payment (Image 5) */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800">After succesful payment</h4>

                  {/* Toggle 1: Show a custom message */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showCustomSuccessMessage}
                        onChange={(e) => setShowCustomSuccessMessage(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 relative" />
                      <span className="text-xs font-medium text-slate-700">Show a custom message</span>
                    </label>
                    {showCustomSuccessMessage && (
                      <textarea
                        rows={2}
                        value={customSuccessMessage}
                        onChange={(e) => setCustomSuccessMessage(e.target.value)}
                        className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 ml-12"
                      />
                    )}
                  </div>

                  {/* Toggle 2: Redirect to a website */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={redirectToWebsite}
                        onChange={(e) => setRedirectToWebsite(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 relative" />
                      <span className="text-xs font-medium text-slate-700">Redirect to a website</span>
                    </label>
                    {redirectToWebsite && (
                      <input
                        type="url"
                        value={redirectUrl}
                        onChange={(e) => setRedirectUrl(e.target.value)}
                        placeholder="https://yourwebsite.com/welcome"
                        className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 ml-12"
                      />
                    )}
                  </div>
                </div>

                {/* Advanced Options: Enable GST (Image 5) */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 mb-3">Advanced Options</h4>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableGst}
                      onChange={(e) => setEnableGst(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 relative" />
                    <span className="text-xs text-slate-700 font-medium">
                      Enable GST <span className="text-slate-400">You can make changes to the GST number in Settings -</span> <span className="text-blue-600 hover:underline">ADD GST</span>
                    </span>
                  </label>
                </div>

                {/* Bottom navigation pill */}
                <div className="pt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setBuilderTab('page')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-full transition cursor-pointer"
                  >
                    Back to Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuilderTab('settings')}
                    className="bg-slate-900 hover:bg-black text-white font-bold text-xs px-6 py-2.5 rounded-full transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Settings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 3: SETTINGS (EXACT MATCHING IMAGE 6)                       */}
            {/* ------------------------------------------------------------- */}
            {builderTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 animate-in fade-in">
                {/* 1. Page Expiry */}
                <div className="p-6 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Page Expiry</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Turning on this option will make the page and its content expire after a defined period of time.
                    </p>
                    {pageExpiry && (
                      <div className="mt-3">
                        <input
                          type="datetime-local"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={pageExpiry}
                      onChange={(e) => setPageExpiry(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative" />
                  </label>
                </div>

                {/* 2. Terms and Conditions */}
                <div className="p-6 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Terms and Conditions</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      You can add your own terms & conditions in addition to the default terms applied by PrimeProfile.
                    </p>
                    {customTerms && (
                      <div className="mt-3">
                        <textarea
                          rows={2}
                          value={termsContent}
                          onChange={(e) => setTermsContent(e.target.value)}
                          className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={customTerms}
                      onChange={(e) => setCustomTerms(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative" />
                  </label>
                </div>

                {/* 3. Personalise with colour (Matching Image 6 swatch box) */}
                <div className="p-6 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Personalise with colour</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Add your own colour to this payment page to represent your brand or the cause.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="color"
                      value={brandColour}
                      onChange={(e) => setBrandColour(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer overflow-hidden p-0"
                    />
                  </div>
                </div>

                {/* 4. Dark theme */}
                <div className="p-6 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Dark theme</h4>
                  </div>
                  <label className="cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={darkTheme}
                      onChange={(e) => setDarkTheme(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative" />
                  </label>
                </div>

                {/* 5. Deactivate sales */}
                <div className="p-6 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Deactivate sales</h4>
                  </div>
                  <label className="cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={deactivateSales}
                      onChange={(e) => setDeactivateSales(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative" />
                  </label>
                </div>

                {/* 6. Buyer questions under the checkout button (Defaults to ON in Image 6) */}
                <div className="p-6 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Buyer questions under the checkout button</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
                      Up to four questions, answered only from this page's own FAQs, refund policy and content. Buyers can ask you directly if it isn't covered. No AI.
                    </p>
                  </div>
                  <label className="cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={buyerQuestions}
                      onChange={(e) => setBuyerQuestions(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative" />
                  </label>
                </div>

                {/* 7. Tracking */}
                <div className="p-6 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Tracking</h4>
                    {trackingEnabled && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <input
                          type="text"
                          value={pixelId}
                          onChange={(e) => setPixelId(e.target.value)}
                          placeholder="Meta Pixel ID"
                          className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                        />
                        <input
                          type="text"
                          value={ga4Id}
                          onChange={(e) => setGa4Id(e.target.value)}
                          placeholder="Google Analytics GA4 ID"
                          className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={trackingEnabled}
                      onChange={(e) => setTrackingEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative" />
                  </label>
                </div>

                {/* Publish Footer in Settings */}
                <div className="p-6 bg-slate-50 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setBuilderTab('checkout')}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-full transition cursor-pointer"
                  >
                    Back to Checkout
                  </button>
                  <button
                    type="button"
                    onClick={handlePublishPage}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs px-8 py-2.5 rounded-full shadow-md shadow-pink-500/25 transition cursor-pointer"
                  >
                    Publish Page Now
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* CREATE DISCOUNT MODAL */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Create New Coupon Code</h3>
            <div>
              <label className="text-xs font-bold text-slate-600">Code (e.g. FLASH50)</label>
              <input
                type="text"
                value={newDiscountCode}
                onChange={(e) => setNewDiscountCode(e.target.value.toUpperCase())}
                placeholder="PROMO20"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Discount Percentage (%)</label>
              <input
                type="number"
                value={newDiscountPercent}
                onChange={(e) => setNewDiscountPercent(Number(e.target.value))}
                min={1}
                max={100}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDiscountModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newDiscountCode.trim()) {
                    setDiscounts([...discounts, { code: newDiscountCode.trim(), percent: newDiscountPercent, maxUses: 100 }]);
                    setNewDiscountCode('');
                    setIsDiscountModalOpen(false);
                  }
                }}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Add Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EXTRA FIELD MODAL */}
      {isAddExtraFieldModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Custom Checkout Field</h3>
            <div>
              <label className="text-xs font-bold text-slate-600">Field Label</label>
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="e.g. Instagram Handle or Full Address"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddExtraFieldModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newFieldName.trim()) {
                    setExtraFields([...extraFields, newFieldName.trim()]);
                    setNewFieldName('');
                    setIsAddExtraFieldModalOpen(false);
                  }
                }}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
