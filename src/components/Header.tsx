import React from 'react';
import { Volume2, LayoutGrid, ScrollText, Headphones } from 'lucide-react';
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
  onOpenKitModal?: () => void;
  onOpenVault?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onQuickTry,
  currentSpeed,
  onSpeedChange,
  viewMode = 'modular',
  onToggleViewMode,
  onOpenKitModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0C0A1D]/85 backdrop-blur-md border-b border-[#281F54]/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('hero')}
          className="text-left group cursor-pointer focus:outline-none flex items-center gap-2"
        >
          <span className="font-heading text-lg sm:text-2xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
            Inglés Fácil y Fluido
          </span>
          <span className="hidden sm:inline-block text-[10px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Fácil & Sin Vueltas
          </span>
        </button>

        {/* Zone 2: 4-5 clean, high-impact navigation links (Decongested) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('desde-cero')}
            className={`transition-colors hover:text-emerald-300 flex items-center gap-1.5 py-1 ${
              activeTab === 'desde-cero'
                ? 'text-emerald-400 font-bold underline decoration-2 underline-offset-4'
                : 'text-emerald-300/90'
            }`}
          >
            <span>🌱</span>
            <span>Desde Cero</span>
          </button>
          <button
            onClick={() => setActiveTab('entrecasa')}
            className={`transition-colors hover:text-white flex items-center gap-1.5 py-1 ${
              activeTab === 'entrecasa' || activeTab === 'simulator' || activeTab === 'chunks'
                ? 'text-amber-400 font-bold underline decoration-2 underline-offset-4'
                : ''
            }`}
          >
            <span>☕</span>
            <span>Vida Real & Práctica</span>
          </button>
          <button
            onClick={() => setActiveTab('gym')}
            className={`transition-colors hover:text-white flex items-center gap-1.5 py-1 ${
              activeTab === 'gym'
                ? 'text-amber-400 font-bold underline decoration-2 underline-offset-4'
                : ''
            }`}
          >
            <span>⚡</span>
            <span>Reflejos 5s</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`transition-colors hover:text-white flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400/10 border border-amber-400/25 ${
              activeTab === 'dashboard'
                ? 'text-amber-400 font-bold border-amber-400/60'
                : 'text-amber-300'
            }`}
          >
            <span>📊 Progreso</span>
          </button>
          <button
            onClick={onOpenKitModal || (() => setActiveTab('kit'))}
            className={`transition-colors hover:text-white flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border border-amber-400/40 hover:border-amber-400 text-amber-300 font-bold shadow-xs ${
              activeTab === 'kit'
                ? 'ring-2 ring-amber-400 text-white'
                : 'hover:text-amber-200'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>🎧 Audio-Kit ($9.990)</span>
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
            onClick={onOpenKitModal || (() => setActiveTab('kit'))}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-amber-300 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:scale-102"
            title="Abrir ventana emergente del Audio-Kit de Bolsillo"
          >
            <Headphones className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Audio-Kit</span>
            <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-extrabold uppercase">
              $9.990
            </span>
          </button>

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
