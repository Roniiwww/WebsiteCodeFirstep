import React, { createContext, useContext, useState, useEffect } from 'react';
import { Opportunity, Application, ApplicationStatus } from '../types';
import { INITIAL_OPPORTUNITIES } from '../data/mockData';
import { useAuth } from './AuthContext';
import { syncOpportunityToFirestore } from '../services/firebase';
import { getCityCoordinates } from '../utils/geoUtils';

export const CREDITS_PER_HOUR = 10;
export const DEFAULT_TARGET_HOURS = 5;

export function calculateEarnedCredits(loggedHours: number, targetHours: number): number {
  if (loggedHours <= 0 || targetHours <= 0 || loggedHours < targetHours) {
    return 0;
  }
  return Math.round(loggedHours * CREDITS_PER_HOUR);
}

interface OpportunitiesContextType {
  opportunities: Opportunity[];
  applications: Application[];
  savedOpportunityIds: string[];
  addOpportunity: (data: Omit<Opportunity, 'id' | 'createdAt' | 'spotsFilled' | 'status'>) => Opportunity;
  applyForOpportunity: (
    opp: Opportunity,
    coverNote: string,
    phone: string,
    availableDays: string[],
    skills: string[]
  ) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => void;
  setVolunteerHours: (applicationId: string, nextHours: number) => void;
  updateOpportunityTargetHours: (opportunityId: string, nextTargetHours: number) => void;
  toggleSaveOpportunity: (opportunityId: string) => void;
  deleteOpportunity: (opportunityId: string) => void;
  getOpportunityById: (id: string) => Opportunity | undefined;
}

const OPPS_KEY = 'giveback_opportunities_v1';
const APPS_KEY = 'giveback_applications_v1';
const SAVED_KEY = 'giveback_saved_v1';
const LEGACY_OPPS_KEY = 'kindredpulse_opportunities_v1';
const LEGACY_APPS_KEY = 'kindredpulse_applications_v1';
const LEGACY_SAVED_KEY = 'kindredpulse_saved_v1';

const OpportunitiesContext = createContext<OpportunitiesContextType | undefined>(undefined);

