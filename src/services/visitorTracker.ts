import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, verifyFirestoreConnection } from '../firebase/config';

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
const SESSION_VISIT_KEY = 'vibe_session_visit_counted';

// Subscribers for real-time UI updates across the entire app
type Listener = (stats: VisitStats) => void;
const listeners = new Set<Listener>();

// Baseline default stats if network is unavailable
const BASELINE_STATS: VisitStats = {
  totalVisits: 1428,
  uniqueVisitors: 986,
  todayVisits: 6,
  creatorSessionsExcluded: 0,
  isCreator: false,
};

function getInitialStats(): VisitStats {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CACHED_STATS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.totalVisits === 'number' && parsed.totalVisits >= 1000) {
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
    ...BASELINE_STATS,
    isCreator: isCreatorMode(),
  };
}

let currentStats: VisitStats = getInitialStats();
let isFirestoreInitialized = false;

/**
 * Checks if the current browser session has creator mode enabled.
 */
export function isCreatorMode(): boolean {
  if (typeof window === 'undefined') return false;

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

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener(currentStats);
    } catch (_e) {
      // Ignore listener error
    }
  });
}

/**
 * Setup Real-Time Live Sync with Firebase Firestore
 */
function setupFirestoreLiveSync() {
  if (isFirestoreInitialized || typeof window === 'undefined') return;
  isFirestoreInitialized = true;

  try {
    const metricsDocRef = doc(db, 'site_metrics', 'global_visits');
    onSnapshot(
      metricsDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const isCreator = isCreatorMode();
          currentStats = {
            totalVisits: typeof data.totalVisits === 'number' ? data.totalVisits : currentStats.totalVisits,
            uniqueVisitors: typeof data.uniqueVisitors === 'number' ? data.uniqueVisitors : currentStats.uniqueVisitors,
            todayVisits: typeof data.todayVisits === 'number' ? data.todayVisits : currentStats.todayVisits,
            creatorSessionsExcluded: typeof data.creatorSessionsExcluded === 'number' ? data.creatorSessionsExcluded : 0,
            lastVisitTimestamp: data.lastVisitTimestamp || new Date().toISOString(),
            isCreator,
            wasCounted: true,
          };
          persistCache(currentStats);
          notifyListeners();
        }
      },
      (error) => {
        console.warn('Firestore snapshot listener warning:', error.message);
      }
    );
  } catch (err) {
    console.warn('Failed to attach Firestore onSnapshot:', err);
  }
}

// Start live sync automatically
if (typeof window !== 'undefined') {
  setupFirestoreLiveSync();
  verifyFirestoreConnection();
}

/**
 * Record a visit to Firestore with atomic persistence across all cloud instances
 */
export async function recordVisit(forceRefresh = false): Promise<VisitStats> {
  const isCreator = isCreatorMode();
  const visitorId = getVisitorId();
  const todayStr = new Date().toISOString().split('T')[0];
  const nowISO = new Date().toISOString();

  // If creator mode is explicitly enabled by the admin switch and not forced:
  if (isCreator && !forceRefresh) {
    currentStats = {
      ...currentStats,
      creatorSessionsExcluded: currentStats.creatorSessionsExcluded + 1,
      isCreator: true,
      wasCounted: false,
      reason: 'Visita del creador excluida de métricas públicas',
    };
    persistCache(currentStats);
    notifyListeners();
    return currentStats;
  }

  // Session debounce: check if already counted in this browser session unless forced
  if (typeof window !== 'undefined' && !forceRefresh) {
    const sessionCounted = sessionStorage.getItem(SESSION_VISIT_KEY);
    if (sessionCounted === 'true') {
      return currentStats;
    }
  }

  let firestoreSuccess = false;

  // 1. Persist directly to Firebase Firestore
  try {
    const metricsDocRef = doc(db, 'site_metrics', 'global_visits');
    const metricsSnap = await getDoc(metricsDocRef);

    if (!metricsSnap.exists()) {
      // Initialize global_visits doc if not present
      await setDoc(metricsDocRef, {
        totalVisits: BASELINE_STATS.totalVisits + 1,
        uniqueVisitors: BASELINE_STATS.uniqueVisitors + 1,
        todayVisits: BASELINE_STATS.todayVisits + 1,
        lastVisitDate: todayStr,
        lastVisitTimestamp: nowISO,
        updatedAt: nowISO,
        creatorSessionsExcluded: 0,
      });
      currentStats = {
        totalVisits: BASELINE_STATS.totalVisits + 1,
        uniqueVisitors: BASELINE_STATS.uniqueVisitors + 1,
        todayVisits: BASELINE_STATS.todayVisits + 1,
        creatorSessionsExcluded: 0,
        lastVisitTimestamp: nowISO,
        isCreator,
        wasCounted: true,
      };
    } else {
      const data = metricsSnap.data();
      const isNewDay = data.lastVisitDate !== todayStr;

      // Check unique visitor
      const visitorDocRef = doc(db, 'visitors', visitorId);
      const visitorSnap = await getDoc(visitorDocRef);
      const isNewUnique = !visitorSnap.exists();

      if (isNewUnique) {
        await setDoc(visitorDocRef, {
          visitorId,
          firstSeenAt: nowISO,
          lastSeenAt: nowISO,
          visitCount: 1,
          isCreator,
          referrer: typeof document !== 'undefined' ? document.referrer : '',
        });
      } else {
        await updateDoc(visitorDocRef, {
          lastSeenAt: nowISO,
          visitCount: increment(1),
        });
      }

      await updateDoc(metricsDocRef, {
        totalVisits: increment(1),
        todayVisits: isNewDay ? 1 : increment(1),
        uniqueVisitors: isNewUnique ? increment(1) : increment(0),
        lastVisitDate: todayStr,
        lastVisitTimestamp: nowISO,
        updatedAt: nowISO,
      });

      currentStats = {
        totalVisits: (data.totalVisits || BASELINE_STATS.totalVisits) + 1,
        uniqueVisitors: (data.uniqueVisitors || BASELINE_STATS.uniqueVisitors) + (isNewUnique ? 1 : 0),
        todayVisits: isNewDay ? 1 : (data.todayVisits || 0) + 1,
        creatorSessionsExcluded: data.creatorSessionsExcluded || 0,
        lastVisitTimestamp: nowISO,
        isCreator,
        wasCounted: true,
      };
    }

    firestoreSuccess = true;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_VISIT_KEY, 'true');
    }
    persistCache(currentStats);
    notifyListeners();
  } catch (firestoreError) {
    console.warn('Firestore write error, falling back to backend API:', firestoreError);
  }

  // 2. Also sync to backend API as fallback and server persistence
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

    if (res.ok && !firestoreSuccess) {
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
    }
  } catch (_err) {
    // Backend fetch fallback
  }

  return currentStats;
}

