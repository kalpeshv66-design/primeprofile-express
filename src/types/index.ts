export interface CreatorProfile {
  id: string;
  uid: string;
  username: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  coverUrl?: string;
  category: string;
  currency: string;
  plan?: 'free' | 'creator' | 'pro';
  theme: 'classic' | 'minimal' | 'dark' | 'glass' | 'neon' | 'sunset' | 'emerald';
  buttonStyle: 'rounded' | 'pill' | 'shadow' | 'bordered';
  fontFamily: 'Poppins' | 'Inter' | 'Plus Jakarta Sans' | 'Outfit';
  brandColor: string;
  metaTitle?: string;
  metaDescription?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  signinPhone?: string;
  supportEmail?: string;
  supportPhone?: string;
  reachPreference?: 'email' | 'phone' | 'both';
  settlement?: {
    upiActive?: boolean;
    cardsRequested?: boolean;
    cardsActive?: boolean;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    gstin?: string;
    invoiceLogo?: string;
    signature?: string;
    customNote?: string;
    invoiceAddress?: string;
    upiId?: string;
  };
  integrations?: {
    facebookPixelId?: string;
    googleAnalyticsId?: string;
    webhookUrl?: string;
  };
  notifications?: {
    offersUpdates?: boolean;
    purchaseEmail?: boolean;
    purchaseWhatsapp?: boolean;
  };
  twoFactorEnabled?: boolean;
  socials: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    telegram?: string;
    discord?: string;
    whatsapp?: string;
    tiktok?: string;
  };
  enabledApps: {
    autoDm: boolean;
    superLinks: boolean;
    leadMagnet: boolean;
    paymentPages: boolean;
    bookings: boolean;
    courses: boolean;
    events: boolean;
    lockedContent: boolean;
    communities: boolean;
  };
  createdAt: number;
  onboarded: boolean;
}

export interface StoreLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  type: 'link' | 'header' | 'highlight';
  enabled: boolean;
  clicks: number;
  order: number;
}

export interface DigitalProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  coverImage: string;
  fileType: 'pdf' | 'zip' | 'video' | 'audio' | 'link';
  fileUrl: string; // download url or drive link or text
  category: string;
  published: boolean;
  salesCount: number;
  revenue: number;
  createdAt: number;
}

export interface PaymentPage {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  coverImage: string;
  buttonText: string;
  collectAddress: boolean;
  collectPhone: boolean;
  customFields?: { label: string; type: string; required: boolean }[];
  published: boolean;
  moderationStatus?: 'approved' | 'rejected' | 'pending';
  rejectionReason?: string;
  submittedAt?: number;
  approvedAt?: number;
  creatorName?: string;
  creatorEmail?: string;
  salesCount: number;
  revenue: number;
  createdAt: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  content: string;
  resources?: { name: string; url: string }[];
}

export interface CourseChapter {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  coverImage: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  published: boolean;
  chapters: CourseChapter[];
  enrolledStudentsCount: number;
  createdAt: number;
}

export interface BookingService {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  coverImage?: string;
  locationType: 'Google Meet' | 'Zoom' | 'Phone Call' | 'In Person';
  availableDays: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  timeSlots: string[]; // e.g. ['10:00 AM', '02:00 PM', '04:30 PM']
  published: boolean;
  bookedCount: number;
  createdAt: number;
}

export interface EventWebinar {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  price: number;
  currency: string;
  coverImage: string;
  locationUrl: string;
  seatsTotal: number;
  seatsBooked: number;
  published: boolean;
  createdAt: number;
}

export interface LeadMagnet {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  buttonText: string;
  freebieType: 'pdf' | 'video' | 'checklist' | 'link';
  freebieUrl: string;
  fields: { name: string; required: boolean }[];
  leadsCount: number;
  published: boolean;
  createdAt: number;
}

export interface LockedContentItem {
  id: string;
  title: string;
  previewText: string;
  secretContent: string;
  price: number;
  currency: string;
  coverImage?: string;
  unlockedCount: number;
  published: boolean;
  createdAt: number;
}

export interface CommunityHub {
  id: string;
  title: string;
  description: string;
  platform: 'telegram' | 'discord' | 'whatsapp';
  inviteLink: string;
  priceMonthly: number;
  currency: string;
  membersCount: number;
  published: boolean;
  createdAt: number;
}

export interface AudienceContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  segment: 'Customers' | 'Followers' | 'Abandoned Carts' | 'Leads';
  source: string;
  totalSpent: number;
  createdAt: number;
}

export interface OrderTransaction {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  itemType: 'product' | 'payment_page' | 'course' | 'booking' | 'event' | 'lead_magnet' | 'locked_content';
  itemId: string;
  itemTitle: string;
  amount: number;
  currency: string;
  status: 'Successful' | 'Pending' | 'Failed' | 'Refunded';
  paymentMethod: string;
  date: string;
  createdAt: number;

  // Razorpay Payment Gateway & Backend Verification details
  gateway?: 'razorpay' | 'cashfree' | 'simulated';
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  signatureVerified?: boolean;
  verifiedAt?: number;

  // Server-Calculated Commission & Creator Share
  platformCommissionRate?: number; // e.g. 0.08 (8%)
  platformCommissionAmount?: number; // e.g. ₹15.20
  creatorShareAmount?: number; // e.g. ₹174.80
  creatorId?: string;
  creatorUsername?: string;

  // Creator Payout status
  payoutStatus?: 'pending' | 'paid';
  payoutId?: string;
  payoutReference?: string;
  paidAt?: number;
}

export interface PayoutRecord {
  id: string;
  payoutNumber: string;
  creatorId: string;
  creatorUsername: string;
  creatorName: string;
  creatorEmail: string;
  amount: number;
  currency: string;
  orderIds: string[];
  status: 'pending' | 'paid' | 'failed';
  requestedAt?: number;
  paidAt?: number;
  paymentMethod: 'Bank Transfer (NEFT/IMPS/RTGS)' | 'UPI' | 'Manual';
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    upiId?: string;
  };
  transactionReference: string; // UTR or Bank Ref Number entered by Admin
  adminNotes?: string;
  createdAt: number;
}

export interface CreatorPayableSummary {
  creatorId: string;
  creatorUsername: string;
  creatorName: string;
  creatorEmail: string;
  totalSalesAmount: number;
  totalPlatformCommission: number;
  totalCreatorShare: number;
  pendingPayableBalance: number;
  paidBalance: number;
  pendingOrdersCount: number;
  paidOrdersCount: number;
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    upiId?: string;
  };
}

export interface AnalyticsSummary {
  visits: number;
  clicks: number;
  ctr: number;
  salesCount: number;
  totalRevenue: number;
  timeToClick: number;
  topLocations: { country: string; visits: number; percentage: number }[];
  referrers: { source: string; visits: number }[];
  deviceBreakdown: { device: string; percentage: number }[];
}
