import React, { useState } from 'react';
import { Opportunity } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useOpportunities } from '../../context/OpportunitiesContext';
import { X, Send, CheckCircle, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ApplyModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ opportunity, onClose }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { applyForOpportunity } = useOpportunities();

  const [coverNote, setCoverNote] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Weekends']);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!opportunity) return null;

  const daysOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Flexible / Remote'];

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please sign in to submit your application.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await applyForOpportunity(
        opportunity,
        coverNote,
        phone,
        selectedDays,
        user?.skills || []
      );

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
              Volunteer Application
            </span>
            <h3 className="font-bold text-slate-900 text-lg mt-1 line-clamp-1">{opportunity.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Organized by <span className="font-medium text-slate-700">{opportunity.organization}</span> • {opportunity.locationType === 'remote' ? 'Remote' : `${opportunity.city}, ${opportunity.state}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-brand-50">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Application Submitted!</h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Thank you for stepping up! <span className="font-semibold text-slate-800">{opportunity.organization}</span> has been notified of your interest. You can track this in your Volunteer Dashboard.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm rounded-xl shadow-sm transition"
              >
                Back to Opportunities
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {!isAuthenticated || !user ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-semibold text-amber-900">Sign in to apply</h5>
                    <p className="text-xs text-amber-700 mt-0.5">
                      To safeguard our organizers and community members, all volunteer applications require a verified GiveBack account.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openAuthModal('signin')}
                    className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 shadow-sm flex items-center justify-center gap-1.5"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal('signup')}
                    className="flex-1 py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                />
                <div className="text-xs">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    Applying as {user.name}
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-1.5 py-0.5 rounded border border-emerald-100">
                      Verified Member
                    </span>
                  </div>
                  <div className="text-slate-500">{user.email}</div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Contact Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                When are you usually available?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {daysOptions.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`text-xs py-1 px-2.5 rounded-lg border font-medium transition ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Personal Message / Motivation Note</span>
                <span className="text-slate-400 font-normal">Optional</span>
              </label>
              <textarea
                rows={4}
                placeholder="Share why you'd like to support this cause, any relevant experience, or special availability..."
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              <span>
                By applying, you agree to honor the scheduled commitment and adhere to GiveBack’s Code of Conduct and Safety Guidelines.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm rounded-xl shadow-sm transition flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Application
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
