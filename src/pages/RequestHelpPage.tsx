import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOpportunities } from '../context/OpportunitiesContext';
import { CauseCategory, LocationType, Opportunity } from '../types';
import { CAUSE_CATEGORIES } from '../data/mockData';
import { 
  PlusCircle, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  Flame, 
  MapPin, 
  Globe, 
  Calendar, 
  Users, 
  Image as ImageIcon,
  HeartHandshake,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RequestHelpPageProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectOpportunity: (opp: Opportunity) => void;
}

export const RequestHelpPage: React.FC<RequestHelpPageProps> = ({
  onNavigate,
  onSelectOpportunity
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { addOpportunity } = useOpportunities();

  const [title, setTitle] = useState('');
  const [organizerType, setOrganizerType] = useState<'Nonprofit' | 'Community Group' | 'Individual in Need' | 'School' | 'Healthcare'>('Nonprofit');
  const [organization, setOrganization] = useState(user?.organizationName || user?.name ? `${user.name}'s Initiative` : '');
  const [organizerEmail, setOrganizerEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [cause, setCause] = useState<CauseCategory>('Community & Social');
  const [description, setDescription] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [perksText, setPerksText] = useState('Service hour verification certificate, Community snacks and refreshments');
  const [locationType, setLocationType] = useState<LocationType>('in-person');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(user?.location?.split(',')[0] || 'Skopje');
  const [state, setState] = useState(user?.location?.split(',')[1]?.trim() || 'Centar');
  const [country, setCountry] = useState('North Macedonia');
  const [isUrgent, setIsUrgent] = useState(false);
  const [startDate, setStartDate] = useState('2026-11-25');
  const [commitmentHours, setCommitmentHours] = useState('3 hrs / week');
  const [targetHours, setTargetHours] = useState<number>(5);
  const [spotsNeeded, setSpotsNeeded] = useState<number>(6);
  const [skillsText, setSkillsText] = useState('Teamwork, Communication, Enthusiasm');
  const [bannerImage, setBannerImage] = useState('https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80');

  const [submitting, setSubmitting] = useState(false);
  const [createdOpportunity, setCreatedOpportunity] = useState<Opportunity | null>(null);

  const bannerPresets = [
    { label: 'Food & Pantry', url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Education & Tech', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Animal Care', url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Environment', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Elderly Companionship', url: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Community Project', url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=1200&q=80' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('signin');
      return;
    }

    setSubmitting(true);

    const responsibilities = responsibilitiesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const requirements = requirementsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const perks = perksText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const skillsNeeded = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const newOpp = addOpportunity({
        title,
        organization: organization || 'Community Initiative',
        organizerId: user?.id || 'anonymous',
        organizerName: user?.name || 'Initiative Coordinator',
        organizerEmail: organizerEmail || user?.email || '',
        organizerType,
        cause,
        description,
        responsibilities: responsibilities.length > 0 ? responsibilities : ['Assist on site with community project'],
        requirements: requirements.length > 0 ? requirements : ['Positive attitude and reliability'],
        perks: perks.length > 0 ? perks : ['Certificate of Community Service'],
        locationType,
        address: locationType === 'remote' ? undefined : address,
        city: locationType === 'remote' ? 'Remote' : city,
        state: locationType === 'remote' ? 'Online' : state,
        country,
        isUrgent,
        startDate,
        commitmentHours,
        targetHours: Math.max(0.5, Number(targetHours) || 5),
        spotsNeeded: Number(spotsNeeded) || 5,
        skillsNeeded: skillsNeeded.length > 0 ? skillsNeeded : ['General Volunteer'],
        bannerImage,
        contactPhone
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setCreatedOpportunity(newOpp);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <HeartHandshake className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In to Request Help</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Posting volunteer requests requires an active GiveBack account to protect community trust, verify listings, and connect directly with helpers.
        </p>
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => openAuthModal('signin')}
            className="w-full py-2.5 px-4 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700 transition"
          >
            Sign In to Existing Account
          </button>
          <button
            onClick={() => openAuthModal('signup')}
            className="w-full py-2.5 px-4 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-sm hover:bg-slate-50 transition"
          >
            Sign Up for a New Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Request Assistance
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Post a Volunteer Request
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Whether you represent an established 501(c)(3) nonprofit, a community garden, a school, or you are an individual needing a hand with an accessibility project, we connect you with passionate helpers.
        </p>
      </div>

      {/* Success View */}
      {createdOpportunity ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">Your Volunteer Request is Live!</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              "<span className="font-semibold text-slate-800">{createdOpportunity.title}</span>" has been published to the GiveBack network. Volunteers can now discover and apply.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onSelectOpportunity(createdOpportunity)}
              className="w-full sm:w-auto px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow transition"
            >
              View Live Listing
            </button>
            <button
              onClick={() => onNavigate('dashboard', { tab: 'requests' })}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition"
            >
              Go to Organizer Dashboard
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-8">
          
          {/* Sign in banner if anonymous */}
          {!isAuthenticated && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Sign in to manage your volunteer listing</h4>
                  <p className="text-[11px] text-amber-700">
                    Signing in lets you review applicants, approve volunteers, and close requests when filled.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 shadow-sm shrink-0"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="py-1.5 px-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm shrink-0"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}

          {/* 1. Basic Opportunity Info */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">1</span>
              Opportunity Overview
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Opportunity Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Weekend Food Rescue Volunteer, Wheelchair Ramp Helper, Coding Tutor"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Requester Entity Type *
                </label>
                <select
                  value={organizerType}
                  onChange={(e) => setOrganizerType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="Nonprofit">Registered Nonprofit / Charity</option>
                  <option value="Community Group">Community Group / Grassroots</option>
                  <option value="Individual in Need">Individual in Need (Neighbor / Family)</option>
                  <option value="School">School / Educational Group</option>
                  <option value="Healthcare">Healthcare Clinic / Hospital</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cause & Category *
                </label>
                <select
                  value={cause}
                  onChange={(e) => setCause(e.target.value as CauseCategory)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  {CAUSE_CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization / Requester Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Harvest or Maria's Family"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="organizer@domain.com"
                  value={organizerEmail}
                  onChange={(e) => setOrganizerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Description of the Need *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Explain the background, why this help is needed, and the impact volunteers will make..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>

          {/* 2. Schedule, Capacity & Location */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">2</span>
              Location, Capacity & Schedule
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location Type *
                </label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value as LocationType)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="in-person">In-Person at Site</option>
                  <option value="remote">100% Online / Remote</option>
                  <option value="hybrid">Hybrid (Flexible)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Commitment *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3 hrs / Saturday, 2 hrs / week"
                  value={commitmentHours}
                  onChange={(e) => setCommitmentHours(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {locationType !== 'remote' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 450 East 11th Street"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Austin"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State / Province *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TX"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Number of Volunteers Needed *
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={spotsNeeded}
                  onChange={(e) => setSpotsNeeded(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Hours for Credits *
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="500"
                  step="0.5"
                  required
                  value={targetHours}
                  onChange={(e) => setTargetHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                  Unlocks {Math.round(Math.max(0.5, Number(targetHours) || 0) * 10)} credits at goal (1 hr = 10 credits)
                </span>
              </div>

              <div className="flex items-center pt-4">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="w-5 h-5 text-coral-600 rounded border-slate-300 focus:ring-coral-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-coral-500" />
                      Mark as Urgent Need
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Promotes this listing to the urgent banner for fast response.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 3. Responsibilities, Requirements & Skills */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">3</span>
              Expectations & Skills
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Volunteer Responsibilities (One per line)
              </label>
              <textarea
                rows={3}
                placeholder="Sort produce and inspect packages&#10;Distribute boxes to community families&#10;Clean tables and inventory goods"
                value={responsibilitiesText}
                onChange={(e) => setResponsibilitiesText(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requirements (One per line)
              </label>
              <textarea
                rows={2}
                placeholder="Must be 18+ or accompanied by guardian&#10;Comfortable lifting 20 lbs occasionally"
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Desired Skills (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Communication, Teamwork, Food Prep, Spanish Fluency"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Banner presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                Select Banner Image
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {bannerPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setBannerImage(preset.url)}
                    className={`relative rounded-xl overflow-hidden h-16 border-2 transition ${
                      bannerImage === preset.url ? 'border-brand-500 ring-2 ring-brand-300' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1">
                      <span className="text-[10px] font-bold text-white text-center">{preset.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Listings are immediately visible and protected by GiveBack safety terms.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/25 transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing Listing...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Publish Volunteer Request
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
