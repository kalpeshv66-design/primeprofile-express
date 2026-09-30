import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Upload,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown,
  Info,
  HelpCircle,
  Copy,
  Trash2,
  Edit2,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Undo2,
  Redo2,
  Type,
  SlidersHorizontal,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Monitor,
  Tag,
  Percent,
  Mail,
  Lock,
  Plus
} from 'lucide-react';
import { PaymentPage } from '../types';
import { PrimeProfileLogo, PrimeProfileIcon } from './PrimeProfileLogo';

interface DigitalProductBuilderProps {
  initialPage?: PaymentPage | null;
  onClose: () => void;
  onPublished: (pageId: string) => void;
}

export const DigitalProductBuilder: React.FC<DigitalProductBuilderProps> = ({
  initialPage,
  onClose,
  onPublished
}) => {
  const { profile, addPaymentPage, updatePaymentPage, addProduct } = useAuth();

  // Current Step: 1 | 2 | 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Preview Mode: 'desktop' | 'mobile'
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // ==========================================
  // STEP 1: PAGE DETAILS (Screenshots 1 & 2)
  // ==========================================
  const [pageTitle, setPageTitle] = useState(initialPage?.title || 'Your Payment Page Title Here');
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialPage?.coverImage ||
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1280&q=80'
  );
  const [videoLink, setVideoLink] = useState('');
  const [pageDescription, setPageDescription] = useState(
    initialPage?.description ||
      'Describe your page to let attendees know what to expect. Include highlights like the purpose, key activities, or notable speakers. Make it engaging and informative to generate interest and excitement.'
  );
  const [buttonText, setButtonText] = useState(initialPage?.buttonText || 'Get it now');

  // Optional Sections toggles
  const [showGallery, setShowGallery] = useState(false);
  const [showTestimonials, setShowTestimonials] = useState(true);
  const [showFaq, setShowFaq] = useState(true);
  const [showAboutMe, setShowAboutMe] = useState(false);
  const [showShowcaseProducts, setShowShowcaseProducts] = useState(false);

  // ==========================================
  // STEP 2: PAYMENT PAGE DETAILS (Screenshots 3 & 4)
  // ==========================================
  const [uploadedFiles, setUploadedFiles] = useState<
    { id: string; name: string; size: string; type: string }[]
  >([
    {
      id: 'f-1',
      name: 'primeprofile_demo.zip',
      size: '14.63 KB',
      type: 'zip'
    }
  ]);
  const [resourceLink, setResourceLink] = useState('');
  const [pricingType, setPricingType] = useState<'fixed' | 'pay_what_you_want'>('fixed');
  const [priceAmount, setPriceAmount] = useState<number>(initialPage?.price || 199);
  const [offerDiscountedPrice, setOfferDiscountedPrice] = useState(false);
  const [originalPriceAmount, setOriginalPriceAmount] = useState<number>(499);
  const [showAdvancedPricing, setShowAdvancedPricing] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(99);

  // Limit quantity
  const [limitQuantity, setLimitQuantity] = useState(false);
  const [maxStock, setMaxStock] = useState<number>(100);

  // ==========================================
  // STEP 3: ADVANCED SETTINGS (Screenshots 5 to 10)
  // ==========================================
  const [selectedTheme, setSelectedTheme] = useState<'default' | 'dawn' | 'dusk'>('default');
  const [styleColor, setStyleColor] = useState('#4C1D95'); // Purple default matching screenshot 6
  const [emailOtp, setEmailOtp] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState(false);
  const [collectPhone, setCollectPhone] = useState(true);
  const [buyerQuestionsUnderCheckout, setBuyerQuestionsUnderCheckout] = useState(true);

  // Questions
  const [additionalQuestions, setAdditionalQuestions] = useState<string[]>([]);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');

  // Setup Modals
  const [activeSetupModal, setActiveSetupModal] = useState<
    | null
    | 'gst'
    | 'bump'
    | 'email'
    | 'coupon'
    | 'terms'
    | 'refund'
    | 'privacy'
    | 'slug'
    | 'post_purchase'
    | 'meta_pixel'
    | 'ga4'
    | 'chatgpt_pixel'
    | 'checkout_type'
  >(null);

  // Modals state
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [bumpEnabled, setBumpEnabled] = useState(false);
  const [bumpTitle, setBumpTitle] = useState('Exclusive VIP Community Pass');
  const [bumpPrice, setBumpPrice] = useState(99);
  const [couponCode, setCouponCode] = useState('PROMO20');
  const [couponDiscount, setCouponDiscount] = useState(20);
  const [termsText, setTermsText] = useState('All digital products are non-refundable once downloaded. 24/7 instant support provided.');
  const [refundText, setRefundText] = useState('Due to the instant downloadable nature of digital assets, sales are final. Please review previews before purchasing.');
  const [privacyText, setPrivacyText] = useState('We respect your privacy. Email and phone information are collected only for product delivery and invoice verification.');
  const [customSlug, setCustomSlug] = useState(initialPage?.id ? `vp-${initialPage.id}` : 'vp');
  const [postPurchaseType, setPostPurchaseType] = useState<'download' | 'redirect'>('download');
  const [postPurchaseUrl, setPostPurchaseUrl] = useState('https://');
  const [metaPixelId, setMetaPixelId] = useState('');
  const [ga4Id, setGa4Id] = useState('');
  const [chatGptPixelId, setChatGptPixelId] = useState('');

  // File Input Refs
  const coverImageInputRef = useRef<HTMLInputElement | null>(null);
  const digitalFilesInputRef = useRef<HTMLInputElement | null>(null);

  // Upload handler for cover image
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Upload handler for digital files
  const handleDigitalFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newItems = Array.from(files).map((f) => {
        const sizeStr =
          f.size > 1024 * 1024
            ? `${(f.size / (1024 * 1024)).toFixed(2)} MB`
            : `${(f.size / 1024).toFixed(2)} KB`;
        return {
          id: 'f-' + Date.now() + Math.random().toString(36).substr(2, 4),
          name: f.name,
          size: sizeStr,
          type: f.name.split('.').pop() || 'file'
        };
      });
      setUploadedFiles((prev) => [...prev, ...newItems]);
    }
  };

  const handleAddResourceLink = () => {
    if (!resourceLink.trim()) return;
    setUploadedFiles((prev) => [
      ...prev,
      {
        id: 'f-' + Date.now(),
        name: resourceLink.trim(),
        size: 'External Link',
        type: 'link'
      }
    ]);
    setResourceLink('');
  };

  const handleAddVideoLink = () => {
    if (!videoLink.trim()) return;
    setCoverImageUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1280&q=80');
    setVideoLink('');
  };

  // Final Publish Handler
  const [publishing, setPublishing] = useState(false);
  const handleFinalPublish = async () => {
    setPublishing(true);
    try {
      const pageData = {
        title: pageTitle.trim() || 'Your Payment Page Title Here',
        description: pageDescription.trim(),
        price: Number(priceAmount) || 199,
        currency: profile?.currency || '₹',
        coverImage: coverImageUrl,
        buttonText: buttonText.trim() || 'Get it now',
        collectAddress: false,
        collectPhone: collectPhone,
        published: false,
        moderationStatus: 'pending' as const,
        submittedAt: Date.now(),
        creatorName: profile?.name || 'Creator',
        creatorEmail: profile?.email || 'creator@primeprofile.bio',
      };

      if (initialPage?.id) {
        await updatePaymentPage(initialPage.id, pageData);
        onPublished(initialPage.id);
      } else {
        await addPaymentPage(pageData);
        if (addProduct) {
          await addProduct({
            title: pageTitle.trim() || 'Your Payment Page Title Here',
            description: pageDescription.trim(),
            price: Number(priceAmount) || 199,
            originalPrice: offerDiscountedPrice ? Number(originalPriceAmount) : undefined,
            currency: profile?.currency || '₹',
            coverImage: coverImageUrl,
            fileType: 'zip',
            fileUrl: uploadedFiles[0]?.name || 'https://drive.google.com',
            category: 'Digital Products',
            published: true,
          });
        }
        onPublished('pay-' + Date.now());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const userEmail = profile?.email || 'kalpeshv66@gmail.com';
  const userPhone = profile?.signinPhone || profile?.supportPhone || '+91 8758523097';

  // Compute theme background style
  const getThemeBackgroundClass = () => {
    if (selectedTheme === 'dusk') return 'bg-slate-950 text-white';
    if (selectedTheme === 'dawn') return 'bg-slate-100 text-slate-900';
    return 'bg-[#2E103E] text-white'; // Default deep purple matching screenshots 6, 7
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121214] text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* ======================================================== */}
      {/* TOP BAR: [✕ | New page] . . . [Step Indicator]           */}
      {/* ======================================================== */}
      <header className="h-14 bg-[#18181b] border-b border-zinc-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            title="Close editor"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="h-4 w-px bg-zinc-700" />
          <PrimeProfileLogo variant="dark" size="xs" />
          <span className="text-xs font-semibold text-zinc-400 hidden sm:inline">
            / {initialPage ? 'Edit page' : 'New page'}
          </span>
        </div>

        {/* Stepper Center Indicator */}
        <div className="flex items-center gap-2.5 text-xs text-zinc-300">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                currentStep >= 1 ? 'bg-white' : 'bg-zinc-600'
              }`}
            />
            <span
              className={`w-2 h-2 rounded-full ${
                currentStep >= 2 ? 'bg-white' : 'bg-zinc-600'
              }`}
            />
            <span
              className={`w-2 h-2 rounded-full ${
                currentStep >= 3 ? 'bg-white' : 'bg-zinc-600'
              }`}
            />
          </div>
          <span className="font-medium text-zinc-400">
            {currentStep === 1 && 'Step 1 - Page Details'}
            {currentStep === 2 && 'Step 2 - Payment Page Details'}
            {currentStep === 3 && 'Step 3 - Advanced Settings'}
          </span>
        </div>

        {/* Top Right Preview Switcher */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-zinc-400 hidden sm:inline">Preview</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop')}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-semibold text-zinc-200 flex items-center gap-2 cursor-pointer transition"
            >
              {previewMode === 'desktop' ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Desktop</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Mobile</span>
                </>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN SPLIT VIEW: LEFT EDITOR | RIGHT LIVE PREVIEW        */}
      {/* ======================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ------------------------------------------------------ */}
        {/* LEFT COLUMN: 3-STEP FORM EDITOR                        */}
        {/* ------------------------------------------------------ */}
        <div className="w-full lg:w-[48%] xl:w-[45%] bg-white text-slate-900 border-r border-slate-200 overflow-y-auto p-6 sm:p-8 flex flex-col justify-between scrollbar-thin">
          <div className="space-y-6">
            {/* ==================================================== */}
            {/* STEP 1: PAGE DETAILS (Screenshots 1 & 2)             */}
            {/* ==================================================== */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Tell us about your Payment Page</h2>
                </div>

                {/* 1. Payment Page Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Payment Page Title <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={75}
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      placeholder="Your Payment Page Title Here"
                      className="w-full px-3.5 py-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] text-slate-400 font-medium">
                      {pageTitle.length}/75
                    </span>
                  </div>
                </div>

                {/* 2. Cover Image */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Cover Image <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="file"
                    ref={coverImageInputRef}
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                  <div className="border border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/50 flex flex-col items-center justify-center">
                    <div
                      onClick={() => coverImageInputRef.current?.click()}
                      className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 cursor-pointer hover:scale-105 transition"
                    >
                      <Upload className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="text-xs font-semibold text-slate-700">
                      <button
                        type="button"
                        onClick={() => coverImageInputRef.current?.click()}
                        className="text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        Upload
                      </button>{' '}
                      or drag & drop
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      1280 x 720 (16:9) recommended; Up to 10 MB each
                    </p>

                    <div className="relative my-4 w-full flex items-center justify-center">
                      <div className="border-t border-slate-200 w-full" />
                      <span className="bg-slate-50 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        OR
                      </span>
                    </div>

                    <div className="w-full flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Add video link (Youtube, Vimeo, etc.)"
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddVideoLink}
                        className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-xl cursor-pointer transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Description with Toolbar */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-slate-400">
                    {/* Rich text toolbar matching Screenshot 1 */}
                    <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-2 text-slate-600">
                      <button type="button" className="p-1 hover:bg-slate-200 rounded font-bold text-xs" title="Bold">
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded italic text-xs" title="Italic">
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded font-bold text-xs" title="Underline">
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                      <div className="h-3 w-px bg-slate-300" />
                      <button type="button" className="p-1 hover:bg-slate-200 rounded" title="Align">
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded" title="List">
                        <ListOrdered className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded" title="Link">
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="h-3 w-px bg-slate-300" />
                      <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 cursor-pointer">
                        Size <ChevronDown className="w-3 h-3 text-slate-400" />
                      </span>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded" title="Image">
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded" title="Video">
                        <VideoIcon className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded" title="Undo">
                        <Undo2 className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded" title="Redo">
                        <Redo2 className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded font-bold text-xs" title="Text format">
                        <Type className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <textarea
                      rows={5}
                      value={pageDescription}
                      onChange={(e) => setPageDescription(e.target.value)}
                      placeholder="Describe what the customer will receive..."
                      className="w-full p-3.5 text-xs text-slate-800 focus:outline-none resize-y leading-relaxed font-normal"
                    />
                  </div>
                </div>

                {/* 4. Button Text */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Button Text <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={25}
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="Get it now"
                      className="w-full px-3.5 py-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] text-slate-400 font-medium">
                      {buttonText.length}/25
                    </span>
                  </div>
                </div>

                {/* 5. Optional Sections (Screenshot 2) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Optional Sections
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowGallery(!showGallery)}
                      className={`p-3 border rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition ${
                        showGallery
                          ? 'border-blue-500 bg-blue-50/40 text-blue-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 text-slate-500" />
                      <span>Gallery</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowTestimonials(!showTestimonials)}
                      className={`p-3 border rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition ${
                        showTestimonials
                          ? 'border-blue-500 bg-blue-50/40 text-blue-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="font-serif font-black text-xs text-slate-500">99</span>
                      <span>Testimonials</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowFaq(!showFaq)}
                      className={`p-3 border rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition ${
                        showFaq
                          ? 'border-blue-500 bg-blue-50/40 text-blue-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4 text-slate-500" />
                      <span>FAQ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAboutMe(!showAboutMe)}
                      className={`p-3 border rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition ${
                        showAboutMe
                          ? 'border-blue-500 bg-blue-50/40 text-blue-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center text-[9px]">👤</span>
                      <span>About Me</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowShowcaseProducts(!showShowcaseProducts)}
                      className={`col-span-2 p-3 border rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition ${
                        showShowcaseProducts
                          ? 'border-blue-500 bg-blue-50/40 text-blue-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Tag className="w-4 h-4 text-slate-500" />
                      <span>Showcase Products</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* STEP 2: PAYMENT PAGE DETAILS (Screenshots 3 & 4)     */}
            {/* ==================================================== */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Upload your digital files</h2>
                </div>

                {/* Upload Box */}
                <div>
                  <input
                    type="file"
                    ref={digitalFilesInputRef}
                    multiple
                    onChange={handleDigitalFilesUpload}
                    className="hidden"
                  />
                  <div className="border border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/50 flex flex-col items-center justify-center">
                    <div
                      onClick={() => digitalFilesInputRef.current?.click()}
                      className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 cursor-pointer hover:scale-105 transition"
                    >
                      <Upload className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="text-xs font-semibold text-slate-700">
                      <button
                        type="button"
                        onClick={() => digitalFilesInputRef.current?.click()}
                        className="text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        Upload
                      </button>{' '}
                      or drag & drop
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Unlimited files, 100MB total limit
                    </p>

                    <div className="relative my-4 w-full flex items-center justify-center">
                      <div className="border-t border-slate-200 w-full" />
                      <span className="bg-slate-50 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        OR
                      </span>
                    </div>

                    <div className="w-full flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Add resource link"
                        value={resourceLink}
                        onChange={(e) => setResourceLink(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddResourceLink}
                        className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-xl cursor-pointer transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Uploaded Files List (Screenshot 3 & 4) */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
                    <span>Uploads ({uploadedFiles.length})</span>
                    <span>Size (0.0/100MB)</span>
                  </div>

                  <div className="space-y-2">
                    {uploadedFiles.map((f) => (
                      <div
                        key={f.id}
                        className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-white text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <div>
                            <span className="font-bold text-slate-800">{f.name}</span>
                            <div className="text-[11px] text-slate-400">{f.size}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadedFiles(uploadedFiles.filter((item) => item.id !== f.id))}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Radio Cards (Screenshot 3) */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-700">Pricing</label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Fixed Price */}
                    <div
                      onClick={() => setPricingType('fixed')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                        pricingType === 'fixed'
                          ? 'border-blue-600 bg-blue-50/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Fixed Price</span>
                        {pricingType === 'fixed' ? (
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                            ✓
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">Charge a one-time fixed pay</p>
                    </div>

                    {/* Customers decide price */}
                    <div
                      onClick={() => setPricingType('pay_what_you_want')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                        pricingType === 'pay_what_you_want'
                          ? 'border-blue-600 bg-blue-50/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Customers decide price</span>
                        {pricingType === 'pay_what_you_want' ? (
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                            ✓
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">Let customers pay any price</p>
                    </div>
                  </div>

                  {/* Price input */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Price <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={priceAmount}
                        onChange={(e) => setPriceAmount(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-2.5 text-xs font-bold text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    </div>
                  </div>

                  {/* Offer discounted price checkbox */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={offerDiscountedPrice}
                        onChange={(e) => setOfferDiscountedPrice(e.target.checked)}
                        className="rounded text-blue-600 cursor-pointer"
                      />
                      <span>Offer discounted price</span>
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                    </label>

                    {offerDiscountedPrice && (
                      <div className="mt-2.5 pl-6">
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Original / Strikethrough Price (₹)
                        </label>
                        <input
                          type="number"
                          value={originalPriceAmount}
                          onChange={(e) => setOriginalPriceAmount(Number(e.target.value))}
                          className="w-48 px-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg"
                          placeholder="e.g. 499"
                        />
                      </div>
                    )}
                  </div>

                  {/* Advanced Settings */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedPricing(!showAdvancedPricing)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Advanced Settings</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          showAdvancedPricing ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {showAdvancedPricing && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Minimum Threshold Price (₹)
                          </label>
                          <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Limit Quantity (Screenshot 4) */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Limit Quantity</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Limit total number of purchases?
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Set a maximum limit on total stock available
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLimitQuantity(!limitQuantity)}
                      className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                        limitQuantity ? 'bg-slate-900' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          limitQuantity ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {limitQuantity && (
                    <div className="mt-3">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Max Total Purchases Available
                      </label>
                      <input
                        type="number"
                        value={maxStock}
                        onChange={(e) => setMaxStock(Number(e.target.value))}
                        className="w-48 px-3 py-1.5 text-xs text-slate-900 border border-slate-200 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* STEP 3: ADVANCED SETTINGS (Screenshots 5 to 10)      */}
            {/* ==================================================== */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 1. Theme and Styling (Screenshot 5) */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 mb-3">Theme and Styling</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Default */}
                    <div
                      onClick={() => setSelectedTheme('default')}
                      className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                        selectedTheme === 'default'
                          ? 'border-blue-600 bg-blue-50/20 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="h-16 rounded-lg bg-purple-900/20 border border-purple-300/40 p-2 flex flex-col justify-between mb-2">
                        <div className="w-8 h-2 rounded bg-purple-600" />
                        <div className="w-full h-8 rounded bg-white border border-purple-200" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Default</span>
                    </div>

                    {/* Dawn */}
                    <div
                      onClick={() => setSelectedTheme('dawn')}
                      className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                        selectedTheme === 'dawn'
                          ? 'border-blue-600 bg-blue-50/20 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="h-16 rounded-lg bg-slate-100 border border-slate-300 p-2 flex flex-col justify-between mb-2">
                        <div className="w-8 h-2 rounded bg-slate-400" />
                        <div className="w-full h-8 rounded bg-white border border-slate-200" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Dawn</span>
                    </div>

                    {/* Dusk */}
                    <div
                      onClick={() => setSelectedTheme('dusk')}
                      className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                        selectedTheme === 'dusk'
                          ? 'border-blue-600 bg-blue-50/20 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="h-16 rounded-lg bg-slate-900 border border-slate-700 p-2 flex flex-col justify-between mb-2">
                        <div className="w-8 h-2 rounded bg-slate-600" />
                        <div className="w-full h-8 rounded bg-slate-800 border border-slate-700" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Dusk</span>
                    </div>
                  </div>

                  {/* Style Color Palette (Screenshots 5 & 6) */}
                  <div className="mt-4 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Style</span>
                    <div className="flex items-center gap-2">
                      {['#4C1D95', '#2563EB', '#10B981', '#F59E0B', '#EF4444'].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setStyleColor(col)}
                          style={{ backgroundColor: col }}
                          className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                            styleColor === col ? 'scale-125 ring-2 ring-offset-2 ring-slate-900' : 'hover:scale-110'
                          }`}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => setStyleColor('#4C1D95')}
                        className="ml-3 text-[11px] font-bold text-slate-500 hover:text-slate-800"
                      >
                        Reset to default
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      The default style uses the same styling you have on your store. This helps your store and all your products to look consistent and create a seamless store experience to your site visitors.{' '}
                      <span className="text-blue-600 underline cursor-pointer">Learn more</span>
                    </p>
                  </div>
                </div>

                {/* 2. Checkout Experience (Screenshot 5) */}
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900">Checkout Experience</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 mb-2.5">
                    Customize how you would like customers to checkout on this product
                  </p>

                  <div className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-white text-xs">
                    <span className="font-semibold text-slate-800">Same Page Checkout</span>
                    <button
                      type="button"
                      onClick={() => setActiveSetupModal('checkout_type')}
                      className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Customise
                    </button>
                  </div>
                </div>

                {/* 3. Customer Information (Screenshot 5) */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900">Customer information</h3>

                  <div className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-white text-xs">
                    <span className="font-semibold text-slate-800">Email ID</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">Verification Code</span>
                      <button
                        type="button"
                        onClick={() => setEmailOtp(!emailOtp)}
                        className={`w-10 h-5 rounded-full transition-colors p-0.5 cursor-pointer ${
                          emailOtp ? 'bg-slate-900' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            emailOtp ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 leading-relaxed">
                    Turning off OTP verification could lead to your customers sharing spam emails, affecting your future marketing opportunities.
                  </div>
                </div>

                {/* 4. Ask Additional Questions (Screenshot 6) */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900">Ask additional questions</h3>

                  <div className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-white text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">⠿</span>
                      <span className="font-semibold text-slate-800">
                        Phone number <span className="text-rose-500">*</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">Verification Code</span>
                      <button
                        type="button"
                        onClick={() => setPhoneOtp(!phoneOtp)}
                        className={`w-10 h-5 rounded-full transition-colors p-0.5 cursor-pointer ${
                          phoneOtp ? 'bg-slate-900' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            phoneOtp ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {additionalQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-white text-xs"
                    >
                      <span className="font-semibold text-slate-800">{q}</span>
                      <button
                        type="button"
                        onClick={() => setAdditionalQuestions(additionalQuestions.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setIsQuestionModalOpen(true)}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Add Question</span>
                  </button>
                </div>

                {/* 5. Pricing: GST (Screenshot 9) */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900">Pricing</h3>
                  <div className="flex items-center justify-between text-xs py-1">
                    <div>
                      <span className="font-bold text-slate-800 block">GST</span>
                      <span className="text-[11px] text-slate-400">You can enable or disable GST on price here</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSetupModal('gst')}
                      className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      {gstEnabled ? 'Enabled (18%)' : 'Setup'}
                    </button>
                  </div>
                </div>

                {/* 6. Boost Sales (Screenshot 9) */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900">Boost Sales</h3>

                  {/* Bump Offer */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <div>
                      <span className="font-bold text-slate-800 block">Bump Offer</span>
                      <span className="text-[11px] text-slate-400">Offer add-on product during checkout</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSetupModal('bump')}
                      className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      {bumpEnabled ? 'Configured' : 'Setup'}
                    </button>
                  </div>

                  {/* Automated Email */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <div>
                      <span className="font-bold text-slate-800 block">Automated Email</span>
                      <span className="text-[11px] text-slate-400">Trigger Email Automations based on certain triggers</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSetupModal('email')}
                      className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Setup
                    </button>
                  </div>

                  {/* Discount Coupons */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <div>
                      <span className="font-bold text-slate-800 block">Discount Coupons</span>
                      <span className="text-[11px] text-slate-400">Offer discounts to your audience to boost sales</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSetupModal('coupon')}
                      className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Setup
                    </button>
                  </div>
                </div>

                {/* 7. Terms and Policies (Screenshot 9 & 10) */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900">Terms and Policies</h3>

                  <div className="flex items-center justify-between text-xs py-1">
                    <div>
                      <span className="font-bold text-slate-800 block">Terms and Conditions</span>
                      <span className="text-[11px] text-slate-400">Add additional terms you want to show to the users</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSetupModal('terms')}
                      className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Setup
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <div>
                      <span className="font-bold text-slate-800 block">Refund Policy</span>
                      <span className="text-[11px] text-slate-400">Refund policy will be shown to the customers</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSetupModal('refund')}
                      className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Setup
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <div>
                      <span className="font-bold text-slate-800 block">Privacy Policy</span>
                      <span className="text-[11px] text-slate-400">Privacy policy will be shown to the customers</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSetupModal('privacy')}
                      className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Setup
                    </button>
                  </div>
                </div>

                {/* 8. Page URL (Screenshot 9) */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs py-1">
                    <div>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        Page URL <Info className="w-3 h-3 text-slate-400" />
                      </span>
                      <span className="text-[11px] text-slate-400">Customise the slug of your page URL</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSetupModal('slug')}
                      className="p-1.5 text-slate-400 hover:text-slate-800 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 9. Post Purchase Behaviour (Screenshot 9) */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs py-1">
                    <div>
                      <span className="font-bold text-slate-800 block">Post Purchase Behaviour</span>
                      <span className="text-[11px] text-slate-400">Define what needs to happen when someone complete the purchase</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSetupModal('post_purchase')}
                      className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Setup
                    </button>
                  </div>
                </div>

                {/* 10. Tracking (Screenshot 10) */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900">Tracking</h3>

                  <div className="flex items-center justify-between text-xs py-1">
                    <div>
                      <span className="font-bold text-slate-800 block">Meta Pixel</span>
                      <span className="text-[11px] text-slate-400">Connect your Pixel IDs to this product to run re-marketing campaigns on Meta Business</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSetupModal('meta_pixel')}
                      className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Setup
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <div>
                      <span className="font-bold text-slate-800 block">Google Analytics</span>
                      <span className="text-[11px] text-slate-400">Add your Google Analytics Tracking IDs to get crucial visitor-level data on your GA dashboard.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSetupModal('ga4')}
                      className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Setup
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <div>
                      <span className="font-bold text-slate-800 block">ChatGPT Ads Pixel</span>
                      <span className="text-[11px] text-slate-400">Connect your OpenAI Ads Pixel IDs to this product to measure conversions from ChatGPT Ads</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSetupModal('chatgpt_pixel')}
                      className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Setup
                    </button>
                  </div>
                </div>

                {/* 11. Buyer questions under checkout button (Screenshot 10) */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">
                        Buyer questions under the checkout button
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed max-w-sm">
                        Up to four questions, answered only from this page's own FAQs, refund policy and content. Buyers can ask you directly if it isn't covered. No AI.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBuyerQuestionsUnderCheckout(!buyerQuestionsUnderCheckout)}
                      className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ml-4 ${
                        buyerQuestionsUnderCheckout ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          buyerQuestionsUnderCheckout ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* BOTTOM STEP CONTROLS: [< Back] | [Save and Continue] */}
          {/* ==================================================== */}
          <div className="pt-8 border-t border-slate-100 flex items-center justify-end gap-3 mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : 1))}
                className="px-5 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer flex items-center gap-1.5"
              >
                <span>&lt; Back</span>
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : 3))}
                className="px-6 py-2.5 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-full shadow-md transition cursor-pointer"
              >
                Save and Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalPublish}
                disabled={publishing}
                className="px-7 py-2.5 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-full shadow-md transition cursor-pointer flex items-center gap-2"
              >
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* RIGHT COLUMN: INTERACTIVE LIVE PREVIEW (Exact match)   */}
        {/* ------------------------------------------------------ */}
        <div className="hidden lg:flex flex-1 bg-[#101012] items-center justify-center p-6 overflow-y-auto relative">
          {/* Subtle Grid Background Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* ==================================================== */}
          {/* PREVIEW: DESKTOP MAC WINDOW                          */}
          {/* ==================================================== */}
          {previewMode === 'desktop' ? (
            <div className="w-full max-w-3xl bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col transition-all">
              {/* Browser Window Header */}
              <div className="h-9 bg-[#1e1e22] px-4 flex items-center justify-between border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>

                <div className="px-6 py-0.5 bg-zinc-800/80 rounded-md text-[10px] text-zinc-400 font-mono">
                  primeprofile.bio/{customSlug}
                </div>

                <div className="w-8" />
              </div>

              {/* Browser Body with Selected Theme */}
              <div
                className={`p-6 max-h-[640px] overflow-y-auto scrollbar-thin transition-colors ${getThemeBackgroundClass()}`}
              >
                {/* Top Creator Bar */}
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                      alt="Avatar"
                      className="w-7 h-7 rounded-full object-cover border border-white/20"
                    />
                    <span className="text-xs font-bold text-white/90">
                      {profile?.name || 'Ananya Sharma'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/80 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-xs">
                      <PrimeProfileIcon size={13} idPrefix="prev-desk-p" />
                      <span>Built with ♡ on PrimeProfile</span>
                    </span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                      K
                    </div>
                  </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl p-6 text-slate-900 shadow-xl border border-slate-100 flex flex-col md:flex-row gap-6">
                  {/* Left Column in Card */}
                  <div className="flex-1 space-y-4">
                    {/* Media / Cover */}
                    {coverImageUrl && (
                      <div className="rounded-2xl overflow-hidden border border-slate-100 aspect-video bg-slate-100 shadow-xs">
                        <img
                          src={coverImageUrl}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                      {pageTitle || 'Your Payment Page Title Here'}
                    </h3>

                    {/* About The Page */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        ABOUT THE PAGE
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {pageDescription ||
                          'Describe your page to let attendees know what to expect. Include highlights like the purpose, key activities, or notable speakers. Make it engaging and informative to generate interest and excitement.'}
                      </p>
                    </div>

                    {/* What You'll Get Table (Matching screenshot 3) */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        WHAT YOU'LL GET
                      </span>
                      <div className="border border-slate-200 rounded-xl overflow-hidden text-xs divide-y divide-slate-100 bg-slate-50/50">
                        <div className="flex justify-between py-2 px-3 text-[11px]">
                          <span className="text-slate-500">Number of resources</span>
                          <span className="font-bold text-slate-800">{uploadedFiles.length || 1}</span>
                        </div>
                        <div className="flex justify-between py-2 px-3 text-[11px]">
                          <span className="text-slate-500">Resource content</span>
                          <span className="font-bold text-slate-800">File</span>
                        </div>
                        <div className="flex justify-between py-2 px-3 text-[11px]">
                          <span className="text-slate-500">Total file size</span>
                          <span className="font-bold text-slate-800">{uploadedFiles[0]?.size || '14.63 KB'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Terms and conditions toggle in card */}
                    <div className="text-[11px] text-slate-400 font-medium pt-1">
                      + Terms and conditions
                    </div>
                  </div>

                  {/* Right Column: Checkout Widget Card (Exact match) */}
                  <div className="w-full md:w-64 space-y-3 shrink-0">
                    <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-3">
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Access to this purchase will be sent to this email
                      </p>

                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">Email Address</span>
                        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs">
                          <span className="font-medium text-slate-800 truncate text-[11px]">{userEmail}</span>
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                            ✓ Verified
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">Phone number *</span>
                        <div className="bg-white px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 text-[11px]">
                          {userPhone}
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-2 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>Sub Total</span>
                          <span className="font-bold text-slate-800">₹{priceAmount}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>Total</span>
                          <span className="font-bold text-slate-800">₹{priceAmount}</span>
                        </div>
                      </div>

                      <div className="pt-1">
                        <div className="text-[10px] text-slate-400 font-semibold mb-0.5">Amount total</div>
                        <div className="text-base font-black text-slate-900 mb-2">₹{priceAmount}</div>

                        <button
                          type="button"
                          style={{ backgroundColor: styleColor }}
                          className="w-full py-2.5 px-3 rounded-xl text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
                        >
                          <span>{buttonText || 'Get it now'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Buyer Questions accordion */}
                      {buyerQuestionsUnderCheckout && (
                        <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
                          <span className="font-bold text-slate-700 block">
                            Questions before you buy? Answers come from this page.
                          </span>
                          <p className="text-slate-400">What do I get? How do I get access?</p>
                        </div>
                      )}
                    </div>

                    {/* Invite your network copy link pill */}
                    <div className="text-center pt-1">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                        INVITE YOUR NETWORK
                      </span>
                      <button
                        type="button"
                        className="w-full py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copy link</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ==================================================== */
            /* PREVIEW: MOBILE SMARTPHONE FRAME                     */
            /* ==================================================== */
            <div className="w-[320px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative transition-all">
              {/* Dynamic Island */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-black rounded-full z-20" />

              <div
                className={`w-full min-h-[580px] max-h-[620px] rounded-[34px] overflow-y-auto p-4 flex flex-col justify-between scrollbar-thin transition-colors ${getThemeBackgroundClass()}`}
              >
                <div className="space-y-3 pt-6">
                  {/* Creator Header */}
                  <div className="flex items-center justify-between text-white/80 pb-2">
                    <div className="flex items-center gap-1.5">
                      <PrimeProfileIcon size={14} idPrefix="prev-mob-p" />
                      <span className="text-[10px] font-bold">primeprofile.bio/vp</span>
                    </div>
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[9px]">
                      K
                    </span>
                  </div>

                  {/* Title & Cover */}
                  <h4 className="text-sm font-black text-white leading-tight">
                    {pageTitle || 'Your Payment Page Title Here'}
                  </h4>

                  {coverImageUrl && (
                    <div className="rounded-xl overflow-hidden aspect-video bg-black/40">
                      <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="bg-white rounded-2xl p-3 text-slate-900 space-y-2 text-xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      ABOUT THE PAGE
                    </span>
                    <p className="text-[11px] text-slate-600 line-clamp-3">
                      {pageDescription}
                    </p>

                    <div className="border border-slate-200 rounded-lg p-2 text-[10px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Resources</span>
                        <span className="font-bold text-slate-800">{uploadedFiles.length || 1} File</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total size</span>
                        <span className="font-bold text-slate-800">{uploadedFiles[0]?.size || '14.63 KB'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Sticky CTA in Mobile */}
                <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-white/10 mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-white">
                    <span className="text-slate-400 text-[10px]">Amount total</span>
                    <span className="font-black text-sm">₹{priceAmount}</span>
                  </div>
                  <button
                    type="button"
                    style={{ backgroundColor: styleColor }}
                    className="w-full py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>{buttonText || 'Get it now'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODALS FOR SETUP BUTTONS & CUSTOMIZATIONS                */}
      {/* ======================================================== */}

      {/* 1. Add Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold">Add Additional Question</h4>
            <input
              type="text"
              placeholder="e.g. Instagram Username or City"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-400"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-500 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newQuestionText.trim()) {
                    setAdditionalQuestions([...additionalQuestions, newQuestionText.trim()]);
                    setNewQuestionText('');
                  }
                  setIsQuestionModalOpen(false);
                }}
                className="px-4 py-1.5 bg-black text-white text-xs font-bold rounded-xl"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Setup Modals for GST, Bump Offer, Coupons, Slug, Policies, etc. */}
      {activeSetupModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold capitalize">
                {activeSetupModal.replace('_', ' ')} Setup
              </h3>
              <button
                type="button"
                onClick={() => setActiveSetupModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* GST Modal */}
            {activeSetupModal === 'gst' && (
              <div className="space-y-3 text-xs">
                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gstEnabled}
                    onChange={(e) => setGstEnabled(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Enable GST on this payment page</span>
                </label>
                {gstEnabled && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      GST Rate (%)
                    </label>
                    <select
                      value={gstPercentage}
                      onChange={(e) => setGstPercentage(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    >
                      <option value={5}>5% (Standard Essential)</option>
                      <option value={12}>12% (Standard Goods)</option>
                      <option value={18}>18% (Standard Digital Services)</option>
                      <option value={28}>28% (Luxury)</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Bump Offer Modal */}
            {activeSetupModal === 'bump' && (
              <div className="space-y-3 text-xs">
                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bumpEnabled}
                    onChange={(e) => setBumpEnabled(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Enable 1-Click Order Bump on Checkout</span>
                </label>
                {bumpEnabled && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Bump Product Title
                      </label>
                      <input
                        type="text"
                        value={bumpTitle}
                        onChange={(e) => setBumpTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Bump Price (₹)
                      </label>
                      <input
                        type="number"
                        value={bumpPrice}
                        onChange={(e) => setBumpPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Discount Coupon Modal */}
            {activeSetupModal === 'coupon' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={couponDiscount}
                    onChange={(e) => setCouponDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Terms and Policies Modal */}
            {activeSetupModal === 'terms' && (
              <div className="space-y-3 text-xs">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Terms and Conditions Text
                </label>
                <textarea
                  rows={4}
                  value={termsText}
                  onChange={(e) => setTermsText(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl"
                />
              </div>
            )}

            {activeSetupModal === 'refund' && (
              <div className="space-y-3 text-xs">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Refund Policy Text
                </label>
                <textarea
                  rows={4}
                  value={refundText}
                  onChange={(e) => setRefundText(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl"
                />
              </div>
            )}

            {activeSetupModal === 'privacy' && (
              <div className="space-y-3 text-xs">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Privacy Policy Text
                </label>
                <textarea
                  rows={4}
                  value={privacyText}
                  onChange={(e) => setPrivacyText(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl"
                />
              </div>
            )}

            {/* Custom URL Slug Modal */}
            {activeSetupModal === 'slug' && (
              <div className="space-y-3 text-xs">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Page URL Slug
                </label>
                <div className="flex items-center gap-1 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                  <span className="text-slate-400 font-mono text-[11px]">primeprofile.bio/</span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                    className="flex-1 bg-transparent font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Tracking Pixels Modals */}
            {activeSetupModal === 'meta_pixel' && (
              <div className="space-y-3 text-xs">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Meta (Facebook) Pixel ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456789012345"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            )}

            {activeSetupModal === 'ga4' && (
              <div className="space-y-3 text-xs">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Google Analytics 4 Measurement ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. G-ABC123XYZ"
                  value={ga4Id}
                  onChange={(e) => setGa4Id(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            )}

            {activeSetupModal === 'chatgpt_pixel' && (
              <div className="space-y-3 text-xs">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  ChatGPT Ads Conversion Pixel
                </label>
                <input
                  type="text"
                  placeholder="e.g. cgt-pixel-88492"
                  value={chatGptPixelId}
                  onChange={(e) => setChatGptPixelId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            )}

            {activeSetupModal === 'post_purchase' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Post Purchase Action
                  </label>
                  <select
                    value={postPurchaseType}
                    onChange={(e) => setPostPurchaseType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="download">Show Direct Instant Download Page</option>
                    <option value="redirect">Redirect Buyer to Custom URL</option>
                  </select>
                </div>
                {postPurchaseType === 'redirect' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Redirect URL
                    </label>
                    <input
                      type="url"
                      value={postPurchaseUrl}
                      onChange={(e) => setPostPurchaseUrl(e.target.value)}
                      placeholder="https://yourwebsite.com/thank-you"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                )}
              </div>
            )}

            {activeSetupModal === 'checkout_type' && (
              <div className="space-y-3 text-xs">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Checkout Style
                </label>
                <div className="p-3 border border-blue-500 bg-blue-50/20 rounded-xl text-xs font-semibold text-blue-900">
                  ✓ Same Page Instant Checkout (Highest 84% conversion rate)
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveSetupModal(null)}
                className="px-5 py-2 bg-black text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
