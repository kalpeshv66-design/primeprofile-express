import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { GettingStarted } from './components/GettingStarted';
import { StoreBuilder } from './components/StoreBuilder';
import { PaymentsManager } from './components/PaymentsManager';
import { PaymentPagesSection } from './components/PaymentPagesSection';
import { AudienceManager } from './components/AudienceManager';
import { ExploreApps } from './components/ExploreApps';
import { CoursesHub } from './components/CoursesHub';
import { BookingsManager } from './components/BookingsManager';
import { LeadAndLockManager } from './components/LeadAndLockManager';
import { PublicStoreView } from './components/PublicStoreView';
import { CheckoutView } from './components/CheckoutView';
import { CoursePortal } from './components/CoursePortal';
import { SuperLinksApp } from './components/SuperLinksApp';
import { AutoDmApp } from './components/AutoDmApp';
import { ReferAndEarn } from './components/ReferAndEarn';
import { UpgradeToCreatorPlanModal } from './components/UpgradeToCreatorPlanModal';
import { AccountSettings } from './components/AccountSettings';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const { user, profile, loading, isDemoUser } = useAuth();

  // Helper to extract clean route from window.location
  const getRouteFromUrl = (): string => {
    // 1. Check window.location.hash (#pay-1, #admin, #public-rohanstyle, etc.)
    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    if (hash) {
      return hash;
    }
    // 2. Check search parameters (?pay=..., ?route=...)
    const params = new URLSearchParams(window.location.search);
    const paramRoute = params.get('route') || params.get('pay') || params.get('p');
    if (paramRoute) {
      return paramRoute.startsWith('pay-') ? paramRoute : `pay-${paramRoute}`;
    }
    return 'landing';
  };

  // Navigation router state initialized from URL
  const [currentRoute, setCurrentRoute] = useState<string>(getRouteFromUrl);
  const [dashboardTab, setDashboardTab] = useState<string>('getting-started');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Sync with browser back/forward and hash changes
  React.useEffect(() => {
    const handleUrlChange = () => {
      const route = getRouteFromUrl();
      if (route && route !== 'landing') {
        setCurrentRoute(route);
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Handle URL hash and route navigation
  const navigate = (route: string) => {
    setCurrentRoute(route);
    try {
      if (route === 'landing') {
        window.history.replaceState(null, '', window.location.pathname);
      } else {
        window.location.hash = route;
      }
    } catch (e) {
      // Ignore in iframe if security restricts history
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold">Loading PrimeProfile...</span>
        </div>
      </div>
    );
  }

  // 1. PUBLIC BIO STORE ROUTES: e.g. "public-rohanstyle"
  if (currentRoute.startsWith('public-')) {
    const username = currentRoute.replace('public-', '');
    return <PublicStoreView targetUsername={username} onNavigate={navigate} />;
  }

  // 2. PUBLIC CHECKOUT ROUTES:
  // e.g. "pay-pay-1", "checkout-product-prod-1", "course-course-1", "booking-book-1"
  if (currentRoute.startsWith('pay-')) {
    const pageId = currentRoute.replace('pay-', '');
    return <CheckoutView type="payment_page" itemId={pageId} onNavigate={navigate} />;
  }

  if (currentRoute.startsWith('checkout-product-')) {
    const prodId = currentRoute.replace('checkout-product-', '');
    return <CheckoutView type="product" itemId={prodId} onNavigate={navigate} />;
  }

  if (currentRoute.startsWith('booking-')) {
    const bookId = currentRoute.replace('booking-', '');
    return <CheckoutView type="booking" itemId={bookId} onNavigate={navigate} />;
  }

  // 3. COURSE PORTAL (Learning experience)
  if (currentRoute.startsWith('course-')) {
    const courseId = currentRoute.replace('course-', '');
    return <CoursePortal courseId={courseId} onNavigate={navigate} />;
  }

  // 4. AUTH MODALS
  if (currentRoute === 'login') {
    return <AuthModal initialMode="login" onNavigate={navigate} />;
  }
  if (currentRoute === 'signup') {
    return <AuthModal initialMode="signup" onNavigate={navigate} />;
  }
  if (currentRoute === 'forgot') {
    return <AuthModal initialMode="forgot" onNavigate={navigate} />;
  }

  // ADMIN PORTAL ROUTE
  if (currentRoute === 'admin' || currentRoute === 'admin-panel') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
        <Sidebar
          currentTab="admin-panel"
          onSelectTab={(tab) => {
            if (tab === 'pricing-upgrade') {
              setIsUpgradeModalOpen(true);
            } else {
              setDashboardTab(tab);
              setCurrentRoute('dashboard');
            }
          }}
          onNavigate={navigate}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
          <AdminPanel onNavigate={navigate} />
        </main>
      </div>
    );
  }

  // 5. LANDING PAGE
  if (currentRoute === 'landing' && !user && !isDemoUser) {
    return <LandingPage onNavigate={navigate} />;
  }

  // 6. DASHBOARD (Private creator back-office)
  // If user is not authenticated and hasn't loaded demo, redirect to landing
  if (!user && !isDemoUser && currentRoute === 'dashboard') {
    return <LandingPage onNavigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans selection:bg-blue-500 selection:text-white">
      {/* SuperProfile Inspired Sidebar */}
      <Sidebar
        currentTab={dashboardTab}
        onSelectTab={(tab) => {
          if (tab === 'pricing-upgrade') {
            setIsUpgradeModalOpen(true);
          } else {
            setDashboardTab(tab);
          }
        }}
        onNavigate={navigate}
      />

      {/* Main Dashboard Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
        {dashboardTab === 'getting-started' && (
          <GettingStarted
            onSelectTab={(tab) => setDashboardTab(tab)}
            onNavigate={navigate}
          />
        )}

        {dashboardTab === 'store' && (
          <StoreBuilder
            initialSubTab="store"
            onNavigate={navigate}
          />
        )}

        {(dashboardTab === 'store-settings' || dashboardTab === 'account-settings') && (
          <AccountSettings onNavigate={navigate} />
        )}

        {dashboardTab === 'payments' && (
          <PaymentsManager onNavigate={navigate} />
        )}

        {dashboardTab === 'admin-panel' && (
          <AdminPanel onNavigate={navigate} />
        )}

        {dashboardTab === 'learn' && (
          <CoursesHub onNavigate={navigate} />
        )}

        {dashboardTab === 'audience' && (
          <AudienceManager />
        )}

        {dashboardTab === 'refer-earn' && (
          <ReferAndEarn />
        )}

        {dashboardTab === 'explore-apps' && (
          <ExploreApps onSelectTab={(tab) => setDashboardTab(tab)} />
        )}

        {dashboardTab === 'apps-autodm' && (
          <AutoDmApp />
        )}

        {dashboardTab === 'apps-superlinks' && (
          <SuperLinksApp />
        )}

        {dashboardTab === 'apps-leadmagnet' && (
          <LeadAndLockManager initialType="lead" onNavigate={navigate} />
        )}

        {dashboardTab === 'apps-paymentpages' && (
          <PaymentPagesSection onNavigate={navigate} />
        )}

        {dashboardTab === 'apps-bookings' && (
          <BookingsManager initialTab="bookings" onNavigate={navigate} />
        )}

        {dashboardTab === 'apps-courses' && (
          <BookingsManager initialTab="courses" onNavigate={navigate} />
        )}

        {dashboardTab === 'apps-lockedcontent' && (
          <LeadAndLockManager initialType="locked" onNavigate={navigate} />
        )}
      </main>

      {/* Upgrade to Creator Plan Modal (Matching exact screenshots) */}
      <UpgradeToCreatorPlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}
