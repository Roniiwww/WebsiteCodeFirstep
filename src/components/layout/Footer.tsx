import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Mail, 
  Globe, 
  Lock, 
  Check, 
  ArrowRight,
  Heart,
  ExternalLink
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-700 to-emerald-400 flex items-center justify-center text-white shadow-md">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-blue-400 transition">
                  Give<span className="text-emerald-400">Back</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  TM
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The world’s most trusted mutual aid and volunteer exchange platform. Bridging compassionate individuals with vetted organizations and neighbors facing urgent hardship.
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Vetted 501(c)(3) Charities
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-400" />
                256-Bit SSL Protection
              </span>
            </div>
          </div>

          {/* Quick Links: Platform */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('explore')} className="text-left hover:text-white transition">
                  Browse Volunteer Work
                </button>
              </li>
              {user && (
                <li>
                  <button onClick={() => onNavigate('request')} className="text-left hover:text-white transition">
                    Request Volunteer Help
                  </button>
                </li>
              )}
              <li>
                <button onClick={() => onNavigate('signup')} className="text-left hover:text-white transition">
                  Sign Up & Register
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="text-left hover:text-white transition">
                  Volunteer Hours Tracker
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('store')} className="text-left hover:text-white transition">
                  Gift Card Rewards Store
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('donate')} className="text-left hover:text-emerald-400 transition font-medium">
                  Donate & Support Causes
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links: Organization */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">About & Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('about')} className="text-left hover:text-white transition">
                  Our Mission & Team
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="text-left hover:text-white transition flex items-center gap-1 text-brand-400 font-medium">
                  Copyright & Legal Notice
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="text-left hover:text-white transition">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="text-left hover:text-white transition">
                  Privacy Policy & GDPR
                </button>
              </li>
              <li>
                <button 
                  onClick={() => window.dispatchEvent(new Event('giveback_open_cookie_modal'))}
                  className="text-left hover:text-white transition text-amber-400/90 hover:text-amber-300 flex items-center gap-1.5"
                >
                  <span>Cookie Settings</span>
                  <span className="text-[10px]">🍪</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="text-left hover:text-white transition">
                  Contact & Support Center
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Stay Connected</h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Get notified of urgent volunteer calls and community breakthroughs in your region.
            </p>
            {subscribed ? (
              <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Thank you for subscribing to our community pulse!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Detailed Copyright and Trademark Assertion Section */}
        <div className="pt-8 space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
              <span className="font-semibold text-slate-200">
                © 2026 GiveBack Global Foundation Inc. All Rights Reserved.
              </span>
              <span className="text-[11px] text-slate-500">
                Registered Nonprofit Platform & Trademark • Reg. No. 98-774-120
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              GiveBack™ and the GiveBack logo are protected trademarks of GiveBack Global Foundation Inc. 
              All content, brand assets, software architecture, and interface designs on this website are protected under international copyright law and the Digital Millennium Copyright Act (DMCA). Unauthorized duplication, scraping, framing, or commercial redistribution without prior written consent is strictly prohibited.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <span>Crafted with compassion &</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for communities worldwide.</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <button onClick={() => onNavigate('legal')} className="hover:text-slate-300 transition">
                Copyright Notice
              </button>
              <span>•</span>
              <button onClick={() => onNavigate('legal')} className="hover:text-slate-300 transition">
                Terms & Conditions
              </button>
              <span>•</span>
              <button onClick={() => onNavigate('legal')} className="hover:text-slate-300 transition">
                Privacy Policy
              </button>
              <span>•</span>
              <button onClick={() => onNavigate('contact')} className="hover:text-slate-300 transition">
                Security & DMCA
              </button>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
