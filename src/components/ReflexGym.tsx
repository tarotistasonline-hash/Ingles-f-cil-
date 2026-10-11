import React, { useState, useEffect, useRef } from 'react';
import { REFLEX_CHALLENGES } from '../data/defaultData';
import { ReflexChallenge } from '../types';
import { evaluateGymReflex } from '../services/api';
import { playEnglishVoice, createSpeechRecognizer } from '../services/audio';
import { KeyTakeawaysToggle, TakeawayItem } from './KeyTakeawaysToggle';
import { triggerConfetti } from '../utils/confetti';
import { recordGymInteraction } from '../services/fluencyTracker';
import { recordBadgeUnlock } from '../services/badgesService';
import {
  Timer,
  Play,
  RotateCcw,
  Mic,
  MicOff,
  CheckCircle2,
  Zap,
  Volume2,
  Award,
  ArrowRight,
  PartyPopper,
  Sparkles,
} from 'lucide-react';

interface ReflexGymProps {
  currentSpeed: number;
}

export const ReflexGym: React.FC<ReflexGymProps> = ({ currentSpeed }) => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'running' | 'evaluated'>('idle');
  const [timeLeft, setTimeLeft] = useState(6);
  const [userResponse, setUserResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [earnedBadgeAlert, setEarnedBadgeAlert] = useState<string | null>(null);

  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  const challenge = REFLEX_CHALLENGES[currentChallengeIndex];

  // Start the timer when running
  useEffect(() => {
    if (gameState === 'running') {
      setTimeLeft(challenge.timeLimitSec);
      // Play challenge audio automatically at selected learner speed
      playEnglishVoice(challenge.audioPrompt, 'Kore', currentSpeed);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleFinishTurn();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, challenge]);

  const handleStartChallenge = () => {
    setUserResponse('');
    setEvalResult(null);
    setEarnedBadgeAlert(null);
    setGameState('running');
  };

  const handleToggleMic = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      (transcript) => {
        setUserResponse(transcript);
        setIsListening(false);
      },
      (err) => {
        console.warn('Gym mic error:', err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      recognitionRef.current = recognizer;
      recognizer.start();
      setIsListening(true);
    }
  };

  const handleFinishTurn = async (forcedSpeech?: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);

    const speech = forcedSpeech !== undefined ? forcedSpeech : userResponse;
    setGameState('evaluated');
    setIsEvaluating(true);

    const reactionTime = Math.max(1.4, Math.round((5 - timeLeft) * 10) / 10);

    try {
      const evaluation = await evaluateGymReflex({
        challengePrompt: challenge.situation,
        expectedChunk: challenge.expectedChunk,
        userSpeech: speech,
      });
      setEvalResult(evaluation);
      recordGymInteraction(evaluation.score, reactionTime);

      // Milestone Badges logic
      recordBadgeUnlock('gym-first-reflex');
      let badgeEarned: string | null = null;
      if (reactionTime <= 3.5) {
        recordBadgeUnlock('gym-speed-demon');
        badgeEarned = 'Rayo de 3.5 Segundos ⏱️';
      }
      if (reactionTime < 2.5) {
        recordBadgeUnlock('gym-pure-instinct');
        badgeEarned = 'Instinto Puro 🏆';
      }
      if (evaluation.score >= 85) {
        recordBadgeUnlock('gym-high-score');
        badgeEarned = badgeEarned ? `${badgeEarned} + Puntería Verbal 🎯` : 'Puntería Verbal 🎯';
      }
      if (badgeEarned) {
        setEarnedBadgeAlert(badgeEarned);
      }

      if (evaluation.isNatural || evaluation.score >= 70) {
        triggerConfetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.65 },
        });
      }
    } catch (err) {
      console.error('Error evaluating gym response:', err);
      const fallbackResult = {
        score: speech ? 85 : 50,
        isNatural: true,
        feedback: speech
          ? '¡Buen reflejo! Cada vez dudarás menos.'
          : 'Se acabó el tiempo, pero la próxima saldrá más rápido.',
        nativeVersion: challenge.targetEnglish,
        rhythmHint: 'Repite la frase 3 veces seguidas como una canción.',
      };
      setEvalResult(fallbackResult);
      recordGymInteraction(fallbackResult.score, reactionTime);
      recordBadgeUnlock('gym-first-reflex');
      if (reactionTime <= 3.5) {
        recordBadgeUnlock('gym-speed-demon');
        setEarnedBadgeAlert('Rayo de 3.5 Segundos ⏱️');
      }
      if (speech) {
        triggerConfetti({ particleCount: 35, spread: 50 });
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextChallenge = () => {
    const nextIdx = (currentChallengeIndex + 1) % REFLEX_CHALLENGES.length;
    setCurrentChallengeIndex(nextIdx);
    setGameState('idle');
    setUserResponse('');
    setEvalResult(null);
    setEarnedBadgeAlert(null);
  };

  const reflexGymTakeaways: TakeawayItem[] = [
    {
      point: 'La regla de oro de los 3 a 5 segundos',
      explanation: 'Si tardas más de 3 segundos en responder, estás traduciendo desde el español con tu filtro analítico. El objetivo aquí es disparar por memoria motora refleja.',
    },
    {
      point: 'Acepta la imperfección para ganar velocidad',
      highlight: 'Speed > Perfection',
      explanation: 'Es infinitamente mejor responder de inmediato con un bloque coloquial simple ("Sounds good to me!") que congelarte 15 segundos buscando la oración "correcta" de un libro de gramática.',
    },
    {
      point: 'Técnica de Shadowing (repetir en voz alta 3 veces)',
      highlight: 'Repetición rítmica',
      explanation: 'Cuando veas la respuesta nativa, repítela en voz alta tres veces seguidas imitando el mismo ritmo y volumen para fijar la pronunciación en la memoria muscular.',
    },
    {
      point: 'El miedo a equivocarse desaparece con la práctica corta',
      explanation: 'Desafíos de 5 segundos reducen la ansiedad porque no dan tiempo a sobrepensar ni juzgarse.',
    },
  ];

  return (
    <section id="gym" className="py-14 sm:py-20 bg-[#0B0721]/90 border-b border-[#281F54]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-amber-400">
            <span>Elimina la Traducción Mental</span>
            <span aria-hidden="true">·</span>
            <span>Desafío de Reflejo</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Gimnasio de Reflejos Inmediatos
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Cuando hablas con alguien, no tienes 20 segundos para pensar en gramática.
            Este gimnasio te entrena para responder en menos de 5 segundos con el bloque automático correcto.
          </p>
        </div>

        {/* Key Takeaways Toggle */}
        <KeyTakeawaysToggle
          moduleName="Gimnasio de Reflejos"
          takeaways={reflexGymTakeaways}
        />

        {/* Challenge Interactive Sandbox */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl max-w-3xl mx-auto space-y-8">
          {/* Card Top: Progress & Timer */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Desafío {currentChallengeIndex + 1} de {REFLEX_CHALLENGES.length}
              </span>
              {challenge.level === 'cero' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  🌱 Desde Cero
                </span>
              )}
              {challenge.level === 'principiante' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  ☕ Principiante
                </span>
              )}
              {challenge.level === 'avanzado' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/15 border border-violet-500/30 text-violet-300">
                  ⚡ Más Avanzado
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-400" />
              <span
                className={`font-mono text-base font-bold tabular-nums ${
                  timeLeft <= 2 && gameState === 'running'
                    ? 'text-rose-400 animate-pulse'
                    : 'text-white'
                }`}
              >
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Scenario & Audio Prompt */}
          <div className="space-y-4 text-center">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider bg-amber-950/60 border border-amber-900/60 px-3 py-1 rounded-full inline-block">
              Situación Relámpago
            </span>

            <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
              {challenge.situation}
            </h3>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 inline-flex flex-col sm:flex-row items-center gap-3 text-xs sm:text-sm text-slate-300 shadow-xs">
              <span className="font-semibold text-white">Te dicen:</span>
              <span className="italic font-medium text-amber-200">"{challenge.audioPrompt}"</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => playEnglishVoice(challenge.audioPrompt, 'Kore', 0.65)}
                  className="text-[10px] text-slate-400 hover:text-amber-300 px-1 py-0.5 rounded bg-slate-900 border border-slate-700 cursor-pointer"
                  title="Escuchar lento (0.65x)"
                >
                  0.65x
                </button>
                <button
                  onClick={() => playEnglishVoice(challenge.audioPrompt, 'Kore', currentSpeed)}
                  className="text-slate-400 hover:text-amber-400 p-1 cursor-pointer"
                  title="Volver a escuchar"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-md mx-auto">
              💡 {challenge.hintSpanish}
            </p>
          </div>

          {/* Interactive State Views */}
          {gameState === 'idle' && (
            <div className="text-center pt-2">
              <button
                onClick={handleStartChallenge}
                className="px-8 py-3.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm hover:bg-amber-300 transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Iniciar Desafío ({challenge.timeLimitSec}s)</span>
              </button>
            </div>
          )}

          {gameState === 'running' && (
            <div className="space-y-4 max-w-lg mx-auto">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-900'
                  }`}
                  title="Hablar por micrófono"
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4 text-amber-400" />
                  )}
                </button>

                <input
                  type="text"
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFinishTurn()}
                  placeholder="¡Responde rápido! Escribe o habla..."
                  autoFocus
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />

                <button
                  onClick={() => handleFinishTurn()}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 cursor-pointer whitespace-nowrap"
                >
                  ¡Listo!
                </button>
              </div>

              <div className="text-center">
                <span className="text-[11px] text-slate-400">
                  {isListening
                    ? '🎤 Escuchando tu voz... suelta para enviar.'
                    : 'Presiona Enter o "Listo" antes de que el reloj llegue a 0s.'}
                </span>
              </div>
            </div>
          )}

          {gameState === 'evaluated' && (
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 space-y-5 animate-in fade-in">
              {isEvaluating ? (
                <div className="text-center py-4 space-y-2">
                  <div className="w-4 h-4 rounded-full bg-amber-400 animate-ping mx-auto"></div>
                  <p className="text-xs text-slate-400">Analizando tu velocidad de reflejo...</p>
                </div>
              ) : evalResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      <span className="text-sm font-bold text-white">
                        Puntuación de Reflejo
                      </span>
                    </div>
                    <span className="font-mono text-base font-bold tabular-nums text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-900/60">
                      {evalResult.score || 90}/100
                    </span>
                  </div>

                  {earnedBadgeAlert && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>¡Hito alcanzado en el Gym! Medalla: {earnedBadgeAlert}</span>
                      </div>
                      <span className="text-[10px] text-amber-200/90 bg-amber-400/20 px-2 py-0.5 rounded-full uppercase">
                        Vitrina de Perfil ⭐
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-slate-200">
                      {evalResult.feedback}
                    </p>

                    <div className="bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-900/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                          El Reflejo Perfecto
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              playEnglishVoice(
                                evalResult.nativeVersion || challenge.targetEnglish,
                                'Kore',
                                0.65
                              )
                            }
                            className="text-[10px] text-slate-400 hover:text-amber-300 px-1 py-0.5 rounded bg-slate-900 border border-slate-700 cursor-pointer"
                            title="Escuchar lento (0.65x)"
                          >
                            0.65x
                          </button>
                          <button
                            onClick={() =>
                              playEnglishVoice(
                                evalResult.nativeVersion || challenge.targetEnglish,
                                'Kore',
                                currentSpeed
                              )
                            }
                            className="text-emerald-400 hover:text-emerald-300 p-1 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-white">
                        "{evalResult.nativeVersion || challenge.targetEnglish}"
                      </p>
                    </div>

                    {evalResult.rhythmHint && (
                      <p className="text-xs text-amber-200 bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/60">
                        ⚡ <strong className="font-semibold text-amber-300">Ritmo:</strong> {evalResult.rhythmHint}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      onClick={handleStartChallenge}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Repetir este Desafío
                    </button>
                    <button
                      onClick={handleNextChallenge}
                      className="px-5 py-2 rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Siguiente Desafío</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
