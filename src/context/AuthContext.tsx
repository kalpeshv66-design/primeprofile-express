import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
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
import {
  DEMO_EMAIL,
  DEMO_UID,
  DEMO_USERNAME,
  INITIAL_CREATOR_PROFILE,
  INITIAL_STORE_LINKS,
  INITIAL_PRODUCTS,
  INITIAL_PAYMENT_PAGES,
  INITIAL_COURSES,
  INITIAL_BOOKINGS,
  INITIAL_EVENTS,
  INITIAL_LEAD_MAGNETS,
  INITIAL_LOCKED_CONTENTS,
  INITIAL_COMMUNITIES,
  INITIAL_AUDIENCE_CONTACTS,
  INITIAL_ORDERS,
  INITIAL_PAYOUTS
} from '../data/mockSeed';

interface AuthContextType {
  user: User | null;
  profile: CreatorProfile | null;
  loading: boolean;
  isDemoUser: boolean;
  links: StoreLink[];
  products: DigitalProduct[];
  paymentPages: PaymentPage[];
  courses: Course[];
  bookings: BookingService[];
  events: EventWebinar[];
  leadMagnets: LeadMagnet[];
  lockedContents: LockedContentItem[];
  communities: CommunityHub[];
  audience: AudienceContact[];
  orders: OrderTransaction[];
  payouts: PayoutRecord[];
  processManualPayout: (data: {
    creatorUsername: string;
    creatorId?: string;
    creatorName?: string;
    creatorEmail?: string;
    amount: number;
    orderIds?: string[];
    transactionReference: string;
    paymentMethod?: string;
    bankDetails?: any;
    adminNotes?: string;
  }) => Promise<PayoutRecord>;
  // Actions
  loginWithDemo: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, username: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<CreatorProfile>) => Promise<void>;
  // Store links
  addLink: (link: Omit<StoreLink, 'id' | 'clicks' | 'order'>) => Promise<void>;
  updateLink: (id: string, updates: Partial<StoreLink>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  // Products
  addProduct: (product: Omit<DigitalProduct, 'id' | 'salesCount' | 'revenue' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<DigitalProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  // Payment Pages
  addPaymentPage: (page: Omit<PaymentPage, 'id' | 'salesCount' | 'revenue' | 'createdAt'>) => Promise<void>;
  updatePaymentPage: (id: string, updates: Partial<PaymentPage>) => Promise<void>;
  deletePaymentPage: (id: string) => Promise<void>;
  approvePaymentPage: (id: string) => Promise<void>;
  rejectPaymentPage: (id: string, reason?: string) => Promise<void>;
  requestPaymentPageApproval: (id: string) => Promise<void>;
  // Courses
  addCourse: (course: Omit<Course, 'id' | 'enrolledStudentsCount' | 'createdAt'>) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  // Bookings
  addBooking: (booking: Omit<BookingService, 'id' | 'bookedCount' | 'createdAt'>) => Promise<void>;
  updateBooking: (id: string, updates: Partial<BookingService>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  // Events
  addEvent: (event: Omit<EventWebinar, 'id' | 'seatsBooked' | 'createdAt'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<EventWebinar>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  // Lead magnets
  addLeadMagnet: (magnet: Omit<LeadMagnet, 'id' | 'leadsCount' | 'createdAt'>) => Promise<void>;
  updateLeadMagnet: (id: string, updates: Partial<LeadMagnet>) => Promise<void>;
  deleteLeadMagnet: (id: string) => Promise<void>;
  // Locked content
  addLockedContent: (content: Omit<LockedContentItem, 'id' | 'unlockedCount' | 'createdAt'>) => Promise<void>;
  updateLockedContent: (id: string, updates: Partial<LockedContentItem>) => Promise<void>;
  deleteLockedContent: (id: string) => Promise<void>;
  // Communities
  addCommunity: (comm: Omit<CommunityHub, 'id' | 'membersCount' | 'createdAt'>) => Promise<void>;
  updateCommunity: (id: string, updates: Partial<CommunityHub>) => Promise<void>;
  deleteCommunity: (id: string) => Promise<void>;
  // Orders and Contacts
  recordPublicOrder: (order: Omit<OrderTransaction, 'id' | 'orderNumber' | 'date' | 'createdAt'> & Partial<Pick<OrderTransaction, 'id' | 'orderNumber' | 'date' | 'createdAt'>>, contactDetails?: { name: string; email: string; phone?: string }) => Promise<OrderTransaction>;
  recordLeadSubmission: (magnetId: string, data: { name: string; email: string; phone?: string }) => Promise<void>;
  // Helpers
  loadCreatorByUsername: (username: string) => Promise<{
    profile: CreatorProfile | null;
    links: StoreLink[];
    products: DigitalProduct[];
    paymentPages: PaymentPage[];
    courses: Course[];
    bookings: BookingService[];
    events: EventWebinar[];
    leadMagnets: LeadMagnet[];
    lockedContents: LockedContentItem[];
    communities: CommunityHub[];
  } | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to load persisted payment pages
  const getInitialPaymentPages = (): PaymentPage[] => {
    try {
      const saved = localStorage.getItem('primeprofile_payment_pages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((p: any) => ({
            ...p,
            salesCount: 0,
            revenue: 0,
            creatorName: p.creatorName === 'Rohan Style & Studio' ? 'Creator' : (p.creatorName || 'Creator'),
            creatorEmail: p.creatorEmail === 'rohanstyle@gmail.com' ? '' : (p.creatorEmail || '')
          }));
          localStorage.setItem('primeprofile_payment_pages', JSON.stringify(sanitized));
          return sanitized;
        }
      }
    } catch (e) {
      // Fallback to initial seed
    }
    return INITIAL_PAYMENT_PAGES;
  };

  const getInitialPayouts = (): PayoutRecord[] => {
    try {
      const saved = localStorage.getItem('primeprofile_payouts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out legacy demo payouts
          const clean = parsed.filter((p: any) => p && p.id !== 'payo-1' && !p.id?.startsWith('payo-1'));
          localStorage.setItem('primeprofile_payouts', JSON.stringify(clean));
          return clean;
        }
      }
    } catch (e) {}
    return INITIAL_PAYOUTS;
  };

  const getInitialOrders = (): OrderTransaction[] => {
    try {
      const saved = localStorage.getItem('primeprofile_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out legacy demo orders
          const clean = parsed.filter((o: any) => o && !['ord-101', 'ord-102', 'ord-103', 'ord-104'].includes(o.id));
          localStorage.setItem('primeprofile_orders', JSON.stringify(clean));
          return clean;
        }
      }
    } catch (e) {}
    return INITIAL_ORDERS;
  };

  // Data states
  const [links, setLinks] = useState<StoreLink[]>(INITIAL_STORE_LINKS);
  const [products, setProducts] = useState<DigitalProduct[]>(INITIAL_PRODUCTS);
  const [paymentPages, setPaymentPages] = useState<PaymentPage[]>(getInitialPaymentPages);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [bookings, setBookings] = useState<BookingService[]>(INITIAL_BOOKINGS);
  const [events, setEvents] = useState<EventWebinar[]>(INITIAL_EVENTS);
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>(INITIAL_LEAD_MAGNETS);
  const [lockedContents, setLockedContents] = useState<LockedContentItem[]>(INITIAL_LOCKED_CONTENTS);
  const [communities, setCommunities] = useState<CommunityHub[]>(INITIAL_COMMUNITIES);
  const [audience, setAudience] = useState<AudienceContact[]>(INITIAL_AUDIENCE_CONTACTS);
  const [orders, setOrders] = useState<OrderTransaction[]>(getInitialOrders);
  const [payouts, setPayouts] = useState<PayoutRecord[]>(getInitialPayouts);

  // Automatically save payment pages, orders & payouts changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('primeprofile_payment_pages', JSON.stringify(paymentPages));
    } catch (e) {}
  }, [paymentPages]);

  useEffect(() => {
    try {
      localStorage.setItem('primeprofile_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('primeprofile_payouts', JSON.stringify(payouts));
    } catch (e) {}
  }, [payouts]);

  // Listen for storage events (e.g. approved in Admin Panel or paid in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'primeprofile_payment_pages' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) setPaymentPages(updated);
        } catch (err) {}
      }
      if (e.key === 'primeprofile_orders' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) setOrders(updated);
        } catch (err) {}
      }
      if (e.key === 'primeprofile_payouts' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) setPayouts(updated);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync demo data to Firestore when demo user logs in so external public pages work seamlessly
  const syncDemoDataToFirestore = async (creatorId: string) => {
    try {
      const creatorRef = doc(db, 'creators', creatorId);
      await setDoc(creatorRef, INITIAL_CREATOR_PROFILE, { merge: true });
      await setDoc(doc(db, 'usernames', INITIAL_CREATOR_PROFILE.username.toLowerCase()), {
        uid: creatorId,
        username: INITIAL_CREATOR_PROFILE.username,
      }, { merge: true });

      // Seed links subcollection
      for (const item of INITIAL_STORE_LINKS) {
        await setDoc(doc(db, 'creators', creatorId, 'links', item.id), item, { merge: true });
      }
      for (const item of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'creators', creatorId, 'products', item.id), item, { merge: true });
      }
      for (const item of INITIAL_PAYMENT_PAGES) {
        await setDoc(doc(db, 'creators', creatorId, 'payment_pages', item.id), item, { merge: true });
      }
      for (const item of INITIAL_COURSES) {
        await setDoc(doc(db, 'creators', creatorId, 'courses', item.id), item, { merge: true });
      }
      for (const item of INITIAL_BOOKINGS) {
        await setDoc(doc(db, 'creators', creatorId, 'bookings', item.id), item, { merge: true });
      }
      for (const item of INITIAL_EVENTS) {
        await setDoc(doc(db, 'creators', creatorId, 'events', item.id), item, { merge: true });
      }
      for (const item of INITIAL_LEAD_MAGNETS) {
        await setDoc(doc(db, 'creators', creatorId, 'lead_magnets', item.id), item, { merge: true });
      }
      for (const item of INITIAL_LOCKED_CONTENTS) {
        await setDoc(doc(db, 'creators', creatorId, 'locked_content', item.id), item, { merge: true });
      }
      for (const item of INITIAL_COMMUNITIES) {
        await setDoc(doc(db, 'creators', creatorId, 'communities', item.id), item, { merge: true });
      }
    } catch (e) {
      console.warn('Syncing demo initial data to firestore handled:', e);
    }
  };

  // Load creator profile and all items from firestore
  const fetchCreatorData = async (uid: string) => {
    try {
      const creatorRef = doc(db, 'creators', uid);
      const snap = await getDoc(creatorRef);
      if (snap.exists()) {
        const prof = snap.data() as CreatorProfile;
        setProfile(prof);

        // Fetch subcollections
        const [
          linksSnap,
          productsSnap,
          paymentPagesSnap,
          coursesSnap,
          bookingsSnap,
          eventsSnap,
          leadMagnetsSnap,
          lockedSnap,
          commSnap,
          audSnap,
          ordersSnap,
        ] = await Promise.all([
          getDocs(query(collection(db, 'creators', uid, 'links'))),
          getDocs(query(collection(db, 'creators', uid, 'products'))),
          getDocs(query(collection(db, 'creators', uid, 'payment_pages'))),
          getDocs(query(collection(db, 'creators', uid, 'courses'))),
          getDocs(query(collection(db, 'creators', uid, 'bookings'))),
          getDocs(query(collection(db, 'creators', uid, 'events'))),
          getDocs(query(collection(db, 'creators', uid, 'lead_magnets'))),
          getDocs(query(collection(db, 'creators', uid, 'locked_content'))),
          getDocs(query(collection(db, 'creators', uid, 'communities'))),
          getDocs(query(collection(db, 'creators', uid, 'audiences'))),
          getDocs(query(collection(db, 'creators', uid, 'orders'), orderBy('createdAt', 'desc'))),
        ]);

        if (!linksSnap.empty) setLinks(linksSnap.docs.map(d => ({ ...d.data(), id: d.id } as StoreLink)));
        if (!productsSnap.empty) setProducts(productsSnap.docs.map(d => ({ ...d.data(), id: d.id } as DigitalProduct)));
        if (!paymentPagesSnap.empty) setPaymentPages(paymentPagesSnap.docs.map(d => ({ ...d.data(), id: d.id } as PaymentPage)));
        if (!coursesSnap.empty) setCourses(coursesSnap.docs.map(d => ({ ...d.data(), id: d.id } as Course)));
        if (!bookingsSnap.empty) setBookings(bookingsSnap.docs.map(d => ({ ...d.data(), id: d.id } as BookingService)));
        if (!eventsSnap.empty) setEvents(eventsSnap.docs.map(d => ({ ...d.data(), id: d.id } as EventWebinar)));
        if (!leadMagnetsSnap.empty) setLeadMagnets(leadMagnetsSnap.docs.map(d => ({ ...d.data(), id: d.id } as LeadMagnet)));
        if (!lockedSnap.empty) setLockedContents(lockedSnap.docs.map(d => ({ ...d.data(), id: d.id } as LockedContentItem)));
        if (!commSnap.empty) setCommunities(commSnap.docs.map(d => ({ ...d.data(), id: d.id } as CommunityHub)));
        if (!audSnap.empty) setAudience(audSnap.docs.map(d => ({ ...d.data(), id: d.id } as AudienceContact)));
        if (!ordersSnap.empty) setOrders(ordersSnap.docs.map(d => ({ ...d.data(), id: d.id } as OrderTransaction)));
      } else {
        // Auto-provision initial profile if user exists in auth (e.g. Google Sign-In)
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === uid) {
          const rawUsername = (currentUser.displayName || currentUser.email?.split('@')[0] || 'creator')
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '')
            .slice(0, 20) || 'creator';

          let finalUsername = rawUsername;
          try {
            const userCheck = await getDoc(doc(db, 'usernames', finalUsername));
            if (userCheck.exists() && userCheck.data()?.uid !== uid) {
              finalUsername = `${rawUsername}${Math.floor(100 + Math.random() * 900)}`;
            }
          } catch {
            // fallback
          }

          const nameParts = (currentUser.displayName || 'Creator').split(' ');
          const firstName = nameParts[0] || 'Creator';
          const lastName = nameParts.slice(1).join(' ') || '';

          const newProfile: CreatorProfile = {
            id: uid,
            uid: uid,
            username: finalUsername,
            name: currentUser.displayName || 'Creator',
            firstName,
            lastName,
            email: currentUser.email || '',
            bio: 'Welcome to my creator store on PrimeProfile! ✨',
            avatarUrl: currentUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.displayName || finalUsername)}`,
            category: 'Digital Creator',
            currency: '₹',
            theme: 'classic',
            buttonStyle: 'rounded',
            fontFamily: 'Poppins',
            brandColor: '#2563eb',
            metaTitle: `${currentUser.displayName || 'Creator'} | Official Store`,
            metaDescription: `Discover and purchase digital products, masterclasses and consultations from ${currentUser.displayName || 'Creator'}.`,
            socials: {},
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
            createdAt: Date.now(),
            onboarded: true,
            settlement: {
              upiActive: true,
              cardsRequested: false,
              cardsActive: false,
              accountHolderName: (currentUser.displayName || 'CREATOR').toUpperCase(),
              accountNumber: '',
              ifscCode: '',
              bankName: '',
              gstin: '',
              invoiceLogo: '',
              signature: '',
              customNote: 'Thank you for your purchase! For any queries or direct access support, reach out to us.',
              invoiceAddress: 'Registered Creator Studio, India'
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
            twoFactorEnabled: false
          };

          await setDoc(creatorRef, newProfile);
          await setDoc(doc(db, 'usernames', finalUsername), {
            uid: uid,
            username: finalUsername
          }, { merge: true });

          const defaultLink: StoreLink = {
            id: 'welcome-link',
            title: '🌟 Welcome to my PrimeProfile Store',
            url: 'https://primeprofile.bio',
            type: 'highlight',
            enabled: true,
            clicks: 0,
            order: 0,
          };
          await setDoc(doc(db, 'creators', uid, 'links', defaultLink.id), defaultLink);

          setProfile(newProfile);
          setLinks([defaultLink]);
          setProducts([]);
          setPaymentPages([]);
          setCourses([]);
          setBookings([]);
          setEvents([]);
          setLeadMagnets([]);
          setLockedContents([]);
          setCommunities([]);
          setAudience([]);
          setOrders([]);
        }
      }
    } catch (err) {
      console.warn('Error fetching creator data:', err);
    }
  };

  useEffect(() => {
    // Check if demo session is stored in localStorage
    const savedDemo = localStorage.getItem('primeprofile_demo_active');
    if (savedDemo === 'true') {
      setIsDemoUser(true);
      setProfile(INITIAL_CREATOR_PROFILE);
      setLinks(INITIAL_STORE_LINKS);
      setProducts(INITIAL_PRODUCTS);
      setPaymentPages(INITIAL_PAYMENT_PAGES);
      setCourses(INITIAL_COURSES);
      setBookings(INITIAL_BOOKINGS);
      setEvents(INITIAL_EVENTS);
      setLeadMagnets(INITIAL_LEAD_MAGNETS);
      setLockedContents(INITIAL_LOCKED_CONTENTS);
      setCommunities(INITIAL_COMMUNITIES);
      setAudience(INITIAL_AUDIENCE_CONTACTS);
      setOrders(INITIAL_ORDERS);
      setPayouts(INITIAL_PAYOUTS);
      setLoading(false);
      syncDemoDataToFirestore(INITIAL_CREATOR_PROFILE.uid);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsDemoUser(false);
        await fetchCreatorData(currentUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithDemo = async () => {
    localStorage.setItem('primeprofile_demo_active', 'true');
    setIsDemoUser(true);
    setProfile(INITIAL_CREATOR_PROFILE);
    setLinks(INITIAL_STORE_LINKS);
    setProducts(INITIAL_PRODUCTS);
    setPaymentPages(INITIAL_PAYMENT_PAGES);
    setCourses(INITIAL_COURSES);
    setBookings(INITIAL_BOOKINGS);
    setEvents(INITIAL_EVENTS);
    setLeadMagnets(INITIAL_LEAD_MAGNETS);
    setLockedContents(INITIAL_LOCKED_CONTENTS);
    setCommunities(INITIAL_COMMUNITIES);
    setAudience(INITIAL_AUDIENCE_CONTACTS);
    setOrders(INITIAL_ORDERS);
    setPayouts(INITIAL_PAYOUTS);
    await syncDemoDataToFirestore(INITIAL_CREATOR_PROFILE.uid);
  };

  const loginWithGoogle = async () => {
    localStorage.removeItem('primeprofile_demo_active');
    setIsDemoUser(false);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    await fetchCreatorData(cred.user.uid);
  };

  const login = async (email: string, pass: string) => {
    if (email.toLowerCase() === DEMO_EMAIL.toLowerCase()) {
      await loginWithDemo();
      return;
    }
    localStorage.removeItem('primeprofile_demo_active');
    setIsDemoUser(false);
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await fetchCreatorData(cred.user.uid);
  };

  const signup = async (email: string, pass: string, username: string, name: string) => {
    localStorage.removeItem('primeprofile_demo_active');
    setIsDemoUser(false);
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const newProfile: CreatorProfile = {
      id: cred.user.uid,
      uid: cred.user.uid,
      username: username.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      name: name || 'Creator',
      email: email,
      bio: 'Welcome to my creator store on PrimeProfile! ✨',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || username)}`,
      category: 'Digital Creator',
      currency: '₹',
      theme: 'classic',
      buttonStyle: 'rounded',
      fontFamily: 'Poppins',
      brandColor: '#2563eb',
      metaTitle: `${name} | Official Store`,
      metaDescription: `Discover and purchase digital products, masterclasses and consultations from ${name}.`,
      socials: {},
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
      createdAt: Date.now(),
      onboarded: true,
    };

    await setDoc(doc(db, 'creators', cred.user.uid), newProfile);
    await setDoc(doc(db, 'usernames', newProfile.username), {
      uid: cred.user.uid,
      username: newProfile.username,
    });
    setProfile(newProfile);

    // Initial default links
    const defaultLink: StoreLink = {
      id: 'welcome-link',
      title: '🌟 Welcome to my PrimeProfile Store',
      url: 'https://primeprofile.bio',
      type: 'highlight',
      enabled: true,
      clicks: 0,
      order: 0,
    };
    await setDoc(doc(db, 'creators', cred.user.uid, 'links', defaultLink.id), defaultLink);
    setLinks([defaultLink]);
    setProducts([]);
    setPaymentPages([]);
    setCourses([]);
    setBookings([]);
    setEvents([]);
    setLeadMagnets([]);
    setLockedContents([]);
    setCommunities([]);
    setAudience([]);
    setOrders([]);
  };

  const resetPassword = async (email: string) => {
    if (email.toLowerCase() === DEMO_EMAIL.toLowerCase()) {
      return;
    }
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    localStorage.removeItem('primeprofile_demo_active');
    setIsDemoUser(false);
    setUser(null);
    setProfile(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.warn(e);
    }
  };

  const getActiveUid = () => {
    if (profile?.uid) return profile.uid;
    if (user?.uid) return user.uid;
    return DEMO_UID;
  };

  const updateProfile = async (updates: Partial<CreatorProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);
    const uid = getActiveUid();
    try {
      await updateDoc(doc(db, 'creators', uid), updates);
    } catch (err) {
      console.warn('Update profile error handled locally:', err);
    }
  };

  // Links CRUD
  const addLink = async (item: Omit<StoreLink, 'id' | 'clicks' | 'order'>) => {
    const id = 'link-' + Date.now();
    const newLink: StoreLink = {
      ...item,
      id,
      clicks: 0,
      order: links.length,
    };
    setLinks(prev => [newLink, ...prev]);
    const uid = getActiveUid();
    try {
      await setDoc(doc(db, 'creators', uid, 'links', id), newLink);
    } catch (e) {
      console.warn(e);
    }
  };

  const updateLink = async (id: string, updates: Partial<StoreLink>) => {
    setLinks(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
    const uid = getActiveUid();
    try {
      await updateDoc(doc(db, 'creators', uid, 'links', id), updates);
    } catch (e) {
      console.warn(e);
    }
  };

  const deleteLink = async (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
    const uid = getActiveUid();
    try {
      await deleteDoc(doc(db, 'creators', uid, 'links', id));
    } catch (e) {
      console.warn(e);
    }
  };

  // Products CRUD
  const addProduct = async (prod: Omit<DigitalProduct, 'id' | 'salesCount' | 'revenue' | 'createdAt'>) => {
    const id = 'prod-' + Date.now();
    const newProd: DigitalProduct = {
      ...prod,
      id,
      salesCount: 0,
      revenue: 0,
      createdAt: Date.now(),
    };
    setProducts(prev => [newProd, ...prev]);
    const uid = getActiveUid();
    try {
      await setDoc(doc(db, 'creators', uid, 'products', id), newProd);
    } catch (e) {
      console.warn(e);
    }
  };

  const updateProduct = async (id: string, updates: Partial<DigitalProduct>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    const uid = getActiveUid();
    try {
      await updateDoc(doc(db, 'creators', uid, 'products', id), updates);
    } catch (e) {
      console.warn(e);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    const uid = getActiveUid();
    try {
      await deleteDoc(doc(db, 'creators', uid, 'products', id));
    } catch (e) {
      console.warn(e);
    }
  };

  // Payment Pages CRUD
  const addPaymentPage = async (page: Omit<PaymentPage, 'id' | 'salesCount' | 'revenue' | 'createdAt'>) => {
    const id = 'pay-' + Date.now();
    const newPage: PaymentPage = {
      ...page,
      id,
      moderationStatus: page.moderationStatus || 'pending',
      published: page.published !== undefined ? page.published : false,
      submittedAt: page.submittedAt || Date.now(),
      creatorName: page.creatorName || profile?.name || 'Creator',
      creatorEmail: page.creatorEmail || profile?.email || 'creator@primeprofile.bio',
      salesCount: 0,
      revenue: 0,
      createdAt: Date.now(),
    };
    setPaymentPages(prev => [newPage, ...prev]);
    const uid = getActiveUid();
    try {
      await setDoc(doc(db, 'creators', uid, 'payment_pages', id), newPage);
    } catch (e) {
      console.warn(e);
    }
  };

  const updatePaymentPage = async (id: string, updates: Partial<PaymentPage>) => {
    const cleanTargetId = id.replace(/^pay-/, '');
    setPaymentPages(prev => prev.map(p => {
      const match = p.id === id || p.id === `pay-${id}` || `pay-${p.id}` === id || p.id.replace(/^pay-/, '') === cleanTargetId;
      return match ? { ...p, ...updates } : p;
    }));
    const uid = getActiveUid();
    try {
      await updateDoc(doc(db, 'creators', uid, 'payment_pages', id), updates);
    } catch (e) {
      console.warn(e);
    }
  };

  const deletePaymentPage = async (id: string) => {
    const cleanTargetId = id.replace(/^pay-/, '');
    setPaymentPages(prev => prev.filter(p => {
      const match = p.id === id || p.id === `pay-${id}` || `pay-${p.id}` === id || p.id.replace(/^pay-/, '') === cleanTargetId;
      return !match;
    }));
    const uid = getActiveUid();
    try {
      await deleteDoc(doc(db, 'creators', uid, 'payment_pages', id));
    } catch (e) {
      console.warn(e);
    }
  };

  const approvePaymentPage = async (id: string) => {
    const cleanTargetId = id.replace(/^pay-/, '');
    const updates: Partial<PaymentPage> = {
      moderationStatus: 'approved',
      published: true,
      approvedAt: Date.now(),
      rejectionReason: undefined,
    };
    setPaymentPages(prev => prev.map(p => {
      const match = p.id === id || p.id === `pay-${id}` || `pay-${p.id}` === id || p.id.replace(/^pay-/, '') === cleanTargetId;
      return match ? { ...p, ...updates } : p;
    }));
    const uid = getActiveUid();
    try {
      await updateDoc(doc(db, 'creators', uid, 'payment_pages', id), updates);
    } catch (e) {
      console.warn(e);
    }
  };

  const rejectPaymentPage = async (id: string, reason?: string) => {
    const cleanTargetId = id.replace(/^pay-/, '');
    const updates: Partial<PaymentPage> = {
      moderationStatus: 'rejected',
      published: false,
      rejectionReason: reason || 'Page did not meet marketplace requirements or details were incomplete.',
    };
    setPaymentPages(prev => prev.map(p => {
      const match = p.id === id || p.id === `pay-${id}` || `pay-${p.id}` === id || p.id.replace(/^pay-/, '') === cleanTargetId;
      return match ? { ...p, ...updates } : p;
    }));
    const uid = getActiveUid();
    try {
      await updateDoc(doc(db, 'creators', uid, 'payment_pages', id), updates);
    } catch (e) {
      console.warn(e);
    }
  };

  const requestPaymentPageApproval = async (id: string) => {
    const cleanTargetId = id.replace(/^pay-/, '');
    const updates: Partial<PaymentPage> = {
      moderationStatus: 'pending',
      published: false,
      submittedAt: Date.now(),
      rejectionReason: undefined,
    };
    setPaymentPages(prev => prev.map(p => {
      const match = p.id === id || p.id === `pay-${id}` || `pay-${p.id}` === id || p.id.replace(/^pay-/, '') === cleanTargetId;
      return match ? { ...p, ...updates } : p;
    }));
    const uid = getActiveUid();
    try {
      await updateDoc(doc(db, 'creators', uid, 'payment_pages', id), updates);
    } catch (e) {
      console.warn(e);
    }
  };

  // Courses CRUD
  const addCourse = async (course: Omit<Course, 'id' | 'enrolledStudentsCount' | 'createdAt'>) => {
    const id = 'course-' + Date.now();
    const newCourse: Course = {
      ...course,
      id,
      enrolledStudentsCount: 0,
      createdAt: Date.now(),
    };
    setCourses(prev => [newCourse, ...prev]);
    const uid = getActiveUid();
    try {
      await setDoc(doc(db, 'creators', uid, 'courses', id), newCourse);
    } catch (e) {
      console.warn(e);
    }
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    const uid = getActiveUid();
    try {
      await updateDoc(doc(db, 'creators', uid, 'courses', id), updates);
    } catch (e) {
      console.warn(e);
    }
  };

  const deleteCourse = async (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    const uid = getActiveUid();
    try {
      await deleteDoc(doc(db, 'creators', uid, 'courses', id));
    } catch (e) {
      console.warn(e);
    }
  };

  // Bookings CRUD
  const addBooking = async (booking: Omit<BookingService, 'id' | 'bookedCount' | 'createdAt'>) => {
    const id = 'book-' + Date.now();
    const newBooking: BookingService = {
      ...booking,
      id,
      bookedCount: 0,
      createdAt: Date.now(),
    };
    setBookings(prev => [newBooking, ...prev]);
    const uid = getActiveUid();
    try {
      await setDoc(doc(db, 'creators', uid, 'bookings', id), newBooking);
    } catch (e) {
      console.warn(e);
    }
  };

  const updateBooking = async (id: string, updates: Partial<BookingService>) => {
    setBookings(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
    const uid = getActiveUid();
    try {
      await updateDoc(doc(db, 'creators', uid, 'bookings', id), updates);
    } catch (e) {
      console.warn(e);
    }
  };

  const deleteBooking = async (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    const uid = getActiveUid();
    try {
      await deleteDoc(doc(db, 'creators', uid, 'bookings', id));
    } catch (e) {
      console.warn(e);
    }
  };

  // Events CRUD
  const addEvent = async (ev: Omit<EventWebinar, 'id' | 'seatsBooked' | 'createdAt'>) => {
    const id = 'event-' + Date.now();
    const newEv: EventWebinar = {
      ...ev,
      id,
      seatsBooked: 0,
      createdAt: Date.now(),
    };
    setEvents(prev => [newEv, ...prev]);
    const uid = getActiveUid();
    try {
      await setDoc(doc(db, 'creators', uid, 'events', id), newEv);
    } catch (e) {
      console.warn(e);
    }
  };

  const updateEvent = async (id: string, updates: Partial<EventWebinar>) => {
    setEvents(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
    const uid = getActiveUid();
    try {
      await updateDoc(doc(db, 'creators', uid, 'events', id), updates);
    } catch (e) {
      console.warn(e);
    }
  };

  const deleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    const uid = getActiveUid();
    try {
      await deleteDoc(doc(db, 'creators', uid, 'events', id));
    } catch (e) {
      console.warn(e);
    }
  };

  // Lead Magnets CRUD
  const addLeadMagnet = async (magnet: Omit<LeadMagnet, 'id' | 'leadsCount' | 'createdAt'>) => {
    const id = 'lead-' + Date.now();
    const newMag: LeadMagnet = {
      ...magnet,
      id,
      leadsCount: 0,
      createdAt: Date.now(),
    };
    setLeadMagnets(prev => [newMag, ...prev]);
    const uid = getActiveUid();
    try {
      await setDoc(doc(db, 'creators', uid, 'lead_magnets', id), newMag);
    } catch (e) {
      console.warn(e);
    }
  };

  const updateLeadMagnet = async (id: string, updates: Partial<LeadMagnet>) => {
    setLeadMagnets(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
    const uid = getActiveUid();
    try {
      await updateDoc(doc(db, 'creators', uid, 'lead_magnets', id), updates);
    } catch (e) {
      console.warn(e);
    }
  };

  const deleteLeadMagnet = async (id: string) => {
    setLeadMagnets(prev => prev.filter(m => m.id !== id));
    const uid = getActiveUid();
    try {
      await deleteDoc(doc(db, 'creators', uid, 'lead_magnets', id));
    } catch (e) {
      console.warn(e);
    }
  };

  // Locked Content CRUD
  const addLockedContent = async (item: Omit<LockedContentItem, 'id' | 'unlockedCount' | 'createdAt'>) => {
    const id = 'lock-' + Date.now();
    const newLock: LockedContentItem = {
      ...item,
      id,
      unlockedCount: 0,
      createdAt: Date.now(),
    };
    setLockedContents(prev => [newLock, ...prev]);
    const uid = getActiveUid();
    try {
      await setDoc(doc(db, 'creators', uid, 'locked_content', id), newLock);
    } catch (e) {
      console.warn(e);
    }
  };

  const updateLockedContent = async (id: string, updates: Partial<LockedContentItem>) => {
    setLockedContents(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
    const uid = getActiveUid();
    try {
      await updateDoc(doc(db, 'creators', uid, 'locked_content', id), updates);
    } catch (e) {
      console.warn(e);
    }
  };

  const deleteLockedContent = async (id: string) => {
    setLockedContents(prev => prev.filter(l => l.id !== id));
    const uid = getActiveUid();
    try {
      await deleteDoc(doc(db, 'creators', uid, 'locked_content', id));
    } catch (e) {
      console.warn(e);
    }
  };

  // Communities CRUD
  const addCommunity = async (comm: Omit<CommunityHub, 'id' | 'membersCount' | 'createdAt'>) => {
    const id = 'comm-' + Date.now();
    const newComm: CommunityHub = {
      ...comm,
      id,
      membersCount: 0,
      createdAt: Date.now(),
    };
    setCommunities(prev => [newComm, ...prev]);
    const uid = getActiveUid();
    try {
      await setDoc(doc(db, 'creators', uid, 'communities', id), newComm);
    } catch (e) {
      console.warn(e);
    }
  };

  const updateCommunity = async (id: string, updates: Partial<CommunityHub>) => {
    setCommunities(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    const uid = getActiveUid();
    try {
      await updateDoc(doc(db, 'creators', uid, 'communities', id), updates);
    } catch (e) {
      console.warn(e);
    }
  };

  const deleteCommunity = async (id: string) => {
    setCommunities(prev => prev.filter(c => c.id !== id));
    const uid = getActiveUid();
    try {
      await deleteDoc(doc(db, 'creators', uid, 'communities', id));
    } catch (e) {
      console.warn(e);
    }
  };

  // Orders and Contacts recording
  const recordPublicOrder = async (
    orderData: Omit<OrderTransaction, 'id' | 'orderNumber' | 'date' | 'createdAt'> & Partial<Pick<OrderTransaction, 'id' | 'orderNumber' | 'date' | 'createdAt'>>,
    contactDetails?: { name: string; email: string; phone?: string }
  ): Promise<OrderTransaction> => {
    const existingOrder = orders.find(o => orderData.gatewayPaymentId && o.gatewayPaymentId === orderData.gatewayPaymentId);
    if (existingOrder) return existingOrder;
    const id = orderData.id || 'ord-' + Date.now();
    const orderNumber = orderData.orderNumber || 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    const date = orderData.date || 'Just now';

    // Calculate 8% server platform commission & creator share
    const rate = 0.08;
    const platformCommissionAmount = Math.round(orderData.amount * rate * 100) / 100;
    const creatorShareAmount = Math.round((orderData.amount - platformCommissionAmount) * 100) / 100;

    const newOrder: OrderTransaction = {
      ...orderData,
      id,
      orderNumber,
      platformCommissionRate: orderData.platformCommissionRate ?? rate,
      platformCommissionAmount: orderData.platformCommissionAmount !== undefined ? orderData.platformCommissionAmount : platformCommissionAmount,
      creatorShareAmount: orderData.creatorShareAmount !== undefined ? orderData.creatorShareAmount : creatorShareAmount,
      creatorId: orderData.creatorId || profile?.uid || 'demo-prime-creator-uid-101',
      creatorUsername: orderData.creatorUsername || profile?.username || 'rohanstyle',
      gateway: orderData.gateway || 'razorpay',
      gatewayOrderId: orderData.gatewayOrderId || '',
      signatureVerified: orderData.signatureVerified !== undefined ? orderData.signatureVerified : false,
      verifiedAt: Date.now(),
      payoutStatus: orderData.payoutStatus || 'pending',
      date,
      createdAt: orderData.createdAt || Date.now(),
    };

    setOrders(prev => [newOrder, ...prev]);

    // Also update customer contact in audience
    if (contactDetails) {
      const existingIdx = audience.findIndex(a => a.email.toLowerCase() === contactDetails.email.toLowerCase());
      if (existingIdx >= 0) {
        setAudience(prev => prev.map((a, i) => i === existingIdx ? { ...a, totalSpent: a.totalSpent + orderData.amount } : a));
      } else {
        const newAud: AudienceContact = {
          id: 'aud-' + Date.now(),
          name: contactDetails.name,
          email: contactDetails.email,
          phone: contactDetails.phone,
          segment: 'Customers',
          source: orderData.itemType,
          totalSpent: orderData.amount,
          createdAt: Date.now(),
        };
        setAudience(prev => [newAud, ...prev]);
      }
    }

    // Update item specific sales count
    if (orderData.itemType === 'product') {
      setProducts(prev => prev.map(p => p.id === orderData.itemId ? { ...p, salesCount: p.salesCount + 1, revenue: p.revenue + orderData.amount } : p));
    } else if (orderData.itemType === 'payment_page') {
      setPaymentPages(prev => prev.map(p => p.id === orderData.itemId ? { ...p, salesCount: p.salesCount + 1, revenue: p.revenue + orderData.amount } : p));
    } else if (orderData.itemType === 'course') {
      setCourses(prev => prev.map(c => c.id === orderData.itemId ? { ...c, enrolledStudentsCount: c.enrolledStudentsCount + 1 } : c));
    } else if (orderData.itemType === 'booking') {
      setBookings(prev => prev.map(b => b.id === orderData.itemId ? { ...b, bookedCount: b.bookedCount + 1 } : b));
    } else if (orderData.itemType === 'event') {
      setEvents(prev => prev.map(e => e.id === orderData.itemId ? { ...e, seatsBooked: e.seatsBooked + 1 } : e));
    } else if (orderData.itemType === 'locked_content') {
      setLockedContents(prev => prev.map(l => l.id === orderData.itemId ? { ...l, unlockedCount: l.unlockedCount + 1 } : l));
    }

    const uid = newOrder.creatorId || getActiveUid();
    try {
      await setDoc(doc(db, 'creators', uid, 'orders', id), newOrder);
    } catch (e) {
      console.warn(e);
    }

    return newOrder;
  };

  // Manual Payout Action for Admin Bank Transfer
  const processManualPayout = async (data: {
    creatorUsername: string;
    creatorId?: string;
    creatorName?: string;
    creatorEmail?: string;
    amount: number;
    orderIds?: string[];
    transactionReference: string;
    paymentMethod?: string;
    bankDetails?: any;
    adminNotes?: string;
  }): Promise<PayoutRecord> => {
    const paidAt = Date.now();
    const payoutId = `payo-${Date.now()}`;
    const payoutNumber = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newPayout: PayoutRecord = {
      id: payoutId,
      payoutNumber,
      creatorId: data.creatorId || 'demo-prime-creator-uid-101',
      creatorUsername: data.creatorUsername || 'rohanstyle',
      creatorName: data.creatorName || 'Creator',
      creatorEmail: data.creatorEmail || `${data.creatorUsername}@gmail.com`,
      amount: data.amount,
      currency: '₹',
      orderIds: data.orderIds || [],
      status: 'paid',
      requestedAt: paidAt - 1000 * 60 * 30,
      paidAt,
      paymentMethod: (data.paymentMethod as any) || 'Bank Transfer (NEFT/IMPS/RTGS)',
      bankDetails: data.bankDetails || {
        accountHolderName: profile?.settlement?.accountHolderName || 'ROHAN VERMA',
        accountNumber: profile?.settlement?.accountNumber || '91827364501234',
        ifscCode: profile?.settlement?.ifscCode || 'HDFC0000123',
        bankName: profile?.settlement?.bankName || 'HDFC Bank',
        upiId: `${data.creatorUsername}@okhdfcbank`
      },
      transactionReference: data.transactionReference.trim(),
      adminNotes: data.adminNotes || 'Manual bank transfer confirmed with UTR reference.',
      createdAt: paidAt
    };

    // Try calling backend endpoint if available
    try {
      await fetch('/api/payouts/manual-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {
      // Local execution fallback
    }

    setPayouts(prev => [newPayout, ...prev]);

    setOrders(prev => prev.map(o => {
      const match = (data.orderIds && data.orderIds.length > 0)
        ? data.orderIds.includes(o.id)
        : o.creatorUsername?.toLowerCase() === data.creatorUsername.toLowerCase() && o.payoutStatus !== 'paid';
      if (match) {
        return {
          ...o,
          payoutStatus: 'paid' as const,
          payoutId,
          payoutReference: data.transactionReference.trim(),
          paidAt
        };
      }
      return o;
    }));

    return newPayout;
  };

  const recordLeadSubmission = async (magnetId: string, data: { name: string; email: string; phone?: string }) => {
    setLeadMagnets(prev => prev.map(m => m.id === magnetId ? { ...m, leadsCount: m.leadsCount + 1 } : m));
    const newAud: AudienceContact = {
      id: 'aud-' + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      segment: 'Followers',
      source: 'Lead Magnet',
      totalSpent: 0,
      createdAt: Date.now(),
    };
    setAudience(prev => [newAud, ...prev]);

    const uid = getActiveUid();
    try {
      await addDoc(collection(db, 'creators', uid, 'audiences'), newAud);
    } catch (e) {
      console.warn(e);
    }
  };

  // Helper for loading creator public bio store by username
  const loadCreatorByUsername = async (username: string) => {
    const cleanUser = username.toLowerCase().trim();
    if (cleanUser === DEMO_USERNAME.toLowerCase() || (profile && profile.username.toLowerCase() === cleanUser)) {
      return {
        profile: profile || INITIAL_CREATOR_PROFILE,
        links,
        products,
        paymentPages,
        courses,
        bookings,
        events,
        leadMagnets,
        lockedContents,
        communities,
      };
    }

    try {
      const uSnap = await getDoc(doc(db, 'usernames', cleanUser));
      if (!uSnap.exists()) return null;
      const targetUid = uSnap.data().uid;
      const cSnap = await getDoc(doc(db, 'creators', targetUid));
      if (!cSnap.exists()) return null;
      const loadedProf = cSnap.data() as CreatorProfile;

      const [
        lSnap,
        pSnap,
        ppSnap,
        crsSnap,
        bSnap,
        evSnap,
        lmSnap,
        lcSnap,
        cmSnap,
      ] = await Promise.all([
        getDocs(query(collection(db, 'creators', targetUid, 'links'))),
        getDocs(query(collection(db, 'creators', targetUid, 'products'))),
        getDocs(query(collection(db, 'creators', targetUid, 'payment_pages'))),
        getDocs(query(collection(db, 'creators', targetUid, 'courses'))),
        getDocs(query(collection(db, 'creators', targetUid, 'bookings'))),
        getDocs(query(collection(db, 'creators', targetUid, 'events'))),
        getDocs(query(collection(db, 'creators', targetUid, 'lead_magnets'))),
        getDocs(query(collection(db, 'creators', targetUid, 'locked_content'))),
        getDocs(query(collection(db, 'creators', targetUid, 'communities'))),
      ]);

      return {
        profile: loadedProf,
        links: lSnap.docs.map(d => ({ ...d.data(), id: d.id } as StoreLink)),
        products: pSnap.docs.map(d => ({ ...d.data(), id: d.id } as DigitalProduct)),
        paymentPages: ppSnap.docs.map(d => ({ ...d.data(), id: d.id } as PaymentPage)),
        courses: crsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Course)),
        bookings: bSnap.docs.map(d => ({ ...d.data(), id: d.id } as BookingService)),
        events: evSnap.docs.map(d => ({ ...d.data(), id: d.id } as EventWebinar)),
        leadMagnets: lmSnap.docs.map(d => ({ ...d.data(), id: d.id } as LeadMagnet)),
        lockedContents: lcSnap.docs.map(d => ({ ...d.data(), id: d.id } as LockedContentItem)),
        communities: cmSnap.docs.map(d => ({ ...d.data(), id: d.id } as CommunityHub)),
      };
    } catch (e) {
      console.warn('Error querying username:', e);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isDemoUser,
        links,
        products,
        paymentPages,
        courses,
        bookings,
        events,
        leadMagnets,
        lockedContents,
        communities,
        audience,
        orders,
        payouts,
        processManualPayout,
        loginWithDemo,
        loginWithGoogle,
        login,
        signup,
        resetPassword,
        logout,
        updateProfile,
        addLink,
        updateLink,
        deleteLink,
        addProduct,
        updateProduct,
        deleteProduct,
        addPaymentPage,
        updatePaymentPage,
        deletePaymentPage,
        approvePaymentPage,
        rejectPaymentPage,
        requestPaymentPageApproval,
        addCourse,
        updateCourse,
        deleteCourse,
        addBooking,
        updateBooking,
        deleteBooking,
        addEvent,
        updateEvent,
        deleteEvent,
        addLeadMagnet,
        updateLeadMagnet,
        deleteLeadMagnet,
        addLockedContent,
        updateLockedContent,
        deleteLockedContent,
        addCommunity,
        updateCommunity,
        deleteCommunity,
        recordPublicOrder,
        recordLeadSubmission,
        loadCreatorByUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
