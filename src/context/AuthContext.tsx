import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { syncUserToFirestore } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginWithEmail: (email: string, password?: string) => Promise<void>;
  registerWithEmail: (data: {
    name: string;
    email: string;
    password?: string;
    role?: UserRole;
    organizationName?: string;
    location?: string;
    phone?: string;
    skills?: string[];
  }) => Promise<void>;
  sendPasswordResetCode: (
    email: string,
    credentials?: { smtpUser?: string; smtpPass?: string }
  ) => Promise<{
    code: string;
    email: string;
    emailSent: boolean;
    needsConfig?: boolean;
    message?: string;
  }>;
  verifyAndResetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  adjustUserProgress: (userId: string, hoursDelta: number, creditsDelta: number) => void;
  spendCredits: (creditCost: number) => void;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup' | 'forgot';
  openAuthModal: (mode?: 'signin' | 'signup' | 'forgot') => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: 'signin' | 'signup' | 'forgot') => void;
}

const ACTIVE_SESSION_KEY = 'giveback_active_user_v1';
const USERS_DB_KEY = 'giveback_users_db_v1';
const LEGACY_SESSION_KEY = 'kindredpulse_active_user_v1';
const LEGACY_USERS_DB_KEY = 'kindredpulse_users_db_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get all registered users from localStorage
const getRegisteredUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY) || localStorage.getItem(LEGACY_USERS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Helper to save all registered users
const saveRegisteredUsers = (users: User[]) => {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_SESSION_KEY) || localStorage.getItem(LEGACY_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.location || parsed.location === 'United States' || parsed.location === 'Local Community' || parsed.location.includes('United States')) {
          parsed.location = 'Karposh, Skopje, North Macedonia';
        }
        if (typeof parsed.credits !== 'number') {
          parsed.credits = 0;
        }
        if (typeof parsed.hoursLogged !== 'number') {
          parsed.hoursLogged = 0;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  useEffect(() => {
    if (user) {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }, [user]);

  // Real user registration
  const registerWithEmail = async (data: {
    name: string;
    email: string;
    password?: string;
    role?: UserRole;
    organizationName?: string;
    location?: string;
    phone?: string;
    skills?: string[];
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.name.trim();

    if (!cleanEmail || !cleanName) {
      throw new Error('Please provide both your name and email.');
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const existingUsers = getRegisteredUsers();
    const alreadyExists = existingUsers.some(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (alreadyExists) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: data.password,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
      role: 'both', // Unified account: both volunteer & request help
      organizationName: data.organizationName?.trim() || undefined,
      location: data.location?.trim() || 'Karposh, Skopje, North Macedonia',
      phone: data.phone?.trim() || undefined,
      bio: 'Active community member empowered to volunteer and post community needs.',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      badges: ['Verified Community Member'],
      hoursLogged: 0,
      credits: 0,
      skills: data.skills && data.skills.length > 0 ? data.skills : ['Volunteer', 'Community Organizer']
    };

    saveRegisteredUsers([...existingUsers, newUser]);
    setUser(newUser);
    syncUserToFirestore(newUser).catch((err) => console.warn('[Firebase Sync]', err));
    setIsAuthModalOpen(false);
  };

  // Real user login with email & password
  const loginWithEmail = async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }

    const existingUsers = getRegisteredUsers();
    const foundUser = existingUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!foundUser) {
      throw new Error('No account found with this email. Please click "Sign Up" to create an account.');
    }

    if (foundUser.password && (!password || foundUser.password !== password)) {
      throw new Error('Incorrect password. Please verify your credentials and try again.');
    }

    const normalizedUser: User = {
      ...foundUser,
      hoursLogged: foundUser.hoursLogged ?? 0,
      credits: foundUser.credits ?? 0
    };
    setUser(normalizedUser);
    setIsAuthModalOpen(false);
  };

  // Password reset request - dispatches real email via Nodemailer
  const sendPasswordResetCode = async (
    email: string,
    credentials?: { smtpUser?: string; smtpPass?: string }
  ): Promise<{
    code: string;
    email: string;
    emailSent: boolean;
    needsConfig?: boolean;
    message?: string;
  }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    const existingUsers = getRegisteredUsers();
    const found = existingUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      throw new Error('No GiveBack account found with this email. Please verify your address or create an account.');
    }

    // Generate secure 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const resetEntry = {
      email: cleanEmail,
      code,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
    };

    localStorage.setItem(`giveback_reset_${cleanEmail}`, JSON.stringify(resetEntry));

    // Retrieve saved SMTP user/pass if present in credentials or localStorage
    const savedUser = credentials?.smtpUser || localStorage.getItem('giveback_smtp_user') || '';
    const savedPass = credentials?.smtpPass || localStorage.getItem('giveback_smtp_pass') || '';

    try {
      const response = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          code,
          smtpUser: savedUser,
          smtpPass: savedPass
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
          return {
            code,
            email: cleanEmail,
            emailSent: false,
            needsConfig: true,
            message: data.error
          };
        }
        throw new Error(data.error || 'Failed to dispatch verification email');
      }

      return {
        code,
        email: cleanEmail,
        emailSent: true,
        message: data.message
      };
    } catch (err: any) {
      if (err.message && err.message.includes('SMTP credentials not configured')) {
        return {
          code,
          email: cleanEmail,
          emailSent: false,
          needsConfig: true,
          message: err.message
        };
      }
      throw err;
    }
  };

  // Verify code and reset password
  const verifyAndResetPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim().replace(/\s+/g, '');

    if (!cleanCode || cleanCode.length !== 6) {
      throw new Error('Please enter the 6-digit verification code sent to your email.');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const raw = localStorage.getItem(`giveback_reset_${cleanEmail}`);
    if (!raw) {
      throw new Error('No active reset request found. Please request a new code.');
    }

    const resetData = JSON.parse(raw);
    if (resetData.code !== cleanCode) {
      throw new Error('Invalid verification code. Please check your email and try again.');
    }

    if (Date.now() > resetData.expiresAt) {
      localStorage.removeItem(`giveback_reset_${cleanEmail}`);
      throw new Error('Verification code has expired. Please request a new code.');
    }

    // Update user password
    const existingUsers = getRegisteredUsers();
    const userIndex = existingUsers.findIndex((u) => u.email.toLowerCase() === cleanEmail);

    if (userIndex === -1) {
      throw new Error('User account not found.');
    }

    existingUsers[userIndex].password = newPassword;
    saveRegisteredUsers(existingUsers);
    localStorage.removeItem(`giveback_reset_${cleanEmail}`);

    // Automatically log the user in with their updated credentials
    setUser(existingUsers[userIndex]);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);

    const users = getRegisteredUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = updated;
      saveRegisteredUsers(users);
    }
    syncUserToFirestore(updated).catch((err) => console.warn('[Firebase Sync]', err));
  };

  const adjustUserProgress = (userId: string, hoursDelta: number, creditsDelta: number) => {
    if (!hoursDelta && !creditsDelta) return;

    const users = getRegisteredUsers();
    let updatedTarget: User | null = null;
    const nextUsers = users.map((u) => {
      if (u.id !== userId) return u;
      const nextHours = Math.max(0, Math.round(((u.hoursLogged ?? 0) + hoursDelta) * 10) / 10);
      const nextCredits = Math.max(0, Math.round((u.credits ?? 0) + creditsDelta));
      updatedTarget = { ...u, hoursLogged: nextHours, credits: nextCredits };
      return updatedTarget;
    });
    saveRegisteredUsers(nextUsers);

    setUser((prev) => {
      if (!prev || prev.id !== userId) return prev;
      if (updatedTarget) return updatedTarget;
      const nextHours = Math.max(0, Math.round(((prev.hoursLogged ?? 0) + hoursDelta) * 10) / 10);
      const nextCredits = Math.max(0, Math.round((prev.credits ?? 0) + creditsDelta));
      return { ...prev, hoursLogged: nextHours, credits: nextCredits };
    });
  };

  const spendCredits = (creditCost: number) => {
    if (!user) {
      throw new Error('Please sign in to redeem gift cards.');
    }
    const currentCredits = user.credits ?? 0;
    if (creditCost <= 0 || currentCredits < creditCost) {
      throw new Error('Not enough credits for this gift card.');
    }
    const nextCredits = currentCredits - creditCost;
    updateUser({ credits: nextCredits });
  };

  const openAuthModal = (mode: 'signin' | 'signup' | 'forgot' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithEmail,
        registerWithEmail,
        sendPasswordResetCode,
        verifyAndResetPassword,
        logout,
        updateUser,
        adjustUserProgress,
        spendCredits,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
