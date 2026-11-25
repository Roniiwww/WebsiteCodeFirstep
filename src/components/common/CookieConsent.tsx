import React, { useState, useEffect } from 'react';
import { 
  Cookie, 
  ShieldCheck, 
  X, 
  Check, 
  Settings2, 
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

const STORAGE_KEY = 'giveback_cookie_consent_v1';

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  savedAt: string;
}

export const CookieConsent: React.FC = () => {
  const [hasConsented, setHasConsented] = useState<boolean>(true); // initially true to avoid flash
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Preference switches
  const [functional, setFunctional] = useState<boolean>(true);
  const [analytics, setAnalytics] = useState<boolean>(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: CookiePreferences = JSON.parse(saved);
        setFunctional(parsed.functional ?? true);
        setAnalytics(parsed.analytics ?? true);
        setHasConsented(true);
        setShowBanner(false);
      } else {
        setHasConsented(false);
        // Display banner after slight delay for smooth page entrance
        const timer = setTimeout(() => setShowBanner(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      setHasConsented(false);
      setShowBanner(true);
    }
  }, []);

  // Listen for custom trigger to open preferences modal anytime (e.g. from Footer)
  useEffect(() => {
    const handleOpenModal = () => {
      setShowModal(true);
    };

    window.addEventListener('giveback_open_cookie_modal', handleOpenModal);
    return () => window.removeEventListener('giveback_open_cookie_modal', handleOpenModal);
  }, []);

  const savePreferences = (prefs: { functional: boolean; analytics: boolean }) => {
    const data: CookiePreferences = {
      essential: true,
      functional: prefs.functional,
      analytics: prefs.analytics,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setFunctional(prefs.functional);
    setAnalytics(prefs.analytics);
    setHasConsented(true);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleAcceptAll = () => {
    savePreferences({ functional: true, analytics: true });
  };

  const handleAcceptEssentialOnly = () => {
    savePreferences({ functional: false, analytics: false });
  };

  const handleSaveCustom = () => {
    savePreferences({ functional, analytics });
  };

  return (
    <>
      {/* 1. FLOATING BOTTOM BANNER */}
      {showBanner && !showModal && (
        <aside 
          aria-label="Cookie consent banner"
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 md:left-auto md:right-6 md:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-3xl p-5 sm:p-6 text-slate-800">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-900/15">
                <Cookie className="w-6 h-6 animate-pulse" />
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                    <span>We respect your privacy</span>
                    <span className="text-amber-500 font-normal text-xs">🍪</span>
                  </h3>
                  <button
                    onClick={() => setShowBanner(false)}
                    aria-label="Dismiss banner"
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition -mr-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  GiveBack™ uses cookies to keep your session secure and ensure volunteer matching operates smoothly. We never sell your personal information or track you across third-party websites.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition transform active:scale-95"
                  >
                    Accept All Cookies
                  </button>

                  <button
                    type="button"
                    onClick={handleAcceptEssentialOnly}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                  >
                    Essential Only
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="px-3 py-2 text-slate-500 hover:text-slate-800 font-semibold text-xs rounded-xl hover:bg-slate-50 transition flex items-center gap-1"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Customize</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 2. RE-OPEN COOKIE PREFERENCES PILL: Available in the site footer under About & Legal */}

      {/* 3. DETAILED COOKIE PREFERENCES MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Cookie className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                    Cookie & Privacy Preferences
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage how GiveBack™ uses cookies on your device
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Categories List */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                We believe in full transparency. When you browse GiveBack™, small files called cookies help keep you authenticated, remember your preferences, and maintain high performance.
              </p>

              {/* Category 1: Strictly Necessary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">Strictly Necessary Cookies</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Always Active
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Required for core platform functionality: authenticating your login session, CSRF security verification, and processing volunteer applications. Cannot be deactivated.
                </p>
              </div>

              {/* Category 2: Functional & Preferences */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-sm">Functional & Preference Cookies</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={functional}
                      onChange={(e) => setFunctional(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Enables GiveBack™ to remember your preferred volunteer cause filters, location proximity radius, and bookmarked opportunities.
                </p>
              </div>

              {/* Category 3: Analytics & Community Insights */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-900 text-sm">Performance & Analytics Cookies</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Provides anonymous insights on high-demand volunteer categories, helping us allocate support and ensure urgent community needs are answered rapidly.
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  GiveBack™ complies with GDPR, CCPA, and COPPA privacy standards. We do not sell or monetize personal data under any circumstances.
                </span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handleAcceptEssentialOnly}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition"
              >
                Reject All Optional
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};