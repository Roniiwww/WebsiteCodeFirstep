import React, { useState, useMemo } from 'react';
import { Opportunity, CauseCategory, LocationType } from '../types';
import { useOpportunities } from '../context/OpportunitiesContext';
import { OpportunityCard } from '../components/opportunities/OpportunityCard';
import { VolunteerPlacesMap } from '../components/map/VolunteerPlacesMap';
import { CAUSE_CATEGORIES } from '../data/mockData';
import { 
  Search, 
  Filter, 
  Flame, 
  MapPin, 
  Globe, 
  X, 
  SlidersHorizontal,
  Check,
  LayoutGrid,
  Map as MapIcon
} from 'lucide-react';

interface OpportunitiesPageProps {
  initialFilter?: {
    query?: string;
    cause?: string;
    urgentOnly?: boolean;
  };
  onSelectOpportunity: (opp: Opportunity) => void;
  onApplyOpportunity: (opp: Opportunity) => void;
}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({
  initialFilter,
  onSelectOpportunity,
  onApplyOpportunity
}) => {
  const { opportunities } = useOpportunities();

  const [searchQuery, setSearchQuery] = useState(initialFilter?.query || '');
  const [selectedCause, setSelectedCause] = useState<string>(initialFilter?.cause || 'All');
  const [locationFilter, setLocationFilter] = useState<'all' | LocationType>('all');
  const [urgentOnly, setUrgentOnly] = useState<boolean>(initialFilter?.urgentOnly || false);
  const [sortBy, setSortBy] = useState<'newest' | 'urgent' | 'spots'>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [visibleCount, setVisibleCount] = useState<number>(24);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // Search text match
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesTitle = opp.title.toLowerCase().includes(query);
        const matchesDesc = opp.description.toLowerCase().includes(query);
        const matchesOrg = opp.organization.toLowerCase().includes(query);
        const matchesCity = opp.city.toLowerCase().includes(query);
        const matchesCountry = opp.country.toLowerCase().includes(query);
        const matchesSkill = opp.skillsNeeded.some((s) => s.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesOrg && !matchesCity && !matchesCountry && !matchesSkill) {
          return false;
        }
      }

      // Cause category
      if (selectedCause !== 'All' && opp.cause !== selectedCause) {
        return false;
      }

      // Location type
      if (locationFilter !== 'all' && opp.locationType !== locationFilter) {
        return false;
      }

      // Urgency
      if (urgentOnly && !opp.isUrgent) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'urgent') {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
      }
      if (sortBy === 'spots') {
        const aRemaining = a.spotsNeeded - a.spotsFilled;
        const bRemaining = b.spotsNeeded - b.spotsFilled;
        return bRemaining - aRemaining;
      }
      // default newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [opportunities, searchQuery, selectedCause, locationFilter, urgentOnly, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCause('All');
    setLocationFilter('all');
    setUrgentOnly(false);
    setSortBy('newest');
    setVisibleCount(24);
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    selectedCause !== 'All' || 
    locationFilter !== 'all' || 
    urgentOnly;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Top Banner Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-medium">
            <a href="#/home" className="hover:text-blue-600 transition">Home</a>
            <span>/</span>
            <span className="text-blue-700 font-bold">Find Opportunities</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Find Volunteer Opportunities
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover {opportunities.length} ways to lend a hand in your city or anywhere in the world.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search roles, causes, cities (e.g. Skopje)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              Filter Listings
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Reset all
              </button>
            )}
          </div>

          {/* Urgency toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={urgentOnly}
                onChange={(e) => setUrgentOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-blue-600" />
                Urgent Needs Only
              </span>
            </label>
          </div>

          {/* Location Type */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Location Type
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'all', label: 'All Locations' },
                { id: 'in-person', label: 'In-Person Only' },
                { id: 'remote', label: '100% Remote' },
                { id: 'hybrid', label: 'Hybrid' }
              ].map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setLocationFilter(loc.id as any)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                    locationFilter === loc.id
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{loc.label}</span>
                  {locationFilter === loc.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Cause Category */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Cause & Category
            </label>
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCause('All')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                  selectedCause === 'All'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Causes</span>
                <span className="text-[10px] text-slate-400 font-normal">({opportunities.length})</span>
              </button>
              {CAUSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCause(cat.name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                    selectedCause === cat.name
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Opportunities List Column */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="text-xs font-semibold text-slate-700">
                Showing <span className="text-brand-600 font-bold">{filteredOpportunities.length}</span> opportunities
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`h-7 px-2.5 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`h-7 px-2.5 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === 'map'
                      ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map & Closest</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="newest">Recently Added</option>
                <option value="urgent">Urgent Priority</option>
                <option value="spots">Most Spots Remaining</option>
              </select>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden p-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg flex items-center gap-1"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="lg:hidden p-4 bg-white rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-bold text-xs">Filter Options</span>
                <button onClick={clearAllFilters} className="text-xs text-brand-600 font-semibold">
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Category</label>
                  <select
                    value={selectedCause}
                    onChange={(e) => setSelectedCause(e.target.value)}
                    className="w-full p-2 border rounded-lg text-xs"
                  >
                    <option value="All">All Causes</option>
                    {CAUSE_CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Location</label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value as any)}
                    className="w-full p-2 border rounded-lg text-xs"
                  >
                    <option value="all">All Locations</option>
                    <option value="in-person">In-Person</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold pt-1">
                <input
                  type="checkbox"
                  checked={urgentOnly}
                  onChange={(e) => setUrgentOnly(e.target.checked)}
                />
                Urgent Needs Only
              </label>
            </div>
          )}

          {/* Main Opportunities Display (Map vs Grid) */}
          {viewMode === 'map' ? (
            <VolunteerPlacesMap
              opportunities={filteredOpportunities}
              onSelectOpportunity={onSelectOpportunity}
              onApplyOpportunity={onApplyOpportunity}
              initialCity="Worldwide"
            />
          ) : filteredOpportunities.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOpportunities.slice(0, visibleCount).map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    onSelect={onSelectOpportunity}
                    onApply={onApplyOpportunity}
                  />
                ))}
              </div>

              {filteredOpportunities.length > visibleCount && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 24)}
                    className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-xl shadow-xs transition hover:border-slate-300"
                  >
                    Load More Opportunities (Showing {visibleCount} of {filteredOpportunities.length})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No matching opportunities found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your search terms, changing the category, or unchecking the urgent filter.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-brand-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
