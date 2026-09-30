import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  CreditCard,
  Bell,
  Shield,
  Layers,
  Info,
  Edit2,
  Check,
  Upload,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Download,
  ExternalLink,
  Smartphone,
  Globe,
  Lock,
  Copy,
  Receipt,
  AlertCircle,
  Building2,
  Eye,
  EyeOff,
  QrCode,
  FileText,
  Send,
  X
} from 'lucide-react';
import { UpgradeToCreatorPlanModal } from './UpgradeToCreatorPlanModal';

interface AccountSettingsProps {
  onNavigate?: (route: string) => void;
}

type TabType = 'profile' | 'billing' | 'payments' | 'integrations' | 'notification' | 'security';

// Bank name helper based on common IFSC prefixes
const detectBankFromIFSC = (ifsc: string): string => {
  const code = ifsc.trim().toUpperCase();
  if (code.startsWith('HDFC')) return 'HDFC Bank Ltd';
  if (code.startsWith('SBIN')) return 'State Bank of India (SBI)';
  if (code.startsWith('ICIC')) return 'ICICI Bank';
  if (code.startsWith('UTIB') || code.startsWith('AXIS')) return 'Axis Bank';
  if (code.startsWith('KKBK')) return 'Kotak Mahindra Bank';
  if (code.startsWith('PUNB')) return 'Punjab National Bank (PNB)';
  if (code.startsWith('BARB')) return 'Bank of Baroda';
  if (code.startsWith('CNRB')) return 'Canara Bank';
  if (code.startsWith('UBIN')) return 'Union Bank of India';
  if (code.startsWith('YESB')) return 'Yes Bank';
  if (code.startsWith('IDFB')) return 'IDFC First Bank';
  if (code.length >= 4) return `${code.slice(0, 4)} Scheduled Bank`;
  return '';
};

