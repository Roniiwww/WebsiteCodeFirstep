import React from 'react';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Users, 
  Target, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Quote, 
  ArrowRight, 
  Heart, 
  Compass, 
  FileCheck, 
  Building2, 
  ShieldAlert, 
  Check, 
  ExternalLink 
} from 'lucide-react';

interface AboutPageProps {
  onNavigate?: (page: string, params?: any) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const handleNav = (page: string, params?: any) => {
    if (onNavigate) {
      onNavigate(page, params);
    } else {
      window.location.hash = `#/${page}`;
    }
  };

  const founders = [
    {
      name: 'Ron Osmani',
      age: 14,
      role: 'Co-Founder & Lead Architect',
      quote: 'We realized that goodwill exists in every neighborhood, but connecting with genuine local needs was fragmented and slow. GiveBack was born to bridge that gap with modern software.',
      bio: 'At 14, Ron leads GiveBack’s technological design and user experience. Driven by a passion for civic software, he engineered GiveBack to eliminate paper forms, verify safety, and give community members an instant, dignified way to connect.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=400&q=80',
      focus: ['Platform Architecture', 'Security & Vetting', 'User Accessibility']
    },
    {
      name: 'Anik Ademi',
      age: 14,
      role: 'Co-Founder & Community Lead',
      quote: 'Age shouldn’t be a limitation to making an impact. We wanted to build something that proves youth can pioneer real solutions for community hardship and human empathy.',
      bio: 'At 14, Anik spearheads community partnerships, outreach, and volunteer engagement. His vision centers on ensuring that grassroots community projects and individuals in need receive the same visibility as large international charities.',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80',
      focus: ['Community Partnerships', 'Youth Mobilization', 'Nonprofit Relations']
    }
  ];

  const values = [
    {
      icon: <Target className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-100',
      title: 'Radical Accessibility',
      desc: 'Volunteering shouldn’t require complex bureaucracy or weeks of waiting. We made discovering causes and lending a hand as frictionless and immediate as possible.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-100',
      title: 'Safety & Vetting First',
      desc: 'Every registered charity is cross-referenced with official tax-exempt records. Individual requests are reviewed by community liaisons to preserve total trust.'
    },
    {
      icon: <Heart className="w-6 h-6 text-rose-600" />,
      bg: 'bg-rose-100',
      title: 'Dignity for All Requesters',
      desc: 'Asking for help requires courage. GiveBack provides a respectful, supportive environment whether you are a food bank or an elderly neighbor needing snow shoveled.'
    },
    {
      icon: <Award className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-100',
      title: 'Certified Impact Recognition',
      desc: 'Volunteers deserve formal acknowledgment. Our system issues verified, tamper-proof certificates of service for high school, university, and employment credits.'
    }
  ];

