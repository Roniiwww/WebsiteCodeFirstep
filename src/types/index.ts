export type UserRole = 'both' | 'volunteer' | 'organizer';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  role?: UserRole;
  bio?: string;
  location?: string;
  phone?: string;
  organizationName?: string;
  joinedDate: string;
  badges: string[];
  hoursLogged: number;
  credits?: number;
  skills: string[];
}

export type CauseCategory = 
  | 'Community & Social'
  | 'Animals & Wildlife'
  | 'Education & Tutoring'
  | 'Environment & Nature'
  | 'Hunger & Food Relief'
  | 'Health & Wellness'
  | 'Disaster & Crisis Aid'
  | 'Elderly & Senior Care'
  | 'Arts & Culture'
  | 'Technology & Digital Aid';

export type LocationType = 'in-person' | 'remote' | 'hybrid';

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  organizationLogo?: string;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  organizerType: 'Nonprofit' | 'Community Group' | 'Individual in Need' | 'School' | 'Healthcare';
  cause: CauseCategory;
  description: string;
  responsibilities: string[];
  requirements: string[];
  perks?: string[];
  locationType: LocationType;
  address?: string;
  city: string;
  state: string;
  country: string;
  lat?: number;
  lng?: number;
  isUrgent: boolean;
  isDirectRequest?: boolean;
  startDate: string;
  endDate?: string;
  commitmentHours: string;
  targetHours?: number;
  spotsNeeded: number;
  spotsFilled: number;
  skillsNeeded: string[];
  bannerImage: string;
  createdAt: string;
  status: 'open' | 'closed' | 'in-progress';
  contactPhone?: string;
}

export type ApplicationStatus = 'pending' | 'accepted' | 'declined';

export interface Application {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunityLocation: string;
  organizationName: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAvatar: string;
  coverNote: string;
  availableDays: string[];
  skillsOffered: string[];
  status: ApplicationStatus;
  appliedAt: string;
  loggedHours?: number;
  creditsAwarded?: number;
}

export interface GiftCardBrand {
  id: string;
  brand: string;
  category: 'Shopping' | 'Food & Coffee' | 'Entertainment' | 'Gaming' | 'Prepaid';
  description: string;
  denominations: number[];
  accentGradient: string;
  tagText: string;
  codePrefix: string;
}

export interface GiftCardRedemption {
  id: string;
  userId: string;
  giftCardId: string;
  brand: string;
  valueUsd: number;
  creditCost: number;
  claimCode: string;
  redeemedAt: string;
}

export interface DonationRecord {
  id: string;
  receiptNumber: string;
  userId?: string;
  donorName: string;
  donorEmail: string;
  isAnonymous: boolean;
  amountUsd: number;
  frequency: 'one-time' | 'monthly';
  cause: string;
  method: 'stripe-checkout' | 'bank-transfer' | 'foundation-grant';
  dedicationNote?: string;
  createdAt: string;
  emailedReceipt?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  organization?: string;
  impact: string;
}

export interface ImpactStory {
  id: string;
  title: string;
  author: string;
  date: string;
  image: string;
  category: CauseCategory;
  summary: string;
  fullStory: string;
  volunteersInvolved: number;
  hoursContributed: number;
}
