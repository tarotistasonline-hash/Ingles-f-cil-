import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  X,
  Volume2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { playEnglishVoice } from '../services/audio';

export interface DailyFluencyTip {
  id: string;
  category: string;
  categoryColor: string;
  title: string;
  englishPhrase?: string;
  phoneticSim?: string;
  spanishMeaning?: string;
  ruleOfThumb: string;
  entrecasaInsight: string;
  exampleBad?: string;
  exampleGood?: string;
}

export const DAILY_TIPS: DailyFluencyTip[] = [
  {
    id: 'tip-contraction-gonna',
    category: 'Soltura Easy · Conexiones',
    categoryColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    title: 'No digas "I am going to", di "I\'m gonna"',
    englishPhrase: "I'm gonna grab some water.",
    phoneticSim: 'Aim go-na grab sam uá-ter',
    spanishMeaning: 'Voy a buscar agua.',
    ruleOfThumb: 'En la calle nadie separa "going to". Automatiza el bloque "I\'m gonna" de un solo tiro de voz.',
    entrecasaInsight: 'Ahorras 2 segundos de traducción mental y suena natural al instante.',
    exampleBad: 'I - am - go - ing - to - get - a - cof - fee (robótico)',
    exampleGood: "I'm gonna grab a coffee (easy & fluido)",
  },
  {
    id: 'tip-chunks-could-i-get',
    category: 'Pedir cosas sin dudar',
    categoryColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    title: 'La llave maestra para pedir todo: "Could I get..."',
    englishPhrase: 'Could I get a napkin, please?',
    phoneticSim: 'Kud ai get a náp-kin, pliiz?',
    spanishMeaning: '¿Me das una servilleta, por favor?',
    ruleOfThumb: 'Olvídate de conjugar "Give me" o "¿Can you bring me?". Con "Could I get + [cosa]" pides comida, cuentas, boletos y direcciones.',
    entrecasaInsight: 'Es 100% educado, ultra común en cafeterías y restaurantes, y no te trabas pensando en el tiempo verbal.',
    exampleBad: 'Can you to give me one coffee? (confuso)',
    exampleGood: 'Could I get a coffee, please? (natural)',
  },
  {
    id: 'tip-linking-wanna',
    category: 'Deseos y planes',
    categoryColor: 'text-sky-400 bg-sky-400/10 border-sky-400/30',
    title: 'El poder de "wanna" frente a "want to"',
    englishPhrase: 'Do you wanna come with us?',
    phoneticSim: 'Diu uá-na cam uiz as?',
    spanishMeaning: '¿Quieres venir con nosotros?',
    ruleOfThumb: 'La "t" de want desaparece con la "t" de to. Queda un sonido suave "uá-na".',
    entrecasaInsight: 'Si entrenas tu oído para escuchar "uá-na", de repente empezarás a entender el 80% de las películas y series.',
    exampleBad: 'Do - you - want - to - come? (duro)',
    exampleGood: 'You wanna come? (coloquial de entrecasa)',
  },
  {
    id: 'tip-filler-well-actually',
    category: 'Ganar tiempo para pensar',
    categoryColor: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    title: 'Cómo pensar sin decir "ehhhhhh"',
    englishPhrase: 'Well, actually, let me check...',
    phoneticSim: 'Uel, ák-chu-li, let mi chek...',
    spanishMeaning: 'Bueno, de hecho, déjame revisar...',
    ruleOfThumb: 'Los nativos no se quedan en silencio: usan muletillas elegantes como "Well...", "You know...", o "To be honest...".',
    entrecasaInsight: 'Usar "Well, you see..." te da 3 segundos de oro para armar tu idea en inglés sin parecer inseguro.',
    exampleBad: 'Uhhhh... emmm... (silencio incómodo)',
    exampleGood: 'Well, to be honest... (te da tiempo y suena nativo)',
  },
  {
    id: 'tip-gotta-go',
    category: 'Despedidas y urgencia',
    categoryColor: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
    title: 'Cómo despedirse rápido: "I gotta run"',
    englishPhrase: "I've gotta go now / I gotta run!",
    phoneticSim: 'Ai gó-da ran!',
    spanishMeaning: '¡Me tengo que ir volando!',
    ruleOfThumb: 'En vez del formal "I have to leave now", usa "I gotta run" o "I gotta head out".',
    entrecasaInsight: 'Es casual, simpático y demuestra que tienes soltura de entrecasa.',
    exampleBad: 'I must leave this place right now.',
    exampleGood: 'I gotta run, see you tomorrow!',
  },
  {
    id: 'tip-im-down',
    category: 'Aceptar planes',
    categoryColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    title: 'Decir "Me sumo" o "Me prendo" en inglés',
    englishPhrase: "I'm down! Sounds like fun.",
    phoneticSim: 'Aim daun! Saunds laik fan.',
    spanishMeaning: '¡Me prendo! ¡Cuenta conmigo!',
    ruleOfThumb: 'No digas "I agree to go with you". Simplemente di "I\'m down" o "Count me in".',
    entrecasaInsight: 'Causa una gran impresión entre amigos o compañeros de trabajo jóvenes/internacionales.',
    exampleBad: 'I accept your invitation gladly.',
    exampleGood: "I'm down! What time?",
  },
  {
    id: 'tip-never-mind',
    category: 'Resolver malentendidos',
    categoryColor: 'text-teal-400 bg-teal-400/10 border-teal-400/30',
    title: 'Olvídalo / No te preocupes: "Never mind"',
    englishPhrase: "Never mind, it's all good!",
    phoneticSim: 'Né-ver maind, its ol gud!',
    spanishMeaning: 'Olvídalo / Déjalo así, ¡está todo bien!',
    ruleOfThumb: 'Cuando alguien no te escucha bien o cambias de opinión, "Never mind" o "No worries" corta la tensión.',
    entrecasaInsight: 'Te salva cuando intentaste pedir algo y te diste cuenta que no hacía falta complicarte.',
    exampleBad: 'Forget what I have just said to you.',
    exampleGood: 'Never mind, we are good!',
  },
];

