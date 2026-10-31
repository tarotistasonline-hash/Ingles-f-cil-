import React from 'react';
import { RealVisitsBadge } from './RealVisitsBadge';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
}) => {
  return (
    <footer className="bg-[#070D18] text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div className="space-y-1 text-center md:text-left">
            <span className="font-heading text-xl font-bold text-white tracking-tight">
              Inglés Fácil y Fluido
            </span>
            <p className="text-xs text-slate-400 max-w-sm">
              Una forma sencilla de aprender el idioma: fluidez natural, bloques de conversación real y cero recetas gramaticales rígidas.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400">
            <button
              onClick={() => onNavigate('entrecasa')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Vida Cotidiana
            </button>
            <button
              onClick={() => onNavigate('simulator')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Simulador de Voz
            </button>
            <button
              onClick={() => onNavigate('cinema')}
              className="hover:text-amber-400 transition-colors cursor-pointer text-amber-200"
            >
              🎬 Cine & Oído
            </button>
            <button
              onClick={() => onNavigate('music')}
              className="hover:text-fuchsia-300 transition-colors cursor-pointer text-fuchsia-300"
            >
              🎵 Música & Oído
            </button>
            <button
              onClick={() => onNavigate('method')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Método Sin Reglas
            </button>
            <button
              onClick={() => onNavigate('tweak')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Habla Coloquial
            </button>
            <button
              onClick={() => onNavigate('chunks')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Bloques de Poder
            </button>
            <button
              onClick={() => onNavigate('gym')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Reflejos en 5s
            </button>
            <button
              onClick={() => onNavigate('blog')}
              className="hover:text-amber-400 transition-colors cursor-pointer text-amber-300 font-medium"
            >
              💬 Blog & Sugerencias
            </button>
            <button
              onClick={() => onNavigate('kit')}
              className="hover:text-emerald-300 transition-colors cursor-pointer text-emerald-400 font-medium"
            >
              🎧 Audio-Kit de Bolsillo
            </button>
          </nav>
        </div>

        {/* Real Visits Counter with Creator Exclusion */}
        <div className="py-6 border-b border-slate-800/80">
          <RealVisitsBadge />
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} VibeEnglish. Aprende a hablar con libertad.</p>
          
          <div className="flex flex-wrap items-center gap-3">
            <span>Audio adaptable para principiantes</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
