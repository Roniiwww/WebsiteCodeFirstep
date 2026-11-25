import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  HeartHandshake, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  KeyRound,
  ArrowLeft,
  Check,
  Send,
  RefreshCw,
  Settings,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    setAuthModalMode,
    loginWithEmail,
    registerWithEmail,
    sendPasswordResetCode,
    verifyAndResetPassword
  } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot password flow states
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Real Email Dispatch (SMTP) configuration state
  const [showSmtpConfig, setShowSmtpConfig] = useState(false);
  const [smtpUser, setSmtpUser] = useState(() => localStorage.getItem('giveback_smtp_user') || '');
  const [smtpPass, setSmtpPass] = useState(() => localStorage.getItem('giveback_smtp_pass') || '');

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isAuthModalOpen) return null;

  // Handle standard login or registration submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authModalMode === 'signin') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both your email and password.');
        }
        await loginWithEmail(email, password);
      } else if (authModalMode === 'signup') {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (!email.trim()) {
          throw new Error('Please enter your email address.');
        }
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        // Single unified account (both volunteering and requesting help)
        await registerWithEmail({
          name: name.trim(),
          email: email.trim(),
          password
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send Password Reset Code via real email
  const handleSendResetCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const result = await sendPasswordResetCode(email, {
        smtpUser: smtpUser.trim(),
        smtpPass: smtpPass.trim().replace(/\s+/g, '')
      });

      if (result.needsConfig) {
        setShowSmtpConfig(true);
        setError('To dispatch a real verification email, please provide your sender Gmail & 16-character Google App Password below (or add them to the .env file).');
      } else if (result.emailSent) {
        setShowSmtpConfig(false);
        setForgotStep('verify');
        setResendCooldown(30);
        setSuccessMsg(`Real verification email sent to ${result.email}! Please check your email inbox.`);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Save SMTP settings & retry dispatching real email
  const handleSaveSmtpAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpUser.trim() || !smtpPass.trim()) {
      setError('Please enter both your sender Gmail address and 16-character App Password.');
      return;
    }

    localStorage.setItem('giveback_smtp_user', smtpUser.trim());
    localStorage.setItem('giveback_smtp_pass', smtpPass.trim().replace(/\s+/g, ''));
    
    await handleSendResetCode();
  };

  // Step 2: Verify Code and Save New Password
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await verifyAndResetPassword(email, resetCode, newPassword);
      setSuccessMsg('Your password has been successfully reset! Logging you in...');
      setTimeout(() => {
        closeAuthModal();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. Please check your verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-md ${
              authModalMode === 'forgot'
                ? 'bg-gradient-to-tr from-amber-500 to-amber-600 shadow-amber-900/15'
                : 'bg-gradient-to-tr from-blue-600 via-blue-700 to-emerald-500 shadow-blue-900/15'
            }`}>
              {authModalMode === 'forgot' ? (
                <KeyRound className="w-5 h-5" />
              ) : (
                <HeartHandshake className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                {authModalMode === 'signin' && 'Sign In to GiveBack'}
                {authModalMode === 'signup' && 'Create Your Account'}
                {authModalMode === 'forgot' && (forgotStep === 'request' ? 'Reset Password' : 'Enter Verification Code')}
              </h3>
              <p className="text-xs text-slate-500">
                {authModalMode === 'forgot'
                  ? (forgotStep === 'request' ? 'We will send a real verification email to your inbox' : 'Check your email inbox and enter the 6-digit code')
                  : 'One account for volunteering and requesting help'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers (only visible in signin or signup modes) */}
        {authModalMode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1.5 mx-6 mt-4 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 shrink-0">
            <button
              type="button"
              onClick={() => {
                setError('');
                setSuccessMsg('');
                setAuthModalMode('signin');
              }}
              className={`py-2 rounded-lg transition ${
                authModalMode === 'signin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setError('');
                setSuccessMsg('');
                setAuthModalMode('signup');
              }}
              className={`py-2 rounded-lg transition ${
                authModalMode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Sign Up (New Account)
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Alerts */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1 & 2: SIGN IN & SIGN UP */}
          {authModalMode !== 'forgot' && (
            <>
              {authModalMode === 'signup' && (
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Unified Account:</strong> You can apply to volunteer AND request volunteer help anytime.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* SIGN UP FULL NAME */}
                {authModalMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* EMAIL INPUT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* PASSWORD INPUT WITH FORGOT PASSWORD LINK */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password * {authModalMode === 'signup' && <span className="text-slate-400 font-normal">(min 6 characters)</span>}
                    </label>
                    {authModalMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setSuccessMsg('');
                          setForgotStep('request');
                          setShowSmtpConfig(false);
                          setAuthModalMode('forgot');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : authModalMode === 'signin' ? (
                    'Sign In'
                  ) : (
                    'Create Account & Get Started'
                  )}
                </button>
              </form>

              {/* Toggle link */}
              <div className="text-center text-xs text-slate-500 pt-2">
                {authModalMode === 'signin' ? (
                  <p>
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setSuccessMsg('');
                        setAuthModalMode('signup');
                      }}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Create one here
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setSuccessMsg('');
                        setAuthModalMode('signin');
                      }}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Sign in here
                    </button>
                  </p>
                )}
              </div>
            </>
          )}

          {/* MODE 3: FORGOT PASSWORD FLOW */}
          {authModalMode === 'forgot' && (
            <div className="space-y-4">
              
              {/* STAGE 1: Request Code */}
              {forgotStep === 'request' && !showSmtpConfig && (
                <form onSubmit={handleSendResetCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="your.registered.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      We'll generate a secure 6-digit verification code and dispatch it straight to your real email inbox.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Real Email...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send 6-Digit Code to My Email</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setSuccessMsg('');
                        setAuthModalMode('signin');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </form>
              )}

              {/* SMTP CONFIGURATION DRAWER (Shown if sender credentials are required) */}
              {authModalMode === 'forgot' && showSmtpConfig && (
                <form onSubmit={handleSaveSmtpAndSend} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold">
                        <Mail className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Real Email Dispatch Setup
                      </h4>
                    </div>
                    {forgotStep === 'request' && (
                      <button
                        type="button"
                        onClick={() => setShowSmtpConfig(false)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    GiveBack dispatches genuine emails directly to inboxes using standard Gmail SMTP. Enter your sender Gmail and 16-character App Password (or define them in <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">.env</code>).
                  </p>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Sender Gmail Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="yourname@gmail.com"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-slate-700">
                          16-Character App Password
                        </label>
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-600 hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Generate password</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="abcd efgh ijkl mnop"
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending to Inbox...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Save & Dispatch Email to {email || 'Inbox'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STAGE 2: Verification Code & New Password */}
              {forgotStep === 'verify' && (
                <form onSubmit={handleVerifyAndReset} className="space-y-4">
                  
                  {/* REAL INBOX NOTIFICATION BANNER (Code is NEVER revealed on screen) */}
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-blue-950">Verification Code Dispatched!</p>
                      <p className="text-blue-800 mt-0.5 leading-relaxed">
                        A real email containing your 6-digit verification code was sent to <strong>{email}</strong>.
                      </p>
                      <p className="text-[11px] text-blue-600 mt-1 font-medium">
                        👉 Please open your email inbox (and check spam/junk), copy the code, and enter it below.
                      </p>
                    </div>
                  </div>

                  {/* 6-DIGIT CODE INPUT */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Enter 6-Digit Verification Code from Email *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="123456"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-9 pr-3.5 py-2 font-mono text-base tracking-widest font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* NEW PASSWORD */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Password * <span className="text-slate-400 font-normal">(min 6 characters)</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* CONFIRM NEW PASSWORD */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying & Updating...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Update Password & Log In</span>
                      </>
                    )}
                  </button>

                  {/* Resend and back navigation */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={() => handleSendResetCode()}
                      className="font-semibold text-blue-600 hover:underline flex items-center gap-1 disabled:opacity-50 disabled:no-underline"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend email'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setSuccessMsg('');
                        setForgotStep('request');
                      }}
                      className="font-semibold text-slate-600 hover:underline"
                    >
                      Change Email
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer legal */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 text-center shrink-0">
          GiveBack™ protects your privacy. By continuing, you agree to our{' '}
          <a href="#/legal" onClick={closeAuthModal} className="underline hover:text-slate-600">Terms</a> &{' '}
          <a href="#/legal" onClick={closeAuthModal} className="underline hover:text-slate-600">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
};
