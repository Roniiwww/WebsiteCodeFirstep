import React from 'react';
import { Opportunity } from '../../types';
import { useOpportunities } from '../../context/OpportunitiesContext';
import { 
  MapPin, 
  Clock, 
  Users, 
  Bookmark, 
  ArrowRight, 
  Flame, 
  CheckCircle2, 
  Globe 
} from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onSelect: (opp: Opportunity) => void;
  onApply: (opp: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onSelect,
  onApply
}) => {
  const { savedOpportunityIds, toggleSaveOpportunity } = useOpportunities();
  const isSaved = savedOpportunityIds.includes(opportunity.id);

  const fillPercentage = Math.min(
    100,
    Math.round((opportunity.spotsFilled / opportunity.spotsNeeded) * 100)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1">
      {/* Card Header & Banner Image */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          src={opportunity.bannerImage}
          alt={opportunity.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            {opportunity.isUrgent && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-coral-500 text-white shadow-md animate-pulse">
                <Flame className="w-3.5 h-3.5" />
                Urgent Need
              </span>
            )}
            {(opportunity.isDirectRequest || opportunity.organizerType === 'Individual in Need') && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-md">
                🙋 Citizen Request
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-md text-slate-800 shadow">
              {opportunity.cause}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveOpportunity(opportunity.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition shadow ${
              isSaved
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 hover:bg-white text-slate-700'
            }`}
            aria-label="Save opportunity"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Organizer Tag on Banner */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          {opportunity.organizationLogo ? (
            <img
              src={opportunity.organizationLogo}
              alt={opportunity.organization}
              className="w-7 h-7 rounded-full border-2 border-white object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white">
              {opportunity.organization.charAt(0)}
            </div>
          )}
          <span className="text-xs font-medium text-white drop-shadow flex items-center gap-1">
            {opportunity.organization}
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 
            onClick={() => onSelect(opportunity)}
            className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition cursor-pointer line-clamp-2 mb-2 leading-snug"
          >
            {opportunity.title}
          </h3>

          {/* Description preview */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {opportunity.description}
          </p>

          {/* Key metadata pills */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 truncate">
              {opportunity.locationType === 'remote' ? (
                <>
                  <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-medium text-blue-700">100% Remote</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{opportunity.city}, {opportunity.state}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{opportunity.commitmentHours}</span>
            </div>
          </div>

          {/* Skills tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {opportunity.skillsNeeded.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
              >
                {skill}
              </span>
            ))}
            {opportunity.skillsNeeded.length > 3 && (
              <span className="text-[10px] text-slate-400 font-medium px-1">
                +{opportunity.skillsNeeded.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Card Footer: Capacity & Actions */}
        <div>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {opportunity.spotsFilled} of {opportunity.spotsNeeded} spots filled
              </span>
              <span className="font-bold text-slate-700">{fillPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  fillPercentage >= 90 ? 'bg-blue-600' : 'bg-emerald-500'
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => onSelect(opportunity)}
              className="flex-1 h-8 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition inline-flex items-center justify-center"
            >
              Details
            </button>
            <button
              onClick={() => onApply(opportunity)}
              className="flex-1 h-8 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs shadow-blue-600/20 transition inline-flex items-center justify-center gap-1.5"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
