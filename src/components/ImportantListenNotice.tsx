import React, { useEffect, useState } from 'react';
import { Volume2, RotateCw } from 'lucide-react';
import {
  playWelcomeVoice,
  pauseWelcomeVoice,
  subscribeWelcomeState,
  getWelcomeState,
  WelcomeVoiceState,
} from '../services/welcomeVoice';

interface ImportantListenNoticeProps {
  className?: string;
}

export const ImportantListenNotice: React.FC<ImportantListenNoticeProps> = ({
  className = '',
}) => {
  const [voiceState, setVoiceState] = useState<WelcomeVoiceState>(getWelcomeState);

  useEffect(() => {
    const unsubscribe = subscribeWelcomeState((newState) => {
      setVoiceState(newState);
    });
    return () => unsubscribe();
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (voiceState.isPlaying) {
      pauseWelcomeVoice();
    } else {
      playWelcomeVoice({ force: true, fromBeginning: voiceState.hasPlayed });
    }
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playWelcomeVoice({ force: true, fromBeginning: true });
  };

  return (
    <aside
      aria-label="Panel importante escuchar"
      className={`w-full bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 border-b border-amber-400/40 px-3 py-1.5 sm:py-2 transition-all ${className}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={handleClick}
            className={`group inline-flex items-center gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full font-black text-xs sm:text-sm tracking-wide transition-all shadow-md cursor-pointer select-none ${
              voiceState.isPlaying
                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 ring-offset-2 ring-offset-[#0C0A1D] animate-pulse'
                : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:brightness-110 hover:scale-102 active:scale-98 shadow-amber-400/30'
            }`}
            title="Haz clic para escuchar el audio"
          >
            {voiceState.isPlaying ? (
              <>
                <span className="flex items-center gap-0.5 h-3.5">
                  <span className="w-1 bg-slate-950 rounded-full animate-[bounce_0.6s_ease-in-out_infinite] h-3.5" />
                  <span className="w-1 bg-slate-950 rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.15s] h-2.5" />
                  <span className="w-1 bg-slate-950 rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.3s] h-3.5" />
                </span>
                <span className="font-extrabold uppercase">Escuchando... (Pausar)</span>
              </>
            ) : (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                </span>
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold uppercase tracking-wide">importante! escuchar</span>
              </>
            )}
          </button>

          {voiceState.isPlaying && (
            <span className="text-[11px] sm:text-xs text-amber-200/90 font-medium truncate">
              Reproduciendo audio...
            </span>
          )}
        </div>

        {voiceState.hasPlayed && !voiceState.isPlaying && (
          <button
            type="button"
            onClick={handleReplay}
            className="text-[11px] text-amber-300 hover:text-white flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md hover:bg-amber-400/10 transition-colors cursor-pointer shrink-0"
            title="Volver a escuchar"
          >
            <RotateCw className="w-3 h-3" />
            <span className="hidden sm:inline">Repetir</span>
          </button>
        )}
      </div>
    </aside>
  );
};
