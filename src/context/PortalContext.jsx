import { createContext, useContext, useState, useEffect } from 'react';

const PortalContext = createContext(null);

export const PORTAL_MODES = {
  BRAND_CONNECT: 'brand-connect',
  REWARD_PROGRAM: 'reward-program',
};

export const PORTAL_CONFIG = {
  [PORTAL_MODES.BRAND_CONNECT]: {
    id: 'brand-connect',
    name: 'Brand Connect',
    navLabel: 'Brand Connect',
    badgeText: '✨ Brand Connect',
    tag: 'BRAND CONNECT',
    iconName: 'Sparkles',
    description: 'Direct creator partnerships, sponsored deliverables, and brand activations.',
    bannerTitle: 'Pulse — Creator Campaigns & Influencer Partnerships',
    bannerSubtitle: 'Direct brand activations, sponsored campaign deliverables, creator reach, and content engagement analytics.',
    campaignsLabel: 'Campaigns',
    primaryActionText: 'View All Campaigns',
    accentColor: '#6538ea',
    secondaryColor: '#f2edfc',
    metricLabels: {
      content: 'Deliverables Created',
      reach: 'Total Reach / Views',
      engagement: 'Creator Engagements',
      value: 'Brand Media Value',
    },
  },
  [PORTAL_MODES.REWARD_PROGRAM]: {
    id: 'reward-program',
    name: 'Reward Program',
    navLabel: 'Reward Program',
    badgeText: '🎁 Reward Program',
    tag: 'REWARD PROGRAM',
    iconName: 'Gift',
    description: 'Catalog affiliate links, performance milestone rewards, and gross sales attribution.',
    bannerTitle: 'Pulse — Creator Performance & Revenue Portal',
    bannerSubtitle: 'Real-time catalog discovery, creator content analytics, and sales driven across all active reward programs.',
    campaignsLabel: 'Reward Programs',
    primaryActionText: 'View All Programs',
    accentColor: '#059669',
    secondaryColor: '#e8fbf3',
    metricLabels: {
      content: 'Total Content Created',
      reach: 'Total Views',
      engagement: 'Total Clicks',
      value: 'Total Sales Driven',
    },
  },
};

export function PortalProvider({ children }) {
  const [portal, setPortalState] = useState(() => {
    const saved = localStorage.getItem('hp_portal_mode');
    if (saved && (saved === PORTAL_MODES.BRAND_CONNECT || saved === PORTAL_MODES.REWARD_PROGRAM)) {
      return saved;
    }
    // Default to Brand Connect as requested
    return PORTAL_MODES.BRAND_CONNECT;
  });

  const setPortal = (mode) => {
    if (mode === PORTAL_MODES.BRAND_CONNECT || mode === PORTAL_MODES.REWARD_PROGRAM) {
      setPortalState(mode);
      localStorage.setItem('hp_portal_mode', mode);
    }
  };

  const togglePortal = () => {
    const next = portal === PORTAL_MODES.BRAND_CONNECT
      ? PORTAL_MODES.REWARD_PROGRAM
      : PORTAL_MODES.BRAND_CONNECT;
    setPortal(next);
  };

  const currentConfig = PORTAL_CONFIG[portal];
  const isBrandConnect = portal === PORTAL_MODES.BRAND_CONNECT;
  const isRewardProgram = portal === PORTAL_MODES.REWARD_PROGRAM;

  return (
    <PortalContext.Provider
      value={{
        portal,
        setPortal,
        togglePortal,
        currentConfig,
        isBrandConnect,
        isRewardProgram,
        PORTAL_MODES,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
}
