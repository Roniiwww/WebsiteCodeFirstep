import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ContactPage: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('General Support');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Fallback SMTP config drawer if .env credentials aren't set on server
  const [showSmtpConfig, setShowSmtpConfig] = useState(false);
  const [smtpUser, setSmtpUser] = useState(() => localStorage.getItem('giveback_smtp_user') || '');
  const [smtpPass, setSmtpPass] = useState(() => localStorage.getItem('giveback_smtp_pass') || '');

  const submitContactEmail = async (overrideCreds?: { smtpUser: string; smtpPass: string }) => {
    setError('');
    setSending(true);

    const effectiveSmtpUser = overrideCreds?.smtpUser ?? smtpUser;
    const effectiveSmtpPass = overrideCreds?.smtpPass ?? smtpPass;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          smtpUser: effectiveSmtpUser.trim(),
          smtpPass: effectiveSmtpPass.trim().replace(/\s+/g, '')
        })
      });

      const rawText = await response.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(
          'Email service endpoint is unavailable on this server. Make sure the Vite server (npm run dev or npm run preview) is running.'
        );
      }

      if (!response.ok || !data.success) {
        if (data.needsConfig) {
          setShowSmtpConfig(true);
          setError(
            data.error ||
              'Please provide your sender Gmail & Google App Password below (or configure SMTP_USER / SMTP_PASS in .env).'
          );
          return;
        }
        throw new Error(data.error || 'Failed to send your message. Please try again.');
      }

      setShowSmtpConfig(false);
      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Unable to send your message right now.');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitContactEmail();
  };

  const handleSaveSmtpAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = smtpUser.trim();
    const cleanPass = smtpPass.trim().replace(/\s+/g, '');
    if (!cleanUser || !cleanPass) {
      setError('Please enter both your Gmail address and 16-character App Password.');
      return;
    }
    localStorage.setItem('giveback_smtp_user', cleanUser);
    localStorage.setItem('giveback_smtp_pass', cleanPass);
    await submitContactEmail({ smtpUser: cleanUser, smtpPass: cleanPass });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Breadcrumb & Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium max-w-2xl mx-auto justify-center">
          <a href="#/home" className="hover:text-blue-600 transition">Home</a>
          <span>/</span>
          <span className="text-blue-700 font-bold">Contact & Support</span>
        </div>

        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Support & Assistance
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            We’re Here to Help
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Questions about signing up, verifying an organization, or organizing a large-scale volunteer drive? Send us a direct email below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Toll-Free Volunteer Hotline</h3>
            <p className="text-xs text-slate-500">Immediate telephone support for volunteers & urgent needs</p>
            <p className="text-sm font-bold text-brand-600">+1 (800) 448-3222 (GIVEBACK)</p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Direct Inquiries</h3>
            <p className="text-xs text-slate-500">General: help@giveback.org</p>
            <p className="text-xs text-slate-500">Legal & DMCA: legal@giveback.org</p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Global Foundation Headquarters</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              GiveBack Global Foundation Inc.<br />
              100 Montgomery Street, Suite 1800<br />
              San Francisco, CA 94104, USA
            </p>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-4">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {sent ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Email Sent!</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your message has been delivered directly to our inbox. Replies will be sent to{' '}
                  <strong className="text-slate-800">{email}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setError('');
                    setMessage('');
                  }}
                  className="h-9 px-5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition inline-flex items-center justify-center"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Morgan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Topic / Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option value="General Support">General Support & Account Assistance</option>
                      <option value="Organization Verification">501(c)(3) Organization Verification</option>
                      <option value="Safety Incident">Report a Safety or Conduct Concern</option>
                      <option value="Corporate Partnership">Corporate Volunteering & Partnership</option>
                      <option value="Press / Media">Press, Media & Copyright Inquiries</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="How can our community team assist you today?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full h-11 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Email...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Inquiry to GiveBack</span>
                      </>
                    )}
                  </button>
                </form>

                {showSmtpConfig && (
                  <form
                    onSubmit={handleSaveSmtpAndSend}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800">
                        Gmail SMTP Setup (Fallback if .env not configured)
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowSmtpConfig(false)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="email"
                        required
                        placeholder="yourname@gmail.com"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                      <input
                        type="password"
                        required
                        placeholder="16-char Google App Password"
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Generate Google App Password</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="submit"
                        disabled={sending}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                      >
                        Save & Send Email
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
