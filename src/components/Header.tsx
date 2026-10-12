import React from 'react';
import { Volume2, Sparkles, Gauge, LayoutGrid, ScrollText } from 'lucide-react';
import { SPEED_LEVELS } from '../services/audio';
import { RealVisitsBadge } from './RealVisitsBadge';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickTry: () => void;
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
  viewMode?: 'modular' | 'full';
  onToggleViewMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onQuickTry,
  currentSpeed,
  onSpeedChange,
  viewMode = 'modular',
  onToggleViewMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0C0A1D]/85 backdrop-blur-md border-b border-[#281F54]/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('hero')}
          className="text-left group cursor-pointer focus:outline-none flex items-center gap-2"
        >
          <span className="font-display text-lg sm:text-2xl font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors">
            Inglés de Entrecasa
          </span>
          <span className="hidden sm:inline-block text-[10px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Simple & Real
          </span>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('desde-cero')}
            className={`transition-colors hover:text-emerald-300 flex items-center gap-1 ${
              activeTab === 'desde-cero'
                ? 'text-emerald-400 font-semibold underline decoration-2 underline-offset-4'
                : 'text-emerald-300/90'
            }`}
          >
            🌱 Desde Cero
          </button>
          <button
            onClick={() => setActiveTab('entrecasa')}
            className={`transition-colors hover:text-white ${
              activeTab === 'entrecasa'
                ? 'text-amber-400 font-semibold underline decoration-2 underline-offset-4'
                : ''
            }`}
          >
            Rincón de Entrecasa
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`transition-colors hover:text-white ${
              activeTab === 'simulator'
                ? 'text-amber-400 font-semibold underline decoration-2 underline-offset-4'
                : ''
            }`}
          >
            Simulador de Voz
          </button>
          <button
            onClick={() => setActiveTab('method')}
            className={`transition-colors hover:text-white ${
              activeTab === 'method'
                ? 'text-amber-400 font-semibold underline decoration-2 underline-offset-4'
                : ''
            }`}
          >
            Método Sin Reglas
          </button>
          <button
            onClick={() => setActiveTab('tweak')}
            className={`transition-colors hover:text-white ${
              activeTab === 'tweak'
                ? 'text-amber-400 font-semibold underline decoration-2 underline-offset-4'
                : ''
            }`}
          >
            Habla Coloquial
          </button>
          <button
            onClick={() => setActiveTab('chunks')}
            className={`transition-colors hover:text-white ${
              activeTab === 'chunks'
                ? 'text-amber-400 font-semibold underline decoration-2 underline-offset-4'
                : ''
            }`}
          >
            Bloques de Poder
          </button>
          <button
            onClick={() => setActiveTab('gym')}
            className={`transition-colors hover:text-white ${
              activeTab === 'gym'
                ? 'text-amber-400 font-semibold underline decoration-2 underline-offset-4'
                : ''
            }`}
          >
            Reflejos en 5s
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`transition-colors hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/25 ${
              activeTab === 'dashboard'
                ? 'text-amber-400 font-semibold border-amber-400/60'
                : 'text-amber-300'
            }`}
          >
            <span>📊 Progreso Easy</span>
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`transition-colors hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/25 ${
              activeTab === 'blog'
                ? 'text-rose-300 font-semibold border-rose-400/60'
                : 'text-rose-300/80 hover:text-rose-200'
            }`}
          >
            <span>💬 Blog & Sugerencias</span>
          </button>
          <button
            onClick={() => setActiveTab('kit')}
            className={`transition-colors hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 ${
              activeTab === 'kit'
                ? 'text-emerald-300 font-semibold border-emerald-400/60 shadow-xs'
                : 'text-emerald-300/90 hover:text-emerald-200'
            }`}
          >
            <span>🎧 Kit de Bolsillo</span>
          </button>
        </nav>

        {/* Zone 3: Speed control & Primary action */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mode toggle (Modular vs Full page) */}
          {onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 hover:text-amber-300 hover:border-amber-400/40 transition-colors cursor-pointer"
              title={
                viewMode === 'modular'
                  ? 'Estás en modo módulos (ligero y sin scroll infinito). Clic para ver todo seguido.'
                  : 'Estás en modo página completa. Clic para volver a módulos limpios.'
              }
            >
              {viewMode === 'modular' ? (
                <>
                  <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-medium">Modo Módulos</span>
                </>
              ) : (
                <>
                  <ScrollText className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-medium">Ver Todo</span>
                </>
              )}
            </button>
          )}

          {/* Real visits counter on desktop */}
          <div className="hidden xl:block">
            <RealVisitsBadge compact={true} />
          </div>

          {/* Beginner-friendly Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 px-2 py-1 rounded-xl shadow-xs">
            <span className="text-[11px] text-amber-300/90 font-medium hidden sm:inline flex items-center gap-1 pl-1">
              <Volume2 className="w-3 h-3 text-amber-400" />
              Audio:
            </span>
            <div className="flex items-center gap-0.5">
              {SPEED_LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  onClick={() => onSpeedChange(lvl.value)}
                  className={`px-2 py-0.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    currentSpeed === lvl.value
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={`${lvl.label} - ${lvl.tag}`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onQuickTry}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm whitespace-nowrap cursor-pointer"
          >
            Probar Frase
          </button>
        </div>
      </div>
    </header>
  );
};
