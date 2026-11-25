import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  HeartHandshake, 
  Menu, 
  X, 
  PlusCircle, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Gift
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'explore', label: 'Opportunities' },
    { id: 'store', label: 'Store' },
    { id: 'donate', label: 'Donate' },
    { id: 'contact', label: 'Contact' },
    { id: 'signup', label: 'Sign Up' }
  ];

  const handleNavClick = (pageId: string, params?: any) => {
    onNavigate(pageId, params);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3 sm:gap-6">
          
          {/* Logo */}
          <a 
            href="#/home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home');
            }}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-700 to-emerald-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition duration-300">
              <HeartHandshake className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                  Give<span className="text-emerald-600">Back</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  TM
                </span>
              </div>
              <p className="hidden xl:block text-[9px] text-slate-400 font-medium tracking-wide -mt-0.5">
                Connecting Goodwill & Community Need
              </p>
            </div>
          </a>

          {/* Main Nav Links (Sleek, compact pills with consistent height) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <a
                  key={link.id}
                  href={`#/${link.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.id);
                  }}
                  className={`h-8 px-2 xl:px-2.5 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'text-blue-700 bg-blue-50/90 font-bold border border-blue-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />}
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Post Request CTA - only visible if logged in with an account */}
            {user && (
              <button
                onClick={() => handleNavClick('request')}
                className="hidden sm:flex h-8 items-center gap-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition shadow-2xs whitespace-nowrap shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Request Help</span>
              </button>
            )}

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="h-8 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white shadow-2xs transition shrink-0"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <span className="text-xs font-semibold text-slate-800 max-w-[72px] sm:max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Member
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => handleNavClick('signup')}
                        className="w-full px-4 py-2 text-left text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2.5 font-semibold"
                      >
                        <UserIcon className="w-4 h-4 text-blue-600" />
                        Sign Up / Switch Account
                      </button>
                      <button
                        onClick={() => handleNavClick('dashboard')}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                        My Dashboard & Hours
                      </button>
                      <button
                        onClick={() => handleNavClick('dashboard', { tab: 'applications' })}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                      >
                        <FileText className="w-4 h-4 text-emerald-600" />
                        My Applications
                      </button>
                      <button
                        onClick={() => handleNavClick('dashboard', { tab: 'requests' })}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                      >
                        <PlusCircle className="w-4 h-4 text-blue-600" />
                        Manage Posted Requests
                      </button>
                      <button
                        onClick={() => handleNavClick('store')}
                        className="w-full px-4 py-2 text-left text-xs text-amber-700 hover:bg-amber-50 flex items-center justify-between font-semibold"
                      >
                        <span className="flex items-center gap-2.5">
                          <Gift className="w-4 h-4 text-amber-600" />
                          Gift Card Store
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {user.credits ?? 0} cr
                        </span>
                      </button>
                      <button
                        onClick={() => handleNavClick('legal')}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Copyright & Legal Policy
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="h-8 px-2.5 sm:px-3.5 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:border-blue-600 hover:text-blue-600 shadow-2xs transition whitespace-nowrap inline-flex items-center justify-center"
                >
                  Sign In
                </button>

                <button
                  onClick={() => handleNavClick('signup')}
                  className="h-8 px-2.5 sm:px-3.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-2xs transition whitespace-nowrap inline-flex items-center justify-center"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile/Tablet Menu Button */}
            <div className="flex lg:hidden items-center ml-1">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200 shadow-lg max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <a
                  key={link.id}
                  href={`#/${link.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.id);
                  }}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-between ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </a>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user && (
              <button
                onClick={() => handleNavClick('request')}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-emerald-600 text-white flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Request Volunteers (Post Need)
              </button>
            )}

            {isAuthenticated && user ? (
              <div className="space-y-1.5 pt-2">
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="w-full py-2.5 px-3 text-left text-sm font-medium text-slate-700 bg-slate-50 rounded-xl flex items-center gap-2.5"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-600" />
                  My Dashboard ({user.name})
                </button>
                <button
                  onClick={() => handleNavClick('dashboard', { tab: 'requests' })}
                  className="w-full py-2.5 px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  Manage Posted Requests
                </button>
                <button
                  onClick={() => handleNavClick('store')}
                  className="w-full py-2.5 px-3 text-left text-sm font-semibold text-amber-800 bg-amber-50/70 rounded-xl flex items-center justify-between"
                >
                  <span className="flex items-center gap-2.5">
                    <Gift className="w-4 h-4 text-amber-600" />
                    Gift Card Store
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {user.credits ?? 0} cr
                  </span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2.5"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signin');
                  }}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 flex items-center justify-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick('signup');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 flex items-center justify-center shadow-sm"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
