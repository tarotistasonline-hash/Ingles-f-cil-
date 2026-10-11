import { SessionConfidenceFeedback } from '../types';

export interface FluencyHistoryPoint {
  sessionLabel: string;
  timestamp: number;
  overallScore: number;
  spontaneity: number;
  chunksUsage: number;
  comfort: number;
  reflexSpeed: number; // in seconds
}

export interface PillarScore {
  pillar: string;
  score: number;
  fullMark: number;
}

export interface ToolActivityStats {
  roleplaySessions: number;
  roleplayTurns: number;
  gymAttempts: number;
  gymBestScore: number;
  tweakCount: number;
  completedModulesCount: number;
  audioListensCount: number;
  streakDays: number;
}

export interface FluencyDashboardData {
  history: FluencyHistoryPoint[];
  pillars: PillarScore[];
  toolStats: ToolActivityStats;
  currentLevelBadge: string;
  estimatedSpeakingLevel: string;
  currentOverallScore: number;
  averageReflexSec: number;
  totalInteractions: number;
}

const STORAGE_KEY = 'vibe_fluency_tracker_v2';
const EVENT_NAME = 'vibe:fluency_updated';

interface StoredTrackerState {
  gymAttempts: number;
  gymScores: number[];
  gymSpeeds: number[]; // in seconds
  roleplayTurns: number;
  roleplaySessions: number;
  roleplayReports: {
    timestamp: number;
    overall: number;
    spontaneity: number;
    chunks: number;
    comfort: number;
  }[];
  tweakCount: number;
  audioListensCount: number;
  lastActiveDate: string;
  streakDays: number;
}

function getInitialStoredState(): StoredTrackerState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    gymAttempts: 3,
    gymScores: [76, 84, 91],
    gymSpeeds: [4.4, 3.8, 3.1],
    roleplayTurns: 8,
    roleplaySessions: 2,
    roleplayReports: [
      {
        timestamp: Date.now() - 3 * 86400000,
        overall: 68,
        spontaneity: 64,
        chunks: 70,
        comfort: 69,
      },
      {
        timestamp: Date.now() - 1 * 86400000,
        overall: 82,
        spontaneity: 80,
        chunks: 85,
        comfort: 83,
      },
    ],
    tweakCount: 4,
    audioListensCount: 14,
    lastActiveDate: today,
    streakDays: 3,
  };
}

function loadState(): StoredTrackerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialStoredState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return { ...getInitialStoredState(), ...parsed };
  } catch {
    return getInitialStoredState();
  }
}

function saveState(state: StoredTrackerState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    }
  } catch {
    // ignore
  }
}

// Check how many modules in localStorage have completed flag
function getCompletedModulesCount(): number {
  if (typeof localStorage === 'undefined') return 2;
  let count = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('vibe_mod_completed_')) {
        if (localStorage.getItem(key) === 'true') {
          count++;
        }
      }
    }
  } catch {
    // ignore
  }
  // Minimum baseline of 1 if fresh, for engaging visual on first load
  return Math.max(count, 2);
}

/**
 * Record a completion in the 5-second Reflex Gym
 */
export function recordGymInteraction(score: number, responseSeconds: number = 3.2) {
  const state = loadState();
  state.gymAttempts += 1;
  state.gymScores.push(score);
  state.gymSpeeds.push(responseSeconds);
  saveState(state);
}

/**
 * Record a conversational message turn in the Roleplay Simulator
 */
export function recordRoleplayTurnEvent() {
  const state = loadState();
  state.roleplayTurns += 1;
  saveState(state);
}

/**
 * Record an evaluated session with Confidence Score feedback in the Roleplay Simulator
 */
export function recordRoleplaySessionEvaluation(feedback: SessionConfidenceFeedback) {
  const state = loadState();
  state.roleplaySessions += 1;
  state.roleplayReports.push({
    timestamp: Date.now(),
    overall: feedback.overallConfidenceScore,
    spontaneity: feedback.spontaneityScore,
    chunks: feedback.chunksScore,
    comfort: feedback.comfortScore,
  });
  saveState(state);
}

/**
 * Record a school phrase transformed with SpeakTweak
 */
export function recordSpeakTweakUse() {
  const state = loadState();
  state.tweakCount += 1;
  saveState(state);
}

/**
 * Record an audio listen
 */
export function recordAudioListenEvent() {
  const state = loadState();
  state.audioListensCount += 1;
  saveState(state);
}

/**
 * Compile full Fluency Dashboard Data for Recharts
 */
