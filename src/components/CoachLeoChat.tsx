import React, { useState, useRef, useEffect } from 'react';
import { askTeacher } from '../services/api';
import { playEnglishVoice } from '../services/audio';
import { Sparkles, Volume2, MessageSquare, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface CoachLeoChatProps {
  currentSpeed: number;
}

export const CoachLeoChat: React.FC<CoachLeoChatProps> = ({ currentSpeed }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [lastAskedQuestion, setLastAskedQuestion] = useState<string>('');
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [typingStep, setTypingStep] = useState<number>(0);

  const responseCardRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<any>(null);

  const sampleQuestions = [
    '¿Cómo pido un descuento sin sonar tacaño?',
    '¿Cómo digo "qué hay de comer" o "se me pasó la hora" de entrecasa?',
    '¿Cómo digo "me da pereza" sin inventar traducciones raras?',
    '¿Cómo cancelo una cita sin sonar grosero?',
    '¿Por qué "I have hunger" suena tan mal para un nativo?',
  ];

  // Animated typing stages while waiting
  useEffect(() => {
    if (isLoading) {
      setTypingStep(1);
      typingTimerRef.current = setInterval(() => {
        setTypingStep((prev) => (prev >= 3 ? 1 : prev + 1));
      }, 1400);
    } else {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      setTypingStep(0);
    }
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [isLoading]);

  const handleAsk = async (textToAsk?: string) => {
    const q = (textToAsk || query).trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    setNotification(null);
    setLastAskedQuestion(q);

    try {
      const data = await askTeacher(q);
      setResponse(data);
      setNotification('✨ ¡La profe ha respondido a tu consulta con audio y fonética!');
      
      // Auto-scroll gently to the response card so the user sees it immediately
      setTimeout(() => {
        responseCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      console.error('Coach ask error:', err);
      setNotification('Hubo un retraso de conexión. Inténtalo nuevamente o prueba una de las preguntas de ejemplo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVoice = async (text: string, key: string, speedOverride?: number) => {
    setPlayingAudioKey(key);
    try {
      await playEnglishVoice(text, 'Kore', speedOverride || currentSpeed);
    } finally {
      setPlayingAudioKey(null);
    }
  };

  return (
    <section id="coach" className="py-12 sm:py-16 bg-[#0E0A24]/90 border-t border-[#261E52]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-amber-400">
            <span>👩‍🏫 Tu Mentora Bilingüe</span>
            <span aria-hidden="true">·</span>
            <span>Cero Vergüenza · Cero Jerga</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Pregúntale a la profe: "¿Cómo se dice esto de verdad?"</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Pregúntale cualquier duda que siempre te dio pena hacer en clase o cualquier expresión que no sepas cómo decir naturalmente.
            La profe te responderá con bloques de la vida real, ritmo pausado y ejemplos claros con audio.
          </p>
        </div>

        {/* Interactive Query Box */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Pregunta a la profe: ej. '¿Cómo cancelo una cita sin sonar grosero?'"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all"
              />
              <button
                onClick={() => handleAsk()}
                disabled={isLoading || !query.trim()}
                className="px-6 py-3 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm hover:bg-amber-300 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shadow-md hover:scale-102"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{isLoading ? 'Consultando...' : 'Preguntar a la profe'}</span>
              </button>
            </div>

            {/* Quick Sample Questions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-400">Dudas frecuentes:</span>
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(q);
                    handleAsk(q);
                  }}
                  className="text-xs text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* INDICADOR DE 'ESCRIBIENDO...' (Typing Indicator) */}
          {isLoading && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-950 to-indigo-950/60 border border-amber-400/50 flex items-center gap-4 animate-in fade-in shadow-lg">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shrink-0 shadow-md animate-pulse">
                👩‍🏫
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-300">
                    La Profe está escribiendo tu respuesta
                  </span>
                  {/* Bouncing dots */}
                  <span className="inline-flex gap-1 items-center">
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {typingStep === 1 && 'Desarmando la expresión a inglés de entrecasa...'}
                  {typingStep === 2 && 'Preparando ejemplos cotidianos y trucos de ritmo...'}
                  {typingStep >= 3 && 'Generando el audio lento y pausado...'}
                </p>
              </div>
            </div>
          )}

          {/* NOTIFICACIÓN DE RESPUESTA LISTA */}
          {notification && !isLoading && (
            <div className="bg-emerald-500/15 border border-emerald-400/50 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between text-xs sm:text-sm shadow-md animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-semibold">{notification}</span>
              </div>
              <span className="text-[11px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md font-mono hidden sm:inline">
                En vivo
              </span>
            </div>
          )}

          {/* Coach Response Card */}
          {response && !isLoading && (
            <div
              ref={responseCardRef}
              className="pt-6 border-t border-slate-800 space-y-5 animate-in fade-in"
            >
              {lastAskedQuestion && (
                <div className="text-xs text-slate-400 bg-slate-950/70 px-3.5 py-2 rounded-lg border border-slate-800/80 flex items-center gap-2">
                  <span className="font-bold text-amber-400">Pregunta respondida:</span>
                  <span className="text-slate-200 italic">"{lastAskedQuestion}"</span>
                </div>
              )}

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-400/20">
                  👩‍🏫
                </div>
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm sm:text-base font-bold text-white block">
                        La Profe (Tu Mentora Easy)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Respuesta personalizada · Cero gramática abstracta
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-300 bg-amber-950/60 px-3 py-1 rounded-full font-bold border border-amber-900/60 shadow-xs">
                      Explicación Simple
                    </span>
                  </div>

                  {/* Text answer */}
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 whitespace-pre-line shadow-inner">
                    {response.answer}
                  </p>

                  {/* Power chunk callout */}
                  {response.powerChunk && (
                    <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-amber-950/30 border border-amber-500/50 p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                      <div>
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                          ⭐ El Bloque Maestro para memorizar
                        </span>
                        <p className="text-base sm:text-lg font-black text-white mt-0.5">
                          "{response.powerChunk}"
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handlePlayVoice(response.powerChunk, 'power-chunk-slow', 0.65)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 hover:text-white text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors"
                          title="Escuchar lento (0.65x)"
                        >
                          🐢 0.65x
                        </button>
                        <button
                          onClick={() => handlePlayVoice(response.powerChunk, 'power-chunk')}
                          className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          title="Escuchar audio normal"
                        >
                          <Volume2
                            className={`w-4 h-4 ${
                              playingAudioKey?.startsWith('power-chunk') ? 'animate-pulse' : ''
                            }`}
                          />
                          <span>Escuchar</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Real natural examples */}
                  {response.naturalExamples && response.naturalExamples.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Úsalo así en la vida real:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {response.naturalExamples.map((ex: any, i: number) => (
                          <div
                            key={i}
                            className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 shadow-xs hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs sm:text-sm font-bold text-white">
                                "{ex.en}"
                              </p>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handlePlayVoice(ex.en, `ex-profe-${i}-slow`, 0.65)}
                                  className="text-[10px] text-slate-400 hover:text-amber-300 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                                  title="Escuchar lento (0.65x)"
                                >
                                  0.65x
                                </button>
                                <button
                                  onClick={() => handlePlayVoice(ex.en, `ex-profe-${i}`)}
                                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 cursor-pointer"
                                  title="Escuchar audio"
                                >
                                  <Volume2
                                    className={`w-3.5 h-3.5 ${
                                      playingAudioKey?.startsWith(`ex-profe-${i}`)
                                        ? 'text-amber-400 animate-pulse'
                                        : ''
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-slate-300 font-medium">{ex.es}</p>
                            {ex.chunkNote && (
                              <p className="text-[11px] text-amber-300/90 bg-amber-950/30 px-2 py-1 rounded border border-amber-900/40">
                                💡 {ex.chunkNote}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sound tip */}
                  {response.soundTip && (
                    <div className="p-3.5 bg-sky-950/40 border border-sky-900/60 rounded-xl text-xs text-sky-200 flex items-start gap-2">
                      <span className="text-base leading-none">🎙️</span>
                      <div>
                        <strong>Truco de pronunciación: </strong> {response.soundTip}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