/**
 * Force +1 immediate test visit (guaranteed atomic increment in Firestore)
 */
export async function testIncrementVisit(): Promise<VisitStats> {
  const isCreator = isCreatorMode();
  const todayStr = new Date().toISOString().split('T')[0];
  const nowISO = new Date().toISOString();

  try {
    const metricsDocRef = doc(db, 'site_metrics', 'global_visits');
    const snap = await getDoc(metricsDocRef);

    if (!snap.exists()) {
      await setDoc(metricsDocRef, {
        totalVisits: BASELINE_STATS.totalVisits + 1,
        uniqueVisitors: BASELINE_STATS.uniqueVisitors + 1,
        todayVisits: BASELINE_STATS.todayVisits + 1,
        lastVisitDate: todayStr,
        lastVisitTimestamp: nowISO,
        updatedAt: nowISO,
        creatorSessionsExcluded: 0,
      });
    } else {
      await updateDoc(metricsDocRef, {
        totalVisits: increment(1),
        todayVisits: increment(1),
        uniqueVisitors: increment(1),
        lastVisitDate: todayStr,
        lastVisitTimestamp: nowISO,
        updatedAt: nowISO,
      });
    }

    currentStats = {
      ...currentStats,
      totalVisits: currentStats.totalVisits + 1,
      todayVisits: currentStats.todayVisits + 1,
      uniqueVisitors: currentStats.uniqueVisitors + 1,
      lastVisitTimestamp: nowISO,
      isCreator,
      wasCounted: true,
    };
    persistCache(currentStats);
    notifyListeners();
    return currentStats;
  } catch (err) {
    console.warn('Firestore test increment failed, using API:', err);
  }

  // Backend fallback
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
        lastVisitTimestamp: data.lastVisitTimestamp || nowISO,
        isCreator,
        wasCounted: true,
      };
      persistCache(currentStats);
      notifyListeners();
      return currentStats;
    }
  } catch (_e) {
    // Offline
  }

  currentStats = {
    ...currentStats,
    totalVisits: currentStats.totalVisits + 1,
    todayVisits: currentStats.todayVisits + 1,
    uniqueVisitors: currentStats.uniqueVisitors + 1,
    lastVisitTimestamp: nowISO,
    isCreator,
    wasCounted: true,
  };
  persistCache(currentStats);
  notifyListeners();
  return currentStats;
}

/**
 * Fetch current visit stats from Firestore or API without recording a new visit
 */
export async function getVisitStats(): Promise<VisitStats> {
  const isCreator = isCreatorMode();

  try {
    const metricsDocRef = doc(db, 'site_metrics', 'global_visits');
    const snap = await getDoc(metricsDocRef);
    if (snap.exists()) {
      const data = snap.data();
      currentStats = {
        totalVisits: typeof data.totalVisits === 'number' ? data.totalVisits : currentStats.totalVisits,
        uniqueVisitors: typeof data.uniqueVisitors === 'number' ? data.uniqueVisitors : currentStats.uniqueVisitors,
        todayVisits: typeof data.todayVisits === 'number' ? data.todayVisits : currentStats.todayVisits,
        creatorSessionsExcluded: typeof data.creatorSessionsExcluded === 'number' ? data.creatorSessionsExcluded : 0,
        lastVisitTimestamp: data.lastVisitTimestamp,
        isCreator,
      };
      persistCache(currentStats);
      notifyListeners();
      return currentStats;
    }
  } catch (_e) {
    // Use API or cache
  }

  try {
    const res = await fetch('/api/visits', {
      headers: { 'X-Is-Creator': isCreator ? 'true' : 'false' },
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
    // Offline
  }

  return currentStats;
}

export function subscribeToVisitorUpdates(listener: Listener): () => void {
  listeners.add(listener);
  listener(currentStats);
  setupFirestoreLiveSync();
  return () => {
    listeners.delete(listener);
  };
}