export function getFluencyDashboardData(): FluencyDashboardData {
  const state = loadState();
  const completedModules = getCompletedModulesCount();

  // 1. Build Time Progression Series for AreaChart
  const history: FluencyHistoryPoint[] = [];

  // Seed baseline points based on roleplay reports and gym interactions
  if (state.roleplayReports.length === 0) {
    history.push(
      { sessionLabel: 'Día 1: Arranque', timestamp: 1, overallScore: 58, spontaneity: 52, chunksUsage: 60, comfort: 56, reflexSpeed: 4.8 },
      { sessionLabel: 'Día 2: Primeros Chunks', timestamp: 2, overallScore: 72, spontaneity: 68, chunksUsage: 76, comfort: 71, reflexSpeed: 3.9 },
      { sessionLabel: 'Sesión Actual', timestamp: 3, overallScore: 84, spontaneity: 82, chunksUsage: 88, comfort: 85, reflexSpeed: 2.9 }
    );
  } else {
    // Merge baseline with user's actual reports
    const baseLabels = ['Sesión 1: Café & Casa', 'Sesión 2: Situaciones Reales'];
    state.roleplayReports.forEach((rep, idx) => {
      const label = baseLabels[idx] || `Sesión ${idx + 1}: Diálogo Real`;
      const avgSpeed = state.gymSpeeds[idx] || 3.2;
      history.push({
        sessionLabel: label,
        timestamp: rep.timestamp,
        overallScore: rep.overall,
        spontaneity: rep.spontaneity,
        chunksUsage: rep.chunks,
        comfort: rep.comfort,
        reflexSpeed: Math.max(1.8, Math.round(avgSpeed * 10) / 10),
      });
    });

    // If there is only 1 or 2 reports, prepend starter history for a rich curve
    if (history.length === 1) {
      history.unshift({
        sessionLabel: 'Inicio: Traduciendo en la Mente',
        timestamp: Date.now() - 4 * 86400000,
        overallScore: 54,
        spontaneity: 48,
        chunksUsage: 56,
        comfort: 52,
        reflexSpeed: 4.9,
      });
    }
  }

  // Calculate current overall score
  const latestReport = history[history.length - 1];
  const gymBonus = Math.min(8, Math.floor(state.gymAttempts * 0.8));
  const tweakBonus = Math.min(6, Math.floor(state.tweakCount * 0.6));
  const currentOverallScore = Math.min(96, Math.max(65, (latestReport?.overallScore || 78) + Math.floor((gymBonus + tweakBonus) / 2)));

  // Average Reflex time in seconds
  const totalSpeeds = state.gymSpeeds.reduce((a, b) => a + b, 0);
  const averageReflexSec = state.gymSpeeds.length > 0
    ? Math.round((totalSpeeds / state.gymSpeeds.length) * 10) / 10
    : 3.1;

  // Best gym score
  const gymBestScore = state.gymScores.length > 0 ? Math.max(...state.gymScores) : 90;

  // 2. Pillars for RadarChart (5 Core Pillars of "Inglés de Entrecasa")
  const pillars: PillarScore[] = [
    {
      pillar: 'Reflejos (< 5 seg)',
      score: Math.min(98, Math.max(65, 75 + Math.floor(state.gymAttempts * 2.5) + (averageReflexSec < 3.5 ? 8 : 0))),
      fullMark: 100,
    },
    {
      pillar: 'Uso de Chunks',
      score: Math.min(96, Math.max(68, 70 + completedModules * 4 + state.tweakCount * 2)),
      fullMark: 100,
    },
    {
      pillar: 'Ritmo & Conexión',
      score: Math.min(95, Math.max(60, 65 + Math.floor(state.audioListensCount * 1.5))),
      fullMark: 100,
    },
    {
      pillar: 'Espontaneidad',
      score: Math.min(98, Math.max(62, latestReport?.spontaneity || 82)),
      fullMark: 100,
    },
    {
      pillar: 'Cero Gramática Rígida',
      score: Math.min(99, Math.max(70, 78 + state.tweakCount * 3)),
      fullMark: 100,
    },
  ];

  // 3. Current Level Title
  let currentLevelBadge = 'Hablante Pragmático';
  let estimatedSpeakingLevel = 'B1 Fluido Cotidiano';
  if (currentOverallScore >= 88) {
    currentLevelBadge = 'Nativo Espontáneo de Entrecasa';
    estimatedSpeakingLevel = 'B2+ Conversador Natural';
  } else if (currentOverallScore >= 75) {
    currentLevelBadge = 'Conversador Ágil sin Miedo';
    estimatedSpeakingLevel = 'B1 Fluidez en Piloto Automático';
  } else {
    currentLevelBadge = 'Primeros Reflejos Naturales';
    estimatedSpeakingLevel = 'A2 Despegue Cotidiano';
  }

  const toolStats: ToolActivityStats = {
    roleplaySessions: state.roleplaySessions,
    roleplayTurns: state.roleplayTurns,
    gymAttempts: state.gymAttempts,
    gymBestScore,
    tweakCount: state.tweakCount,
    completedModulesCount: completedModules,
    audioListensCount: state.audioListensCount,
    streakDays: state.streakDays,
  };

  const totalInteractions =
    state.gymAttempts + state.roleplayTurns + state.tweakCount + state.audioListensCount;

  return {
    history,
    pillars,
    toolStats,
    currentLevelBadge,
    estimatedSpeakingLevel,
    currentOverallScore,
    averageReflexSec,
    totalInteractions,
  };
}

/**
 * Subscribe to realtime fluency data updates
 */
export function subscribeToFluencyUpdates(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener('storage', callback);
  };
}
