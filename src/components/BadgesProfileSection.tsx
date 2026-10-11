import React, { useState, useEffect } from 'react';
import {
  Award,
  Zap,
  CheckCircle2,
  Lock,
  Sparkles,
  Flame,
  Layers,
  Timer,
  ChevronRight,
  X,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  Badge,
  BadgeCategory,
  getAllBadges,
  getBadgesSummary,
  subscribeToBadgeUpdates,
  recordBadgeUnlock,
} from '../services/badgesService';
import { triggerConfetti, triggerSuperConfetti } from '../utils/confetti';
import { FluencyDashboardData } from '../services/fluencyTracker';

interface BadgesProfileSectionProps {
  fluencyData: FluencyDashboardData;
  onNavigateToGym?: () => void;
  onNavigateToSimulator?: () => void;
  onNavigateToTweak?: () => void;
}

export const BadgesProfileSection: React.FC<BadgesProfileSectionProps> = ({
  fluencyData,
  onNavigateToGym,
  onNavigateToSimulator,
  onNavigateToTweak,
}) => {
  const [badges, setBadges] = useState<Badge[]>(() => getAllBadges());
  const [activeCategory, setActiveCategory] = useState<BadgeCategory>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [recentlyUnlockedToast, setRecentlyUnlockedToast] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      setBadges(getAllBadges());
    };
    refresh();
    const unsubscribe = subscribeToBadgeUpdates(refresh);
    return unsubscribe;
  }, []);

  const summary = getBadgesSummary();

  const filteredBadges = badges.filter((b) => {
    if (activeCategory === 'all') return true;
    return b.category === activeCategory;
  });

  const handleInspectBadge = (badge: Badge) => {
    setSelectedBadge(badge);
  };

  const handleSimulateUnlock = (badge: Badge) => {
    if (!badge.unlocked) {
      recordBadgeUnlock(badge.id);
      triggerSuperConfetti();
      setRecentlyUnlockedToast(`¡Medalla Desbloqueada: ${badge.title}! 🎉`);
      setTimeout(() => setRecentlyUnlockedToast(null), 4000);
      setBadges(getAllBadges());
    } else {
      triggerConfetti({ particleCount: 35, spread: 50 });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Student Profile Banner */}
      <div className="bg-gradient-to-r from-[#17113E] via-[#1A134B] to-[#120E33] border border-[#352778] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* User Identity & Level */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 flex items-center justify-center font-display text-2xl sm:text-3xl font-black shadow-lg shadow-amber-400/20 ring-4 ring-amber-400/30">
                EE
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase ring-2 ring-[#17113E]">
                Activo
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                  Estudiante de Entrecasa
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300">
                  {fluencyData.currentLevelBadge}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                <span>Nivel conversacional:</span>
                <span className="text-amber-300 font-bold">
                  {fluencyData.estimatedSpeakingLevel}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">
                  {fluencyData.totalInteractions} prácticas acumuladas
                </span>
              </p>

              {/* Progress Bar of Badges */}
              <div className="pt-1.5 flex items-center gap-3 max-w-md">
                <div className="flex-1 bg-slate-900/90 rounded-full h-2.5 overflow-hidden border border-[#2F2366]">
                  <div
                    className="bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-xs"
                    style={{ width: `${summary.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-amber-300 shrink-0 tabular-nums">
                  {summary.unlocked} de {summary.total} Medallas ({summary.percentage}%)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badges in Profile Header */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#2D2165]">
            {/* Streak Pill */}
            <div className="bg-[#0F0B2A]/90 border border-[#2F2366] rounded-2xl px-4 py-2.5 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Racha Actual</div>
                <div className="text-sm font-black text-white">
                  {fluencyData.toolStats.streakDays} Días Seguidos
                </div>
              </div>
            </div>

            {/* Gym Speed Pill */}
            <div className="bg-[#0F0B2A]/90 border border-[#2F2366] rounded-2xl px-4 py-2.5 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Velocidad Gym</div>
                <div className="text-sm font-black text-emerald-300">
                  {fluencyData.averageReflexSec}s (Meta &lt; 5s)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Showcase Header & Category Filter */}
      <div className="bg-[#120D30] p-4 sm:p-5 rounded-2xl border border-[#2C2160] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h4 className="font-display text-lg font-bold text-white">
              Vitrina de Medallas & Logros (Badges)
            </h4>
          </div>
          <p className="text-xs text-slate-400">
            Conquista hitos entrenando tus reflejos en el Gym, completando módulos o practicando a diario.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Todas ({badges.length})
          </button>

          <button
            onClick={() => setActiveCategory('gym')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'gym'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-900/80 text-amber-300/80 hover:text-amber-200 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Gimnasio de Reflejos ({badges.filter((b) => b.category === 'gym').length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('module')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'module'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-900/80 text-emerald-300/80 hover:text-emerald-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Módulos Dominados ({badges.filter((b) => b.category === 'module').length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('consistency')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'consistency'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-900/80 text-rose-300/80 hover:text-rose-200 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Constancia ({badges.filter((b) => b.category === 'consistency').length})</span>
          </button>
        </div>
      </div>

      {/* Toast Notification when unlocking */}
      {recentlyUnlockedToast && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-sm font-semibold flex items-center gap-3 animate-in fade-in shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{recentlyUnlockedToast}</span>
        </div>
      )}

      {/* 3. Badges Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const isUnlocked = badge.unlocked;

          return (
            <div
              key={badge.id}
              onClick={() => handleInspectBadge(badge)}
              className={`rounded-2xl p-5 border transition-all duration-300 cursor-pointer relative flex flex-col justify-between group ${
                isUnlocked
                  ? 'bg-gradient-to-b from-[#18123E] to-[#100C2A] border-amber-400/40 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-400/10'
                  : 'bg-[#0E0A24]/90 border-[#281F54] hover:border-slate-600 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Card Top: Icon & Status */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-400/40 shadow-inner'
                        : 'bg-slate-900 border border-slate-800 grayscale'
                    }`}
                  >
                    {badge.icon}
                  </div>

                  {isUnlocked ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Conquistada</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>En progreso</span>
                    </span>
                  )}
                </div>

                {/* Badge Info */}
                <h5 className="font-display text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {badge.title}
                </h5>
                <p className="text-[11px] font-medium text-amber-400/90 mb-1.5">
                  {badge.tagline}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {badge.description}
                </p>
              </div>

              {/* Card Bottom: Progress Bar & Requirement */}
              <div className="pt-4 mt-3 border-t border-[#231A4E] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">{badge.requirement}</span>
                  <span className="font-bold text-slate-300 tabular-nums shrink-0 ml-1">
                    {badge.progress.percentage}%
                  </span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUnlocked ? 'bg-amber-400' : 'bg-slate-600'
                    }`}
                    style={{ width: `${badge.progress.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <span className="text-slate-400">
                    {isUnlocked ? `✓ ${badge.unlockedAt}` : 'Toca para ver detalles'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Modal: Badge Details & Action */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#14102E] border border-[#3A2C7C] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
            <div className="flex items-start justify-between pb-3 border-b border-[#281F54]">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-inner">
                  {selectedBadge.icon}
                </div>
                <div>
                  <h4 className="font-display text-xl font-bold text-white">
                    {selectedBadge.title}
                  </h4>
                  <span className="text-xs font-semibold text-amber-300">
                    {selectedBadge.tagline}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBadge(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Descripción del Hito
                </label>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {selectedBadge.description}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C0A1D] border border-[#2B215E] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Requisito exacto:</span>
                  <span className="text-white font-bold">{selectedBadge.requirement}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Estado actual:</span>
                  <span
                    className={`font-bold ${
                      selectedBadge.unlocked ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {selectedBadge.unlocked ? '✓ Desbloqueada' : 'En progreso'}
                  </span>
                </div>

                <div className="pt-1">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Progreso:</span>
                    <span className="font-mono text-white">
                      {selectedBadge.progress.current} / {selectedBadge.progress.target}{' '}
                      {selectedBadge.progress.unit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        selectedBadge.unlocked ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${selectedBadge.progress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action shortcut button based on badge category */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                {selectedBadge.category === 'gym' && onNavigateToGym && (
                  <button
                    onClick={() => {
                      setSelectedBadge(null);
                      onNavigateToGym();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-amber-400/20"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Entrenar en el Gimnasio</span>
                  </button>
                )}

                {selectedBadge.category === 'module' && onNavigateToTweak && (
                  <button
                    onClick={() => {
                      setSelectedBadge(null);
                      onNavigateToTweak();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-sky-500/20"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Explorar Módulo</span>
                  </button>
                )}

                {selectedBadge.category === 'consistency' && onNavigateToSimulator && (
                  <button
                    onClick={() => {
                      setSelectedBadge(null);
                      onNavigateToSimulator();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-rose-500/20"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Practicar Diálogo Real</span>
                  </button>
                )}

                {/* Instant Test / Celebrate Button */}
                <button
                  type="button"
                  onClick={() => handleSimulateUnlock(selectedBadge)}
                  className="py-3 px-4 rounded-xl bg-[#1E1747] hover:bg-[#2B2165] text-amber-300 font-semibold text-xs border border-[#392C78] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedBadge.unlocked ? 'Celebrar 🎉' : 'Desbloquear Ahora'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
