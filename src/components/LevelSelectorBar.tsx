import React from 'react';
import { SKILL_LEVELS } from '../data/defaultData';
import { SkillLevel } from '../types';
import { Sprout, Coffee, Zap, Layers } from 'lucide-react';

interface LevelSelectorBarProps {
  currentLevel: SkillLevel | 'all';
  onSelectLevel: (level: SkillLevel | 'all') => void;
  className?: string;
}

export const LevelSelectorBar: React.FC<LevelSelectorBarProps> = ({
  currentLevel,
  onSelectLevel,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="bg-[#120E30]/90 border border-[#2D2260] rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Label */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Tu Nivel de Aprendizaje:</span>
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Elige tu punto de partida (o explora todos):
            </span>
          </div>

          {/* Level Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SKILL_LEVELS.map((lvl) => {
              const isSelected = currentLevel === lvl.id;
              let activeColor = 'bg-amber-400 text-slate-950 font-bold shadow-md';
              if (lvl.id === 'cero') {
                activeColor = 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20';
              } else if (lvl.id === 'principiante') {
                activeColor = 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20';
              } else if (lvl.id === 'avanzado') {
                activeColor = 'bg-violet-400 text-slate-950 font-bold shadow-md shadow-violet-500/20';
              }

              return (
                <button
                  key={lvl.id}
                  onClick={() => onSelectLevel(lvl.id as SkillLevel | 'all')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? activeColor
                      : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                  title={lvl.desc}
                >
                  <span className="text-sm">{lvl.icon}</span>
                  <span className="truncate">{lvl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level description helper text */}
        <div className="mt-3 pt-3 border-t border-[#261E52] text-xs text-slate-300 flex items-center gap-2">
          {currentLevel === 'cero' && (
            <span className="text-emerald-300 flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <strong>Modo Desde Cero:</strong> Fonética figurada en español ("JAI DER"), frases de rescate ("A bit slower, please") y audio ultra lento (0.6x).
            </span>
          )}
          {currentLevel === 'principiante' && (
            <span className="text-amber-300 flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <strong>Modo Principiante (A1-A2):</strong> Bloques cotidianos para la cocina, hacer pedidos en cafés y favores domésticos sin dudar ni conjugar.
            </span>
          )}
          {currentLevel === 'avanzado' && (
            <span className="text-violet-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <strong>Modo Un Poco Más Avanzado (B1-B2):</strong> Modismos nativos ("Tell me about it", "Slipped my mind"), connected speech rápido y soltura conversacional.
            </span>
          )}
          {currentLevel === 'all' && (
            <span className="text-slate-400">
              Mostrando la ruta completa: desde los primeros pasos hasta modismos nativos avanzados.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
