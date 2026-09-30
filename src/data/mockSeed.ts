import {
  CreatorProfile,
  StoreLink,
  DigitalProduct,
  PaymentPage,
  Course,
  BookingService,
  EventWebinar,
  LeadMagnet,
  LockedContentItem,
  CommunityHub,
  AudienceContact,
  OrderTransaction,
  PayoutRecord
} from '../types';

export const DEMO_UID = 'demo-prime-creator-uid-101';
export const DEMO_EMAIL = 'demo@primeprofile.com';
export const DEMO_USERNAME = 'rohanstyle';

export const INITIAL_CREATOR_PROFILE: CreatorProfile = {
  id: DEMO_UID,
  uid: DEMO_UID,
  username: DEMO_USERNAME,
  name: 'Rohan Style & Studio',
  email: DEMO_EMAIL,
  bio: 'Top Curated Digital Assets, E-Commerce Masterclasses, Fashion Catalogues & 1-on-1 Growth Consulting ✨',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  category: 'Fashion & Digital Products',
  currency: '₹',
  theme: 'classic',
  buttonStyle: 'rounded',
  fontFamily: 'Poppins',
  brandColor: '#2563eb',
  metaTitle: 'Rohan Style & Studio | Official Store & Products',
  metaDescription: 'Shop high converting catalogues, e-books, webinars and private masterclasses directly on PrimeProfile.',
  firstName: 'Rohan',
  lastName: 'Verma',
  headline: 'Creator, Fashion Stylist & Digital Educator',
  signinPhone: '',
  supportEmail: '',
  supportPhone: '',
  reachPreference: 'both',
  settlement: {
    upiActive: false,
    cardsRequested: false,
    cardsActive: false,
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    gstin: '',
    invoiceLogo: '',
    signature: '',
    customNote: '',
    invoiceAddress: '',
    upiId: ''
  },
  integrations: {
    facebookPixelId: '',
    googleAnalyticsId: '',
    webhookUrl: ''
  },
  notifications: {
    offersUpdates: true,
    purchaseEmail: true,
    purchaseWhatsapp: true
  },
  twoFactorEnabled: false,
  socials: {
    instagram: '',
    youtube: '',
    telegram: '',
    twitter: '',
    whatsapp: '',
    discord: ''
  },
  enabledApps: {
    autoDm: true,
    superLinks: true,
    leadMagnet: true,
    paymentPages: true,
    bookings: true,
    courses: true,
    events: true,
    lockedContent: true,
    communities: true,
  },
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  onboarded: true,
};

export const INITIAL_STORE_LINKS: StoreLink[] = [
  {
    id: 'link-1',
    title: '🔥 Best Selling Festive Wholesale Lookbook (PDF)',
    url: 'https://primeprofile.bio/lookbook',
    type: 'highlight',
    enabled: true,
    clicks: 1420,
    order: 0,
  },
  {
    id: 'link-2',
    title: 'Instagram Growth & Viral Reels Blueprint 2026',
    url: 'https://instagram.com',
    type: 'link',
    enabled: true,
    clicks: 890,
    order: 1,
  },
  {
    id: 'link-3',
    title: 'Join Our VIP Telegram Community for Daily Drops',
    url: 'https://t.me/primeprofiledemo',
    type: 'link',
    enabled: true,
    clicks: 654,
    order: 2,
  },
  {
    id: 'link-4',
    title: 'Our YouTube Channel - Behind The Scenes',
    url: 'https://youtube.com',
    type: 'link',
    enabled: true,
    clicks: 430,
    order: 3,
  },
];

export const INITIAL_PRODUCTS: DigitalProduct[] = [
  {
    id: 'prod-1',
    title: 'Wholesale Vendor Supplier Directory 2026 (500+ Verified Contacts)',
    description: 'Get direct manufacturer pricing for sarees, kurtis, western wear and jewelry with full WhatsApp contact lists and verified GST details.',
    price: 499,
    originalPrice: 1999,
    currency: '₹',
    coverImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
    fileType: 'pdf',
    fileUrl: 'https://drive.google.com/sample-vendor-list.pdf',
    category: 'E-Books & Guides',
    published: true,
    salesCount: 0,
    revenue: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },
  {
    id: 'prod-2',
    title: 'Canva 100+ Aesthetic Fashion Brand Templates Bundle',
    description: 'Editable Instagram carousel posts, story promo mockups and sale discount stickers ready to drop in your brand colors.',
    price: 299,
    originalPrice: 999,
    currency: '₹',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    fileType: 'link',
    fileUrl: 'https://canva.com/templates/sample-bundle',
    category: 'Templates',
    published: true,
    salesCount: 0,
    revenue: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
  },
];

