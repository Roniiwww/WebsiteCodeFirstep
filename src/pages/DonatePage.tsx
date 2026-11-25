import React, { useState, useEffect, useMemo } from 'react';
import { DonationRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { CAUSE_CATEGORIES } from '../data/mockData';
import { CREDITS_PER_HOUR } from '../context/OpportunitiesContext';
import {
  Heart,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Gift,
  Sparkles,
  CreditCard,
  Landmark,
  FileText,
  Printer,
  Copy,
  Check,
  Mail,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DonatePageProps {
  onNavigate: (page: string, params?: any) => void;
  initialCause?: string;
}

const DONATIONS_KEY = 'giveback_donations_v1';
const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

function generateReceiptNumber(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `GB-DON-${num}`;
}

export const DonatePage: React.FC<DonatePageProps> = ({ onNavigate, initialCause }) => {
  const { user } = useAuth();

  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');
  const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(25);
  const [customAmount, setCustomAmount] = useState<string>('25');
  const [cause, setCause] = useState<string>(
    initialCause || 'GiveBack General Mutual Aid Fund'
  );
  const [method, setMethod] = useState<'stripe-checkout' | 'bank-transfer' | 'foundation-grant'>('stripe-checkout');
  const [donorName, setDonorName] = useState<string>(user?.name || '');
  const [donorEmail, setDonorEmail] = useState<string>(user?.email || '');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [dedicationNote, setDedicationNote] = useState<string>('');
  const [emailReceipt, setEmailReceipt] = useState<boolean>(true);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [verifyingStripe, setVerifyingStripe] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [emailNotice, setEmailNotice] = useState<string>('');
  const [completedReceipt, setCompletedReceipt] = useState<DonationRecord | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState<boolean>(false);

  const [donations, setDonations] = useState<DonationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(DONATIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(DONATIONS_KEY, JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeCanceled = params.get('stripe_canceled');
    const sessionId = params.get('session_id');

    const stripQueryParam = (key: string) => {
      const nextParams = new URLSearchParams(window.location.search);
      nextParams.delete(key);
      const nextSearch = nextParams.toString();
      const cleanUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
      window.history.replaceState(null, '', cleanUrl);
    };

    if (stripeCanceled === '1') {
      setError('Stripe checkout was canceled. No payment was charged.');
      stripQueryParam('stripe_canceled');
      return;
    }

    if (!sessionId) return;

    let cancelled = false;
    setVerifyingStripe(true);
    setError('');
    setEmailNotice('');

    (async () => {
      try {
        const res = await fetch(`/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`);
        const raw = await res.text();
        let data: any = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          data = {};
        }

        if (cancelled) return;

        if (!res.ok || !data.success) {
          setError(data.error || 'Could not verify your Stripe Checkout session.');
          stripQueryParam('session_id');
          return;
        }

        if (!data.paid) {
          setError(`Stripe payment status is "${data.paymentStatus || 'unpaid'}". No receipt recorded.`);
          stripQueryParam('session_id');
          return;
        }

        const record: DonationRecord = {
          id: `stripe-${data.sessionId}`,
          receiptNumber: data.receiptNumber,
          userId: data.userId || user?.id,
          donorName: data.donorName || 'Anonymous Supporter',
          donorEmail: data.donorEmail || '',
          isAnonymous: Boolean(data.isAnonymous),
          amountUsd: Number(data.amountUsd) || 0,
          frequency: data.frequency === 'monthly' ? 'monthly' : 'one-time',
          cause: data.cause || 'GiveBack General Mutual Aid Fund',
          method: 'stripe-checkout',
          dedicationNote: data.dedicationNote || undefined,
          createdAt: new Date().toISOString(),
          emailedReceipt: Boolean(data.emailedReceipt)
        };

        let alreadyRecorded = false;
        try {
          const existingRaw = localStorage.getItem(DONATIONS_KEY);
          const existingList: DonationRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
          alreadyRecorded = existingList.some(
            (d) => d.id === record.id || d.receiptNumber === record.receiptNumber
          );
        } catch {
          alreadyRecorded = false;
        }

        setDonations((prev) => {
          if (prev.some((d) => d.id === record.id || d.receiptNumber === record.receiptNumber)) {
            return prev;
          }
          return [record, ...prev];
        });

        setCompletedReceipt(record);
        if (data.emailedReceipt && data.donorEmail) {
          setEmailNotice(`A receipt email was sent to ${data.donorEmail}.`);
        }

        stripQueryParam('session_id');

        if (!alreadyRecorded) {
          confetti({
            particleCount: 95,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch {
        if (!cancelled) {
          setError('Network error while verifying your Stripe payment.');
        }
      } finally {
        if (!cancelled) {
          setVerifyingStripe(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const effectiveAmount = useMemo(() => {
    if (selectedPreset !== 'custom') return selectedPreset;
    const parsed = Number(customAmount);
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) / 100 : 0;
  }, [selectedPreset, customAmount]);

  const sponsoredCredits = Math.round(effectiveAmount * 10);
  const sponsoredHours = Math.round((sponsoredCredits / CREDITS_PER_HOUR) * 10) / 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailNotice('');

    if (effectiveAmount < 1) {
      setError('Please enter a donation amount of at least $1.');
      return;
    }

    const cleanName = isAnonymous ? 'Anonymous Supporter' : donorName.trim();
    const cleanEmail = donorEmail.trim();

    if (!isAnonymous && !cleanName) {
      setError('Please enter your name or select "Give anonymously".');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address for your receipt.');
      return;
    }

    setSubmitting(true);

    if (method === 'stripe-checkout') {
      try {
        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amountUsd: effectiveAmount,
            frequency,
            cause,
            donorName: cleanName,
            donorEmail: cleanEmail,
            dedicationNote: dedicationNote.trim(),
            isAnonymous,
            emailReceipt,
            userId: user?.id
          })
        });

        const raw = await res.text();
        let data: any = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          data = {};
        }

        if (!res.ok || !data.success || !data.url) {
          setError(
            data.error ||
              (res.status === 404
                ? 'Stripe Checkout endpoint (/api/create-checkout-session) returned 404. Ensure the api/ functions are deployed.'
                : `Could not start Stripe Checkout (HTTP ${res.status}). Please verify STRIPE_SECRET_KEY in your server environment variables.`)
          );
          setSubmitting(false);
          return;
        }

        window.location.assign(data.url);
        return;
      } catch {
        setError('Network error connecting to Stripe Checkout. Please try again.');
        setSubmitting(false);
        return;
      }
    }

    const receiptNumber = generateReceiptNumber();
    let emailedReceipt = false;

    try {
      if (emailReceipt) {
        const savedSmtpUser = localStorage.getItem('giveback_smtp_user') || '';
        const savedSmtpPass = localStorage.getItem('giveback_smtp_pass') || '';

        const res = await fetch('/api/donation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            donorName: cleanName,
            donorEmail: cleanEmail,
            amountUsd: effectiveAmount,
            frequency,
            cause,
            receiptNumber,
            dedicationNote: dedicationNote.trim(),
            smtpUser: savedSmtpUser,
            smtpPass: savedSmtpPass
          })
        });

        const raw = await res.text();
        let data: any = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          data = {};
        }

        if (res.ok && data.success) {
          emailedReceipt = true;
          setEmailNotice(`A pledge receipt email was sent to ${cleanEmail}.`);
        } else {
          setEmailNotice(
            'Your pledge receipt was saved below (email dispatch unavailable on this server or SMTP error).'
          );
        }
      }

      const record: DonationRecord = {
        id: `don-${Date.now()}`,
        receiptNumber,
        userId: user?.id,
        donorName: cleanName,
        donorEmail: cleanEmail,
        isAnonymous,
        amountUsd: effectiveAmount,
        frequency,
        cause,
        method,
        dedicationNote: dedicationNote.trim() || undefined,
        createdAt: new Date().toISOString(),
        emailedReceipt
      };

      setDonations((prev) => [record, ...prev]);
      setCompletedReceipt(record);

      confetti({
        particleCount: 95,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      setError('Something went wrong saving your donation pledge. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyReceipt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Breadcrumb & Hero Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium justify-center">
          <a
            href="#/home"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="hover:text-blue-600 transition"
          >
            Home
          </a>
          <span>/</span>
          <span className="text-blue-700 font-bold">Donate</span>
        </div>

        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Support GiveBack™</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Fuel Community Action & Volunteer Rewards
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Keep GiveBack™ 100% free for nonprofits and neighbors while sponsoring emergency local drives and volunteer gift-card rewards.
          </p>
        </div>
      </div>

      {/* Main Content: Receipt View, Verification Spinner, or Donation Form */}
      {completedReceipt ? (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Thank You for Your Generosity!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Your {completedReceipt.frequency}{' '}
              {completedReceipt.method === 'stripe-checkout' ? 'contribution' : 'pledge'} of{' '}
              <strong className="text-slate-900">${completedReceipt.amountUsd.toFixed(2)}</strong> to{' '}
              <strong className="text-blue-700">{completedReceipt.cause}</strong> has been{' '}
              {completedReceipt.method === 'stripe-checkout'
                ? 'paid and verified via Stripe.'
                : 'recorded.'}
            </p>
            {emailNotice && (
              <p className="text-xs text-emerald-700 font-medium pt-1">{emailNotice}</p>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                {completedReceipt.method === 'stripe-checkout'
                  ? 'Stripe Payment Receipt'
                  : 'Official Pledge Receipt'}
              </span>
              <span className="font-mono font-bold text-blue-700">
                {completedReceipt.receiptNumber}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500 shrink-0">Payment Method</span>
              <strong className="text-slate-900 text-right">
                {completedReceipt.method === 'stripe-checkout'
                  ? 'Stripe Checkout'
                  : completedReceipt.method === 'bank-transfer'
                  ? 'Bank / Wire Transfer'
                  : 'Sponsor Grant'}
              </strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500 shrink-0">Donor</span>
              <strong className="text-slate-900 text-right">{completedReceipt.donorName}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500 shrink-0">Email</span>
              <strong className="text-slate-900 text-right break-all">{completedReceipt.donorEmail}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500 shrink-0">Amount</span>
              <strong className="text-emerald-700 text-right">
                ${completedReceipt.amountUsd.toFixed(2)}{' '}
                {completedReceipt.frequency === 'monthly' ? '/ month' : '(One-time)'}
              </strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500 shrink-0">Designated Fund</span>
              <strong className="text-slate-900 text-right">{completedReceipt.cause}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <strong className="text-slate-900">
                {new Date(completedReceipt.createdAt).toLocaleString()}
              </strong>
            </div>
            {completedReceipt.dedicationNote && (
              <div className="pt-2 border-t border-slate-200 italic text-slate-600">
                "{completedReceipt.dedicationNote}"
              </div>
            )}
          </div>

          {completedReceipt.method === 'bank-transfer' && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-left text-xs text-blue-900 space-y-1">
              <div className="font-bold">Bank / Wire Transfer Reference</div>
              <p>
                Include reference <strong className="font-mono">{completedReceipt.receiptNumber}</strong> when sending funds to GiveBack Global Foundation Inc.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleCopyReceipt(completedReceipt.receiptNumber)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 transition"
            >
              {copiedReceipt ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedReceipt ? 'Receipt ID Copied' : 'Copy Receipt ID'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCompletedReceipt(null);
                setDedicationNote('');
                setError('');
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            >
              {completedReceipt.method === 'stripe-checkout'
                ? 'Make Another Donation'
                : 'Make Another Pledge'}
            </button>
          </div>
        </div>
      ) : verifyingStripe ? (
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-10 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-base font-extrabold text-slate-900">
            Verifying Your Stripe Payment...
          </div>
          <p className="text-xs text-slate-500">
            Please wait while we confirm your checkout session and issue your official receipt.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Donation Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6"
          >
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Frequency Toggle */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Contribution Frequency
              </label>
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFrequency('one-time')}
                  className={`py-2.5 rounded-lg text-xs font-bold transition ${
                    frequency === 'one-time'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  One-Time Gift
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('monthly')}
                  className={`py-2.5 rounded-lg text-xs font-bold transition ${
                    frequency === 'monthly'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly Supporter
                </button>
              </div>
            </div>

            {/* 2. Amount Picker */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Select Amount (USD)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_AMOUNTS.map((amt) => {
                  const active = selectedPreset === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(amt);
                        setCustomAmount(String(amt));
                      }}
                      className={`py-2.5 rounded-xl text-sm font-extrabold border transition ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      ${amt}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setSelectedPreset('custom')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    selectedPreset === 'custom'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Custom
                </button>
              </div>

              {selectedPreset === 'custom' && (
                <div className="relative pt-1">
                  <span className="absolute left-3.5 top-3.5 text-sm font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="Enter custom amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {effectiveAmount > 0 && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Equivalent impact: sponsors{' '}
                    <strong>{sponsoredCredits.toLocaleString()} volunteer credits</strong> ({sponsoredHours} verified service hours).
                  </span>
                </div>
              )}
            </div>

            {/* 3. Cause Allocation */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Designate Your Impact
              </label>
              <select
                value={cause}
                onChange={(e) => setCause(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-medium border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GiveBack General Mutual Aid Fund">
                  GiveBack General Mutual Aid Fund (Highest Need)
                </option>
                <option value="Volunteer Gift Card Rewards Pool">
                  Volunteer Gift Card Rewards Pool
                </option>
                {CAUSE_CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Donor Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  4. Your Information
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Give anonymously</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {!isAnonymous && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required={!isAnonymous}
                      placeholder="e.g. Alex Morgan"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className={isAnonymous ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email for Receipt *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dedication or Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. In support of local food rescue volunteers"
                  value={dedicationNote}
                  onChange={(e) => setDedicationNote(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={emailReceipt}
                  onChange={(e) => setEmailReceipt(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email me a copy of my receipt</span>
              </label>
            </div>

            {/* 5. Contribution Method */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                5. Payment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'stripe-checkout', label: 'Stripe Checkout', sub: 'Card, Apple/Google Pay', icon: CreditCard },
                  { id: 'bank-transfer', label: 'Bank / Wire', sub: 'Transfer instructions', icon: Landmark },
                  { id: 'foundation-grant', label: 'Sponsor Grant', sub: 'Org / CSR pledge', icon: FileText }
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = method === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMethod(opt.id as any)}
                      className={`p-3 rounded-xl border text-left transition ${
                        active
                          ? 'border-blue-600 bg-blue-50/80 text-blue-950 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1.5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[10px] text-slate-500">{opt.sub}</div>
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                {method === 'stripe-checkout'
                  ? `Secure checkout powered by Stripe. You will be redirected to Stripe to complete your ${
                      frequency === 'monthly' ? 'monthly ' : ''
                    }payment and returned here with a verified receipt.`
                  : 'Bank/Wire and Sponsor Grants record an official pledge commitment in GiveBack™ and provide transfer instructions without charging a card online.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || effectiveAmount < 1}
              className="w-full h-12 px-6 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 disabled:opacity-60 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>
                    {method === 'stripe-checkout' ? 'Redirecting to Stripe...' : 'Recording Pledge...'}
                  </span>
                </>
              ) : (
                <>
                  {method === 'stripe-checkout' ? (
                    <CreditCard className="w-5 h-5" />
                  ) : (
                    <HeartHandshake className="w-5 h-5" />
                  )}
                  <span>
                    {method === 'stripe-checkout'
                      ? `Donate $${effectiveAmount > 0 ? effectiveAmount.toFixed(2) : '0'}${
                          frequency === 'monthly' ? ' / mo' : ''
                        } via Stripe`
                      : `Complete $${effectiveAmount > 0 ? effectiveAmount.toFixed(2) : '0'} ${
                          frequency === 'monthly' ? 'Monthly ' : ''
                        }Pledge`}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Right Column: Live Summary & Transparency */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Donation Summary
                </span>
                <Sparkles className="w-4 h-4 text-emerald-300" />
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-extrabold">
                  ${effectiveAmount > 0 ? effectiveAmount.toFixed(2) : '0.00'}
                  {frequency === 'monthly' && (
                    <span className="text-sm font-semibold text-slate-300 ml-1">/ month</span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Allocated to <strong className="text-white">{cause}</strong>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-2 text-xs">
                <div className="font-bold text-white">What Your Gift Makes Possible</div>
                <ul className="space-y-1.5 text-slate-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Keeps GiveBack™ 100% free for charities & families</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Funds {sponsoredCredits.toLocaleString()} volunteer reward credits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Supports urgent neighborhood aid & emergency kits</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('store')}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition flex items-center justify-center gap-1.5"
              >
                <Gift className="w-4 h-4 text-emerald-300" />
                <span>See Volunteer Gift Card Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Where Every Dollar Goes</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Direct Community Supplies & Local Drives</span>
                    <span>70%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Volunteer Rewards & Gift Card Pool</span>
                    <span>20%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '20%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Verification, Safety & Platform Hosting</span>
                    <span>10%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donation Pledge History */}
      {donations.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Recent Contributions & Pledges ({donations.length})
              </h2>
              <p className="text-xs text-slate-500">
                Receipts saved in this browser
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {donations.slice(0, 8).map((don) => (
              <div
                key={don.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{don.donorName}</span>
                    <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {don.receiptNumber}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    {don.cause} • {new Date(don.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="font-extrabold text-sm text-emerald-700">
                  ${don.amountUsd.toFixed(2)}
                  {don.frequency === 'monthly' ? '/mo' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
