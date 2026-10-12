import React, { useState, useEffect } from 'react';
import { Headphones, Sparkles, X, ArrowRight, Volume2 } from 'lucide-react';

interface AudioKitFloatingTriggerProps {
  onOpenModal: () => void;
}

export const AudioKitFloatingTrigger: React.FC<AudioKitFloatingTriggerProps> = ({
  onOpenModal,
}) => {
  const [showInvitationBubble, setShowInvitationBubble] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('vibe_kit_bubble_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  // Show gentle prompt bubble after 6 seconds if not dismissed
  useEffect(() => {
    if (bubbleDismissed) return;
    const timer = setTimeout(() => {
      setShowInvitationBubble(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [bubbleDismissed]);

  const handleDismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInvitationBubble(false);
    setBubbleDismissed(true);
    try {
      sessionStorage.setItem('vibe_kit_bubble_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-none">
      {/* Gentle Floating Invitation Bubble */}
      {showInvitationBubble && !bubbleDismissed && (
        <div
          onClick={onOpenModal}
          className="pointer-events-auto max-w-xs sm:max-w-sm p-3.5 rounded-2xl bg-[#140F35]/95 border border-amber-400/50 shadow-2xl shadow-amber-500/15 backdrop-blur-md cursor-pointer transition-all hover:scale-102 hover:border-amber-400 group animate-bounce-slight"
          role="complementary"
          aria-label="Invitación a descubrir el Audio-Kit"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pack de Bolsillo Offline</span>
            </div>
            <button
              onClick={handleDismissBubble}
              className="p-1 -mr-1 -mt-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Cerrar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">
            ¿Querés escuchar en el auto o caminando{' '}
            <strong className="text-amber-300 font-semibold">sin internet</strong>?
            Descargá los 120 audios y la guía en tu celular.
          </p>

          <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
            <span className="font-mono font-bold text-amber-400">
              Pago único: $9 USD
            </span>
            <span className="font-semibold text-white group-hover:text-amber-300 flex items-center gap-1 transition-colors">
              <span>Escuchar muestra</span>
              <ArrowRight className="w-3 h-3 text-amber-400" />
            </span>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Pill */}
      <button
        onClick={onOpenModal}
        className="pointer-events-auto group relative flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-full bg-gradient-to-r from-[#1E174E] via-[#2A1F6E] to-[#1E174E] hover:from-[#2A1F6E] hover:to-[#382B91] border-2 border-amber-400/70 hover:border-amber-300 shadow-xl shadow-amber-500/20 text-white font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Abrir Audio-Kit de Bolsillo Offline"
      >
        {/* Pulsing glow ring */}
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
        </span>

        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          <div className="text-left leading-tight">
            <span className="text-xs sm:text-sm font-extrabold text-white block">
              Audio-Kit de Bolsillo
            </span>
            <span className="text-[10px] text-amber-300 font-medium hidden sm:inline">
              120 Audios MP3 · Offline ($9)
            </span>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 ml-0.5">
          Ver Kit
        </span>
      </button>
    </div>
  );
};
