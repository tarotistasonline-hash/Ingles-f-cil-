import React from 'react';
import { ArrowLeft, ArrowRight, Home, LayoutGrid, ScrollText } from 'lucide-react';

export interface ModuleInfo {
  id: string;
  title: string;
  icon: string;
  badge: string;
  prevId?: string;
  nextId?: string;
  prevName?: string;
  nextName?: string;
}

export const MODULE_REGISTRY: Record<string, ModuleInfo> = {
  'desde-cero': {
    id: 'desde-cero',
    title: 'Nivel Cero Absoluto',
    icon: '🌱',
    badge: 'Principiante',
    nextId: 'entrecasa',
    nextName: 'Rincón de Entrecasa',
  },
  'entrecasa': {
    id: 'entrecasa',
    title: 'Rincón de Entrecasa',
    icon: '☕',
    badge: 'Día a Día',
    prevId: 'desde-cero',
    prevName: 'Desde Cero',
    nextId: 'simulator',
    nextName: 'Simulador de Charlas',
  },
  'simulator': {
    id: 'simulator',
    title: 'Simulador de Charlas Reales',
    icon: '🎙️',
    badge: 'Voz y Audio',
    prevId: 'entrecasa',
    prevName: 'Rincón de Entrecasa',
    nextId: 'cinema',
    nextName: 'Cine & Películas',
  },
  'cinema': {
    id: 'cinema',
    title: 'Cine & Películas en Inglés',
    icon: '🎬',
    badge: 'Oído & Subtítulos',
    prevId: 'simulator',
    prevName: 'Simulador de Charlas',
    nextId: 'tweak',
    nextName: 'Habla Coloquial',
  },
  'tweak': {
    id: 'tweak',
    title: 'Habla Coloquial (SpeakTweak)',
    icon: '🔄',
    badge: 'Transformador',
    prevId: 'cinema',
    prevName: 'Cine & Películas',
    nextId: 'chunks',
    nextName: 'Bloques de Poder',
  },
  'chunks': {
    id: 'chunks',
    title: 'Bloques de Poder (50 Chunks)',
    icon: '🧩',
    badge: 'Comodines',
    prevId: 'tweak',
    prevName: 'Habla Coloquial',
    nextId: 'gym',
    nextName: 'Gimnasio de Reflejos',
  },
  'gym': {
    id: 'gym',
    title: 'Gimnasio de Reflejos en 5s',
    icon: '⚡',
    badge: 'Agilidad',
    prevId: 'chunks',
    prevName: 'Bloques de Poder',
    nextId: 'connected',
    nextName: 'Laboratorio de Oído',
  },
  'connected': {
    id: 'connected',
    title: 'Laboratorio de Oído Rápido',
    icon: '🎧',
    badge: 'Connected Speech',
    prevId: 'gym',
    prevName: 'Gimnasio de Reflejos',
    nextId: 'dashboard',
    nextName: 'Mi Crecimiento',
  },
  'dashboard': {
    id: 'dashboard',
    title: 'Mi Progreso Easy (Soltura & Medallas)',
    icon: '📊',
    badge: 'Estadísticas & Medallas',
    prevId: 'connected',
    prevName: 'Laboratorio de Oído',
    nextId: 'coach',
    nextName: 'Preguntarle a la profe',
  },
  'coach': {
    id: 'coach',
    title: 'Preguntarle a la profe',
    icon: '👩‍🏫',
    badge: 'Dudas & Asesoría',
    prevId: 'dashboard',
    prevName: 'Mi Crecimiento',
    nextId: 'method',
    nextName: 'Las 4 Claves',
  },
  'method': {
    id: 'method',
    title: 'Las 4 Claves Sin Reglas',
    icon: '💡',
    badge: 'Filosofía',
    prevId: 'coach',
    prevName: 'Preguntarle a la profe',
    nextId: 'blog',
    nextName: 'Blog y Sugerencias',
  },
  'blog': {
    id: 'blog',
    title: 'Blog de Opiniones & Sugerencias',
    icon: '💬',
    badge: 'Comunidad',
    prevId: 'method',
    prevName: 'Las 4 Claves',
    nextId: 'kit',
    nextName: 'Kit de Bolsillo',
  },
  'kit': {
    id: 'kit',
    title: 'Audio-Kit de Bolsillo (Offline)',
    icon: '🎧',
    badge: 'Pack MP3 & PDF',
    prevId: 'blog',
    prevName: 'Blog de Opiniones',
    nextId: 'desde-cero',
    nextName: 'Desde Cero',
  },
};

