import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  Mic,
  Volume2,
  Trophy,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Award,
} from 'lucide-react';
import {
  DailyStreakInfo,
  recordDailyPracticeCheckIn,
} from '../services/fluencyTracker';
import { triggerConfetti } from '../utils/confetti';

interface DailyStreakCounterProps {
  streakInfo: DailyStreakInfo;
  onNavigateToGym?: () => void;
  onNavigateToSimulator?: () => void;
  onNavigateToTweak?: () => void;
}

export const DailyStreakCounter: React.FC<DailyStreakCounterProps> = ({
  streakInfo,
  onNavigateToGym,
  onNavigateToSimulator,
  onNavigateToTweak,
}) => {
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const {
    currentStreak,
    longestStreak,
    isActiveToday,
    todayActionsCount,
    todayGoalTarget,
    goalProgressPercent,
    isGoalCompletedToday,
    statusMessage,
    nextMilestone,
    daysToNextMilestone,
    milestoneTitle,
    weekProgress,
  } = streakInfo;

  const handleQuickCheckIn = () => {
    const result = recordDailyPracticeCheckIn();
    setJustCheckedIn(true);
    triggerConfetti({
      particleCount: 55,
      spread: 70,
      origin: { y: 0.6 },
    });

    const msg = result.isGoalMet
      ? `🎉 ¡Felicitaciones! Has completado tu meta diaria (${result.todayActionsCount}/${todayGoalTarget}). ¡Racha de ${result.currentStreak} días firme!`
      : `🔥 ¡Práctica sumada! Llevas ${result.todayActionsCount}/${todayGoalTarget} micro-sesiones hoy. ¡Racha de ${result.currentStreak} días activa!`;

    setFeedbackToast(msg);
    setTimeout(() => {
      setJustCheckedIn(false);
    }, 1800);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 6000);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#160E3D] via-[#120B2E] to-[#0A071E] border border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-7">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Top Header: Streak Status & Flame */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="flex items-start sm:items-center gap-4 sm:gap-5">
          {/* Flame badge emblem */}
          <div className="relative shrink-0">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                isActiveToday
                  ? 'bg-gradient-to-br from-amber-500 via-rose-500 to-amber-600 shadow-lg shadow-amber-500/30 border border-amber-300/40 animate-pulse'
                  : 'bg-slate-900 border border-amber-500/30'
              }`}
            >
              <Flame
                className={`w-9 h-9 sm:w-11 sm:h-11 transition-transform duration-300 ${
                  isActiveToday
                    ? 'text-white scale-110 drop-shadow-[0_4px_12px_rgba(245,158,11,0.8)]'
                    : 'text-amber-400/80 animate-bounce'
                }`}
              />
            </div>
            {isActiveToday && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400" />
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <span className="uppercase tracking-wider">Hábito Conversacional Diario</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-slate-300">
                {isActiveToday ? 'Fuego Encendido Hoy' : '¡En Juego Hoy!'}
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {currentStreak}{' '}
                <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-400">
                  {currentStreak === 1 ? 'Día en Racha' : 'Días Consecutivos'}
                </span>
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              {statusMessage}
            </p>
          </div>
        </div>

        {/* Right side quick actions & record stats */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div className="text-left lg:text-right">
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Récord Personal</span>
              <strong className="text-white font-mono text-sm sm:text-base">{longestStreak} días seguidos</strong>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-left lg:text-right">
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Próximo Hito</span>
              <strong className="text-amber-300 font-semibold text-sm">
                {nextMilestone} días ({milestoneTitle})
              </strong>
            </div>
          </div>

          {/* Quick Check-in CTA Button */}
          <button
            type="button"
            onClick={handleQuickCheckIn}
            className={`w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isActiveToday
                ? 'bg-amber-400/20 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-400/50'
                : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-amber-500/25 border border-amber-300/40'
            } ${justCheckedIn ? 'scale-105 ring-2 ring-amber-400' : ''}`}
            title="Suma 1 práctica a tu registro de hoy y mantén viva tu racha"
          >
            <Zap className={`w-4 h-4 ${justCheckedIn ? 'animate-spin' : ''}`} />
            <span>
              {isActiveToday
                ? '+1 Práctica Rápida Hoy (+XP)'
                : 'Registrar Práctica de Hoy (+1 Racha)'}
            </span>
          </button>
        </div>
      </div>

      {/* Optional feedback banner */}
      {feedbackToast && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
          <button
            onClick={() => setFeedbackToast(null)}
            className="text-amber-400/70 hover:text-white text-xs cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* 7-Day Visual Week Strip (Lunes a Domingo) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Semana Actual de Práctica</span>
          </span>
          <span className="text-slate-400 text-[11px]">
            {isGoalCompletedToday ? '✓ Meta diaria cumplida' : `${todayActionsCount}/${todayGoalTarget} micro-sesiones hoy`}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {weekProgress.map((day, idx) => {
            const isCompleted = day.isCompleted;
            const isToday = day.isToday;
            const isPast = day.isPast;

            return (
              <div
                key={idx}
                className={`relative rounded-2xl p-2 sm:p-3 text-center border transition-all ${
                  isToday
                    ? isCompleted
                      ? 'bg-gradient-to-b from-amber-500/25 to-rose-500/15 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40'
                      : 'bg-amber-500/10 border-amber-400/60 ring-1 ring-amber-400/20'
                    : isCompleted
                    ? 'bg-slate-900/90 border-amber-500/30 text-white'
                    : isPast
                    ? 'bg-slate-950/40 border-white/5 opacity-50'
                    : 'bg-slate-950/30 border-white/5 text-slate-500'
                }`}
              >
                {/* Day name */}
                <span className={`block text-[10px] sm:text-xs font-bold uppercase ${
                  isToday ? 'text-amber-300' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  {day.dayName}
                </span>

                {/* Day number */}
                <span className="block font-mono text-xs sm:text-sm font-semibold text-white/90 my-1">
                  {day.dayNumber}
                </span>

                {/* Status icon */}
                <div className="flex items-center justify-center pt-0.5">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center">
                      <Flame className="w-3 h-3 text-amber-400" />
                    </div>
                  ) : isToday ? (
                    <div className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-400/50 flex items-center justify-center animate-pulse">
                      <Zap className="w-2.5 h-2.5 text-rose-300" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    </div>
                  )}
                </div>

                {/* Pill-free tag for today */}
                {isToday && (
                  <span className="block mt-1 text-[9px] font-extrabold text-amber-400 tracking-wider uppercase">
                    Hoy
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Micro-Goal Progress Bar & 3 Core Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* Left: Progress bar & description */}
        <div className="lg:col-span-6 bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Meta Diaria de Soltura</span>
            </span>
            <span className="font-mono text-amber-400 font-bold tabular-nums">
              {todayActionsCount} / {todayGoalTarget} ejercicios ({goalProgressPercent}%)
            </span>
          </div>

          <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-amber-500 transition-all duration-700 shadow-sm"
              style={{ width: `${Math.max(5, goalProgressPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {isGoalCompletedToday
                ? '🏆 ¡Meta del día completada con éxito!'
                : `Falta ${todayGoalTarget - todayActionsCount} ejercicio para cerrar el día`}
            </span>
            <span className="text-amber-300 font-medium">
              +{Math.min(todayActionsCount * 10, 30)} XP sumados
            </span>
          </div>
        </div>

        {/* Right: Quick micro-habits navigation triggers */}
        <div className="lg:col-span-6 grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={onNavigateToGym}
            className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 hover:border-emerald-400 text-left cursor-pointer group transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-emerald-400">
              <Zap className="w-4 h-4" />
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2">
              <span className="block text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                Gym 5s
              </span>
              <span className="block text-[10px] text-slate-400 truncate">
                Reflejo rápido
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={onNavigateToSimulator}
            className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 hover:border-amber-400 text-left cursor-pointer group transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-amber-400">
              <Mic className="w-4 h-4" />
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2">
              <span className="block text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                Simulador
              </span>
              <span className="block text-[10px] text-slate-400 truncate">
                Voz en vivo
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={onNavigateToTweak}
            className="p-3 rounded-xl bg-slate-950/60 border border-sky-500/20 hover:border-sky-400 text-left cursor-pointer group transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-sky-400">
              <Sparkles className="w-4 h-4" />
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2">
              <span className="block text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                SpeakTweak
              </span>
              <span className="block text-[10px] text-slate-400 truncate">
                Frase natural
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Milestone Motivation Bar */}
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-white">Constancia Pragmática: </strong>
            Estás a <strong className="text-amber-300">{daysToNextMilestone} {daysToNextMilestone === 1 ? 'día' : 'días'}</strong> de desbloquear la insignia{' '}
            <strong className="text-white">{milestoneTitle}</strong> ({nextMilestone} días seguidos).
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>3 a 5 min diarios</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>Cero culpa</span>
        </div>
      </div>
    </div>
  );
};
