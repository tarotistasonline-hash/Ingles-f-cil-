import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronDown, CheckCircle, Sparkles, PartyPopper, Check } from 'lucide-react';
import { triggerConfetti } from '../utils/confetti';
import { recordModuleCompletion } from '../services/fluencyTracker';

export interface TakeawayItem {
  point: string;
  explanation?: string;
  highlight?: string;
}

interface KeyTakeawaysToggleProps {
  moduleName?: string;
  moduleId?: string;
  takeaways: TakeawayItem[];
  className?: string;
  defaultExpanded?: boolean;
}

export const KeyTakeawaysToggle: React.FC<KeyTakeawaysToggleProps> = ({
  moduleName,
  moduleId,
  takeaways,
  className = '',
  defaultExpanded = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const storageKey = `vibe_mod_completed_${moduleId || moduleName || 'default'}`;
  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    try {
      localStorage.setItem(storageKey, String(nextState));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vibe:fluency_updated'));
        window.dispatchEvent(new CustomEvent('vibe:badge_updated'));
      }
    } catch {
      // ignore
    }

    if (nextState) {
      recordModuleCompletion(moduleId || moduleName || 'modulo');
      triggerConfetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-300 border ${
        isCompleted
          ? 'border-emerald-500/50 bg-[#0E1528]/85 ring-1 ring-emerald-500/20'
          : isOpen
          ? 'bg-[#150F38]/95 border-amber-400/50 shadow-xl shadow-amber-500/5 ring-1 ring-amber-400/20'
          : 'bg-[#120D30]/60 border-[#2D2260] hover:border-amber-400/40 hover:bg-[#16103D]'
      } ${className}`}
    >
      {/* Toggle Button Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer group focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              isCompleted
                ? 'bg-emerald-400 text-slate-950 font-bold'
                : isOpen
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-amber-400/15 text-amber-300 group-hover:bg-amber-400 group-hover:text-slate-950'
            }`}
          >
            {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <Lightbulb className="w-4 h-4" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isCompleted ? 'Módulo Completado ✓' : 'Puntos Clave / Key Takeaways'}
              </span>
              {moduleName && (
                <span className="hidden sm:inline-block text-[11px] text-slate-400">
                  · {moduleName}
                </span>
              )}
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors">
              {isOpen ? 'Ocultar Resumen y Puntos Clave' : 'Show Key Takeaways (Ver Puntos Clave)'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-medium text-amber-300/80 group-hover:text-amber-300">
          {isCompleted && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Check className="w-3 h-3" /> Dominado
            </span>
          )}
          <span className="hidden sm:inline">
            {isOpen ? 'Cerrar' : `${takeaways.length} claves`}
          </span>
          <div
            className={`p-1 rounded-lg transition-transform duration-200 ${
              isOpen ? 'bg-amber-400/20 text-amber-300 rotate-180' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Expandable Content Area */}
      {isOpen && (
        <div className="px-5 pb-5 pt-1 border-t border-[#291F5B]/80 animate-in fade-in-50 duration-200 space-y-4">
          <div className="flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-amber-300/90 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Resumen práctico para aplicar hoy sin memorizar reglas:</span>
            </div>

            {/* Complete Module Action Button */}
            <button
              type="button"
              onClick={handleToggleComplete}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-amber-400/15 text-amber-300 border border-amber-400/30 hover:bg-amber-400 hover:text-slate-950'
              }`}
              title={isCompleted ? 'Desmarcar' : 'Completar y celebrar módulo'}
            >
              <PartyPopper className="w-3.5 h-3.5" />
              <span>{isCompleted ? '¡Módulo Completado!' : 'Marcar como Completado'}</span>
            </button>
          </div>

          <ul className="space-y-2.5">
            {takeaways.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 bg-slate-950/40 p-3 rounded-xl border border-white/5"
              >
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-white">
                    {item.point}
                    {item.highlight && (
                      <span className="ml-1.5 text-amber-300 font-mono-clean text-xs px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                        {item.highlight}
                      </span>
                    )}
                  </span>
                  {item.explanation && (
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                      {item.explanation}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

