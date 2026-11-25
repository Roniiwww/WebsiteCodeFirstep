import React from 'react';
import { 
  HeartHandshake, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  CheckCircle, 
  Award, 
  Users, 
  HelpCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { FAQS } from '../data/mockData';

interface HowItWorksPageProps {
  onNavigate: (page: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-16">
      
      {/* Breadcrumb & Hero Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium max-w-3xl mx-auto justify-center">
          <a href="#/home" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-blue-600 transition">Home</a>
          <span>/</span>
          <span className="text-blue-700 font-bold">How It Works</span>
        </div>

        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Step-by-Step Guide
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            How GiveBack™ Connects Need & Goodwill
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Our platform is designed to be completely barrier-free. Whether you are stepping up to volunteer or reaching out for support, here is how our ecosystem works.
          </p>
        </div>
      </div>

      {/* Volunteer Workflow */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg">
            A
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">For Prospective Volunteers</h2>
            <p className="text-xs text-slate-500">Discovering, applying, and tracking your impact</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900">1. Discover by Passion or Location</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Filter through food rescue, animal welfare, coding mentoring, or disaster relief. Choose between in-person neighborhood tasks or remote digital support.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900">2. Apply in One Click</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use your verified account to submit your availability and note. No cumbersome 10-page forms—just clear communication with the organizer.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900">3. Verified Service Certificates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your service hours are logged to your profile. Download official signed PDF certificates with unique verification stamps for school or employer recognition.
            </p>
          </div>
        </div>
      </div>

      {/* Requester & Organizer Workflow */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
            B
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">For Organizers & Individuals in Need</h2>
            <p className="text-xs text-slate-500">Posting voluntary opportunities and rallying your community</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900">1. Define What You Need</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              State the date, number of volunteers, location, and tasks required. Mark urgent if you need immediate assistance within 48 to 72 hours.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900">2. Review Volunteer Applicants</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive notifications as candidates apply. View their profiles, verified credentials, and availability directly in your Organizer Dashboard.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900">3. Coordinate & Celebrate</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Approve applicants with one click, coordinate shifts, and mark the opportunity completed when your community goal is achieved!
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <HelpCircle className="w-8 h-8 text-brand-600 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500">Everything you need to know about the platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="font-bold text-sm text-slate-900">{faq.q}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('explore')}
          className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition inline-flex items-center gap-2"
        >
          <span>Get Started Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
