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
const CACHED_STATS_KEY = 'vibe_cached_visits_v2';

// Subscribers for real-time UI updates across the entire app
type Listener = (stats: VisitStats) => void;
const listeners = new Set<Listener>();

// Try loading cached stats from localStorage so UI shows current figures immediately without flash
function getInitialStats(): VisitStats {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CACHED_STATS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.totalVisits === 'number') {
          return {
            ...parsed,
            isCreator: isCreatorMode(),
          };
        }
      }
    } catch {
      // Ignore
    }
  }
  return {
    totalVisits: 1422,
    uniqueVisitors: 982,
    todayVisits: 43,
    creatorSessionsExcluded: 25,
    isCreator: isCreatorMode(),
  };
}

let currentStats: VisitStats = getInitialStats();

/**
 * Checks if the current browser session has creator mode enabled.
 */
export function isCreatorMode(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Check URL parameters for explicit intent
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
      id = 'vis_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch (_e) {
    return 'fallback_id_' + Date.now();
  }
}

function persistCache(stats: VisitStats) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CACHED_STATS_KEY, JSON.stringify(stats));
    } catch (_e) {
      // Ignore
    }
  }
}

/**
 * Record a visit to the backend
 */
export async function recordVisit(forceRefresh = false): Promise<VisitStats> {
  const isCreator = isCreatorMode();
  const visitorId = getVisitorId();

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
        force: forceRefresh,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      currentStats = {
        totalVisits: typeof data.totalVisits === 'number' ? data.totalVisits : currentStats.totalVisits,
        uniqueVisitors: typeof data.uniqueVisitors === 'number' ? data.uniqueVisitors : currentStats.uniqueVisitors,
        todayVisits: typeof data.todayVisits === 'number' ? data.todayVisits : currentStats.todayVisits,
        creatorSessionsExcluded: typeof data.creatorSessionsExcluded === 'number' ? data.creatorSessionsExcluded : currentStats.creatorSessionsExcluded,
        lastVisitTimestamp: data.lastVisitTimestamp,
        isCreator,
        wasCounted: data.wasCounted,
        reason: data.reason,
      };
      persistCache(currentStats);
      notifyListeners();
      return currentStats;
    }
  } catch (_err) {
    // Backend unreachable or offline
  }

  currentStats = {
    ...currentStats,
    isCreator,
  };
  notifyListeners();
  return currentStats;
}

/**
 * Force +1 immediate test visit (bypasses all debounce/creator filters)
 */
export async function testIncrementVisit(): Promise<VisitStats> {
  const isCreator = isCreatorMode();
  try {
    const res = await fetch('/api/visits/test-increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      currentStats = {
        totalVisits: typeof data.totalVisits === 'number' ? data.totalVisits : currentStats.totalVisits + 1,
        uniqueVisitors: typeof data.uniqueVisitors === 'number' ? data.uniqueVisitors : currentStats.uniqueVisitors + 1,
        todayVisits: typeof data.todayVisits === 'number' ? data.todayVisits : currentStats.todayVisits + 1,
        creatorSessionsExcluded: typeof data.creatorSessionsExcluded === 'number' ? data.creatorSessionsExcluded : currentStats.creatorSessionsExcluded,
        lastVisitTimestamp: data.lastVisitTimestamp || new Date().toISOString(),
        isCreator,
        wasCounted: true,
      };
      persistCache(currentStats);
      notifyListeners();
      return currentStats;
    }
  } catch (_e) {
    // Offline fallback
  }

  currentStats = {
    ...currentStats,
    totalVisits: currentStats.totalVisits + 1,
    todayVisits: currentStats.todayVisits + 1,
    uniqueVisitors: currentStats.uniqueVisitors + 1,
    lastVisitTimestamp: new Date().toISOString(),
    isCreator,
    wasCounted: true,
  };
  persistCache(currentStats);
  notifyListeners();
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
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      currentStats = {
        totalVisits: typeof data.totalVisits === 'number' ? data.totalVisits : currentStats.totalVisits,
        uniqueVisitors: typeof data.uniqueVisitors === 'number' ? data.uniqueVisitors : currentStats.uniqueVisitors,
        todayVisits: typeof data.todayVisits === 'number' ? data.todayVisits : currentStats.todayVisits,
        creatorSessionsExcluded: typeof data.creatorSessionsExcluded === 'number' ? data.creatorSessionsExcluded : currentStats.creatorSessionsExcluded,
        lastVisitTimestamp: data.lastVisitTimestamp,
        isCreator,
      };
      persistCache(currentStats);
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

// Background auto-poller every 25 seconds so live counter updates automatically when other visitors enter
if (typeof window !== 'undefined') {
  setInterval(() => {
    getVisitStats();
  }, 25000);
}