interface ModuleNavBarProps {
  currentModuleId: string;
  onNavigate: (moduleId: string) => void;
  viewMode: 'modular' | 'full';
  onToggleViewMode: () => void;
}

export const ModuleNavBar: React.FC<ModuleNavBarProps> = ({
  currentModuleId,
  onNavigate,
  viewMode,
  onToggleViewMode,
}) => {
  const currentInfo = MODULE_REGISTRY[currentModuleId] || {
    id: currentModuleId,
    title: 'Módulo de Práctica',
    icon: '✨',
    badge: 'Práctica',
  };

  return (
    <div className="sticky top-16 z-30 bg-[#0F0C24]/95 backdrop-blur-md border-b border-[#2B215E] py-2.5 shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back to Home / Hub */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('hero')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1440] hover:bg-[#251C5C] text-xs font-bold text-amber-300 hover:text-white border border-[#352A75] transition-all cursor-pointer shadow-xs"
            title="Volver a la portada y catálogo de módulos"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">← Volver al Inicio</span>
            <span className="sm:hidden">Inicio</span>
          </button>

          <div className="h-5 w-px bg-slate-700/60 hidden sm:block" />

          {/* Active Module Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-base">{currentInfo.icon}</span>
            <span className="text-xs sm:text-sm font-bold text-white">
              {currentInfo.title}
            </span>
            <span className="hidden md:inline-block text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
              {currentInfo.badge}
            </span>
          </div>
        </div>

        {/* Right: Next / Previous & View Switcher */}
        <div className="flex items-center gap-2">
          {/* Quick Module Switcher Dropdown */}
          <select
            value={currentModuleId}
            onChange={(e) => onNavigate(e.target.value)}
            className="text-xs font-semibold bg-[#14102E] text-slate-200 border border-[#2F2466] rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer hidden lg:block"
          >
            {Object.values(MODULE_REGISTRY).map((mod) => (
              <option key={mod.id} value={mod.id}>
                {mod.icon} {mod.title}
              </option>
            ))}
          </select>

          {/* Prev Button */}
          {currentInfo.prevId && (
            <button
              onClick={() => onNavigate(currentInfo.prevId!)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              title={`Ir al módulo anterior: ${currentInfo.prevName || ''}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{currentInfo.prevName}</span>
            </button>
          )}

          {/* Next Button */}
          {currentInfo.nextId && (
            <button
              onClick={() => onNavigate(currentInfo.nextId!)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              title={`Ir al siguiente módulo: ${currentInfo.nextName || ''}`}
            >
              <span className="hidden sm:inline">{currentInfo.nextName}</span>
              <span className="sm:hidden">Siguiente</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Toggle between focused and full mode */}
          <button
            onClick={onToggleViewMode}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#151030] hover:bg-[#20184A] text-slate-400 hover:text-amber-300 border border-[#30256B] text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ml-1"
            title={
              viewMode === 'modular'
                ? 'Cambiar a modo pergamino (ver todo junto de corrido)'
                : 'Cambiar a modo módulos enfocados (sin scroll infinito)'
            }
          >
            {viewMode === 'modular' ? (
              <>
                <ScrollText className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline text-[11px]">Ver Todo Corrido</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline text-[11px]">Modo Módulos</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ModuleBottomNav: React.FC<{
  currentModuleId: string;
  onNavigate: (moduleId: string) => void;
}> = ({ currentModuleId, onNavigate }) => {
  const currentInfo = MODULE_REGISTRY[currentModuleId];
  if (!currentInfo) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-6 border-t border-[#251D52]">
      <div className="bg-[#120E30]/80 border border-[#2D2260] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            ¿Terminaste esta práctica?
          </p>
          <h4 className="text-base sm:text-lg font-bold text-white">
            Continúa con el siguiente paso o vuelve al catálogo
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-center">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              onNavigate('hero');
            }}
            className="px-4 py-2.5 rounded-xl bg-[#1C1544] hover:bg-[#261E5E] text-xs sm:text-sm font-semibold text-slate-200 border border-[#362A76] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>Volver al Inicio</span>
          </button>

          {currentInfo.nextId && (
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onNavigate(currentInfo.nextId!);
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20"
            >
              <span>Siguiente: {currentInfo.nextName}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
