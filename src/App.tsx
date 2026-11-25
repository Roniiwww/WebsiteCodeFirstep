import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { OpportunitiesProvider, useOpportunities } from './context/OpportunitiesContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { ApplyModal } from './components/opportunities/ApplyModal';
import { CookieConsent } from './components/common/CookieConsent';

// Pages
import { HomePage } from './pages/HomePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';
import { RequestHelpPage } from './pages/RequestHelpPage';
import { DashboardPage } from './pages/DashboardPage';
import { SignUpPage } from './pages/SignUpPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ImpactStoriesPage } from './pages/ImpactStoriesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { StorePage } from './pages/StorePage';
import { DonatePage } from './pages/DonatePage';

import { Opportunity } from './types';

const MainApp: React.FC = () => {
  const { opportunities } = useOpportunities();

  const [currentPage, setCurrentPage] = useState<string>(() => {
    const hash = window.location.hash.replace('#/', '').split('?')[0];
    return hash || 'home';
  });

  const [pageParams, setPageParams] = useState<any>({});
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [applyModalOpportunity, setApplyModalOpportunity] = useState<Opportunity | null>(null);

  // Sync hash routing (including initial #/detail-... deep link)
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace('#/', '').split('?')[0];
      if (hash) {
        if (hash.startsWith('detail-')) {
          const oppId = hash.replace('detail-', '');
          const found = opportunities.find((o) => o.id === oppId);
          if (found) {
            setSelectedOpportunity(found);
            setCurrentPage('detail');
            return;
          }
        }
        setCurrentPage(hash);
      } else {
        setCurrentPage('home');
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [opportunities]);

  const navigateTo = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || {});
    window.location.hash = `#/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOpportunity = (opp: Opportunity) => {
    setSelectedOpportunity(opp);
    setCurrentPage('detail');
    window.location.hash = `#/detail-${opp.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyOpportunity = (opp: Opportunity) => {
    setApplyModalOpportunity(opp);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-brand-600 selection:text-white overflow-x-clip w-full max-w-full">
      {/* Global Navbar */}
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onSelectOpportunity={handleSelectOpportunity}
            onApplyOpportunity={handleApplyOpportunity}
          />
        )}

        {currentPage === 'explore' && (
          <OpportunitiesPage
            initialFilter={pageParams}
            onSelectOpportunity={handleSelectOpportunity}
            onApplyOpportunity={handleApplyOpportunity}
          />
        )}

        {currentPage === 'detail' && selectedOpportunity && (
          <OpportunityDetailPage
            opportunity={selectedOpportunity}
            onBack={() => navigateTo('explore')}
            onApply={handleApplyOpportunity}
          />
        )}

        {currentPage === 'request' && (
          <RequestHelpPage
            onNavigate={navigateTo}
            onSelectOpportunity={handleSelectOpportunity}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            initialTab={pageParams?.tab || 'volunteer'}
            onNavigate={navigateTo}
            onSelectOpportunity={handleSelectOpportunity}
          />
        )}

        {currentPage === 'signup' && (
          <SignUpPage onNavigate={navigateTo} />
        )}

        {currentPage === 'how-it-works' && (
          <HowItWorksPage onNavigate={navigateTo} />
        )}

        {currentPage === 'stories' && (
          <ImpactStoriesPage />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={navigateTo} />
        )}

        {currentPage === 'contact' && (
          <ContactPage />
        )}

        {currentPage === 'legal' && (
          <LegalPage />
        )}

        {currentPage === 'store' && (
          <StorePage onNavigate={navigateTo} />
        )}

        {currentPage === 'donate' && (
          <DonatePage
            onNavigate={navigateTo}
            initialCause={pageParams?.cause}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Interactive Global Modals */}
      <AuthModal />
      <ApplyModal
        opportunity={applyModalOpportunity}
        onClose={() => setApplyModalOpportunity(null)}
      />
      <CookieConsent />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <OpportunitiesProvider>
        <MainApp />
      </OpportunitiesProvider>
    </AuthProvider>
  );
}

export default App;
