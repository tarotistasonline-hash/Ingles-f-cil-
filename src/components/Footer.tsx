import React, { useState } from 'react';
import { Globe, ExternalLink, X, Copy, Check } from 'lucide-react';
import { RealVisitsBadge } from './RealVisitsBadge';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

const TRADUCE_YA_URL = 'https://traduce-ya.online';

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
}) => {
  const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyUrl = () => {
    try {
      navigator.clipboard.writeText(TRADUCE_YA_URL);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2200);
    } catch {
      // ignore
    }
  };

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

        {/* Self-Test Pronunciation Tip + External Translator Link */}
        <div className="py-5 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <span className="text-base shrink-0" aria-hidden="true">🎙️</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-300">Tip para tomarte lección solo:</strong> hablale en inglés al traductor — si traduce bien lo que quisiste decir, ¡es señal de que ya estás aprendiendo!
            </p>
          </div>
          <div className="shrink-0 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsTranslatorOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/60 text-xs text-slate-200 hover:text-amber-300 transition-all shadow-xs cursor-pointer group"
              title="Abrir traduce-ya.online aquí mismo"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Probalo en <strong className="text-white group-hover:text-amber-300">traduce-ya.online</strong>
              </span>
            </button>
            <a
              href={TRADUCE_YA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-xs text-slate-400 hover:text-white transition-all"
              title="Abrir traduce-ya.online en una pestaña nueva"
              aria-label="Abrir traduce-ya.online en una pestaña nueva"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-xs text-slate-400 hover:text-emerald-300 transition-all cursor-pointer"
              title="Copiar enlace traduce-ya.online"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">Copiado</span>
                </>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} VibeEnglish. Aprende a hablar con libertad.</p>
          
          <div className="flex flex-wrap items-center gap-3">
            <span>Audio adaptable para principiantes</span>
          </div>
        </div>
      </div>

      {/* In-App Modal for traduce-ya.online (works reliably even inside sandboxed iframes) */}
      {isTranslatorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsTranslatorOpen(false)}
        >
          <div
            className="bg-[#0B1120] border border-slate-700/80 rounded-2xl w-full max-w-4xl h-[82vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-white truncate">
                  Traduce Ya — Probá tu inglés en vivo
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? '¡Copiado!' : 'Copiar link'}</span>
                </button>
                <a
                  href={TRADUCE_YA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors"
                >
                  <span>Abrir fuera</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setIsTranslatorOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Cerrar traductor"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <iframe
              src={TRADUCE_YA_URL}
              title="Traduce Ya - Traductor de Voz y Conversación"
              className="w-full flex-1 bg-[#090d16] border-0"
              allow="microphone; autoplay; clipboard-write"
            />
          </div>
        </div>
      )}
    </footer>
  );
};
