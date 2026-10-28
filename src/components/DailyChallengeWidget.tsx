import React, { useState, useEffect } from 'react';
import {
  Flame,
  Volume2,
  Clock,
  Sparkles,
  CheckCircle2,
  RotateCw,
  Play,
  Pause,
  ArrowRight,
  ShieldCheck,
  Zap,
  Award,
  Layers,
  Dumbbell,
  Check,
  Share2,
} from 'lucide-react';
import { playEnglishVoice } from '../services/audio';
import { triggerConfetti } from '../utils/confetti';
import { SkillLevel } from '../types';

export interface DailyChallengeItem {
  id: string;
  type: 'chunk' | 'reflex' | 'connected';
  level: SkillLevel;
  levelLabel: string;
  categoryTag: string;
  title: string;
  situation: string;
  failedTrap: string;
  targetEnglish: string;
  phoneticSimple: string;
  soundSecret: string;
  timeEstimate: string;
  keyChunk: string;
  sampleFollowUp?: string;
}

const DAILY_CHALLENGES: DailyChallengeItem[] = [
  {
    id: 'dc-1',
    type: 'chunk',
    level: 'cero',
    levelLabel: '🌱 Desde Cero',
    categoryTag: 'Café & Vida Diaria',
    title: 'Pedir cualquier cosa con soltura',
    situation: 'Estás en un café o restaurante y quieres pedir agua o la carta sin trabarte.',
    failedTrap: 'No digas "I want please that you give me water".',
    targetEnglish: 'Can I have a glass of water, please?',
    phoneticSimple: 'ka-nai jav a glas ov uá-ter, pliiz?',
    soundSecret: 'Une las tres primeras palabras como un solo bloque: "ke-nai-jav". El 90% de los nativos piden así.',
    timeEstimate: '5 min',
    keyChunk: 'Can I have...?',
    sampleFollowUp: 'Can I have the check whenever you get a chance?',
  },
  {
    id: 'dc-2',
    type: 'reflex',
    level: 'principiante',
    levelLabel: '☕ Principiante',
    categoryTag: 'Reflejo en la Mesa',
    title: 'Rechazar comida o postre con educación',
    situation: 'El mesero te pregunta si quieres postre o más comida pero ya terminaste satisfecho.',
    failedTrap: 'Evita decir "I am full and no want more" (suena tosco y literal).',
    targetEnglish: "I'm good, just the check please!",
    phoneticSimple: 'aim gud, yast de chek pliiz!',
    soundSecret: 'Los nativos usan "I\'m good" para decir "estoy satisfecho, no necesito nada más". Suena cálido y seguro.',
    timeEstimate: '5 min',
    keyChunk: "I'm good, thanks!",
  },
  {
    id: 'dc-3',
    type: 'chunk',
    level: 'cero',
    levelLabel: '🌱 Desde Cero',
    categoryTag: 'Reacciones Diarias',
    title: 'El "Sí" universal de los nativos',
    situation: 'Un amigo te propone tomar un café o encontrarse en 15 minutos.',
    failedTrap: 'No digas "Yes, I agree with this proposition" (suena a abogado en un juicio).',
    targetEnglish: 'Sounds good to me, see you there!',
    phoneticSimple: 'saunds gud tu mi, sii iu der!',
    soundSecret: 'Di "Sounds good" con entonación ascendente alegre. Es el conector más positivo y espontáneo.',
    timeEstimate: '5 min',
    keyChunk: 'Sounds good!',
    sampleFollowUp: 'Sounds like a plan!',
  },
  {
    id: 'dc-4',
    type: 'reflex',
    level: 'principiante',
    levelLabel: '☕ Principiante',
    categoryTag: 'Despedidas Reales',
    title: 'Despedirte de un lugar sin dar rodeos',
    situation: 'Estás en una reunión o en casa de alguien y ya es hora de irte a tu casa.',
    failedTrap: 'No digas "I will go to my home right now bye".',
    targetEnglish: "I'm about to head out, catch you later!",
    phoneticSimple: 'aim a-báut tu jed áut, ketch iu léi-ter!',
    soundSecret: '"Head out" es el verbo idiomático favorito de los nativos para irse. Une "head-out" sin pausar.',
    timeEstimate: '5 min',
    keyChunk: "I'm about to head out...",
  },
  {
    id: 'dc-5',
    type: 'connected',
    level: 'principiante',
    levelLabel: '☕ Principiante',
    categoryTag: 'Unión de Sonidos',
    title: 'Pedir un favor suave sin sonar exigente',
    situation: 'Necesitas que un colega o conocido revise algo rápido en tu celular o pantalla.',
    failedTrap: 'Evita el rígido "Can you look this very quickly please?".',
    targetEnglish: 'Any chance you could look over this real quick?',
    phoneticSimple: 'é-ni chens iu cud luk óu-ver dis rial cuik?',
    soundSecret: 'El bloque "Any chance you could..." suaviza el pedido al 100% y te hace sonar considerado.',
    timeEstimate: '5 min',
    keyChunk: 'Any chance you could...',
  },
  {
    id: 'dc-6',
    type: 'reflex',
    level: 'cero',
    levelLabel: '🌱 Desde Cero',
    categoryTag: 'Frase Salvavidas',
    title: 'Pedir que hablen más despacio con gracia',
    situation: 'Te hablaron en inglés demasiado rápido y no llegaste a procesar las palabras.',
    failedTrap: '¡Nunca digas "What?!". Suena cortante y agresivo.',
    targetEnglish: 'Sorry, could you say that a bit slower?',
    phoneticSimple: 'sór-ri, cud iu sei det e bit slóu-er?',
    soundSecret: 'Esta es tu frase escudo. Dila con una sonrisa; todo el mundo bajará el ritmo con gusto.',
    timeEstimate: '5 min',
    keyChunk: 'Could you say that slower...?',
  },
  {
    id: 'dc-7',
    type: 'chunk',
    level: 'avanzado',
    levelLabel: '⚡ Avanzado',
    categoryTag: 'Conversación Empática',
    title: 'Reaccionar cuando cancelan un plan',
    situation: 'Te escriben cancelando una reunión o cena a último momento.',
    failedTrap: 'No digas "It does not matter, I do not care".',
    targetEnglish: "All good, don't worry about it at all!",
    phoneticSimple: 'ol gud, dont uór-ri a-báut it at ol!',
    soundSecret: '"All good" transmite calma inmediata. Suena a persona segura, empática y comprensiva.',
    timeEstimate: '5 min',
    keyChunk: "All good, don't worry...",
  },
  {
    id: 'dc-8',
    type: 'reflex',
    level: 'principiante',
    levelLabel: '☕ Principiante',
    categoryTag: 'Agradecimientos',
    title: 'Responder a un "gracias" sin sonar de manual',
    situation: 'Alguien te agradece por haberle alcanzado algo o abierto la puerta.',
    failedTrap: 'El clásico "You are welcome" suena demasiado formal para favores cotidianos.',
    targetEnglish: 'No worries at all! Any time!',
    phoneticSimple: 'nou uór-ris at ol! é-ni taim!',
    soundSecret: '"No worries" es la respuesta universal más cálida en el mundo anglosajón.',
    timeEstimate: '5 min',
    keyChunk: 'No worries at all!',
  },
];