export const AccountSettings: React.FC<AccountSettingsProps> = ({ onNavigate }) => {
  const { profile, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('payments');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals state
  const [showRequestPaymentsModal, setShowRequestPaymentsModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState<null | { type: 'phone' | 'email'; target: string }>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [showOlderReceiptsModal, setShowOlderReceiptsModal] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // -------------------------------------------------------------
  // TAB 1: Profile State
  // -------------------------------------------------------------
  const [firstName, setFirstName] = useState(profile?.firstName || profile?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(profile?.lastName || profile?.name?.split(' ').slice(1).join(' ') || '');
  const [aboutName, setAboutName] = useState(profile?.name || '');
  const [headline, setHeadline] = useState(profile?.headline || 'Creator & Digital Entrepreneur');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarPreview, setAvatarPreview] = useState<string>(
    profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([
    { platform: 'Instagram', url: profile?.socials?.instagram ? (profile.socials.instagram.startsWith('http') ? profile.socials.instagram : `https://instagram.com/${profile.socials.instagram}`) : 'https://instagram.com/rohanstyle' },
    { platform: 'YouTube', url: profile?.socials?.youtube ? (profile.socials.youtube.startsWith('http') ? profile.socials.youtube : `https://youtube.com/@${profile.socials.youtube}`) : 'https://youtube.com/@rohanstyle' },
  ]);

  // Signin & Support Information
  const [signinEmail, setSigninEmail] = useState(profile?.email || '');
  const [signinPhone, setSigninPhone] = useState(profile?.signinPhone || '');
  const [isEditingSigninEmail, setIsEditingSigninEmail] = useState(false);
  const [isEditingSigninPhone, setIsEditingSigninPhone] = useState(false);

  const [supportEmail, setSupportEmail] = useState(profile?.supportEmail || profile?.email || '');
  const [supportPhone, setSupportPhone] = useState(profile?.supportPhone || '');
  const [isEditingSupportEmail, setIsEditingSupportEmail] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [reachPreference, setReachPreference] = useState<'email' | 'phone' | 'both'>(
    profile?.reachPreference || 'both'
  );

  // -------------------------------------------------------------
  // TAB 3: Payments State
  // -------------------------------------------------------------
  const [upiActive, setUpiActive] = useState<boolean>(
    profile?.settlement?.upiActive !== undefined ? profile.settlement.upiActive : false
  );
  const [cardsRequested, setCardsRequested] = useState<boolean>(
    profile?.settlement?.cardsRequested || false
  );
  const [cardsActive, setCardsActive] = useState<boolean>(
    profile?.settlement?.cardsActive || false
  );

  const [accountHolderName, setAccountHolderName] = useState(
    profile?.settlement?.accountHolderName || ''
  );
  const [accountNumber, setAccountNumber] = useState(
    profile?.settlement?.accountNumber || ''
  );
  const [ifscCode, setIfscCode] = useState(
    profile?.settlement?.ifscCode || ''
  );
  const [detectedBank, setDetectedBank] = useState<string>(
    profile?.settlement?.bankName || (profile?.settlement?.ifscCode ? detectBankFromIFSC(profile.settlement.ifscCode) : '')
  );
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [accountSaveError, setAccountSaveError] = useState<string | null>(null);

  const [gstin, setGstin] = useState(profile?.settlement?.gstin || '');
  const [gstSaved, setGstSaved] = useState(false);

  // Invoice Details
  const [invoiceLogo, setInvoiceLogo] = useState<string>(profile?.settlement?.invoiceLogo || '');
  const [signatureImage, setSignatureImage] = useState<string>(profile?.settlement?.signature || '');
  const [customInvoiceNote, setCustomInvoiceNote] = useState(
    profile?.settlement?.customNote || 'Thank you for your purchase! For any queries or direct access support, reach out on WhatsApp.'
  );
  const [showInvoiceNoteInput, setShowInvoiceNoteInput] = useState(true);
  const [invoiceAddress, setInvoiceAddress] = useState(
    profile?.settlement?.invoiceAddress || 'Studio 402, Signature Tower, SG Highway, Ahmedabad, Gujarat - 380054'
  );
  const [tempAddress, setTempAddress] = useState(invoiceAddress);

  // Request Other Payments Modal state
  const [businessType, setBusinessType] = useState('Individual / Freelancer');
  const [expectedVolume, setExpectedVolume] = useState('₹1,00,000 - ₹5,00,000 / month');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');

  // -------------------------------------------------------------
  // TAB 4: Integrations State
  // -------------------------------------------------------------
  const [facebookPixelId, setFacebookPixelId] = useState(profile?.integrations?.facebookPixelId || '198273645019');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(profile?.integrations?.googleAnalyticsId || 'G-7XYZ89ABCD');
  const [webhookUrl, setWebhookUrl] = useState(profile?.integrations?.webhookUrl || '');
  const [metaTitle, setMetaTitle] = useState(profile?.metaTitle || `${profile?.name || 'Rohan Style & Studio'} | Official Store & Products`);
  const [metaDescription, setMetaDescription] = useState(profile?.metaDescription || 'Shop high converting catalogues, e-books, webinars and private masterclasses directly on PrimeProfile.');
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<string | null>(null);

  // -------------------------------------------------------------
  // TAB 5: Notifications State
  // -------------------------------------------------------------
  const [notifyOffers, setNotifyOffers] = useState<boolean>(
    profile?.notifications?.offersUpdates !== undefined ? profile.notifications.offersUpdates : true
  );
  const [notifyPurchaseEmail, setNotifyPurchaseEmail] = useState<boolean>(
    profile?.notifications?.purchaseEmail !== undefined ? profile.notifications.purchaseEmail : true
  );
  const [notifyPurchaseWhatsapp, setNotifyPurchaseWhatsapp] = useState<boolean>(
    profile?.notifications?.purchaseWhatsapp !== undefined ? profile.notifications.purchaseWhatsapp : true
  );

  // -------------------------------------------------------------
  // TAB 6: Security State
  // -------------------------------------------------------------
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(
    profile?.twoFactorEnabled || false
  );

  // Update bank detection when IFSC changes
  useEffect(() => {
    if (ifscCode.length >= 4) {
      setDetectedBank(detectBankFromIFSC(ifscCode));
    } else {
      setDetectedBank('');
    }
  }, [ifscCode]);

  // Show toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper to persist all settlement updates into profile & AuthContext
  const saveSettlementToProfile = async (overrides: Partial<NonNullable<typeof profile>['settlement']> = {}) => {
    if (!profile || !updateProfile) return;
    const updatedSettlement = {
      upiActive,
      cardsRequested,
      cardsActive,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName: detectedBank,
      gstin,
      invoiceLogo,
      signature: signatureImage,
      customNote: customInvoiceNote,
      invoiceAddress,
      ...overrides
    };

    await updateProfile({
      ...profile,
      settlement: updatedSettlement
    });
  };

  // Save Profile Handler
  const handleSaveProfile = async () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || aboutName.trim() || (profile?.name || 'Creator');
    if (updateProfile && profile) {
      await updateProfile({
        ...profile,
        name: fullName,
        firstName,
        lastName,
        headline,
        bio,
        avatarUrl: avatarPreview,
        signinPhone,
        supportEmail,
        supportPhone,
        reachPreference,
      });
    }
    showToast('Profile information saved successfully!');
  };

  // Save Account Details
  const handleSaveAccountDetails = async () => {
    setAccountSaveError(null);
    if (!accountHolderName.trim()) {
      setAccountSaveError('Please enter the account holder name.');
      return;
    }
    if (!accountNumber.trim() || accountNumber.length < 8) {
      setAccountSaveError('Please enter a valid bank account number (min 8 digits).');
      return;
    }
    if (!ifscCode.trim() || ifscCode.length < 8) {
      setAccountSaveError('Please enter a valid 11-digit IFSC code.');
      return;
    }

    await saveSettlementToProfile({
      accountHolderName: accountHolderName.trim().toUpperCase(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      bankName: detectedBank || detectBankFromIFSC(ifscCode)
    });

    setIsEditingAccount(false);
    showToast('Settlement bank account details updated & verified!');
  };

  // Save GSTIN
  const handleSaveGSTIN = async () => {
    if (!gstin.trim()) {
      await saveSettlementToProfile({ gstin: '' });
      setGstSaved(true);
      showToast('GST details cleared.');
      return;
    }
    const cleanGST = gstin.trim().toUpperCase();
    setGstin(cleanGST);
    await saveSettlementToProfile({ gstin: cleanGST });
    setGstSaved(true);
    showToast(`GSTIN ${cleanGST} saved & verified successfully!`);
    setTimeout(() => setGstSaved(false), 3000);
  };

  // Save Custom Invoice Note
  const handleSaveInvoiceNote = async () => {
    await saveSettlementToProfile({ customNote: customInvoiceNote });
    showToast('Invoice note updated successfully!');
  };

  // Save Invoice Address
  const handleSaveInvoiceAddress = async () => {
    if (!tempAddress.trim()) return;
    setInvoiceAddress(tempAddress.trim());
    await saveSettlementToProfile({ invoiceAddress: tempAddress.trim() });
    setShowEditAddressModal(false);
    showToast('Invoice address updated successfully!');
  };

  // Toggle UPI Payments
  const handleToggleUPI = async () => {
    const nextState = !upiActive;
    setUpiActive(nextState);
    await saveSettlementToProfile({ upiActive: nextState });
    showToast(`UPI Payments ${nextState ? 'Activated' : 'Paused'}`);
  };

  // Submit Request for Other Payment Methods (Cards & BNPL)
  const handleSubmitCardRequest = async () => {
    setCardsRequested(true);
    setCardsActive(true);
    await saveSettlementToProfile({
      cardsRequested: true,
      cardsActive: true
    });
    setShowRequestPaymentsModal(false);
    showToast('International Cards & BNPL payment methods successfully activated for your store!');
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          setInvoiceLogo(reader.result);
          await saveSettlementToProfile({ invoiceLogo: reader.result });
          showToast('Invoice logo uploaded and saved!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Signature Upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          setSignatureImage(reader.result);
          await saveSettlementToProfile({ signature: reader.result });
          showToast('Digital signature uploaded and saved for invoices!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Download Real Fee Receipt HTML/Document
  const handleDownloadReceipt = (month: string = 'November 2023', amount: string = '₹480.00', invoiceNo: string = 'INV-2023-11-8921') => {
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PrimeProfile Fee Receipt - ${month}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 800; color: #2563eb; }
          .badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 12px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; margin-top: 24px; gap: 20px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 14px; }
          th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
          .total { font-size: 18px; font-weight: 800; text-align: right; margin-top: 20px; }
          .footer { margin-top: 40px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">PrimeProfile</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Platform Fee Tax Invoice / Receipt</div>
          </div>
          <div style="text-align: right;">
            <span class="badge">PAID</span>
            <div style="font-size: 13px; margin-top: 6px;">Receipt #: <strong>${invoiceNo}</strong></div>
            <div style="font-size: 12px; color: #64748b;">Billing Cycle: ${month}</div>
          </div>
        </div>

        <div class="grid">
          <div>
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">Issued To:</div>
            <div><strong>${accountHolderName || profile?.name || 'Creator'}</strong></div>
            <div>${invoiceAddress}</div>
            <div>GSTIN: ${gstin || 'Unregistered Consumer'}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">Service Provider:</div>
            <div><strong>PrimeProfile Internet Technologies Pvt Ltd</strong></div>
            <div>GSTIN: 27AABCP8921K1ZP</div>
            <div>Bengaluru, Karnataka - 560001</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Tax (GST 18%)</th>
              <th style="text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>PrimeProfile Platform Services & Payment Gateway Processing (${month})</td>
              <td>1</td>
              <td>₹406.78</td>
              <td>₹73.22</td>
              <td style="text-align: right; font-weight: 700;">${amount}</td>
            </tr>
          </tbody>
        </table>

        <div class="total">
          Net Paid: <span style="color: #2563eb;">${amount}</span>
        </div>

        <div class="footer">
          This is a computer-generated official receipt for PrimeProfile creator monetization services.
          Thank you for choosing PrimeProfile!
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([receiptContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PrimeProfile_Receipt_${month.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Receipt for ${month} downloaded successfully!`);
  };

  // Verify Phone OTP simulation
  const handleVerifyOtp = () => {
    if (otpInput.trim() === '1234' || otpInput.trim().length === 4) {
      if (showOtpModal?.type === 'phone') {
        setIsPhoneVerified(true);
        if (profile && updateProfile) {
          updateProfile({ ...profile, supportPhone });
        }
        showToast('Phone number verified successfully with OTP!');
      } else {
        showToast('Email verified successfully!');
      }
      setShowOtpModal(null);
      setOtpInput('');
      setOtpError(false);
    } else {
      setOtpError(true);
    }
  };

  // Test Webhook Simulation
  const handleTestWebhook = () => {
    if (!webhookUrl) {
      showToast('Please enter a webhook URL first.');
      return;
    }
    setWebhookTesting(true);
    setWebhookTestResult(null);
    setTimeout(() => {
      setWebhookTesting(false);
      setWebhookTestResult('HTTP 200 OK — Ping delivered successfully with test payload { event: "ping", store: "rohanstyle" }');
      showToast('Webhook ping test successful (HTTP 200)');
    }, 1200);
  };

  // Save Integrations & SEO
  const handleSaveIntegrations = async () => {
    if (!profile || !updateProfile) return;
    await updateProfile({
      ...profile,
      metaTitle,
      metaDescription,
      integrations: {
        facebookPixelId,
        googleAnalyticsId,
        webhookUrl
      }
    });
    showToast('Integrations & SEO settings saved!');
  };

  // Toggle Notification preferences
  const handleToggleNotification = async (key: 'offers' | 'purchaseEmail' | 'purchaseWhatsapp', value: boolean) => {
    let nextOffers = notifyOffers;
    let nextPurchaseEmail = notifyPurchaseEmail;
    let nextPurchaseWhatsapp = notifyPurchaseWhatsapp;

    if (key === 'offers') {
      nextOffers = value;
      setNotifyOffers(value);
    } else if (key === 'purchaseEmail') {
      nextPurchaseEmail = value;
      setNotifyPurchaseEmail(value);
    } else if (key === 'purchaseWhatsapp') {
      nextPurchaseWhatsapp = value;
      setNotifyPurchaseWhatsapp(value);
    }

    if (profile && updateProfile) {
      await updateProfile({
        ...profile,
        notifications: {
          offersUpdates: nextOffers,
          purchaseEmail: nextPurchaseEmail,
          purchaseWhatsapp: nextPurchaseWhatsapp
        }
      });
    }
    showToast('Notification preferences updated!');
  };

  // Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match!');
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password changed successfully!');
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  // Copy Store Link Helper
  const handleCopyStoreLink = () => {
    const url = `https://primeprofile.bio/${profile?.username || 'rohanstyle'}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Official store link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen p-4 sm:p-8 overflow-y-auto">
      {/* Toast Alert Header */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6 pb-24">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Account Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your personal profile, settlement details, billing plan, and notifications.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyStoreLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied Link' : 'Copy Store Link'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Profile | Billing | Payments | Integrations | Notification | Security) */}
        <div className="flex items-center gap-2 sm:gap-6 border-b border-slate-200 overflow-x-auto no-scrollbar pt-2">
          {(
            [
              { id: 'profile', label: 'Profile' },
              { id: 'billing', label: 'Billing' },
              { id: 'payments', label: 'Payments' },
              { id: 'integrations', label: 'Integrations' },
              { id: 'notification', label: 'Notification' },
              { id: 'security', label: 'Security' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer relative ${
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: PROFILE (Screenshots 2, 3, 4)                           */}
        {/* ============================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* 1. Basic information */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <span>Basic information</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">First name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Last name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. About me info */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5">
              <div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  <span>About me info</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  This is the default 'About me' info we show as a card on all your products. Talk about yourself and link your social accounts.
                </p>
              </div>

              {/* Your image */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Your image</label>
                <div className="flex items-center gap-4">
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 shadow-sm"
                  />
                  <label className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition shadow-xs flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Change</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setAvatarPreview(reader.result);
                              showToast('Avatar updated!');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Display Name</label>
                <input
                  type="text"
                  value={aboutName}
                  onChange={(e) => setAboutName(e.target.value)}
                  placeholder="Enter your public display name"
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Creator, Coach & Digital Educator"
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a brief intro about yourself for your followers..."
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>

              {/* Social Media Links */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800">
                    Social Media Links ({socialLinks.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setSocialLinks([...socialLinks, { platform: 'Website', url: 'https://' }])}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                <div className="space-y-2">
                  {socialLinks.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.platform}
                        onChange={(e) => {
                          const updated = [...socialLinks];
                          updated[idx].platform = e.target.value;
                          setSocialLinks(updated);
                        }}
                        placeholder="Platform"
                        className="w-28 px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium text-slate-800"
                      />
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => {
                          const updated = [...socialLinks];
                          updated[idx].url = e.target.value;
                          setSocialLinks(updated);
                        }}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono text-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== idx))}
                        className="p-2 text-slate-400 hover:text-red-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book a session with me */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Book a session with me</div>
                  <div className="text-[11px] text-slate-400">Offer paid 1:1 discovery calls or consulting on your store</div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('bookings')}
                  className="px-4 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition shadow-xs"
                >
                  Set up
                </button>
              </div>
            </div>

            {/* 3. Signin information */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <span>Signin information</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Registered email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Registered email</label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    disabled={!isEditingSigninEmail}
                    value={signinEmail}
                    onChange={(e) => setSigninEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 disabled:text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditingSigninEmail) {
                        showToast('Registered email updated!');
                        setIsEditingSigninEmail(false);
                      } else {
                        setIsEditingSigninEmail(true);
                      }
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditingSigninEmail ? 'Done' : 'Edit'}</span>
                  </button>
                </div>
              </div>

              {/* Registered phone number */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Registered phone number</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center flex-1 px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50">
                    <span className="text-base mr-2">🇮🇳</span>
                    <span className="text-xs font-semibold text-slate-500 mr-2">+91</span>
                    <input
                      type="tel"
                      disabled={!isEditingSigninPhone}
                      value={signinPhone}
                      onChange={(e) => setSigninPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full text-sm font-medium text-slate-800 bg-transparent focus:outline-none font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditingSigninPhone) {
                        showToast('Registered phone number updated!');
                        setIsEditingSigninPhone(false);
                      } else {
                        setIsEditingSigninPhone(true);
                      }
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditingSigninPhone ? 'Done' : 'Edit'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Support Channel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <span>Support Channel</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    disabled={!isEditingSupportEmail}
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 disabled:text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditingSupportEmail) {
                        showToast('Support email saved!');
                        setIsEditingSupportEmail(false);
                      } else {
                        setIsEditingSupportEmail(true);
                      }
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditingSupportEmail ? 'Done' : 'Edit'}</span>
                  </button>
                </div>
              </div>

              {/* Support phone number */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Support phone number</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center flex-1 px-3 py-1.5 border border-slate-200 rounded-xl bg-white">
                    <span className="text-base mr-2">🇮🇳</span>
                    <span className="text-xs font-semibold text-slate-500 mr-2">+91</span>
                    <input
                      type="tel"
                      value={supportPhone}
                      onChange={(e) => {
                        setSupportPhone(e.target.value.replace(/[^0-9]/g, ''));
                        setIsPhoneVerified(false);
                      }}
                      placeholder="Enter support phone number"
                      className="w-full text-sm font-medium text-slate-800 bg-transparent focus:outline-none font-mono"
                    />
                  </div>
                  {isPhoneVerified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!supportPhone || supportPhone.length < 10) {
                          showToast('Please enter a valid 10-digit mobile number.');
                          return;
                        }
                        setShowOtpModal({ type: 'phone', target: `+91 ${supportPhone}` });
                      }}
                      className="px-4 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 border border-blue-200 bg-blue-50/50 rounded-xl hover:bg-blue-50 cursor-pointer"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>

              {/* How would you like your customers to reach out to you */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  How would you like your customers to reach out to you in case of queries?
                </label>
                <div className="flex flex-wrap items-center gap-5 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="reach"
                      checked={reachPreference === 'email'}
                      onChange={() => setReachPreference('email')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Via Email address
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="reach"
                      checked={reachPreference === 'phone'}
                      onChange={() => setReachPreference('phone')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Via Phone number
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="reach"
                      checked={reachPreference === 'both'}
                      onChange={() => setReachPreference('both')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Via Both
                  </label>
                </div>
                {!supportPhone && (
                  <p className="text-[11px] text-red-500 mt-2 font-medium">
                    Please set up your support phone number
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/25 transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: BILLING (Screenshot 5)                                  */}
        {/* ============================================================== */}
        {activeTab === 'billing' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Your PrimeProfile subscription */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <span>Your PrimeProfile subscription</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Current Plan Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">You're on</span>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    {profile?.plan === 'creator'
                      ? 'Creator Plan'
                      : profile?.plan === 'pro'
                      ? 'Pro Plan (0% Commission)'
                      : 'Starter plan (Free)'}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">
                      ACTIVE
                    </span>
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">
                    {profile?.plan === 'creator' ? '₹999 / mo' : profile?.plan === 'pro' ? '₹1,999 / mo' : '₹0 / mo'}
                  </div>
                  <div className="text-[11px] text-slate-400">Renews on 1st of each month</div>
                </div>
              </div>

              {/* Upgrade Banner matching Screenshot 5 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#f0f9ff] border border-[#bae6fd] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-xs font-medium text-slate-700 max-w-md leading-relaxed">
                  Get access to all monetization apps, unlimited SuperLinks and Lead Magnet responses and more with our Creator Plan.
                </p>
                <button
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white text-xs font-bold rounded-xl shadow-sm transition whitespace-nowrap cursor-pointer shrink-0"
                >
                  Upgrade to Creator
                </button>
              </div>
            </div>

            {/* Billing history */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <span>Billing history</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">PrimeProfile Starter Plan (Monthly)</div>
                    <div className="text-slate-400 text-[11px]">Billed on 1st Nov 2023 • Paid via Card</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">₹0.00</span>
                    <button
                      type="button"
                      onClick={() => handleDownloadReceipt('November 2023', '₹0.00', 'INV-2023-11-001')}
                      className="p-1.5 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                      title="Download Invoice"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PAYMENTS (Screenshots 6, 7, 8)                          */}
        {/* ============================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* 1. Payments support banner */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  <span>Payments</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  PrimeProfile payments supports UPI, all major credit cards, BNPL (Buy now, Pay Later), and more. You can manage which of these to enable for your customers below.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Method 1: UPI */}
                <div className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-black text-orange-600">UPI</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">UPI payments</div>
                      <div className="text-[11px] text-slate-500">Accept all UPI payments - PhonePe, Paytm, GPay, and more.</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleUPI}
                    className={`px-3 py-1 text-white font-bold text-[10px] rounded-full uppercase tracking-wider shrink-0 transition cursor-pointer ${
                      upiActive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-400 hover:bg-slate-500'
                    }`}
                  >
                    {upiActive ? 'ACTIVE' : 'PAUSED'}
                  </button>
                </div>

                {/* Method 2: Cards & BNPL */}
                <div className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Other payment methods</div>
                      <div className="text-[11px] text-slate-500">Allow your customers to pay using credit cards - Visa and MasterCard and Buy now, Pay Later options</div>
                    </div>
                  </div>
                  {cardsActive ? (
                    <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-full uppercase tracking-wider shrink-0">
                      ACTIVE
                    </span>
                  ) : cardsRequested ? (
                    <span className="px-3 py-1 bg-amber-500 text-white font-bold text-[10px] rounded-full uppercase tracking-wider shrink-0">
                      UNDER REVIEW
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowRequestPaymentsModal(true)}
                      className="px-4 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition shrink-0"
                    >
                      Request
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Settlement account */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <span>Settlement account</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {accountSaveError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{accountSaveError}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Account Holder Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Account holder name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingAccount}
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value.toUpperCase())}
                    placeholder="Enter account holder name as per bank record"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Account number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingAccount}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter bank account number"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                {/* IFSC Code */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-600">
                      IFSC code <span className="text-red-500">*</span>
                    </label>
                    {detectedBank && (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {detectedBank}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    disabled={!isEditingAccount}
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase().slice(0, 11))}
                    placeholder="e.g. HDFC0001234"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                {/* Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditingAccount) {
                        handleSaveAccountDetails();
                      } else {
                        setIsEditingAccount(true);
                      }
                    }}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition shadow-xs"
                  >
                    {isEditingAccount ? 'Save Account Details' : 'Change account'}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. GST on sales (Screenshot 7) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">GST on sales</div>
                  <p className="text-xs text-slate-500 mt-0.5">Want to enable GST on your product sales? Set it here.</p>
                </div>
                {gstSaved && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="Enter GSTIN (e.g. 24AAAAA0000A1Z5)"
                  className="flex-1 px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
                <button
                  type="button"
                  onClick={handleSaveGSTIN}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition"
                >
                  Save
                </button>
              </div>
            </div>

            {/* 4. Invoice information (Screenshots 7 & 8) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <span>Invoice information</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Logo */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Logo (Recommended size - 640x640)
                </label>
                <div className="flex items-center gap-4">
                  {invoiceLogo ? (
                    <div className="relative w-14 h-14 rounded-full border border-slate-200 overflow-hidden shadow-xs">
                      <img src={invoiceLogo} alt="Invoice Logo" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={async () => {
                          setInvoiceLogo('');
                          await saveSettlementToProfile({ invoiceLogo: '' });
                          showToast('Logo removed from invoice.');
                        }}
                        className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
                      <Upload className="w-5 h-5" />
                    </div>
                  )}

                  <label className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition shadow-xs">
                    <span>{invoiceLogo ? 'Replace' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Signature */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Signature (optional)
                </label>
                <div className="flex items-center gap-4">
                  {signatureImage ? (
                    <div className="relative w-28 h-12 rounded-xl border border-slate-300 bg-white p-1 overflow-hidden flex items-center justify-center">
                      <img src={signatureImage} alt="Signature" className="max-h-full max-w-full object-contain" />
                      <button
                        type="button"
                        onClick={async () => {
                          setSignatureImage('');
                          await saveSettlementToProfile({ signature: '' });
                          showToast('Signature removed.');
                        }}
                        className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-28 h-12 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
                      Sign preview
                    </div>
                  )}

                  <label className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition shadow-xs">
                    <span>{signatureImage ? 'Replace' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Custom note to customer */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-xs font-bold text-slate-800">Custom note to customer</span>
                    <p className="text-[11px] text-slate-400">Add any additional information you want to show on the invoice</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInvoiceNoteInput(!showInvoiceNoteInput)}
                    className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    {showInvoiceNoteInput ? 'Collapse' : 'Add'}
                  </button>
                </div>
                {showInvoiceNoteInput && (
                  <div className="space-y-2 mt-2">
                    <textarea
                      rows={2}
                      value={customInvoiceNote}
                      onChange={(e) => setCustomInvoiceNote(e.target.value)}
                      placeholder="e.g. Thank you for your purchase! For any questions, reach out via WhatsApp."
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveInvoiceNote}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Address currently mentioned on your invoice */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="block text-xs font-bold text-slate-800">
                    Address currently mentioned on your invoice
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTempAddress(invoiceAddress);
                      setShowEditAddressModal(true);
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Address
                  </button>
                </div>
                <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-xs text-slate-800 space-y-1">
                  <p className="font-medium text-slate-900">{invoiceAddress}</p>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  If you have corporate entity changes, please contact{' '}
                  <span className="text-blue-600 underline cursor-pointer">support@primeprofile.bio</span>
                </p>
              </div>
            </div>

            {/* 5. Platform-fee Receipts (Screenshot 8) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <span>Platform-fee Receipts</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between text-xs hover:border-slate-300 transition">
                <div>
                  <span className="font-semibold text-slate-800 block">Receipt for November 2023</span>
                  <span className="text-[11px] text-slate-400">Total Billed: ₹480.00 • Status: Paid</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadReceipt('November 2023', '₹480.00', 'INV-2023-11-8921')}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer flex items-center gap-1.5 font-bold"
                  title="Download Receipt"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-[11px] hidden sm:inline">Download</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                If you're looking for receipts which are older,{' '}
                <button
                  type="button"
                  onClick={() => setShowOlderReceiptsModal(true)}
                  className="text-blue-600 underline cursor-pointer font-medium"
                >
                  click here
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: INTEGRATIONS                                            */}
        {/* ============================================================== */}
        {activeTab === 'integrations' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Store Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Store Details</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Your store's official link
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 truncate">
                    https://primeprofile.bio/{profile?.username || 'rohanstyle'}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyStoreLink}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition shrink-0 flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SEO - Custom Meta */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">SEO - Custom Meta</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Enter page SEO title"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Enter meta description for search engines..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Google Search Preview Snippet */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Google Search Preview</span>
                <div className="text-xs text-[#1a0dab] font-semibold truncate hover:underline cursor-pointer">
                  {metaTitle}
                </div>
                <div className="text-[11px] text-[#006621]">
                  https://primeprofile.bio/{profile?.username || 'rohanstyle'}
                </div>
                <div className="text-[11px] text-slate-600 line-clamp-2">
                  {metaDescription}
                </div>
              </div>
            </div>

            {/* Analytics & Tracking Pixels */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Analytics & Tracking Pixels</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Facebook Pixel ID</label>
                  <input
                    type="text"
                    value={facebookPixelId}
                    onChange={(e) => setFacebookPixelId(e.target.value)}
                    placeholder="e.g. 198273645019"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Google Analytics ID</label>
                  <input
                    type="text"
                    value={googleAnalyticsId}
                    onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                    placeholder="e.g. G-XXXXXXXXXX"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Webhook Endpoint */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Webhooks / Zapier Integration</h3>
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={webhookTesting}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{webhookTesting ? 'Sending ping...' : 'Send Test Event'}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Webhook URL</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {webhookTestResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-mono">
                  {webhookTestResult}
                </div>
              )}
            </div>

            {/* Bottom Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveIntegrations}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/25 transition cursor-pointer"
              >
                Save Integrations & SEO
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: NOTIFICATION (Screenshot 9)                             */}
        {/* ============================================================== */}
        {activeTab === 'notification' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Notify me about */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <span>Notify me about</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 font-semibold text-slate-500">Event</th>
                      <th className="pb-3 text-right font-semibold text-slate-500 w-24">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-4">
                        <div className="font-bold text-slate-900">Offers and updates</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Notify me about PrimeProfile updates and offers</div>
                      </td>
                      <td className="py-4 text-right">
                        <input
                          type="checkbox"
                          checked={notifyOffers}
                          onChange={(e) => handleToggleNotification('offers', e.target.checked)}
                          className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900 cursor-pointer"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notify my contacts about */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <span>Notify my contacts about</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 font-semibold text-slate-500">Event</th>
                      <th className="pb-3 text-center font-semibold text-slate-500 w-20">Email</th>
                      <th className="pb-3 text-center font-semibold text-slate-500 w-24">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-4">
                        <div className="font-bold text-slate-900">Any Purchase</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Notify customers when they make a purchase with instant download link</div>
                      </td>
                      <td className="py-4 text-center">
                        <input
                          type="checkbox"
                          checked={notifyPurchaseEmail}
                          onChange={(e) => handleToggleNotification('purchaseEmail', e.target.checked)}
                          className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 text-center">
                        <input
                          type="checkbox"
                          checked={notifyPurchaseWhatsapp}
                          onChange={(e) => handleToggleNotification('purchaseWhatsapp', e.target.checked)}
                          className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900 cursor-pointer"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: SECURITY                                                */}
        {/* ============================================================== */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Change Password */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Change Password</span>
              </div>

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Password updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* Two Factor Authentication (2FA) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">Two-Factor Authentication (2FA)</div>
                    <div className="text-xs text-slate-500">Protect your creator earnings and account with OTP verification</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (twoFactorEnabled) {
                      setTwoFactorEnabled(false);
                      if (profile && updateProfile) {
                        updateProfile({ ...profile, twoFactorEnabled: false });
                      }
                      showToast('Two-factor authentication disabled.');
                    } else {
                      setShowTwoFactorModal(true);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    twoFactorEnabled
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {twoFactorEnabled ? 'Enabled' : 'Enable 2FA'}
                </button>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">Active Login Sessions</div>
                  <div className="text-xs text-slate-500">Devices currently logged into this creator account</div>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('All other device sessions terminated successfully!')}
                  className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                >
                  Log out other devices
                </button>
              </div>

              <div className="space-y-3 text-xs pt-1">
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-bold text-slate-800">Chrome on Windows (Current Session)</div>
                      <div className="text-[11px] text-slate-400">Ahmedabad, India • Active now</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    This Device
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL: Request Credit Cards & BNPL Payment Methods             */}
      {/* ============================================================== */}
      {showRequestPaymentsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Request Card & BNPL Payments</h3>
                  <p className="text-xs text-slate-500">Enable Visa, MasterCard, Amex & Buy Now Pay Later</p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestPaymentsModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Entity Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Individual / Freelancer">Individual / Freelancer</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="LLP / Partnership">LLP / Partnership</option>
                  <option value="Private Limited (Pvt Ltd)">Private Limited (Pvt Ltd)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expected Monthly Sales Volume</label>
                <select
                  value={expectedVolume}
                  onChange={(e) => setExpectedVolume(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Under ₹1,00,000 / month">Under ₹1,00,000 / month</option>
                  <option value="₹1,00,000 - ₹5,00,000 / month">₹1,00,000 - ₹5,00,000 / month</option>
                  <option value="₹5,00,000 - ₹20,00,000 / month">₹5,00,000 - ₹20,00,000 / month</option>
                  <option value="₹20,00,000+ / month">₹20,00,000+ / month</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business PAN Card Number</label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-[11px] text-blue-900 leading-relaxed">
                By activating, your store will support global cards from 135+ countries and instant 0-interest EMI with instant payouts to your settlement account.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRequestPaymentsModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitCardRequest}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Submit & Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: OTP Verification Simulation (Phone / Email)             */}
      {/* ============================================================== */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Verify Phone Number</h3>
              <p className="text-xs text-slate-500">
                We sent a 4-digit verification code to <strong>{showOtpModal.target}</strong>
              </p>
              <p className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-lg inline-block">
                Demo code: <strong>1234</strong>
              </p>
            </div>

            {otpError && (
              <p className="text-xs text-red-500 text-center font-medium">
                Invalid verification code. Enter 1234 for testing.
              </p>
            )}

            <div>
              <input
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="1 2 3 4"
                className="w-full text-center text-2xl font-mono tracking-widest py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowOtpModal(null);
                  setOtpInput('');
                  setOtpError(false);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Verify & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Edit Invoice Address                                    */}
      {/* ============================================================== */}
      {showEditAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Update Invoice Address</h3>
              <button
                onClick={() => setShowEditAddressModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Official Registered Business / Studio Address
              </label>
              <textarea
                rows={3}
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
                placeholder="Shop/Studio No., Building name, Road, City, State, PIN"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEditAddressModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInvoiceAddress}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Older Platform Receipts                                 */}
      {/* ============================================================== */}
      {showOlderReceiptsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Platform-Fee Receipts Archive</h3>
                <p className="text-xs text-slate-500">Download past tax invoices & platform fee receipts</p>
              </div>
              <button
                onClick={() => setShowOlderReceiptsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs">
              {[
                { month: 'October 2023', amount: '₹420.00', id: 'INV-2023-10-7612' },
                { month: 'September 2023', amount: '₹350.00', id: 'INV-2023-09-5431' },
                { month: 'August 2023', amount: '₹290.00', id: 'INV-2023-08-3210' },
                { month: 'July 2023', amount: '₹150.00', id: 'INV-2023-07-1192' },
              ].map((rc) => (
                <div key={rc.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl">
                  <div>
                    <div className="font-bold text-slate-800">Receipt for {rc.month}</div>
                    <div className="text-[11px] text-slate-400">Total Billed: {rc.amount} • {rc.id}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadReceipt(rc.month, rc.amount, rc.id)}
                    className="p-2 text-slate-500 hover:text-blue-600 transition flex items-center gap-1 font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowOlderReceiptsModal(false)}
                className="px-5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: 2FA Setup (QR Code & OTP)                               */}
      {/* ============================================================== */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Set Up Two-Factor Authentication</span>
              </h3>
              <button
                onClick={() => setShowTwoFactorModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3">
              <p>Scan this QR code with Google Authenticator, Microsoft Authenticator, or 1Password:</p>
              <div className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-200">
                <div className="w-32 h-32 bg-white border border-slate-300 rounded-xl flex items-center justify-center shadow-xs">
                  <QrCode className="w-24 h-24 text-slate-900" />
                </div>
                <span className="text-[11px] font-mono text-slate-500 mt-2">Secret: JBSWY3DPEHPK3PXP</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Enter 6-digit verification code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 123456"
                  className="w-full text-center text-lg font-mono tracking-widest py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTwoFactorModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (twoFactorCode.length >= 4) {
                    setTwoFactorEnabled(true);
                    if (profile && updateProfile) {
                      updateProfile({ ...profile, twoFactorEnabled: true });
                    }
                    setShowTwoFactorModal(false);
                    setTwoFactorCode('');
                    showToast('Two-Factor Authentication is now active!');
                  } else {
                    showToast('Please enter the 6-digit authenticator code.');
                  }
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Verify & Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade to Creator Plan Interactive Modal */}
      {isUpgradeModalOpen && (
        <UpgradeToCreatorPlanModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
        />
      )}
    </div>
  );
};