  const comparisons = [
    {
      feature: 'Cost & Fees',
      traditional: 'Often involves membership dues or donation requirements',
      giveback: '100% Free forever for both volunteers and requesters'
    },
    {
      feature: 'Who Can Post',
      traditional: 'Typically limited strictly to large accredited NGOs',
      giveback: 'Both 501(c)(3) charities AND individual neighbors facing hardship'
    },
    {
      feature: 'Application Process',
      traditional: 'Multi-page paper packets, slow phone tag, weeks of delay',
      giveback: 'Streamlined online discovery and fast 1-click applications'
    },
    {
      feature: 'Service Hour Verification',
      traditional: 'Paper sign-in sheets that easily get misplaced',
      giveback: 'Automated profile logging & downloadable signed certificates'
    },
    {
      feature: 'Account Flexibility',
      traditional: 'Separate accounts for organizers vs volunteers',
      giveback: 'One unified account to volunteer AND request support anytime'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-16">
      
      {/* 1. Breadcrumb & Hero Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium max-w-3xl mx-auto justify-center">
          <a 
            href="#/home" 
            onClick={(e) => { e.preventDefault(); handleNav('home'); }} 
            className="hover:text-blue-600 transition"
          >
            Home
          </a>
          <span>/</span>
          <span className="text-blue-700 font-bold">About Us</span>
        </div>

        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Driven by Purpose, Powered by Community</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            We Build the Bridge Between{' '}
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Goodwill & Community Need
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            GiveBack™ is an open community exchange platform where neighbors help neighbors. We empower passionate volunteers to discover vetted causes while giving local organizers and families a trusted voice to request support.
          </p>
        </div>
      </div>

      {/* 2. The Origin Story Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Our Origin Story</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            How Two 14-Year-Olds Saw a Simple Problem and Built a Movement
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              In communities everywhere, countless food pantries are understaffed, shelters struggle to find drivers, and elderly neighbors face hardship alone. At the exact same time, millions of high school students, university graduates, and caring adults actively search for meaningful ways to give back.
            </p>
            <p>
              The problem wasn’t a lack of compassion—it was <strong>friction</strong>. Outdated paper forms, fragmented social media posts, and cumbersome bureaucratic sign-up processes created unnecessary walls between goodwill and human need.
            </p>
            <p>
              Founders <strong>Ron Osmani (14)</strong> and <strong>Anik Ademi (14)</strong> set out to change that. They asked a simple question: <em>"Why shouldn’t volunteering and requesting help be as seamless, safe, and transparent as ordering groceries or booking a ride?"</em> That conviction sparked <strong>GiveBack™</strong>.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-700 font-semibold">
            <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zero Platform Fees</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span>100% Unified Accounts</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
              <span>Official Hours Certificates</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] sm:aspect-square">
            <img
              src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80"
              alt="Community Volunteers Gathering"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mb-1">
                <HeartHandshake className="w-4 h-4" />
                Community First
              </div>
              <p className="text-sm font-semibold leading-snug">
                "Small acts multiplied by thousands of compassionate people transform neighborhoods."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The Founders & Leadership */}
      <div className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Visionary Founders
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Meet the Founders of GiveBack™
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Pioneered by young innovators using modern technology to empower volunteers and uplift local communities worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {founders.map((founder, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                <div className="relative shrink-0">
                  <img
                    src={founder.avatar}
                    alt={founder.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-blue-500 shadow-md group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full border-2 border-white shadow">
                    Age {founder.age}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="font-extrabold text-xl text-slate-900">{founder.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                      Co-Founder
                    </span>
                  </div>
                  <p className="text-xs font-bold text-emerald-600">{founder.role}</p>
                  <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                    {founder.bio}
                  </p>
                </div>
              </div>

              {/* Founder Quote */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative">
                <Quote className="w-5 h-5 text-blue-300 absolute top-3 left-3 opacity-40" />
                <p className="text-xs text-slate-700 italic pl-6 leading-relaxed">
                  "{founder.quote}"
                </p>
              </div>

              {/* Focus Areas */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Focus Areas:</span>
                {founder.focus.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Our Core Values Grid */}
      <div className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            What Drives Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Our Core Principles
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            The foundation of everything we build, design, and protect across GiveBack™.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, i) => (
            <div
              key={i}
              className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-2xl ${val.bg} flex items-center justify-center`}>
                  {val.icon}
                </div>
                <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                  {val.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {val.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. How GiveBack Compares */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            The Modern Alternative
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How GiveBack™ Transforms Voluntary Service
          </h2>
          <p className="text-xs text-slate-500">
            See why community leaders and volunteers choose our modern platform over outdated systems.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-4">Feature</th>
                <th className="pb-3 px-4">Traditional Volunteering Systems</th>
                <th className="pb-3 px-4 text-emerald-700 font-extrabold">GiveBack™ Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisons.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">{row.feature}</td>
                  <td className="py-4 px-4 text-slate-500">{row.traditional}</td>
                  <td className="py-4 px-4 font-semibold text-emerald-700">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{row.giveback}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Safety & Trust Standard */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>GiveBack™ Safety & Trust Standard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Our Zero-Tolerance Commitment to Integrity & Safety
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Every volunteer and recipient deserves a safe, welcoming, and verified environment. We hold all organizers and participants to strict anti-discrimination, child safety, and mutual respect guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Identity Verification',
              desc: 'Email and phone checks to prevent fraudulent listings.'
            },
            {
              title: 'Tax-Exempt Checks',
              desc: 'Nonprofits cross-referenced with official 501(c)(3) records.'
            },
            {
              title: 'Mutual Protection',
              desc: 'Strict anti-harassment and child safety protocols.'
            },
            {
              title: '24/7 Rapid Resolution',
              desc: 'Incident reporting and active community moderation.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-xs text-white">{item.title}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Call to Action Banner */}
      <div className="bg-gradient-to-tr from-blue-700 via-blue-800 to-emerald-700 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Be Part of Something Bigger
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
            Join neighbors, students, and organizations uniting to make everyday life better in communities across the globe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => handleNav('explore')}
            className="w-full sm:w-auto h-11 px-6 bg-white hover:bg-slate-100 text-blue-900 font-bold text-xs sm:text-sm rounded-xl border border-transparent shadow-lg transition inline-flex items-center justify-center gap-2"
          >
            <span>Explore Volunteer Opportunities</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleNav('contact')}
            className="w-full sm:w-auto h-11 px-6 bg-blue-900/40 hover:bg-blue-900/60 border border-white/30 text-white font-bold text-xs sm:text-sm rounded-xl transition inline-flex items-center justify-center"
          >
            <span>Contact Our Team</span>
          </button>
        </div>
      </div>

    </div>
  );
};