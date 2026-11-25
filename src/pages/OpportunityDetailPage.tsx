import React from 'react';
import { Opportunity } from '../types';
import { useOpportunities } from '../context/OpportunitiesContext';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Bookmark, 
  CheckCircle, 
  ShieldCheck, 
  Share2, 
  Flame, 
  Globe, 
  HeartHandshake, 
  Gift, 
  Check, 
  Phone, 
  Mail,
  Building
} from 'lucide-react';

interface OpportunityDetailPageProps {
  opportunity: Opportunity;
  onBack: () => void;
  onApply: (opp: Opportunity) => void;
}

export const OpportunityDetailPage: React.FC<OpportunityDetailPageProps> = ({
  opportunity,
  onBack,
  onApply
}) => {
  const { savedOpportunityIds, toggleSaveOpportunity } = useOpportunities();
  const isSaved = savedOpportunityIds.includes(opportunity.id);

  const fillPercentage = Math.min(
    100,
    Math.round((opportunity.spotsFilled / opportunity.spotsNeeded) * 100)
  );

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: opportunity.title,
        text: `Volunteer opportunity on GiveBack: ${opportunity.title}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={() => toggleSaveOpportunity(opportunity.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition shadow-sm ${
              isSaved
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 shadow-lg bg-slate-900">
        <img
          src={opportunity.bannerImage}
          alt={opportunity.title}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              {opportunity.isUrgent && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-coral-500 text-white shadow flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  Urgent Need
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
                {opportunity.cause}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/80 backdrop-blur-md text-white">
                {opportunity.organizerType}
              </span>
              {(opportunity.isDirectRequest || opportunity.organizerType === 'Individual in Need') && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md">
                  🙋 Citizen Volunteer Request
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {opportunity.title}
            </h1>

            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
              <span className="font-semibold text-white flex items-center gap-1">
                {opportunity.organization}
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </span>
              <span>•</span>
              <span>Posted on {opportunity.createdAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Full Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Key Facts Strip */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-700">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Location</span>
              <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-slate-900">
                {opportunity.locationType === 'remote' ? (
                  <>
                    <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Remote / Online</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{opportunity.city}, {opportunity.country || opportunity.state}</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Start Date</span>
              <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-slate-900">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{opportunity.startDate}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Commitment</span>
              <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-slate-900">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{opportunity.commitmentHours}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Availability</span>
              <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-brand-600">
                <Users className="w-4 h-4 text-brand-500 shrink-0" />
                <span>{opportunity.spotsNeeded - opportunity.spotsFilled} spots left</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">About this Volunteer Initiative</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {opportunity.description}
            </p>
          </div>

          {/* Responsibilities */}
          {opportunity.responsibilities && opportunity.responsibilities.length > 0 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Key Volunteer Responsibilities</h2>
              <ul className="space-y-2.5">
                {opportunity.responsibilities.map((resp: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {opportunity.requirements && opportunity.requirements.length > 0 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Requirements & Qualifications</h2>
              <ul className="space-y-2.5">
                {opportunity.requirements.map((req: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      {i + 1}
                    </div>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Perks & What's Provided */}
          {opportunity.perks && opportunity.perks.length > 0 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-brand-600">
                <Gift className="w-5 h-5" />
                <h2 className="text-xl font-bold text-slate-900">Volunteer Perks & Amenities</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {opportunity.perks.map((perk: string, i: number) => (
                  <div key={i} className="p-3 bg-brand-50/50 border border-brand-100 rounded-xl text-xs font-semibold text-brand-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-500 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Needed */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-slate-900">Desired Skills & Experience</h2>
            <div className="flex flex-wrap gap-2">
              {opportunity.skillsNeeded.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sticky Column: Action & Organizer */}
        <div className="space-y-6">
          
          {/* Action Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-6 lg:sticky lg:top-24">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Roster Capacity</span>
                <span className="font-bold text-brand-600">{fillPercentage}% filled</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                {opportunity.spotsFilled} confirmed volunteers • {opportunity.spotsNeeded - opportunity.spotsFilled} spots remaining
              </p>
            </div>

            <button
              onClick={() => onApply(opportunity)}
              className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/20 transition flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-5 h-5" />
              <span>Apply for this Opportunity</span>
            </button>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified 501(c)(3) / Registered Initiator</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Check className="w-4 h-4 text-brand-500" />
                <span>Service hour certificate granted upon completion</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Target {opportunity.targetHours ?? 5} hrs unlocks {(opportunity.targetHours ?? 5) * 10}+ store credits (1 hr = 10 credits)
                </span>
              </div>
            </div>

            {/* Organizer Box */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Hosted by
              </span>
              <div className="flex items-center gap-3">
                {opportunity.organizationLogo ? (
                  <img
                    src={opportunity.organizationLogo}
                    alt={opportunity.organization}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white font-bold text-lg flex items-center justify-center">
                    {opportunity.organization.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{opportunity.organization}</h4>
                  <p className="text-xs text-slate-500">{opportunity.organizerName}</p>
                </div>
              </div>

              {opportunity.contactPhone && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{opportunity.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{opportunity.organizerEmail}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