interface DailyChallengeWidgetProps {
  onStartGym?: () => void;
  onExploreChunks?: () => void;
  onStartSimulator?: () => void;
  currentSpeed?: number;
}

export const DailyChallengeWidget: React.FC<DailyChallengeWidgetProps> = ({
  onStartGym,
  onExploreChunks,
  onStartSimulator,
  currentSpeed = 0.8,
}) => {
  // Deterministic daily challenge index based on calendar day
  const getTodayChallengeIndex = () => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    return Math.abs(dayOfYear) % DAILY_CHALLENGES.length;
  };

  const [currentIndex, setCurrentIndex] = useState<number>(getTodayChallengeIndex);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingSpeed, setPlayingSpeed] = useState<number | null>(null);
  const [repetitionCount, setRepetitionCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [streakDays, setStreakDays] = useState<number>(1);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(300); // 5 minutes (300 seconds)
  const [showShareToast, setShowShareToast] = useState<boolean>(false);

  const currentChallenge = DAILY_CHALLENGES[currentIndex];
  const todayDateKey = new Date().toISOString().slice(0, 10);

  // Load streak and completion state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const completedToday = localStorage.getItem(`vibe_challenge_completed_${todayDateKey}`);
      if (completedToday === 'true') {
        setIsCompleted(true);
      }
      const savedStreak = localStorage.getItem('vibe_challenge_streak');
      if (savedStreak) {
        const parsed = parseInt(savedStreak, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setStreakDays(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [todayDateKey]);

  // 5-minute countdown timer logic
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          triggerConfetti();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handlePlayVoice = async (text: string, speed: number, forceDevice = false) => {
    if (isPlaying) return;
    setIsPlaying(true);
    setPlayingSpeed(speed);
    try {
      await playEnglishVoice(text, 'Kore', speed, {
        useDeviceSpeech: forceDevice,
        onStart: () => setIsPlaying(true),
        onEnd: () => {
          setIsPlaying(false);
          setPlayingSpeed(null);
        },
        onError: () => {
          setIsPlaying(false);
          setPlayingSpeed(null);
        },
      });
    } catch {
      setIsPlaying(false);
      setPlayingSpeed(null);
    }
  };

  const handleRepetition = (index: number) => {
    const nextCount = index + 1;
    setRepetitionCount(nextCount);
    // Play voice upon clicking repetition bubble
    handlePlayVoice(currentChallenge.targetEnglish, 0.8);

    if (nextCount === 5 && !isCompleted) {
      handleCompleteChallenge();
    }
  };

  const handleCompleteChallenge = () => {
    setIsCompleted(true);
    triggerConfetti();

    try {
      localStorage.setItem(`vibe_challenge_completed_${todayDateKey}`, 'true');
      const lastCompletedDate = localStorage.getItem('vibe_challenge_last_date');
      let newStreak = streakDays;

      if (lastCompletedDate !== todayDateKey) {
        newStreak = streakDays + 1;
        setStreakDays(newStreak);
        localStorage.setItem('vibe_challenge_streak', newStreak.toString());
        localStorage.setItem('vibe_challenge_last_date', todayDateKey);
      }
    } catch {
      // Ignore
    }
  };

  const handleShuffleChallenge = () => {
    const nextIdx = (currentIndex + 1) % DAILY_CHALLENGES.length;
    setCurrentIndex(nextIdx);
    setRepetitionCount(0);
    setIsCompleted(false);
    setTimerSeconds(300);
    setIsTimerRunning(false);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A123E] via-[#140E33] to-[#0D0922] border-2 border-amber-400/40 hover:border-amber-400/60 shadow-2xl transition-all duration-300">
      {/* Subtle Glow Lighting in corner */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner: Streak & Header */}
      <div className="px-5 sm:px-6 py-3.5 bg-black/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Reto del Día · Micro-Hábito de 5 Minutos
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {currentChallenge.levelLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Instala un reflejo nativo hoy sin sentarte a estudiar gramática
            </p>
          </div>
        </div>

        {/* Streak Counter & Action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F1745] border border-amber-400/30 text-xs font-bold text-amber-300">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Racha: {streakDays} {streakDays === 1 ? 'día' : 'días'}</span>
          </div>

          <button
            onClick={handleShuffleChallenge}
            className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1"
            title="Ver otro reto de 5 minutos"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Otro reto</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-7 space-y-5">
        {/* Situation / Context Prompt */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Situación de hoy:</span>
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentChallenge.timeEstimate} de práctica recomendada</span>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white leading-snug">
            {currentChallenge.situation}
          </h3>
        </div>

        {/* The Mental Trap vs. The Native Comeback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Box 1: The Trap to Avoid */}
          <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>La traba mental que congela:</span>
            </div>
            <p className="text-slate-300 font-medium leading-relaxed pl-3.5">
              {currentChallenge.failedTrap}
            </p>
          </div>

          {/* Box 2: The Secret Chunk */}
          <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Bloque automático a memorizar con ritmo:</span>
            </div>
            <p className="text-white font-black text-sm pl-4">
              &ldquo;{currentChallenge.keyChunk}&rdquo;
            </p>
          </div>
        </div>

        {/* Master Native Phrase Showcase */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-teal-950/40 border-2 border-emerald-400/60 shadow-xl space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Tu respuesta natural automática:</span>
            </span>

            {/* Audio Speed Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePlayVoice(currentChallenge.targetEnglish, 0.65)}
                disabled={isPlaying}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isPlaying && playingSpeed === 0.65
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-md animate-pulse'
                    : 'bg-black/50 hover:bg-black/70 text-amber-300 border border-amber-400/30'
                }`}
                title="Escuchar lento para captar cada sonido fonético"
              >
                <Volume2 className="w-3 h-3 text-amber-400" />
                <span>0.65x Lento</span>
              </button>

              <button
                type="button"
                onClick={() => handlePlayVoice(currentChallenge.targetEnglish, 0.8)}
                disabled={isPlaying}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isPlaying && playingSpeed === 0.8
                    ? 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-300 shadow-md animate-pulse'
                    : 'bg-black/50 hover:bg-black/70 text-emerald-300 border border-emerald-400/30'
                }`}
                title="Escuchar a velocidad pausada ideal para aprender"
              >
                <Volume2 className="w-3 h-3 text-emerald-400" />
                <span>0.8x Pausado</span>
              </button>

              <button
                type="button"
                onClick={() => handlePlayVoice(currentChallenge.targetEnglish, 1.0)}
                disabled={isPlaying}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isPlaying && playingSpeed === 1.0
                    ? 'bg-teal-400 text-slate-950 ring-2 ring-teal-300 shadow-md animate-pulse'
                    : 'bg-black/50 hover:bg-black/70 text-teal-300 border border-teal-400/30'
                }`}
                title="Escuchar a velocidad nativa cotidiana"
              >
                <Volume2 className="w-3 h-3 text-teal-400" />
                <span>1.0x Nativo</span>
              </button>

              <button
                type="button"
                onClick={() => handlePlayVoice(currentChallenge.targetEnglish, 0.9, true)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                title="Reproducir al instante usando la voz del dispositivo"
              >
                <span>🗣️ Celular</span>
              </button>
            </div>
          </div>

          <div>
            <p className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              &ldquo;{currentChallenge.targetEnglish}&rdquo;
            </p>
            <p className="text-xs sm:text-sm font-mono text-emerald-300 mt-1">
              🗣 Fonética: {currentChallenge.phoneticSimple}
            </p>
          </div>

          <div className="pt-2 border-t border-emerald-900/40 text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-300">Secreto de fluidez:</strong> {currentChallenge.soundSecret}
          </div>
        </div>

        {/* 5 Repetitions Interactive Gamification Tracker */}
        <div className="p-4 rounded-2xl bg-[#120D2C] border border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-amber-400" />
                <span>Práctica de 5 minutos: Repite 5 veces en voz alta</span>
              </span>
              <p className="text-slate-400 text-[11px]">
                Toca cada círculo para escuchar y marcar tu repetición con ritmo
              </p>
            </div>

            {/* Mini 5-min timer toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isTimerRunning
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
                title="Iniciar temporizador de 5 minutos"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pausar ({formatTimer(timerSeconds)})</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Timer 5 min ({formatTimer(timerSeconds)})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 5 Repetition Bubbles */}
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4].map((stepIdx) => {
              const isDone = repetitionCount > stepIdx;
              const isCurrent = repetitionCount === stepIdx;
              return (
                <button
                  key={stepIdx}
                  type="button"
                  onClick={() => handleRepetition(stepIdx)}
                  className={`py-2.5 px-1 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/20 scale-102'
                      : isCurrent
                      ? 'bg-amber-400/20 border-2 border-amber-400 text-amber-300 animate-pulse'
                      : 'bg-black/40 border border-white/10 text-slate-400 hover:text-white hover:bg-black/60'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>#{stepIdx + 1}</span>
                  )}
                  <span className="text-[10px] font-semibold">
                    {stepIdx === 4 ? '¡Meta!' : `${stepIdx + 1}ª vez`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Completion Celebration or Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5">
            {isCompleted ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/40 px-3.5 py-2 rounded-xl w-full sm:w-auto animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>¡Reto de hoy completado! Tu reflejo ya está grabado en tu memoria.</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCompleteChallenge}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/20 transition-all cursor-pointer active:scale-98"
              >
                <Award className="w-4 h-4" />
                <span>Completar Reto de Hoy (+1 día a tu racha)</span>
              </button>
            )}

            {/* Deep Links to Modules */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
              {onStartGym && (
                <button
                  type="button"
                  onClick={onStartGym}
                  className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gimnasio de Reflejos</span>
                </button>
              )}

              {onExploreChunks && (
                <button
                  type="button"
                  onClick={onExploreChunks}
                  className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 hover:text-amber-200 border border-amber-400/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Ver 100 Bloques</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
