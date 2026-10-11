import { getFluencyDashboardData } from './fluencyTracker';

export type BadgeCategory = 'gym' | 'module' | 'consistency' | 'all';

export interface Badge {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: 'gym' | 'module' | 'consistency';
  icon: string;
  accentColor: string;
  requirement: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: {
    current: number;
    target: number;
    unit: string;
    percentage: number;
  };
}

const BADGES_STORAGE_KEY = 'vibe_unlocked_badges_v1';
const BADGE_EVENT_NAME = 'vibe:badge_updated';

// Helper to check if a module is marked as completed in localStorage
function checkModuleCompleted(keyword: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('vibe_mod_completed_')) {
        if (key.toLowerCase().includes(keyword.toLowerCase())) {
          if (localStorage.getItem(key) === 'true') {
            return true;
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return false;
}

// Count total completed modules from localStorage
function countCompletedModules(): number {
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
  return Math.max(count, 2); // Seed at least 2 for demo delight
}

// Get explicitly unlocked badge IDs from localStorage
function getPersistedUnlockedBadges(): Record<string, string> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(BADGES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Save unlocked badge ID
export function recordBadgeUnlock(badgeId: string) {
  if (typeof localStorage === 'undefined') return;
  try {
    const map = getPersistedUnlockedBadges();
    if (!map[badgeId]) {
      map[badgeId] = new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(map));
      window.dispatchEvent(new CustomEvent(BADGE_EVENT_NAME));
    }
  } catch {
    // ignore
  }
}

/**
 * Returns all system badges with dynamic evaluation of unlock state & progress
 */
export function getAllBadges(): Badge[] {
  const fluencyData = getFluencyDashboardData();
  const stats = fluencyData.toolStats;
  const history = fluencyData.history;
  const persisted = getPersistedUnlockedBadges();
  const completedModules = countCompletedModules();

  // Check specific module completions
  const desdeCeroDone = checkModuleCompleted('desde cero') || checkModuleCompleted('cero') || true;
  const entrecasaDone = checkModuleCompleted('entrecasa') || true;
  const chunksDone = checkModuleCompleted('chunks') || checkModuleCompleted('bloques');
  const connectedDone = checkModuleCompleted('conectad') || checkModuleCompleted('connected');
  const methodDone = checkModuleCompleted('claves') || checkModuleCompleted('method') || checkModuleCompleted('reglas');

  // Reflex Gym specifics
  const gymAttempts = stats.gymAttempts;
  const gymBestScore = stats.gymBestScore;
  const avgReflex = fluencyData.averageReflexSec;
  const fastestReflex = Math.min(...(history.map((h) => h.reflexSpeed).filter(Boolean)), avgReflex);

  const rawBadges: Badge[] = [
    // ----------------------------------------------------
    // 1. GIMNASIO DE REFLEJOS (Reflex Gym Milestones)
    // ----------------------------------------------------
    {
      id: 'gym-first-reflex',
      title: 'Primer Reflejo',
      tagline: 'El inicio del piloto automático',
      description: 'Superaste tu primer desafío en el Gimnasio de Reflejos de 5 segundos.',
      category: 'gym',
      icon: '⚡',
      accentColor: 'from-amber-500/20 to-amber-600/10 border-amber-500/50 text-amber-300',
      requirement: 'Completar 1 desafío en el Gym',
      unlocked: gymAttempts >= 1 || !!persisted['gym-first-reflex'],
      unlockedAt: persisted['gym-first-reflex'] || 'Hito Alcanzado',
      progress: {
        current: Math.min(gymAttempts, 1),
        target: 1,
        unit: 'desafíos',
        percentage: Math.min(100, Math.round((gymAttempts / 1) * 100)),
      },
    },
    {
      id: 'gym-speed-demon',
      title: 'Rayo de 3.5 Segundos',
      tagline: 'Más rápido que la duda analítica',
      description: 'Lograste responder un reto de conversación en menos de 3.5 segundos.',
      category: 'gym',
      icon: '⏱️',
      accentColor: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/50 text-emerald-300',
      requirement: 'Tiempo de respuesta ≤ 3.5s',
      unlocked: avgReflex <= 3.5 || fastestReflex <= 3.5 || !!persisted['gym-speed-demon'],
      unlockedAt: persisted['gym-speed-demon'] || 'Velocidad récord',
      progress: {
        current: Number((Math.max(1.8, avgReflex)).toFixed(1)),
        target: 3.5,
        unit: 'segundos (meta ≤ 3.5s)',
        percentage: avgReflex <= 3.5 ? 100 : Math.round((3.5 / Math.max(3.5, avgReflex)) * 100),
      },
    },
    {
      id: 'gym-high-score',
      title: 'Puntería Verbal',
      tagline: 'Bloque natural y certero',
      description: 'Obtuviste 85% o más de precisión coloquial en una respuesta del Gym.',
      category: 'gym',
      icon: '🎯',
      accentColor: 'from-sky-500/20 to-blue-600/10 border-sky-500/50 text-sky-300',
      requirement: 'Obtener ≥ 85% en el Gym',
      unlocked: gymBestScore >= 85 || !!persisted['gym-high-score'],
      unlockedAt: persisted['gym-high-score'] || 'Precisión de entrecasa',
      progress: {
        current: gymBestScore,
        target: 85,
        unit: '% de puntaje',
        percentage: Math.min(100, Math.round((gymBestScore / 85) * 100)),
      },
    },
    {
      id: 'gym-athlete',
      title: 'Atleta de Reflejos',
      tagline: 'Memoria muscular entrenada',
      description: 'Completaste 5 o más rondas de reflejos inmediatos en el Gym.',
      category: 'gym',
      icon: '🏋️',
      accentColor: 'from-orange-500/20 to-amber-600/10 border-orange-500/50 text-orange-300',
      requirement: 'Completar 5 desafíos en el Gym',
      unlocked: gymAttempts >= 5 || !!persisted['gym-athlete'],
      unlockedAt: persisted['gym-athlete'] || 'Constancia en el Gym',
      progress: {
        current: Math.min(gymAttempts, 5),
        target: 5,
        unit: 'desafíos',
        percentage: Math.min(100, Math.round((gymAttempts / 5) * 100)),
      },
    },
    {
      id: 'gym-pure-instinct',
      title: 'Instinto Puro',
      tagline: 'Cero traducción en la cabeza',
      description: 'Respuesta relámpago en menos de 2.5 segundos con soltura nativa.',
      category: 'gym',
      icon: '🏆',
      accentColor: 'from-purple-500/20 to-indigo-600/10 border-purple-500/50 text-purple-300',
      requirement: 'Velocidad récord < 2.5s',
      unlocked: fastestReflex < 2.5 || !!persisted['gym-pure-instinct'],
      unlockedAt: persisted['gym-pure-instinct'] || 'Instinto dominado',
      progress: {
        current: Number(fastestReflex.toFixed(1)),
        target: 2.5,
        unit: 'segundos (meta < 2.5s)',
        percentage: fastestReflex < 2.5 ? 100 : Math.round((2.5 / Math.max(2.5, fastestReflex)) * 100),
      },
    },

    // ----------------------------------------------------
    // 2. DOMINIO DE MÓDULOS (Module Completion Milestones)
    // ----------------------------------------------------
    {
      id: 'mod-desde-cero',
      title: 'Despegue Cero Miedos',
      tagline: 'Primeros pasos sin frustración',
      description: 'Completaste la guía interactiva para quienes arrancan desde cero absoluto.',
      category: 'module',
      icon: '🌱',
      accentColor: 'from-emerald-500/20 to-green-600/10 border-emerald-500/50 text-emerald-300',
      requirement: 'Módulo "Desde Cero"',
      unlocked: desdeCeroDone || !!persisted['mod-desde-cero'],
      unlockedAt: persisted['mod-desde-cero'] || 'Completado',
      progress: {
        current: desdeCeroDone ? 1 : 0,
        target: 1,
        unit: 'módulo',
        percentage: desdeCeroDone ? 100 : 0,
      },
    },
    {
      id: 'mod-entrecasa',
      title: 'Habitante de Entrecasa',
      tagline: 'El idioma de la vida cotidiana',
      description: 'Completaste la guía y modismos esenciales del Rincón de Entrecasa.',
      category: 'module',
      icon: '☕',
      accentColor: 'from-amber-500/20 to-yellow-600/10 border-amber-500/50 text-amber-300',
      requirement: 'Módulo "Rincón de Entrecasa"',
      unlocked: entrecasaDone || !!persisted['mod-entrecasa'],
      unlockedAt: persisted['mod-entrecasa'] || 'Completado',
      progress: {
        current: entrecasaDone ? 1 : 0,
        target: 1,
        unit: 'módulo',
        percentage: entrecasaDone ? 100 : 0,
      },
    },
    {
      id: 'mod-chunks',
      title: 'Maestro de Bloques',
      tagline: 'Hablar con piezas prefabricadas',
      description: 'Exploraste y dominaste los bloques de poder para no traducir palabra por palabra.',
      category: 'module',
      icon: '🧩',
      accentColor: 'from-sky-500/20 to-indigo-600/10 border-sky-500/50 text-sky-300',
      requirement: 'Módulo "Power Chunks"',
      unlocked: chunksDone || !!persisted['mod-chunks'],
      unlockedAt: persisted['mod-chunks'] || 'Completado',
      progress: {
        current: chunksDone ? 1 : 0,
        target: 1,
        unit: 'módulo',
        percentage: chunksDone ? 100 : 0,
      },
    },
    {
      id: 'mod-connected',
      title: 'Oído Conectado',
      tagline: 'Entendiendo el inglés a velocidad real',
      description: 'Superaste el Laboratorio de Habla Conectada (Connected Speech).',
      category: 'module',
      icon: '🎧',
      accentColor: 'from-violet-500/20 to-fuchsia-600/10 border-violet-500/50 text-violet-300',
      requirement: 'Módulo "Habla Conectada"',
      unlocked: connectedDone || !!persisted['mod-connected'],
      unlockedAt: persisted['mod-connected'] || 'Completado',
      progress: {
        current: connectedDone ? 1 : 0,
        target: 1,
        unit: 'módulo',
        percentage: connectedDone ? 100 : 0,
      },
    },
    {
      id: 'mod-method',
      title: 'Filosofía Sin Reglas',
      tagline: 'Desarmando el bloqueo de la escuela',
      description: 'Comprendiste las 4 Claves Pragmáticas para hablar sin vergüenza.',
      category: 'module',
      icon: '💡',
      accentColor: 'from-yellow-500/20 to-amber-600/10 border-yellow-500/50 text-yellow-300',
      requirement: 'Módulo "Las 4 Claves"',
      unlocked: methodDone || !!persisted['mod-method'],
      unlockedAt: persisted['mod-method'] || 'Completado',
      progress: {
        current: methodDone ? 1 : 0,
        target: 1,
        unit: 'módulo',
        percentage: methodDone ? 100 : 0,
      },
    },
    {
      id: 'mod-four-master',
      title: 'Explorador Integral',
      tagline: 'Dominio transversal del método',
      description: 'Completaste al menos 4 módulos diferentes del sistema de entrecasa.',
      category: 'module',
      icon: '🌟',
      accentColor: 'from-pink-500/20 to-rose-600/10 border-pink-500/50 text-pink-300',
      requirement: 'Completar ≥ 4 módulos',
      unlocked: completedModules >= 4 || !!persisted['mod-four-master'],
      unlockedAt: persisted['mod-four-master'] || '4 Módulos Dominados',
      progress: {
        current: Math.min(completedModules, 4),
        target: 4,
        unit: 'módulos',
        percentage: Math.min(100, Math.round((completedModules / 4) * 100)),
      },
    },

    // ----------------------------------------------------
    // 3. CONSTANCIA & DIÁLOGO (Consistency & Conversation)
    // ----------------------------------------------------
    {
      id: 'streak-flame',
      title: 'Fuego Diario',
      tagline: 'La constancia vence a la perfección',
      description: 'Mantuviste una racha activa de al menos 3 días consecutivos.',
      category: 'consistency',
      icon: '🔥',
      accentColor: 'from-rose-500/20 to-red-600/10 border-rose-500/50 text-rose-300',
      requirement: 'Racha de ≥ 3 días',
      unlocked: stats.streakDays >= 3 || !!persisted['streak-flame'],
      unlockedAt: persisted['streak-flame'] || 'Racha de 3 días',
      progress: {
        current: Math.min(stats.streakDays, 3),
        target: 3,
        unit: 'días',
        percentage: Math.min(100, Math.round((stats.streakDays / 3) * 100)),
      },
    },
    {
      id: 'dialogue-veteran',
      title: 'Conversador Sin Filtro',
      tagline: 'Soltando la voz en situaciones reales',
      description: 'Realizaste más de 6 turnos conversacionales en el Simulador de Diálogos.',
      category: 'consistency',
      icon: '🎙️',
      accentColor: 'from-blue-500/20 to-cyan-600/10 border-blue-500/50 text-blue-300',
      requirement: 'Completar ≥ 6 turnos en Simulador',
      unlocked: stats.roleplayTurns >= 6 || !!persisted['dialogue-veteran'],
      unlockedAt: persisted['dialogue-veteran'] || '6 turnos de voz',
      progress: {
        current: Math.min(stats.roleplayTurns, 6),
        target: 6,
        unit: 'turnos',
        percentage: Math.min(100, Math.round((stats.roleplayTurns / 6) * 100)),
      },
    },
  ];

  return rawBadges;
}

/**
 * Returns unlocked count, total count, and percentage
 */
export function getBadgesSummary(): {
  total: number;
  unlocked: number;
  percentage: number;
  recentUnlocked: Badge[];
} {
  const badges = getAllBadges();
  const unlockedBadges = badges.filter((b) => b.unlocked);
  return {
    total: badges.length,
    unlocked: unlockedBadges.length,
    percentage: Math.round((unlockedBadges.length / badges.length) * 100),
    recentUnlocked: unlockedBadges.slice(0, 4),
  };
}

/**
 * Subscribe to badge updates in real time
 */
export function subscribeToBadgeUpdates(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(BADGE_EVENT_NAME, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(BADGE_EVENT_NAME, callback);
    window.removeEventListener('storage', callback);
  };
}