export const INITIAL_PAYMENT_PAGES: PaymentPage[] = [
  {
    id: 'pay-1',
    title: 'Your Payment Page Title Here',
    description: 'Describe your page to let attendees know what to expect. Highlights like purpose, activities, or speakers.',
    price: 199,
    currency: '₹',
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    buttonText: 'Get it now',
    collectAddress: false,
    collectPhone: true,
    published: false,
    moderationStatus: 'pending',
    submittedAt: Date.now() - 1000 * 60 * 45,
    creatorName: 'Creator',
    creatorEmail: '',
    salesCount: 0,
    revenue: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'pay-2',
    title: 'Minimum Order Quantity : 10 is ONLY RS 190',
    description: 'Book a curated sample pack of 10 trending products delivered straight to your door.',
    price: 190,
    currency: '₹',
    coverImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
    buttonText: 'Order Sample Box',
    collectAddress: true,
    collectPhone: true,
    published: false,
    moderationStatus: 'pending',
    submittedAt: Date.now() - 1000 * 60 * 120,
    creatorName: 'Creator',
    creatorEmail: '',
    salesCount: 0,
    revenue: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: 'pay-3',
    title: '3,00000+ TEMPLATES FOR GRAPHIC DESIGNERS',
    description: 'Instant downloadable access to 300,000+ PSD, AI, Canva & Figma templates for all your design projects.',
    price: 149,
    currency: '₹',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    buttonText: 'Download Templates Now',
    collectAddress: false,
    collectPhone: true,
    published: true,
    moderationStatus: 'approved',
    approvedAt: Date.now() - 1000 * 60 * 60 * 24,
    creatorName: 'Creator',
    creatorEmail: '',
    salesCount: 0,
    revenue: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Zero to 1 Lakh/Month: E-Commerce & Instagram Masterclass',
    subtitle: 'Step-by-step blueprint to launch and scale a boutique store with 0 inventory using reels',
    description: 'Learn finding winning niches, negotiating rock-bottom wholesale prices, building hyper-converting Instagram bio funnels, and managing shipping and COD returns.',
    price: 1499,
    originalPrice: 4999,
    currency: '₹',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    level: 'All Levels',
    published: true,
    enrolledStudentsCount: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    chapters: [
      {
        id: 'chap-1',
        title: 'Module 1: Foundations & Product Sourcing',
        lessons: [
          {
            id: 'les-1',
            title: 'Welcome & System Overview',
            duration: '09:20',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            content: 'In this introductory lesson, we will lay out the exact roadmap used to generate consistent sales without paid ads.',
          },
          {
            id: 'les-2',
            title: 'How to Pick Verified Wholesale Manufacturers',
            duration: '18:45',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            content: 'How to verify suppliers on Indiamart, avoid fake distributors, and get sample units at factory rate.',
          }
        ]
      },
      {
        id: 'chap-2',
        title: 'Module 2: The Bio-Funnel & Conversions',
        lessons: [
          {
            id: 'les-3',
            title: 'Configuring PrimeProfile for 3x Click-Through Rate',
            duration: '14:10',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            content: 'How to structure your links, lead magnets, and sample boxes so every visitor converts.',
          }
        ]
      }
    ]
  }
];

export const INITIAL_BOOKINGS: BookingService[] = [
  {
    id: 'book-1',
    title: '1:1 Private Store Audit & E-Commerce Strategy Call',
    description: 'A 45-minute deep dive session over Google Meet. We review your current Instagram page, product pricing, ad copy, and give you an actionable checklist.',
    durationMinutes: 45,
    price: 999,
    currency: '₹',
    coverImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    locationType: 'Google Meet',
    availableDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat'],
    timeSlots: ['11:00 AM', '02:00 PM', '05:00 PM', '07:30 PM'],
    published: true,
    bookedCount: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
  }
];

export const INITIAL_EVENTS: EventWebinar[] = [
  {
    id: 'event-1',
    title: 'Live Workshop: Scaling Organic Instagram Dropshipping in 2026',
    description: 'Join live with 250+ aspiring entrepreneurs. Q&A session, live supplier cold calls, and real case studies included.',
    eventDate: '2026-10-15',
    eventTime: '06:00 PM IST',
    price: 399,
    currency: '₹',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
    locationUrl: 'https://meet.google.com/xyz-sample',
    seatsTotal: 100,
    seatsBooked: 0,
    published: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  }
];

export const INITIAL_LEAD_MAGNETS: LeadMagnet[] = [
  {
    id: 'lead-1',
    title: 'Free PDF: Top 25 Wholesale Hubs & Markets in Surat & Delhi',
    description: 'Download the comprehensive city-by-city guide complete with contact details, best bargain timings, and transport tips.',
    freebieType: 'pdf',
    freebieUrl: 'https://samplefreebie.pdf',
    buttonText: 'Get Free Instant Access 🎁',
    fields: [
      { name: 'Name', required: true },
      { name: 'Email Address', required: true },
      { name: 'WhatsApp Number', required: true },
    ],
    leadsCount: 0,
    published: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
  }
];

export const INITIAL_LOCKED_CONTENTS: LockedContentItem[] = [
  {
    id: 'lock-1',
    title: 'Exclusive High-Profit Supplier WhatsApp Contact List',
    previewText: 'Unlock direct numbers of 5 factory owners who supply directly with zero upfront MOQ requirements.',
    secretContent: 'Secret Contacts Unlocked! Access factory owner contact details and wholesale catalog links directly in your member dashboard.',
    price: 199,
    currency: '₹',
    unlockedCount: 0,
    published: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  }
];

export const INITIAL_COMMUNITIES: CommunityHub[] = [
  {
    id: 'comm-1',
    title: 'Prime E-com Insiders Club (VIP Telegram)',
    description: 'Weekly winning supplier drops, reel script breakdown, live group discussions and wholesale deal negotiation groups.',
    platform: 'telegram',
    inviteLink: 'https://t.me/+primevipsamplejoin',
    priceMonthly: 499,
    currency: '₹',
    membersCount: 0,
    published: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
  }
];

export const INITIAL_AUDIENCE_CONTACTS: AudienceContact[] = [];

export const INITIAL_ORDERS: OrderTransaction[] = [];

export const INITIAL_PAYOUTS: PayoutRecord[] = [];