export const OpportunitiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, adjustUserProgress } = useAuth();

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    try {
      const saved = localStorage.getItem(OPPS_KEY) || localStorage.getItem(LEGACY_OPPS_KEY);
      if (saved) {
        const parsed: Opportunity[] = JSON.parse(saved);
        // Preserve any custom opportunities created by the user
        const initialIds = new Set(INITIAL_OPPORTUNITIES.map((io) => io.id));
        const userCreated = parsed.filter((p) => !initialIds.has(p.id));
        return [...userCreated, ...INITIAL_OPPORTUNITIES];
      }
      return INITIAL_OPPORTUNITIES;
    } catch {
      return INITIAL_OPPORTUNITIES;
    }
  });

  const [applications, setApplications] = useState<Application[]>(() => {
    try {
      const saved = localStorage.getItem(APPS_KEY) || localStorage.getItem(LEGACY_APPS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SAVED_KEY) || localStorage.getItem(LEGACY_SAVED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(OPPS_KEY, JSON.stringify(opportunities));
  }, [opportunities]);

  useEffect(() => {
    localStorage.setItem(APPS_KEY, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedOpportunityIds));
  }, [savedOpportunityIds]);

  const addOpportunity = (data: Omit<Opportunity, 'id' | 'createdAt' | 'spotsFilled' | 'status'>): Opportunity => {
    const fallbackCoords = getCityCoordinates(data.city);

    const newOpportunity: Opportunity = {
      ...data,
      lat: data.lat || fallbackCoords.lat,
      lng: data.lng || fallbackCoords.lng,
      targetHours: Math.max(0.5, Number(data.targetHours) || DEFAULT_TARGET_HOURS),
      id: `opp-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      spotsFilled: 0,
      status: 'open'
    };

    setOpportunities((prev) => [newOpportunity, ...prev]);
    syncOpportunityToFirestore(newOpportunity).catch((err) => console.warn('[Firebase Opp Sync]', err));
    return newOpportunity;
  };

  const applyForOpportunity = async (
    opp: Opportunity,
    coverNote: string,
    phone: string,
    availableDays: string[],
    skills: string[]
  ) => {
    if (!user) throw new Error('Must be logged in to apply');

    const newApp: Application = {
      id: `app-${Date.now()}`,
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      opportunityLocation: opp.locationType === 'remote' ? 'Remote' : `${opp.city}, ${opp.state}`,
      organizationName: opp.organization,
      applicantId: user.id,
      applicantName: user.name,
      applicantEmail: user.email,
      applicantPhone: phone || user.phone || 'N/A',
      applicantAvatar: user.avatar,
      coverNote,
      availableDays,
      skillsOffered: skills,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      loggedHours: 0,
      creditsAwarded: 0
    };

    setApplications((prev) => [newApp, ...prev]);

    // Update spots filled
    setOpportunities((prev) =>
      prev.map((item) =>
        item.id === opp.id ? { ...item, spotsFilled: Math.min(item.spotsNeeded, item.spotsFilled + 1) } : item
      )
    );
  };

  const updateApplicationStatus = (applicationId: string, status: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
    );
  };

  const setVolunteerHours = (applicationId: string, nextHoursRaw: number) => {
    const targetApp = applications.find((a) => a.id === applicationId);
    if (!targetApp) return;

    const nextHours = Math.max(0, Math.round(nextHoursRaw * 10) / 10);
    const parentOpp = opportunities.find((o) => o.id === targetApp.opportunityId);
    const targetHours = parentOpp?.targetHours ?? DEFAULT_TARGET_HOURS;

    const prevHours = targetApp.loggedHours ?? 0;
    const prevCredits = targetApp.creditsAwarded ?? 0;
    const nextCredits = calculateEarnedCredits(nextHours, targetHours);

    const hoursDelta = Math.round((nextHours - prevHours) * 10) / 10;
    const creditsDelta = nextCredits - prevCredits;

    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? { ...app, loggedHours: nextHours, creditsAwarded: nextCredits }
          : app
      )
    );

    adjustUserProgress(targetApp.applicantId, hoursDelta, creditsDelta);
  };

  const updateOpportunityTargetHours = (opportunityId: string, nextTargetRaw: number) => {
    const nextTarget = Math.max(0.5, Math.round(nextTargetRaw * 10) / 10);

    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id !== opportunityId) return opp;
        const updated = { ...opp, targetHours: nextTarget };
        syncOpportunityToFirestore(updated).catch((err) => console.warn('[Firebase Opp Sync]', err));
        return updated;
      })
    );

    const pendingDeltas: { userId: string; creditsDelta: number }[] = [];

    setApplications((prev) =>
      prev.map((app) => {
        if (app.opportunityId !== opportunityId || app.status !== 'accepted') return app;
        const hours = app.loggedHours ?? 0;
        const prevCredits = app.creditsAwarded ?? 0;
        const nextCredits = calculateEarnedCredits(hours, nextTarget);
        const creditsDelta = nextCredits - prevCredits;
        if (creditsDelta !== 0) {
          pendingDeltas.push({ userId: app.applicantId, creditsDelta });
        }
        return { ...app, creditsAwarded: nextCredits };
      })
    );

    pendingDeltas.forEach(({ userId, creditsDelta }) => {
      adjustUserProgress(userId, 0, creditsDelta);
    });
  };

  const toggleSaveOpportunity = (opportunityId: string) => {
    setSavedOpportunityIds((prev) =>
      prev.includes(opportunityId) ? prev.filter((id) => id !== opportunityId) : [...prev, opportunityId]
    );
  };

  const deleteOpportunity = (opportunityId: string) => {
    setOpportunities((prev) => prev.filter((o) => o.id !== opportunityId));
    setApplications((prev) => prev.filter((a) => a.opportunityId !== opportunityId));
  };

  const getOpportunityById = (id: string) => {
    return opportunities.find((o) => o.id === id);
  };

  return (
    <OpportunitiesContext.Provider
      value={{
        opportunities,
        applications,
        savedOpportunityIds,
        addOpportunity,
        applyForOpportunity,
        updateApplicationStatus,
        setVolunteerHours,
        updateOpportunityTargetHours,
        toggleSaveOpportunity,
        deleteOpportunity,
        getOpportunityById
      }}
    >
      {children}
    </OpportunitiesContext.Provider>
  );
};

export const useOpportunities = () => {
  const context = useContext(OpportunitiesContext);
  if (!context) {
    throw new Error('useOpportunities must be used within an OpportunitiesProvider');
  }
  return context;
};
