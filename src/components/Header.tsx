import React, { useState, useRef, useEffect } from 'react';
import { Volume2, LayoutGrid, ScrollText, Headphones, HelpCircle, X, Check, Info, Sparkles, User } from 'lucide-react';
import {
  SPEED_LEVELS,
  VOICE_OPTIONS,
  AudioVoiceId,
  getGlobalAudioVoice,
  setGlobalAudioVoice,
  subscribeVoiceChange,
  playEnglishVoice,
} from '../services/audio';
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
  const [showSpeedHelp, setShowSpeedHelp] = useState(false);
  const speedHelpRef = useRef<HTMLDivElement>(null);

  // Dynamic user-selected voice state (Emma, Leo, David, Sarah)
  const [currentVoice, setCurrentVoice] = useState<AudioVoiceId>(getGlobalAudioVoice);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<AudioVoiceId | null>(null);
  const voicePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeVoiceChange((v) => setCurrentVoice(v));
    return () => unsub();
  }, []);

  // Close speed help popover if clicked outside or Esc key pressed
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (speedHelpRef.current && !speedHelpRef.current.contains(event.target as Node)) {
        setShowSpeedHelp(false);
      }
      if (voicePickerRef.current && !voicePickerRef.current.contains(event.target as Node)) {
        setShowVoicePicker(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowSpeedHelp(false);
        setShowVoicePicker(false);
      }
    }
    if (showSpeedHelp || showVoicePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSpeedHelp, showVoicePicker]);

  const activeVoiceObj =
    VOICE_OPTIONS.find((v) => v.id === currentVoice) || VOICE_OPTIONS[0];

  const handlePreviewVoice = async (v: typeof VOICE_OPTIONS[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewingVoiceId(v.id);
    try {
      await playEnglishVoice(v.samplePhrase, v.id, 0.8, {
        forceVoice: true,
        onEnd: () => setPreviewingVoiceId(null),
      });
    } catch {
      setPreviewingVoiceId(null);
    }
  };

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
            className={`nav-link-item transition-colors hover:text-emerald-300 flex items-center gap-1.5 py-1 ${
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
            className={`nav-link-item transition-colors hover:text-white flex items-center gap-1.5 py-1 ${
              activeTab === 'entrecasa' || activeTab === 'simulator' || activeTab === 'chunks'
                ? 'text-amber-400 font-bold underline decoration-2 underline-offset-4'
                : ''
            }`}
          >
            <span>☕</span>
            <span>Vida Real & Práctica</span>
          </button>
          <button
            onClick={() => setActiveTab('cinema')}
            className={`btn-interactive flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-xs shadow-xs ${
              activeTab === 'cinema'
                ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/20'
                : 'bg-red-950/40 hover:bg-red-900/60 border-red-500/40 hover:border-amber-400 text-amber-200 hover:text-white'
            }`}
            title="Aprende inglés con películas famosas y subtítulos en español"
          >
            <span>🎬</span>
            <span>Películas</span>
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`btn-interactive flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-xs shadow-xs ${
              activeTab === 'music'
                ? 'bg-fuchsia-400 text-slate-950 border-fuchsia-400 shadow-md shadow-fuchsia-400/20'
                : 'bg-fuchsia-950/40 hover:bg-fuchsia-900/60 border-fuchsia-500/40 hover:border-fuchsia-400 text-fuchsia-200 hover:text-white'
            }`}
            title="Aprende inglés con canciones famosas y subtítulos en español"
          >
            <span>🎵</span>
            <span>Música & Oído</span>
          </button>
          <button
            onClick={() => setActiveTab('gym')}
            className={`nav-link-item transition-colors hover:text-white flex items-center gap-1.5 py-1 ${
              activeTab === 'gym'
                ? 'text-amber-400 font-bold underline decoration-2 underline-offset-4'
                : ''
            }`}
          >
            <span>⚡</span>
            <span>Reflejos 5s</span>
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`btn-interactive flex items-center gap-1.5 px-3 py-1 rounded-lg border font-bold text-xs shadow-xs ${
              activeTab === 'coach'
                ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/20'
                : 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-400/40 hover:border-amber-400 text-purple-200 hover:text-white'
            }`}
            title="Pregúntale cualquier duda de inglés a la profe"
          >
            <span>👩‍🏫</span>
            <span>Preguntarle a la profe</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`btn-interactive flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400/10 border border-amber-400/25 ${
              activeTab === 'dashboard'
                ? 'text-amber-400 font-bold border-amber-400/60'
                : 'text-amber-300'
            }`}
          >
            <span>📊 Progreso</span>
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`btn-interactive flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold shadow-xs ${
              activeTab === 'blog'
                ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:text-white hover:border-amber-400/50'
            }`}
            title="Opiniones reales de estudiantes y buzón de la comunidad"
          >
            <span>💬</span>
            <span>Blog & Opiniones</span>
          </button>
          <button
            onClick={onOpenKitModal || (() => setActiveTab('kit'))}
            className={`btn-interactive flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border border-amber-400/40 hover:border-amber-400 text-amber-300 font-bold shadow-xs ${
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
          {/* Shortcut to Thematic Panels */}
          <button
            onClick={() => {
              setActiveTab('hero');
              setTimeout(() => {
                const el = document.getElementById('hub-panels');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 50);
            }}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 hover:text-amber-300 hover:border-amber-400/40 transition-colors cursor-pointer"
            title="Ver los paneles de aprendizaje temáticos"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-medium">Paneles Temáticos</span>
          </button>

          {/* Real visits counter on desktop and tablet */}
          <div className="hidden lg:block">
            <RealVisitsBadge compact={true} />
          </div>


          {/* Voice Selector (Feminine or Masculine choices) */}
          <div className="relative" ref={voicePickerRef}>
            <div className="flex items-center bg-slate-900/95 border border-sky-400/40 px-2 py-1 rounded-xl shadow-xs">
              <button
                type="button"
                onClick={() => setShowVoicePicker((prev) => !prev)}
                className="text-[11px] font-bold text-sky-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Elegir voz femenina o masculina para todos los audios"
                aria-label="Elegir voz de pronunciación"
              >
                <span className="text-sm leading-none">{activeVoiceObj.avatar}</span>
                <span className="hidden sm:inline text-slate-300 font-semibold">Voz:</span>
                <span className="text-white font-extrabold">{activeVoiceObj.name.split(' ')[0]}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase hidden md:inline ${
                    activeVoiceObj.gender === 'Femenina'
                      ? 'bg-pink-400/20 text-pink-300'
                      : 'bg-blue-400/20 text-blue-300'
                  }`}
                >
                  {activeVoiceObj.genderLabel.slice(0, 4)}
                </span>
                <span className="text-[10px] text-sky-400">▾</span>
              </button>
            </div>

            {/* Voice Selection Dropdown Popover */}
            {showVoicePicker && (
              <>
                {/* Mobile Backdrop */}
                <div
                  className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 sm:hidden animate-fade-in"
                  onClick={() => setShowVoicePicker(false)}
                />

                <div
                  className="fixed left-3 right-3 top-16 sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[420px] max-h-[calc(100dvh-5rem)] overflow-y-auto bg-[#0E0A24] border-2 border-sky-400 rounded-3xl p-4 sm:p-5 shadow-2xl z-50 animate-fade-in text-left overscroll-contain"
                >
                  {/* Popover Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#2C215C] mb-3 sticky top-0 bg-[#0E0A24] z-10 -mt-1 pt-1">
                    <div className="flex items-center gap-2.5 text-sm font-black text-white">
                      <div className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/40">
                        <Headphones className="w-4 h-4 text-sky-400" />
                      </div>
                      <div>
                        <span className="block leading-tight text-white font-extrabold">Elegí tu voz preferida</span>
                        <span className="text-[10px] text-sky-300 font-normal">Voces nativas femeninas y masculinas</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowVoicePicker(false)}
                      className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                      aria-label="Cerrar selector de voz"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                    Podés elegir una <strong>voz femenina o masculina</strong>, la que te resulte más clara, nítida y cómoda para memorizar y repetir:
                  </p>

                  {/* Voice Choices List */}
                  <div className="space-y-2.5 text-xs">
                    {VOICE_OPTIONS.map((v) => {
                      const isSelected = currentVoice === v.id;
                      const isPreviewing = previewingVoiceId === v.id;
                      return (
                        <div
                          key={v.id}
                          onClick={() => {
                            setGlobalAudioVoice(v.id);
                            setCurrentVoice(v.id);
                          }}
                          className={`w-full p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-sky-500/20 border-sky-400 text-white shadow-md ring-1 ring-sky-400'
                              : 'bg-black/40 border-[#261E52] text-slate-300 hover:bg-white/5 hover:border-sky-500/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl shrink-0">{v.avatar}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-white text-sm">{v.name}</span>
                                  <span
                                    className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase ${
                                      v.gender === 'Femenina'
                                        ? 'bg-pink-400/25 text-pink-300 border border-pink-400/40'
                                        : 'bg-blue-400/25 text-blue-300 border border-blue-400/40'
                                    }`}
                                  >
                                    {v.genderLabel}
                                  </span>
                                </div>
                                <span className="text-[11px] text-sky-300 block font-medium mt-0.5">{v.tone}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Sample Preview Play Button */}
                              <button
                                type="button"
                                onClick={(e) => handlePreviewVoice(v, e)}
                                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95"
                                title="Escuchar cómo suena esta voz"
                              >
                                <Volume2 className={`w-3.5 h-3.5 ${isPreviewing ? 'text-amber-400 animate-pulse' : 'text-sky-300'}`} />
                                <span>{isPreviewing ? 'Sonando...' : 'Probar'}</span>
                              </button>

                              {/* Status Badge */}
                              {isSelected ? (
                                <span className="text-[10px] bg-sky-400 text-slate-950 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">
                                  ACTIVA
                                </span>
                              ) : (
                                <span className="text-xs text-sky-400 hover:text-white px-2 py-1 rounded-lg font-bold">
                                  Elegir
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                            {v.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Popover Footer Sticky Bar */}
                  <div className="mt-4 pt-3 border-t border-[#2C215C] flex items-center justify-between gap-3 sticky bottom-0 bg-[#0E0A24] -mb-1 pb-1">
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span>✓</span> Voz activa: <strong className="text-white">{activeVoiceObj.name}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowVoicePicker(false)}
                      className="px-4 py-1.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs cursor-pointer shadow-sm transition-all"
                    >
                      Listo
                    </button>
                  </div>
                </div>
              </>
            )}
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
              <>
                {/* Mobile Backdrop */}
                <div
                  className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 sm:hidden animate-fade-in"
                  onClick={() => setShowSpeedHelp(false)}
                />

                <div
                  className="fixed left-3 right-3 top-16 sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[420px] max-h-[calc(100dvh-5rem)] overflow-y-auto bg-[#0E0A24] border-2 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-2xl z-50 animate-fade-in text-left overscroll-contain"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#2C215C] mb-3 sticky top-0 bg-[#0E0A24] z-10 -mt-1 pt-1">
                    <div className="flex items-center gap-2 text-sm font-black text-white">
                      <div className="p-1.5 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/40">
                        <Volume2 className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <span className="block leading-tight text-white font-extrabold">Velocidades de Reproducción</span>
                        <span className="text-[10px] text-amber-300 font-normal">Ajustá el ritmo a tu oído</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowSpeedHelp(false)}
                      className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                      aria-label="Cerrar explicación"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                    Son las <strong>velocidades de reproducción</strong> de los audios nativos en toda la aplicación. Podés cambiarlas en cualquier momento según tu nivel:
                  </p>

                  {/* The speeds with full explanations and tap to switch */}
                  <div className="space-y-2.5 text-xs">
                    <button
                      onClick={() => {
                        onSpeedChange(0.5);
                        setShowSpeedHelp(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        currentSpeed === 0.5
                          ? 'bg-amber-400/25 border-amber-400 text-white shadow-md ring-1 ring-amber-400'
                          : 'bg-black/40 border-[#261E52] text-slate-300 hover:bg-white/5 hover:border-amber-400/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-300 text-xs">
                          🌱 0.5x — Ultra Lento (Paso a paso)
                        </span>
                        {currentSpeed === 0.5 ? (
                          <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-black">
                            ACTIVO
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Elegir</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                        <strong>Palabras separadas una a una con pausas:</strong> pensado para quien no sabe nada de inglés. Cada palabra suena aislada y nítida para que puedas memorizarla y repetirla fácilmente sin que se peguen los sonidos.
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        onSpeedChange(0.65);
                        setShowSpeedHelp(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        currentSpeed === 0.65
                          ? 'bg-amber-400/20 border-amber-400 text-white shadow-md'
                          : 'bg-black/40 border-[#261E52] text-slate-300 hover:bg-white/5 hover:border-amber-400/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-300 text-xs">
                          🐢 0.65x — Lento (Principiante)
                        </span>
                        {currentSpeed === 0.65 ? (
                          <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-black">
                            ACTIVO
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Elegir</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                        Ritmo pausado continuo para captar letras y pronunciación en principiantes.
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        onSpeedChange(0.8);
                        setShowSpeedHelp(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        currentSpeed === 0.8
                          ? 'bg-emerald-400/20 border-emerald-400 text-white shadow-md'
                          : 'bg-black/40 border-[#261E52] text-slate-300 hover:bg-white/5 hover:border-emerald-400/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-300 text-xs">
                          🎯 0.8x — Pausado y Claro (Recomendado)
                        </span>
                        {currentSpeed === 0.8 ? (
                          <span className="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-md font-black">
                            ACTIVO
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Elegir</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                        Ritmo óptimo: ni muy rápido ni muy lento. El más cómodo para repetir y hablar fluido.
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        onSpeedChange(1.0);
                        setShowSpeedHelp(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        currentSpeed === 1.0
                          ? 'bg-sky-400/20 border-sky-400 text-white shadow-md'
                          : 'bg-black/40 border-[#261E52] text-slate-300 hover:bg-white/5 hover:border-sky-400/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sky-300 text-xs">
                          ⚡ 1.0x — Nativo Real (Normal)
                        </span>
                        {currentSpeed === 1.0 ? (
                          <span className="text-[10px] bg-sky-400 text-slate-950 px-2 py-0.5 rounded-md font-black">
                            ACTIVO
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Elegir</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                        Velocidad espontánea real tal como hablan los nativos en la calle, el trabajo y películas.
                      </p>
                    </button>
                  </div>

                  {/* Footer advice */}
                  <div className="mt-4 pt-3 border-t border-[#2C215C] flex items-center justify-between gap-2 sticky bottom-0 bg-[#0E0A24] -mb-1 pb-1">
                    <span className="text-[11px] text-emerald-400 font-medium">
                      ✓ Se guarda solo en tu celular
                    </span>
                    <button
                      onClick={() => setShowSpeedHelp(false)}
                      className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer shadow-xs transition-all"
                    >
                      Entendido
                    </button>
                  </div>
                </div>
              </>
            )}
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