const STORAGE_KEY_DISMISSED = 'vibe_daily_tip_dismissed_date';
const STORAGE_KEY_CURRENT_INDEX = 'vibe_daily_tip_index';

interface QuickDailyTipProps {
  onExploreTopic?: () => void;
  className?: string;
  forceOpen?: boolean;
}

export const QuickDailyTip: React.FC<QuickDailyTipProps> = ({
  onExploreTopic,
  className = '',
  forceOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Initialize and check once-per-day logic
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const lastDismissed = localStorage.getItem(STORAGE_KEY_DISMISSED);

      // Deterministic day-of-year index so all users get the tip of the day,
      // but can also page through them
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      const dayOfYear = Math.floor(
        (Date.now() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
      );
      const defaultIndex = dayOfYear % DAILY_TIPS.length;

      const savedIndex = localStorage.getItem(STORAGE_KEY_CURRENT_INDEX);
      const initialIndex = savedIndex !== null ? parseInt(savedIndex, 10) : defaultIndex;
      const validIndex = isNaN(initialIndex) ? 0 : Math.abs(initialIndex) % DAILY_TIPS.length;
      setCurrentTipIndex(validIndex);

      if (forceOpen) {
        setIsOpen(true);
      } else if (lastDismissed !== today) {
        // First visit today! Pop up gently after a tiny moment
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // In case localStorage is blocked
      setIsOpen(true);
    }
  }, [forceOpen]);

  const tip = DAILY_TIPS[currentTipIndex] || DAILY_TIPS[0];

  const handleDismissToday = () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(STORAGE_KEY_DISMISSED, today);
    } catch (e) {
      // ignore
    }
    setIsOpen(false);
  };

  const handleReopen = () => {
    setIsOpen(true);
  };

  const handleNextTip = () => {
    const next = (currentTipIndex + 1) % DAILY_TIPS.length;
    setCurrentTipIndex(next);
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_INDEX, next.toString());
    } catch (e) {
      // ignore
    }
  };

  const handlePrevTip = () => {
    const prev = (currentTipIndex - 1 + DAILY_TIPS.length) % DAILY_TIPS.length;
    setCurrentTipIndex(prev);
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_INDEX, prev.toString());
    } catch (e) {
      // ignore
    }
  };

  const handlePlayVoice = async () => {
    if (!tip.englishPhrase || isPlayingAudio) return;
    setIsPlayingAudio(true);
    setHasInteracted(true);
    try {
      await playEnglishVoice(tip.englishPhrase, 'Kore');
    } catch (e) {
      console.warn('Audio tip playback:', e);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  // If floating card was closed, show a minimal "Tip del Día" launcher pill on the dashboard
  if (!isOpen) {
    return (
      <div className={`flex items-center ${className}`}>
        <button
          type="button"
          onClick={handleReopen}
          className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 hover:border-amber-400 text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          title="Ver el consejo del día de soltura Easy"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
          </span>
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span>Tip Easy del Día: #{currentTipIndex + 1}</span>
          <span className="text-[10px] bg-amber-400/20 px-1.5 py-0.5 rounded text-amber-200 ml-0.5 hidden sm:inline">
            Abrir consejo
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Consejo rápido de soltura diaria"
      className={`relative rounded-2xl bg-gradient-to-br from-[#1A1238] via-[#140D2F] to-[#0D0820] border-2 border-amber-400/40 p-4 sm:p-5 shadow-2xl shadow-amber-500/10 backdrop-blur-md text-slate-100 transition-all animate-fadeIn ${className}`}
    >
      {/* Decorative top ambient glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-sm shrink-0">
            <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Tip Easy del Día
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tip.categoryColor}`}>
                {tip.category}
              </span>
            </div>
            <h4 className="font-display font-bold text-base sm:text-lg text-white mt-0.5 leading-snug">
              {tip.title}
            </h4>
          </div>
        </div>

        {/* Close / Dismiss button */}
        <button
          type="button"
          onClick={handleDismissToday}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          title="Cerrar por hoy"
          aria-label="Cerrar consejo del día"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Tip Content */}
      <div className="mt-3.5 space-y-3 relative z-10">
        {/* Core English Phrase (if applicable) */}
        {tip.englishPhrase && (
          <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-base sm:text-lg font-bold text-amber-300 font-mono tracking-wide">
                  "{tip.englishPhrase}"
                </p>
                <button
                  type="button"
                  onClick={handlePlayVoice}
                  disabled={isPlayingAudio}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 text-xs font-bold transition-all cursor-pointer border border-amber-400/40 shrink-0"
                  title="Escuchar pronunciación nativa pausada"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                  <span className="text-[11px]">{isPlayingAudio ? 'Escuchando...' : 'Escuchar'}</span>
                </button>
              </div>

              {tip.phoneticSim && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="text-[10px] text-amber-400/80 uppercase font-semibold">Suena:</span>
                  <span className="text-amber-200/90 font-mono">{tip.phoneticSim}</span>
                </p>
              )}

              {tip.spanishMeaning && (
                <p className="text-xs text-slate-300 font-medium">
                  👉 <span className="text-slate-200">{tip.spanishMeaning}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* The Rule of Thumb & Entrecasa Insight */}
        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 space-y-1.5">
          <p className="font-medium text-slate-100">
            💡 <strong className="text-amber-300">Regla de oro:</strong> {tip.ruleOfThumb}
          </p>
          <p className="text-slate-400 text-xs">
            ✨ <span className="text-slate-300 font-semibold">Clave de la vida real:</span> {tip.entrecasaInsight}
          </p>
        </div>

        {/* Good vs Bad comparison pill */}
        {tip.exampleBad && tip.exampleGood && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-300 flex items-center gap-1.5">
              <span className="text-xs font-bold">❌ Evita:</span>
              <span className="truncate">{tip.exampleBad}</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 flex items-center gap-1.5">
              <span className="text-xs font-bold">✅ Di:</span>
              <span className="truncate">{tip.exampleGood}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3 text-xs relative z-10">
        {/* Pagination between daily tips */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <button
            type="button"
            onClick={handlePrevTip}
            className="p-1 rounded-md hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Consejo anterior"
            aria-label="Consejo anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-semibold text-slate-300 min-w-14 text-center">
            {currentTipIndex + 1} de {DAILY_TIPS.length}
          </span>
          <button
            type="button"
            onClick={handleNextTip}
            className="p-1 rounded-md hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Siguiente consejo"
            aria-label="Siguiente consejo"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          {onExploreTopic && (
            <button
              type="button"
              onClick={onExploreTopic}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
            >
              <span>Practicar esto</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={handleDismissToday}
            className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>¡Entendido!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
