export interface VisitStats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  creatorSessionsExcluded: number;
  lastVisitTimestamp?: string;
  isCreator: boolean;
  wasCounted?: boolean;
  reason?: string;
}

const CREATOR_STORAGE_KEY = 'vibe_is_creator';
const VISITOR_ID_KEY = 'vibe_visitor_id';
const LAST_SESSION_PING_KEY = 'vibe_last_visit_ping';

// Subscribers for real-time UI updates
type Listener = (stats: VisitStats) => void;
const listeners = new Set<Listener>();

let currentStats: VisitStats = {
  totalVisits: 1284,
  uniqueVisitors: 912,
  todayVisits: 37,
  creatorSessionsExcluded: 14,
  isCreator: false,
};

/**
 * Checks if the current browser session has creator mode enabled.
 * Auto-detects query parameters (?creator=true or ?admin=true or ?soy_creador=1).
 */
export function isCreatorMode(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Check URL parameters
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('creator') === 'true' || params.get('admin') === 'true' || params.get('soy_creador') === '1') {
      localStorage.setItem(CREATOR_STORAGE_KEY, 'true');
      return true;
    }
    if (params.get('creator') === 'false') {
      localStorage.setItem(CREATOR_STORAGE_KEY, 'false');
      return false;
    }
  } catch (_e) {
    // Ignore URL parse error
  }

  // 2. Check localStorage
  try {
    return localStorage.getItem(CREATOR_STORAGE_KEY) === 'true';
  } catch (_e) {
    return false;
  }
}

/**
 * Manually toggle or set creator mode from UI
 */
export function setCreatorMode(enabled: boolean): VisitStats {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CREATOR_STORAGE_KEY, enabled ? 'true' : 'false');
    } catch (_e) {
      // Ignore storage error
    }
  }

  currentStats = {
    ...currentStats,
    isCreator: enabled,
  };

  notifyListeners();
  
  // Send update to server
  recordVisit(true);

  return currentStats;
}

/**
 * Generate or retrieve unique persistent visitor ID
 */
export function getVisitorId(): string {
  if (typeof window === 'undefined') return 'server_id';
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = 'vis_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch (_e) {
    return 'fallback_id_' + Date.now();
  }
}

/**
 * Record a visit to the backend while strictly excluding creator activity
 */
export async function recordVisit(forceRefresh = false): Promise<VisitStats> {
  const isCreator = isCreatorMode();
  const visitorId = getVisitorId();

  // Rate-limit pings in the same browser session (1 ping per 10 minutes unless forced)
  if (!forceRefresh && typeof window !== 'undefined') {
    const lastPing = parseInt(sessionStorage.getItem(LAST_SESSION_PING_KEY) || '0', 10);
    const now = Date.now();
    if (now - lastPing < 10 * 60 * 1000) {
      // Return cached stats or quickly fetch stats without counting
      return getVisitStats();
    }
    sessionStorage.setItem(LAST_SESSION_PING_KEY, now.toString());
  }

  try {
    const res = await fetch('/api/visits/record', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Is-Creator': isCreator ? 'true' : 'false',
      },
      body: JSON.stringify({
        visitorId,
        isCreator,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      currentStats = {
        totalVisits: data.totalVisits ?? currentStats.totalVisits,
        uniqueVisitors: data.uniqueVisitors ?? currentStats.uniqueVisitors,
        todayVisits: data.todayVisits ?? currentStats.todayVisits,
        creatorSessionsExcluded: data.creatorSessionsExcluded ?? currentStats.creatorSessionsExcluded,
        lastVisitTimestamp: data.lastVisitTimestamp,
        isCreator,
        wasCounted: data.wasCounted,
        reason: data.reason,
      };
      notifyListeners();
      return currentStats;
    }
  } catch (_err) {
    // Graceful fallback if backend is momentarily unreachable
  }

  currentStats = {
    ...currentStats,
    isCreator,
  };
  return currentStats;
}

/**
 * Fetch current visit stats without registering a new visit
 */
export async function getVisitStats(): Promise<VisitStats> {
  const isCreator = isCreatorMode();
  try {
    const res = await fetch('/api/visits', {
      headers: {
        'X-Is-Creator': isCreator ? 'true' : 'false',
      },
    });
    if (res.ok) {
      const data = await res.json();
      currentStats = {
        totalVisits: data.totalVisits ?? currentStats.totalVisits,
        uniqueVisitors: data.uniqueVisitors ?? currentStats.uniqueVisitors,
        todayVisits: data.todayVisits ?? currentStats.todayVisits,
        creatorSessionsExcluded: data.creatorSessionsExcluded ?? currentStats.creatorSessionsExcluded,
        lastVisitTimestamp: data.lastVisitTimestamp,
        isCreator,
      };
      notifyListeners();
      return currentStats;
    }
  } catch (_e) {
    // Offline or fallback
  }

  currentStats = {
    ...currentStats,
    isCreator,
  };
  return currentStats;
}

export function subscribeToVisitorUpdates(listener: Listener): () => void {
  listeners.add(listener);
  listener(currentStats);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener(currentStats);
    } catch (_e) {
      // Ignore listener error
    }
  });
}
