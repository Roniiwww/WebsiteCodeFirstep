import React, { useState, useMemo } from 'react';
import { Opportunity } from '../types';
import { useOpportunities } from '../context/OpportunitiesContext';
import { useAuth } from '../context/AuthContext';
import { OpportunityCard } from '../components/opportunities/OpportunityCard';
import { VolunteerPlacesMap } from '../components/map/VolunteerPlacesMap';
import { CAUSE_CATEGORIES, IMPACT_STORIES } from '../data/mockData';
import {
  HeartHandshake,
  Search,
  PlusCircle,
  Flame,
  ArrowRight,
  ShieldCheck,
  Users,
  Sparkles,
  Award,
  UserCheck,
  CheckCircle2,
  Utensils,
  PawPrint,
  GraduationCap,
  TreePine,
  Activity,
  ShieldAlert,
  Laptop,
  Palette,
  BookOpen
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectOpportunity: (opp: Opportunity) => void;
  onApplyOpportunity: (opp: Opportunity) => void;
}

const CAUSE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Utensils,
  PawPrint,
  GraduationCap,
  TreePine,
  HeartHandshake,
  Users,
  Activity,
  ShieldAlert,
  Laptop,
  Palette
};

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectOpportunity,
  onApplyOpportunity
}) => {
  const { opportunities } = useOpportunities();
  const { user } = useAuth();
  const [quickQuery, setQuickQuery] = useState('');
  const [selectedCause, setSelectedCause] = useState<string>('All');

  const urgentOpportunities = useMemo(
    () => opportunities.filter((o) => o.isUrgent),
    [opportunities]
  );

  const featuredStory = IMPACT_STORIES[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('explore', { query: quickQuery, cause: selectedCause });
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-14 lg:pt-14 lg:pb-20 gradient-mesh border-b border-slate-200/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Value Prop, CTAs, Quick Search */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Global Mutual Aid & Volunteer Exchange</span>
                <span className="text-slate-300">|</span>
                <span className="text-blue-700 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  100% Free
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Connect goodwill with{' '}
                <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  urgent community need.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                GiveBack™ unites passionate volunteers with vetted nonprofits, local initiatives, and neighbors needing a helping hand—complete with live GPS mapping and verified service certificates.
              </p>

              {/* Primary Dual-Sided Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('explore')}
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  <span>Explore Opportunities</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('request')}
                  className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Request Volunteers</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('how-it-works')}
                  className="h-11 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs transition inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>How It Works</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* Quick Filter Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white p-1.5 sm:p-2 rounded-2xl shadow-md border border-slate-200/90 flex flex-col sm:flex-row gap-2 max-w-xl"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search roles, skills, or cities (e.g. Skopje, Tirana, Berlin)..."
                    value={quickQuery}
                    onChange={(e) => setQuickQuery(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-xl focus:outline-none focus:bg-slate-50 text-slate-800 placeholder-slate-400"
                  />
                </div>

                <select
                  value={selectedCause}
                  onChange={(e) => setSelectedCause(e.target.value)}
                  className="h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none"
                >
                  <option value="All">All Causes</option>
                  {CAUSE_CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shrink-0 inline-flex items-center justify-center"
                >
                  Search
                </button>
              </form>

              {/* Trust Strip */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Vetted Nonprofits & Requests
                </span>
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Unified Volunteer/Organizer Account
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Printable Service Certificates
                </span>
              </div>
            </div>

            {/* Right Column: Hero Photo */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=900&q=80"
                    alt="Volunteers sorting and packing community donations"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/10" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Community Action
                    </span>
                    <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                      100% Free Platform
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPLORE ALL 10 CAUSE CATEGORIES */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Causes That Matter
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Find Your Cause in Seconds
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="text-blue-600 hover:text-blue-800 font-bold text-xs sm:text-sm inline-flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>Browse all opportunities</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {CAUSE_CATEGORIES.map((cat) => {
            const IconComponent = CAUSE_ICON_MAP[cat.icon] || HeartHandshake;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => onNavigate('explore', { cause: cat.name })}
                className="text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition group flex flex-col justify-between gap-3"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${cat.color}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-700 transition leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium inline-flex items-center gap-1 group-hover:text-blue-600 transition">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. DUAL-SIDED PLATFORM WORKFLOW ("TWO WAYS TO PARTICIPATE") */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              How GiveBack™ Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              One Account to Give Help or Ask for Support
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('how-it-works')}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs sm:text-sm inline-flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>Full guide & FAQ</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Volunteer Path */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
                <Search className="w-3.5 h-3.5" />
                <span>For Volunteers</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Lend Your Time, Skills & Compassion
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Filter by cause, remote or in-person availability, or exact GPS distance.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Submit a quick 1-click application with your availability and motivation note.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Track acceptance status and print signed Service Certificates for school or work.</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('explore')}
              className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition inline-flex items-center justify-center gap-2 w-full sm:w-fit"
            >
              <span>Browse Volunteer Roles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Requester / Organizer Path */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>For Organizers & Neighbors</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Mobilize Trusted Local Helpers Fast
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Open to registered nonprofits, schools, clinics, grassroots groups, and individuals.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Publish schedule, spots needed, and Urgent badges in under two minutes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Review applicants and accept or decline volunteers from your Organizer Dashboard.</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('request')}
              className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition inline-flex items-center justify-center gap-2 w-full sm:w-fit"
            >
              <span>Post a Volunteer Need</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. FEATURED URGENT OPPORTUNITIES */}
      {urgentOpportunities.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-coral-600 font-bold text-xs uppercase tracking-wider mb-0.5">
                <Flame className="w-3.5 h-3.5" />
                Immediate Support Needed
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Urgent Volunteer Opportunities
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('explore', { urgentOnly: true })}
              className="text-blue-600 hover:text-blue-800 font-bold text-xs sm:text-sm flex items-center gap-1 group shrink-0"
            >
              <span>View all urgent</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {urgentOpportunities.slice(0, 3).map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onSelect={onSelectOpportunity}
                onApply={onApplyOpportunity}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. INTERACTIVE GOOGLE MAPS VOLUNTEER EXPLORER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-4">
        <VolunteerPlacesMap
          opportunities={opportunities}
          onSelectOpportunity={onSelectOpportunity}
          onApplyOpportunity={onApplyOpportunity}
          initialCity={user?.location || 'Worldwide'}
        />
      </section>

      {/* 7. IMPACT STORY SPOTLIGHT */}
      {featuredStory && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 h-60 lg:h-auto overflow-hidden">
              <img
                src={featuredStory.image}
                alt={featuredStory.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Community Impact Story • {featuredStory.category}</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {featuredStory.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {featuredStory.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-medium text-slate-500">
                  By <span className="font-semibold text-slate-700">{featuredStory.author}</span> • {featuredStory.date}
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('stories')}
                  className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 group"
                >
                  <span>Read all impact stories</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 8. FOUNDERS MISSION & FINAL CONVERSION CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-left">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-white/10 px-3 py-1 rounded-full">
              Founded by Ron Osmani (14) & Anik Ademi (14)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              Ready to Make Your Hours Count?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              GiveBack™ removes red tape between compassion and community action. Create one free unified account to volunteer worldwide or rally help for a local cause today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate(user ? 'dashboard' : 'signup')}
              className="h-11 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md inline-flex items-center gap-2 whitespace-nowrap"
            >
              <span>{user ? 'Open My Dashboard' : 'Create Free Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('donate')}
              className="h-11 px-5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition inline-flex items-center gap-2 whitespace-nowrap"
            >
              <HeartHandshake className="w-4 h-4 text-emerald-300" />
              <span>Donate</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="h-11 px-5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Users className="w-4 h-4" />
              <span>Read Our Story</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
