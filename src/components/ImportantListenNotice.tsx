import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Play, RotateCw } from 'lucide-react';
import {
  playWelcomeVoice,
  pauseWelcomeVoice,
  subscribeWelcomeState,
  getWelcomeState,
  WelcomeVoiceState,
} from '../services/welcomeVoice';

interface ImportantListenNoticeProps {
  variant?: 'banner' | 'header-badge' | 'hero-badge';
  className?: string;
}

export const ImportantListenNotice: React.FC<ImportantListenNoticeProps> = ({
  variant = 'banner',
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

  // Variant 1: Top Announcement Bar (sits above Header)
  if (variant === 'banner') {
    return (
      <aside
        aria-label="Audio de bienvenida"
        className={`w-full bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 border-b border-amber-400/40 px-3 py-1.5 sm:py-2 transition-all ${className}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
          {/* Left / Center content */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* The clickable message button requested by user */}
            <button
              type="button"
              onClick={handleClick}
              className={`group inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-black text-xs sm:text-sm tracking-wide transition-all shadow-md cursor-pointer select-none ${
                voiceState.isPlaying
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 ring-offset-2 ring-offset-[#0C0A1D] animate-pulse'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:brightness-110 hover:scale-102 active:scale-98 shadow-amber-400/30'
              }`}
              title="Haz clic para escuchar el mensaje de bienvenida con voz nativa neutra"
            >
              {voiceState.isPlaying ? (
                <>
                  {/* Equalizer sound bars */}
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
                  {/* User requested text: destacada aunque no muy grande */}
                  <span className="font-extrabold uppercase">¡Importante! Escuchar</span>
                </>
              )}
            </button>

            {/* Contextual description - clear, compact */}
            <span className="text-[11px] sm:text-xs text-amber-200/90 font-medium truncate">
              {voiceState.isPlaying ? (
                <span>Voz de bienvenida activa • Aprendé inglés rápido y fácil</span>
              ) : voiceState.hasPlayed ? (
                <span>Mensaje escuchado • Podés volver a hacer clic para repetir</span>
              ) : (
                <span>Mensaje breve de bienvenida para quienes empiezan desde cero</span>
              )}
            </span>
          </div>

          {/* Right quick replay if already played */}
          {voiceState.hasPlayed && !voiceState.isPlaying && (
            <button
              type="button"
              onClick={handleReplay}
              className="text-[11px] text-amber-300 hover:text-white flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md hover:bg-amber-400/10 transition-colors cursor-pointer shrink-0"
              title="Volver a escuchar el saludo de bienvenida"
            >
              <RotateCw className="w-3 h-3" />
              <span className="hidden sm:inline">Repetir bienvenida</span>
            </button>
          )}
        </div>
      </aside>
    );
  }

  // Variant 2: Header Badge (fits directly inside Header nav/actions)
  if (variant === 'header-badge') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`group inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full font-extrabold text-[11px] sm:text-xs transition-all shadow-xs cursor-pointer select-none ${
          voiceState.isPlaying
            ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse'
            : 'bg-amber-400/20 text-amber-300 border border-amber-400/60 hover:bg-amber-400 hover:text-slate-950'
        } ${className}`}
        title="Escuchar mensaje de bienvenida en audio"
      >
        {voiceState.isPlaying ? (
          <>
            <span className="flex items-center gap-0.5 h-2.5">
              <span className="w-0.5 bg-current rounded-full animate-pulse h-2.5" />
              <span className="w-0.5 bg-current rounded-full animate-pulse h-1.5" />
              <span className="w-0.5 bg-current rounded-full animate-pulse h-2" />
            </span>
            <span className="uppercase">Escuchando</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="uppercase font-black">Importante! escuchar</span>
          </>
        )}
      </button>
    );
  }

  // Variant 3: Hero Badge (for landing hero callout)
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        className={`group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-black text-xs sm:text-sm tracking-wide transition-all shadow-md cursor-pointer select-none ${
          voiceState.isPlaying
            ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse'
            : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:brightness-110 hover:scale-103 active:scale-97 shadow-amber-400/25'
        }`}
      >
        {voiceState.isPlaying ? (
          <>
            <span className="flex items-center gap-0.5 h-3">
              <span className="w-1 bg-slate-950 rounded-full animate-bounce h-3" />
              <span className="w-1 bg-slate-950 rounded-full animate-bounce h-2" />
              <span className="w-1 bg-slate-950 rounded-full animate-bounce h-3" />
            </span>
            <span>Escuchando bienvenida...</span>
          </>
        ) : (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
            <Volume2 className="w-3.5 h-3.5" />
            <span>¡IMPORTANTE! ESCUCHAR</span>
          </>
        )}
      </button>
      <span className="text-[11px] text-amber-300/80 font-medium hidden sm:inline">
        (Audio de bienvenida en voz nativa)
      </span>
    </div>
  );
};
