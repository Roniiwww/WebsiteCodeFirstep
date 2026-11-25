import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Scale, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

export const LegalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'copyright' | 'terms' | 'privacy'>('copyright');
  const [copied, setCopied] = useState(false);

  const handleCopyNotice = () => {
    navigator.clipboard.writeText('Copyright © 2026 GiveBack Global Foundation Inc. All Rights Reserved. Reg. No. 98-774-120.');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Breadcrumb & Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium max-w-2xl mx-auto justify-center">
          <a href="#/home" className="hover:text-blue-600 transition">Home</a>
          <span>/</span>
          <span className="text-blue-700 font-bold">Legal Notice & Terms</span>
        </div>

        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
            Legal & Intellectual Property
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Copyright, Terms & Privacy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Last updated and effective as of November 12, 2026
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-slate-200 justify-start sm:justify-center gap-4 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('copyright')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'copyright'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4 shrink-0" />
          <span>Copyright & IP Notice</span>
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'terms'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>Terms of Service</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'privacy'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-4 h-4 shrink-0" />
          <span>Privacy & Data Protection Policy</span>
        </button>
      </div>

      {/* TAB 1: COPYRIGHT NOTICE */}
      {activeTab === 'copyright' && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8 text-slate-700 leading-relaxed text-sm">
          
          <div className="p-5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-brand-400">OFFICIAL LEGAL ASSERTION</div>
              <div className="text-base sm:text-lg font-bold font-sans mt-0.5">
                © 2026 GiveBack Global Foundation Inc. All Rights Reserved.
              </div>
              <div className="text-xs text-slate-400">
                Registered United States Trademark No. 98-774-120 • International Classification 035, 036, 045
              </div>
            </div>

            <button
              onClick={handleCopyNotice}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Notice'}</span>
            </button>
          </div>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">1. Intellectual Property Ownership</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              The GiveBack™ platform, including but not limited to its visual layout, graphic logos, interface workflows, database architecture, design systems, algorithms, source code, and associated textual content, is the proprietary property of <strong>GiveBack Global Foundation Inc.</strong> and is protected under United States and international copyright, trademark, and intellectual property statutes.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">2. Restrictions on Use</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Except as expressly granted herein, no component of this website or its underlying code may be copied, reproduced, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, scraped via automated bots or crawlers, or distributed in any commercial form without the prior express written authorization of GiveBack Global Foundation Inc.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">3. Digital Millennium Copyright Act (DMCA) Designated Agent</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              GiveBack respects the intellectual property rights of creators and organizers. If you believe that your copyrighted work has been posted on the platform in a manner that constitutes infringement, please submit a formal DMCA Takedown Notice to our designated agent:
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 space-y-1">
              <div>Attn: DMCA Copyright Compliance Agent</div>
              <div>GiveBack Legal Operations, 100 Montgomery Street, Suite 1800, San Francisco, CA 94104</div>
              <div>Email: dmca-compliance@giveback.org | Phone: +1 (800) 448-3222 ext. 4</div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">4. User-Submitted Content & Opportunity Listings</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              By submitting volunteer opportunities, photographs, descriptions, and community requests to GiveBack, organizers warrant that they hold the legal right to publish said material and grant GiveBack a worldwide, royalty-free, non-exclusive license to display, promote, and distribute such requests solely to mobilize volunteer participants.
            </p>
          </section>

        </div>
      )}

      {/* TAB 2: TERMS OF SERVICE */}
      {activeTab === 'terms' && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-slate-700 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-slate-900">Platform Terms of Service</h2>
          <p className="text-xs text-slate-500">
            Please read these terms carefully before creating an account, applying for voluntary opportunities, or posting volunteer requests.
          </p>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">1. Eligibility & Volunteer Commitment</h4>
              <p className="mt-1">
                Users must be at least 13 years of age to register an account. Volunteers under the age of 18 must receive parent or legal guardian consent for in-person opportunities requiring adult supervision. By applying, volunteers agree to make honest, good-faith efforts to attend agreed shifts.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 text-sm">2. Mutual Aid & Volunteer Nature</h4>
              <p className="mt-1">
                Volunteer services arranged via GiveBack are performed freely without financial remuneration or employment relationship between GiveBack and the volunteer. Organizers agree not to use voluntary workers to replace paid union or regular employees in violation of federal labor standards.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 text-sm">3. Safety, Code of Conduct & Harassment Prohibition</h4>
              <p className="mt-1">
                GiveBack maintains strict zero tolerance for hate speech, harassment, discrimination based on race, religion, gender, sexual orientation, disability, or nationality. Organizers or volunteers violating this pledge will have their accounts immediately terminated.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 text-sm">4. Limitation of Liability</h4>
              <p className="mt-1">
                GiveBack operates as a matching and exchange platform. While reasonable efforts are made to verify organizations, participants assume standard voluntary risks associated with physical labor or site activities.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRIVACY & DATA PROTECTION POLICY */}
      {activeTab === 'privacy' && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-slate-700 leading-relaxed text-sm">
          <h2 className="text-xl font-bold text-slate-900">Privacy & Data Protection Policy</h2>
          <p className="text-xs text-slate-500">
            GiveBack is dedicated to protecting your personal information and complying with GDPR, CCPA, and global privacy standards.
          </p>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">1. Account Data & Profile Privacy</h4>
              <p className="mt-1">
                When you create an account, we store only your essential profile details: your name, email address, password hash, and volunteer interests. GiveBack never shares your data with advertisers or unauthorized third parties.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 text-sm">2. Information Sharing & Protection</h4>
              <p className="mt-1">
                We never sell, rent, or trade your personal data to third-party advertisers. When you apply for a volunteer opportunity, your contact details (name, email, phone) are provided exclusively to the verified organizer of that specific listing.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 text-sm">3. Data Retention & Right to Deletion</h4>
              <p className="mt-1">
                You may request complete erasure of your account, history, and uploaded listings at any time by contacting privacy@giveback.org.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
