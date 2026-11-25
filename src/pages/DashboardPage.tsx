import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  useOpportunities,
  CREDITS_PER_HOUR,
  DEFAULT_TARGET_HOURS
} from '../context/OpportunitiesContext';
import { Application, Opportunity } from '../types';
import {
  User,
  Award,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  Clock3,
  PlusCircle,
  ShieldCheck,
  Printer,
  HeartHandshake,
  Mail,
  Phone,
  Bookmark,
  Trash2,
  Sparkles,
  X,
  Gift,
  Target,
  Check
} from 'lucide-react';

interface DashboardPageProps {
  initialTab?: 'volunteer' | 'requests' | 'applications';
  onNavigate: (page: string, params?: any) => void;
  onSelectOpportunity: (opp: Opportunity) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  initialTab = 'volunteer',
  onNavigate,
  onSelectOpportunity
}) => {
  const { user, openAuthModal } = useAuth();
  const {
    opportunities,
    applications,
    updateApplicationStatus,
    setVolunteerHours,
    updateOpportunityTargetHours,
    deleteOpportunity,
    savedOpportunityIds
  } = useOpportunities();

  const [activeTab, setActiveTab] = useState<'volunteer' | 'organizer' | 'profile'>(
    initialTab === 'requests' ? 'organizer' : 'volunteer'
  );
  const [selectedCertificateApp, setSelectedCertificateApp] = useState<Application | null>(null);
  const [hoursDrafts, setHoursDrafts] = useState<Record<string, string>>({});
  const [targetDrafts, setTargetDrafts] = useState<Record<string, string>>({});
  const [savedTargetNoticeId, setSavedTargetNoticeId] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab === 'requests') {
      setActiveTab('organizer');
    } else if (initialTab === 'volunteer' || initialTab === 'applications') {
      setActiveTab('volunteer');
    }
  }, [initialTab]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In to View Dashboard</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Access your real logged volunteer hours, track applications you’ve submitted, or review incoming volunteers for your posted requests.
        </p>
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => openAuthModal('signin')}
            className="w-full py-2.5 px-4 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-brand-700 transition"
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

  // Filter user's applications
  const myApplications = applications.filter((a) => a.applicantId === user.id);

  // Filter opportunities posted by this user or user's organizer ID
  const myPostedOpportunities = opportunities.filter(
    (o) => o.organizerId === user.id || o.organizerEmail === user.email
  );

  // Incoming applications to opportunities posted by this user
  const incomingApplications = applications.filter((app) =>
    myPostedOpportunities.some((o) => o.id === app.opportunityId)
  );

  const savedOpportunities = opportunities.filter((o) =>
    savedOpportunityIds.includes(o.id)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* User Header Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-brand-500 shadow-md"
            />
            <span 
              title="Verified Community Member"
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full border-2 border-white flex items-center justify-center shadow"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user.name}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Unified Account (Volunteer & Requester)
              </span>
            </div>
            <p className="text-xs text-slate-500 break-all">{user.email} • Member since {user.joinedDate}</p>
            {user.bio && <p className="text-xs text-slate-600 max-w-xl">{user.bio}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('store')}
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <Gift className="w-4 h-4 text-amber-600" />
            <span>Store ({user.credits ?? 0} Credits)</span>
          </button>
          <button
            onClick={() => onNavigate('request')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Need</span>
          </button>
          <button
            onClick={() => onNavigate('explore')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition"
          >
            Browse Needs
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex overflow-x-auto whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-slate-200 gap-4 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('volunteer')}
          className={`pb-3 px-2 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'volunteer'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HeartHandshake className="w-4 h-4 shrink-0" />
          <span>My Applications ({myApplications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('organizer')}
          className={`pb-3 px-2 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'organizer'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>Posted Requests ({incomingApplications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-2 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'profile'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4 shrink-0" />
          <span>Badges & Hours</span>
        </button>
      </div>

      {/* TAB 1: Volunteer Applications */}
      {activeTab === 'volunteer' && (
        <div className="space-y-8">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{user.hoursLogged ?? 0} Hours</div>
                <div className="text-xs text-slate-500">Verified Service Donated</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{user.credits ?? 0} Credits</div>
                  <button
                    type="button"
                    onClick={() => onNavigate('store')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Redeem in Store →
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {myApplications.filter((a) => a.status === 'accepted').length} Accepted
                </div>
                <div className="text-xs text-slate-500">Confirmed Engagements</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock3 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {myApplications.filter((a) => a.status === 'pending').length} Pending
                </div>
                <div className="text-xs text-slate-500">Under Review by Organizers</div>
              </div>
            </div>
          </div>

          {/* Applications Table / Cards */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Submitted Applications</h3>
                <p className="text-xs text-slate-500">Real-time status updates from organizers</p>
              </div>
              <button
                onClick={() => onNavigate('explore')}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                + Find more opportunities
              </button>
            </div>

            {myApplications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {myApplications.map((app) => {
                  const parentOpp = opportunities.find((o) => o.id === app.opportunityId);
                  const targetHours = parentOpp?.targetHours ?? DEFAULT_TARGET_HOURS;
                  const loggedHours = app.loggedHours ?? 0;
                  const creditsAwarded = app.creditsAwarded ?? 0;
                  const progressPct = Math.min(100, Math.round((loggedHours / targetHours) * 100));
                  const reachedGoal = loggedHours >= targetHours;

                  return (
                    <div key={app.id} className="p-6 hover:bg-slate-50/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 max-w-xl flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            app.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'declined'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.status}
                          </span>
                          <span className="text-xs text-slate-400">
                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 hover:text-brand-600 cursor-pointer">
                          {app.opportunityTitle}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {app.organizationName} • {app.opportunityLocation}
                        </p>

                        {app.status === 'accepted' && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-700">
                                Progress: {loggedHours} / {targetHours} target hrs
                              </span>
                              <span className={`font-bold ${reachedGoal ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {reachedGoal
                                  ? `${creditsAwarded} Credits Earned`
                                  : `Reach ${targetHours} hrs for ${Math.round(targetHours * CREDITS_PER_HOUR)} credits`}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  reachedGoal ? 'bg-emerald-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {app.coverNote && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                            "{app.coverNote}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {app.status === 'accepted' && (
                          <button
                            onClick={() => setSelectedCertificateApp(app)}
                            className="px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs rounded-xl border border-brand-200 transition flex items-center gap-1.5"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>View Certificate</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (parentOpp) onSelectOpportunity(parentOpp);
                          }}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                        >
                          View Opportunity
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <p className="text-sm">You haven’t applied for any volunteer work yet.</p>
                <button
                  onClick={() => onNavigate('explore')}
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
                >
                  Explore Opportunities
                </button>
              </div>
            )}
          </div>

          {/* Saved Opportunities Section */}
          {savedOpportunities.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-rose-500 fill-rose-500" />
                Saved for Later ({savedOpportunities.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => onSelectOpportunity(opp)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-brand-500 hover:shadow-md transition cursor-pointer space-y-2 bg-slate-50/50"
                  >
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">{opp.cause}</span>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{opp.title}</h4>
                    <p className="text-xs text-slate-500">{opp.organization} • {opp.city}, {opp.state}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: Organizer & Requester Center */}
      {activeTab === 'organizer' && (
        <div className="space-y-8">
          
          {/* Incoming Applications from Volunteers */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Incoming Volunteer Applications</h3>
                <p className="text-xs text-slate-500">Volunteers eager to support your posted requests</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {incomingApplications.length} Applicants
              </span>
            </div>

            {incomingApplications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {incomingApplications.map((app) => {
                  const parentOpp = opportunities.find((o) => o.id === app.opportunityId);
                  const targetHours = parentOpp?.targetHours ?? DEFAULT_TARGET_HOURS;
                  const loggedHours = app.loggedHours ?? 0;
                  const creditsAwarded = app.creditsAwarded ?? 0;
                  const reachedGoal = loggedHours >= targetHours;
                  const hoursLeft = Math.max(0, Math.round((targetHours - loggedHours) * 10) / 10);
                  const progressPct = Math.min(100, Math.round((loggedHours / targetHours) * 100));
                  const draftHours =
                    hoursDrafts[app.id] !== undefined ? hoursDrafts[app.id] : String(loggedHours);

                  return (
                    <div key={app.id} className="p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={app.applicantAvatar}
                            alt={app.applicantName}
                            className="w-12 h-12 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{app.applicantName}</h4>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                app.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.status === 'declined'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {app.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              Applying for: <span className="font-semibold text-slate-700">{app.opportunityTitle}</span>
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          {app.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => updateApplicationStatus(app.id, 'accepted')}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Accept Volunteer</span>
                              </button>
                              <button
                                onClick={() => updateApplicationStatus(app.id, 'declined')}
                                className="px-3.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Decline</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => updateApplicationStatus(app.id, app.status === 'accepted' ? 'pending' : 'accepted')}
                              className="text-xs text-slate-500 hover:underline"
                            >
                              Change Status
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Applicant details */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                        <div className="flex flex-wrap gap-4 text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {app.applicantEmail}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {app.applicantPhone}
                          </span>
                          <span>
                            Available: <strong className="text-slate-700">{app.availableDays.join(', ')}</strong>
                          </span>
                        </div>
                        {app.coverNote && (
                          <p className="text-slate-700 italic pt-1 border-t border-slate-200/60">
                            "{app.coverNote}"
                          </p>
                        )}
                      </div>

                      {/* Organizer Control Panel for Volunteer Hours & Credit Payout */}
                      {app.status === 'accepted' && (
                        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span>Volunteer Hours Control: {loggedHours} hrs logged</span>
                              <span className="text-slate-400 font-normal">/ {targetHours} hrs target</span>
                            </div>

                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                              reachedGoal
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}>
                              {reachedGoal
                                ? `Target Reached • ${creditsAwarded} Credits Earned`
                                : `${hoursLeft} hrs left to earn ${Math.round(targetHours * CREDITS_PER_HOUR)} credits`}
                            </span>
                          </div>

                          <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-blue-100">
                            <div
                              className={`h-full rounded-full transition-all ${
                                reachedGoal ? 'bg-emerald-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {[-1, 0.5, 1, 2, 5].map((delta) => {
                                const label = delta > 0 ? `+${delta}h` : `${delta}h`;
                                const nextVal = Math.max(0, Math.round((loggedHours + delta) * 10) / 10);
                                return (
                                  <button
                                    key={delta}
                                    type="button"
                                    disabled={delta < 0 && loggedHours <= 0}
                                    onClick={() => {
                                      setVolunteerHours(app.id, nextVal);
                                      setHoursDrafts((prev) => ({ ...prev, [app.id]: String(nextVal) }));
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition disabled:opacity-40 ${
                                      delta > 0
                                        ? 'bg-white hover:bg-blue-600 hover:text-white text-blue-700 border-blue-200'
                                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>

                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const parsed = Number(draftHours);
                                if (!Number.isNaN(parsed)) {
                                  const clean = Math.max(0, Math.round(parsed * 10) / 10);
                                  setVolunteerHours(app.id, clean);
                                  setHoursDrafts((prev) => ({ ...prev, [app.id]: String(clean) }));
                                }
                              }}
                              className="flex items-center gap-1.5"
                            >
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={draftHours}
                                onChange={(e) =>
                                  setHoursDrafts((prev) => ({ ...prev, [app.id]: e.target.value }))
                                }
                                className="w-20 px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Set exact volunteer hours"
                              />
                              <button
                                type="submit"
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
                              >
                                Set Hours
                              </button>
                            </form>
                          </div>

                          <p className="text-[11px] text-slate-500">
                            Conversion rate: <strong>1 hour = {CREDITS_PER_HOUR} credits</strong> once target ({targetHours} hrs) is reached.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center text-slate-500 space-y-2">
                <p className="text-sm">No volunteer applications received yet for your listings.</p>
                <p className="text-xs text-slate-400">Post a new request or share your existing link to attract helpers.</p>
              </div>
            )}
          </div>

          {/* Your Posted Requests */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Your Posted Volunteer Requests</h3>
                <p className="text-xs text-slate-500">Manage and monitor live requests</p>
              </div>
              <button
                onClick={() => onNavigate('request')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post New Request</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myPostedOpportunities.map((opp) => {
                const currentTarget = opp.targetHours ?? DEFAULT_TARGET_HOURS;
                const draftTarget =
                  targetDrafts[opp.id] !== undefined ? targetDrafts[opp.id] : String(currentTarget);
                const acceptedCount = incomingApplications.filter(
                  (a) => a.opportunityId === opp.id && a.status === 'accepted'
                ).length;

                return (
                  <div key={opp.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
                          {opp.cause}
                        </span>
                        <button
                          onClick={() => deleteOpportunity(opp.id)}
                          className="text-slate-400 hover:text-red-600 transition p-1"
                          title="Delete listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4
                        onClick={() => onSelectOpportunity(opp)}
                        className="font-bold text-sm text-slate-900 hover:text-brand-600 cursor-pointer mt-2"
                      >
                        {opp.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {opp.city}, {opp.state} • {opp.commitmentHours} • {acceptedCount} accepted
                      </p>
                    </div>

                    {/* Editable Target Hour Goal */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-emerald-600" />
                          Target Hour Goal
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700">
                          {Math.round(currentTarget * CREDITS_PER_HOUR)} credits at goal
                        </span>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const parsed = Number(draftTarget);
                          if (!Number.isNaN(parsed) && parsed > 0) {
                            const clean = Math.max(0.5, Math.round(parsed * 10) / 10);
                            updateOpportunityTargetHours(opp.id, clean);
                            setTargetDrafts((prev) => ({ ...prev, [opp.id]: String(clean) }));
                            setSavedTargetNoticeId(opp.id);
                            setTimeout(() => setSavedTargetNoticeId(null), 1800);
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="number"
                          min="0.5"
                          max="500"
                          step="0.5"
                          value={draftTarget}
                          onChange={(e) =>
                            setTargetDrafts((prev) => ({ ...prev, [opp.id]: e.target.value }))
                          }
                          className="w-24 px-2.5 py-1 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          aria-label="Target hours for credits"
                        />
                        <span className="text-[11px] text-slate-500">hrs</span>
                        <button
                          type="submit"
                          className="ml-auto px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition inline-flex items-center gap-1"
                        >
                          {savedTargetNoticeId === opp.id ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <span>Save Target</span>
                          )}
                        </button>
                      </form>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        {opp.spotsFilled} of {opp.spotsNeeded} spots filled
                      </span>
                      <button
                        onClick={() => onSelectOpportunity(opp)}
                        className="text-brand-600 font-semibold hover:underline"
                      >
                        View Live Page →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: Badges & Hours Summary */}
      {activeTab === 'profile' && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900">Your Volunteer Badges & Honors</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {user.badges.map((badge, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-gradient-to-b from-brand-50 to-white border border-brand-200 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{badge}</h4>
                  <p className="text-[10px] text-slate-500">Verified by GiveBack™</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      {selectedCertificateApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-brand-600 p-5 sm:p-10 relative max-h-[90vh] overflow-y-auto text-center space-y-5 sm:space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCertificateApp(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                GiveBack™ Official Certificate of Service
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 pt-2 tracking-tight">
                CERTIFICATE OF APPRECIATION
              </h2>
              <p className="text-xs text-slate-400 uppercase tracking-widest">
                This certifies that
              </p>
            </div>

            <div className="border-b-2 border-brand-500 pb-2 max-w-md mx-auto">
              <h3 className="text-2xl sm:text-3xl font-serif italic text-brand-800 font-bold">
                {user.name}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              has completed dedicated voluntary service for{' '}
              <strong className="text-slate-900">{selectedCertificateApp.opportunityTitle}</strong> organized by{' '}
              <strong className="text-slate-900">{selectedCertificateApp.organizationName}</strong>, donating genuine goodwill, compassion, and effort to community advancement.
            </p>

            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 max-w-md mx-auto">
              <div className="text-center">
                <div className="font-serif italic text-slate-800 text-sm font-bold">Ron Osmani & Anik Ademi</div>
                <div className="border-t border-slate-300 pt-1 mt-1 text-[10px]">Founders & Verification Officers</div>
              </div>

              <div className="w-14 h-14 rounded-full bg-brand-100 border-2 border-brand-500 flex items-center justify-center text-brand-700 font-extrabold text-[10px] uppercase shadow">
                Seal 2026
              </div>

              <div className="text-center">
                <div className="font-mono text-slate-800 text-xs">{new Date().toISOString().split('T')[0]}</div>
                <div className="border-t border-slate-300 pt-1 mt-1 text-[10px]">Issue Date</div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-brand-700 shadow"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
              <button
                onClick={() => setSelectedCertificateApp(null)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
