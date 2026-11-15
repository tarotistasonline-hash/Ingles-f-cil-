import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Headphones, X, Menu } from 'lucide-react';
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
  onOpenKitModal,
}) => {
  const [showSpeedHelp, setShowSpeedHelp] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const speedHelpRef = useRef<HTMLDivElement>(null);

  // Close speed help popover if clicked outside or Esc key pressed
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (speedHelpRef.current && !speedHelpRef.current.contains(event.target as Node)) {
        setShowSpeedHelp(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowSpeedHelp(false);
      }
    }
    if (showSpeedHelp) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSpeedHelp]);

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

        {/* Zone 2: Clean, focused primary navigation (5 top-level items) */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('desde-cero')}
            className={`nav-link-item transition-colors hover:text-emerald-300 flex items-center gap-1.5 py-1 cursor-pointer ${
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
            className={`nav-link-item transition-colors hover:text-white flex items-center gap-1.5 py-1 cursor-pointer ${
              activeTab === 'entrecasa' || activeTab === 'simulator' || activeTab === 'chunks'
                ? 'text-amber-400 font-bold underline decoration-2 underline-offset-4'
                : ''
            }`}
          >
            <span>☕</span>
            <span>Vida Real</span>
          </button>
          <button
            onClick={() => setActiveTab('cinema')}
            className={`nav-link-item transition-colors hover:text-amber-300 flex items-center gap-1.5 py-1 cursor-pointer ${
              activeTab === 'cinema' || activeTab === 'music'
                ? 'text-amber-400 font-bold underline decoration-2 underline-offset-4'
                : ''
            }`}
            title="Aprende inglés con películas y música"
          >
            <span>🎬</span>
            <span>Cine & Música</span>
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`btn-interactive flex items-center gap-1.5 px-3 py-1 rounded-lg border font-bold text-xs shadow-xs cursor-pointer ${
              activeTab === 'coach'
                ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/20'
                : 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-400/40 hover:border-amber-400 text-purple-200 hover:text-white'
            }`}
            title="Pregúntale cualquier duda de inglés al profe Leo"
          >
            <span>👨‍🏫</span>
            <span>Profe Leo</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-link-item transition-colors hover:text-amber-300 flex items-center gap-1.5 py-1 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-amber-400 font-bold underline decoration-2 underline-offset-4'
                : ''
            }`}
          >
            <span>📊</span>
            <span>Mi Progreso</span>
          </button>
        </nav>

        {/* Zone 3: Visits counter, Speed control, Primary CTA & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Real visits counter on desktop and tablet */}
          <div className="hidden md:block">
            <RealVisitsBadge compact={true} />
          </div>

          {/* Beginner-friendly Speed Selector with Clear Explanation Popover */}
          <div className="relative" ref={speedHelpRef}>
            <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/95 border border-amber-400/30 px-2 py-1 rounded-xl shadow-xs">
              {/* Informative Label & Help Button (Accessible on Mobile and Desktop) */}
              <button
                type="button"
                onClick={() => setShowSpeedHelp((prev) => !prev)}
                className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1 pl-0.5 cursor-pointer transition-colors group"
                title="Toca para ver qué significa 0.5x, 0.65x, 0.8x y 1.0x"
                aria-label="Información sobre las velocidades de audio"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Velocidad:</span>
                <span className="sm:hidden text-[10px]">Vel:</span>
                <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center text-[10px] font-black transition-colors">
                  ?
                </span>
              </button>

              {/* Speed Buttons with Clear Tags */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                {SPEED_LEVELS.map((lvl) => {
                  const isSelected = currentSpeed === lvl.value;
                  return (
                    <button
                      key={lvl.value}
                      onClick={() => onSpeedChange(lvl.value)}
                      className={`px-1.5 sm:px-2 py-0.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs ring-1 ring-amber-300'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                      title={lvl.tag}
                    >
                      <span>{lvl.label}</span>
                      <span
                        className={`text-[9px] hidden md:inline font-bold uppercase ${
                          isSelected ? 'text-slate-950' : 'text-slate-400'
                        }`}
                      >
                        {lvl.shortTag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanatory Dropdown Popover (Works on Mobile without hover) */}
            {showSpeedHelp && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-[#110D2C] border-2 border-amber-400/70 rounded-2xl p-4 shadow-2xl z-50 animate-fade-in text-left">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#2C215C] mb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-white">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>¿Qué significan 0.5, 0.65, 0.8 y 1.0?</span>
                  </div>
                  <button
                    onClick={() => setShowSpeedHelp(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Cerrar explicación"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                  Son las <strong>velocidades de reproducción</strong> de los audios nativos en toda la aplicación. Podés cambiarlas en cualquier momento según tu nivel:
                </p>

                {/* The speeds with full explanations and tap to switch */}
                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => {
                      onSpeedChange(0.5);
                      setShowSpeedHelp(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      currentSpeed === 0.5
                        ? 'bg-amber-400/25 border-amber-400 text-white shadow-sm ring-1 ring-amber-400'
                        : 'bg-black/40 border-[#261E52] text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-300 text-xs">
                        🌱 0.5x — Ultra Lento (Paso a paso)
                      </span>
                      {currentSpeed === 0.5 ? (
                        <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                          ACTIVO
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Elegir</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                      <strong>Palabras separadas una a una con pausas:</strong> pensado para quien no sabe nada de inglés. Cada palabra suena aislada y nítida para que puedas memorizarla y repetirla fácilmente sin que se peguen los sonidos.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      onSpeedChange(0.65);
                      setShowSpeedHelp(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      currentSpeed === 0.65
                        ? 'bg-amber-400/20 border-amber-400 text-white shadow-sm'
                        : 'bg-black/40 border-[#261E52] text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-300 text-xs">
                        🐢 0.65x — Lento (Principiante)
                      </span>
                      {currentSpeed === 0.65 ? (
                        <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                          ACTIVO
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Elegir</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                      Ritmo pausado continuo para captar letras y pronunciación en principiantes.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      onSpeedChange(0.8);
                      setShowSpeedHelp(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      currentSpeed === 0.8
                        ? 'bg-emerald-400/20 border-emerald-400 text-white shadow-sm'
                        : 'bg-black/40 border-[#261E52] text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-emerald-300 text-xs">
                        🎯 0.8x — Pausado y Claro (Recomendado)
                      </span>
                      {currentSpeed === 0.8 ? (
                        <span className="text-[10px] bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                          ACTIVO
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Elegir</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                      Ritmo óptimo: ni muy rápido ni muy lento. El más cómodo para repetir y hablar fluido.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      onSpeedChange(1.0);
                      setShowSpeedHelp(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      currentSpeed === 1.0
                        ? 'bg-sky-400/20 border-sky-400 text-white shadow-sm'
                        : 'bg-black/40 border-[#261E52] text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sky-300 text-xs">
                        ⚡ 1.0x — Nativo Real (Normal)
                      </span>
                      {currentSpeed === 1.0 ? (
                        <span className="text-[10px] bg-sky-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                          ACTIVO
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Elegir</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                      Velocidad espontánea real tal como hablan los nativos en la calle, el trabajo y películas.
                    </p>
                  </button>
                </div>

                {/* Voice clarity note */}
                <div className="mt-2.5 p-2 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center gap-2 text-xs">
                  <span className="text-emerald-400">🎙️</span>
                  <span className="text-[11px] text-slate-300">
                    <strong className="text-emerald-300">Voz activa:</strong> Hombre latino neutro con dicción clara y pausada (sin acento cerrado).
                  </span>
                </div>

                {/* Footer advice */}
                <div className="mt-3 pt-2.5 border-t border-[#2C215C] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-emerald-400 font-medium">
                    ✓ Se guarda solo en tu celular
                  </span>
                  <button
                    onClick={() => setShowSpeedHelp(false)}
                    className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer shadow-xs"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            )}
          </div>


          <button
            onClick={onOpenKitModal || (() => setActiveTab('kit'))}
            className="hidden sm:flex px-2.5 sm:px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 rounded-xl transition-all items-center gap-1.5 cursor-pointer shadow-xs"
            title="Abrir ventana del Audio-Kit de Bolsillo"
          >
            <Headphones className="w-3.5 h-3.5 text-amber-400" />
            <span>Audio-Kit</span>
          </button>

          <button
            onClick={onQuickTry}
            className="hidden sm:inline-flex px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm whitespace-nowrap cursor-pointer"
          >
            Probar Frase
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-amber-300 hover:border-amber-400/50 transition-colors cursor-pointer"
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Thumb-friendly access to all modules) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0E0B24] border-t border-[#281F54] px-4 py-4 space-y-3 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {[
              { id: 'desde-cero', label: '🌱 Desde Cero', accent: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/30' },
              { id: 'entrecasa', label: '☕ Vida Real', accent: 'text-amber-300 border-amber-500/30 bg-amber-950/30' },
              { id: 'simulator', label: '🎙️ Simulador Voz', accent: 'text-slate-200 border-slate-700 bg-slate-900/80' },
              { id: 'gym', label: '⚡ Reflejos 5s', accent: 'text-slate-200 border-slate-700 bg-slate-900/80' },
              { id: 'cinema', label: '🎬 Películas', accent: 'text-amber-200 border-red-500/30 bg-red-950/30' },
              { id: 'music', label: '🎵 Música & Oído', accent: 'text-fuchsia-200 border-fuchsia-500/30 bg-fuchsia-950/30' },
              { id: 'coach', label: '👨‍🏫 Profe Leo', accent: 'text-purple-200 border-purple-500/30 bg-purple-950/30' },
              { id: 'tweak', label: '✂️ Desarmar Frase', accent: 'text-slate-200 border-slate-700 bg-slate-900/80' },
              { id: 'dashboard', label: '📊 Mi Progreso', accent: 'text-amber-300 border-slate-700 bg-slate-900/80' },
              { id: 'blog', label: '💬 Opiniones', accent: 'text-slate-200 border-slate-700 bg-slate-900/80' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'ring-2 ring-amber-400 bg-amber-400/15 text-white border-amber-400'
                    : item.accent
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#281F54] flex items-center justify-between gap-2">
            <RealVisitsBadge compact={true} />
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onOpenKitModal) onOpenKitModal();
                else setActiveTab('kit');
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Audio-Kit</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
