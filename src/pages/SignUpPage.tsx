import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  UserCheck, 
  Mail, 
  Lock, 
  User, 
  MapPin, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  HeartHandshake, 
  ArrowRight, 
  CheckCircle2, 
  LogIn,
  Users,
  Compass,
  AlertCircle
} from 'lucide-react';

interface SignUpPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, registerWithEmail, loginWithEmail, logout, openAuthModal } = useAuth();

  // Mode: 'signup' or 'signin'
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('both');
  const [organizationName, setOrganizationName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Volunteer', 'Community Aid']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const availableSkills = [
    'Food Distribution',
    'Elderly Companion',
    'Animal Care',
    'Tutoring & Mentoring',
    'Disaster Relief',
    'Digital / Tech Support',
    'Event Coordination',
    'First Aid / Health'
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await registerWithEmail({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        organizationName: organizationName.trim() || undefined,
        location: location.trim() || 'Skopje, North Macedonia',
        phone: phone.trim() || undefined,
        skills: selectedSkills
      });

      setSuccessMessage('Welcome to GiveBack™! Your real account has been created.');
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      await loginWithEmail(email.trim().toLowerCase(), password);
      setSuccessMessage('Successfully signed in to GiveBack™!');
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated and logged in
  if (isAuthenticated && user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium justify-center">
          <button onClick={() => onNavigate('home')} className="hover:text-blue-600 transition">Home</button>
          <span>/</span>
          <span className="text-blue-700 font-bold">My Account</span>
        </div>

        {/* Signed In Confirmation Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md text-center space-y-6">
          <div className="w-20 h-20 rounded-full mx-auto relative border-4 border-emerald-100 overflow-hidden shadow-md">
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified GiveBack Account
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              You are signed in as {user.name}
            </h1>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block font-medium">Role</span>
              <span className="text-slate-800 font-bold capitalize">{user.role || 'Volunteer & Requester'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block font-medium">Logged Hours</span>
              <span className="text-emerald-600 font-bold">{user.hoursLogged || 0} Hours</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block font-medium">Location</span>
              <span className="text-slate-800 font-bold truncate block">{user.location || 'Community'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition inline-flex items-center gap-2 shadow-sm"
            >
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('request')}
              className="h-10 px-6 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs sm:text-sm rounded-xl transition inline-flex items-center gap-2"
            >
              <span>Request Help</span>
            </button>
            <button
              onClick={logout}
              className="h-10 px-5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-semibold text-xs sm:text-sm rounded-xl transition"
            >
              Sign Out / Switch Account
            </button>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium justify-center">
        <button onClick={() => onNavigate('home')} className="hover:text-blue-600 transition">Home</button>
        <span>/</span>
        <span className="text-blue-700 font-bold">{mode === 'signup' ? 'Sign Up Free' : 'Sign In'}</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>One Account for Giving & Receiving Aid</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {mode === 'signup' ? 'Create Your Free Account' : 'Welcome Back to GiveBack'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {mode === 'signup'
            ? 'Join our community network in seconds. Volunteer for urgent local causes or request help when you need a hand.'
            : 'Sign in to manage your volunteer applications, log service hours, or track your posted requests.'}
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
        
        {/* Toggle Mode Pills */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
              setSuccessMessage('');
            }}
            className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Sign Up (New Member)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
              setSuccessMessage('');
            }}
            className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              mode === 'signin'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* SIGN UP FORM */}
        {mode === 'signup' ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ron Osmani"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password (min 6 chars) *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location / City</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Skopje, Centar or Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Account Role Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Account Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('both')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    role === 'both'
                      ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <span className="font-bold text-xs flex items-center justify-between">
                    Unified (Both)
                    {role === 'both' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">Volunteer & request help anytime (Recommended)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('volunteer')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    role === 'volunteer'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <span className="font-bold text-xs flex items-center justify-between">
                    Volunteer Only
                    {role === 'volunteer' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">Discover causes and log service hours</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('organizer')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    role === 'organizer'
                      ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <span className="font-bold text-xs flex items-center justify-between">
                    Help Requester
                    {role === 'organizer' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">Nonprofit or neighbor posting needs</span>
                </button>
              </div>
            </div>

            {/* Optional Skills / Interests */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Skills & Volunteer Interests (Select what applies)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`h-8 px-3 rounded-lg text-xs font-medium transition border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Real Gmail Verification Note */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-slate-800">Genuine Email Protection:</strong> GiveBack™ uses Google SMTP verification to prevent bots and spam. Passwords can be securely reset via real 6-digit codes sent directly to your inbox.
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Create Free Account</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* SIGN IN FORM */
          <form onSubmit={handleLogin} className="space-y-5 max-w-md mx-auto">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password *</label>
                <button
                  type="button"
                  onClick={() => openAuthModal('forgot')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>

    </div>
  );
};
