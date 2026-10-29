import React, { useState } from 'react';
import { askTeacher } from '../services/api';
import { playEnglishVoice } from '../services/audio';
import { Sparkles, Volume2, MessageSquare, Send, Zap } from 'lucide-react';

interface CoachLeoChatProps {
  currentSpeed: number;
}

export const CoachLeoChat: React.FC<CoachLeoChatProps> = ({ currentSpeed }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);

  const sampleQuestions = [
    '¿Cómo digo "qué hay de comer" o "se me pasó la hora" de entrecasa?',
    '¿Cómo digo "me da pereza" sin inventar traducciones raras?',
    '¿Por qué "I have hunger" suena tan mal para un nativo?',
    '¿Cómo digo "ojalá pudiera" sin enredarme con el subjuntivo?',
  ];

  const handleAsk = async (textToAsk?: string) => {
    const q = (textToAsk || query).trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    try {
      const data = await askTeacher(q);
      setResponse(data);
    } catch (err) {
      console.error('Coach ask error:', err);
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
    <section className="py-14 sm:py-20 bg-[#0E0A24]/90 border-t border-[#261E52]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
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
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400"
              />
              <button
                onClick={() => handleAsk()}
                disabled={isLoading || !query.trim()}
                className="px-6 py-3 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm hover:bg-amber-300 disabled:opacity-40 transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shadow-xs"
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

          {/* Coach Response Card */}
          {response && (
            <div className="pt-6 border-t border-slate-800 space-y-5 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md">
                  👩‍🏫
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">
                      La Profe (Tu Mentora Easy)
                    </span>
                    <span className="text-[11px] text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full font-semibold border border-amber-900/60">
                      Explicación Simple (Easy)
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                    {response.answer}
                  </p>

                  {/* Power chunk callout */}
                  {response.powerChunk && (
                    <div className="bg-amber-950/30 border border-amber-900/60 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                          El Bloque Maestro
                        </span>
                        <p className="text-base font-bold text-white">
                          "{response.powerChunk}"
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePlayVoice(response.powerChunk, 'power-chunk-slow', 0.65)}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 hover:text-white text-[11px] cursor-pointer"
                          title="Escuchar lento (0.65x)"
                        >
                          0.65x
                        </button>
                        <button
                          onClick={() => handlePlayVoice(response.powerChunk, 'power-chunk')}
                          className="p-2 rounded-lg bg-slate-900 border border-amber-500/50 text-amber-400 hover:text-white cursor-pointer shadow-xs"
                          title="Escuchar audio"
                        >
                          <Volume2
                            className={`w-4 h-4 ${
                              playingAudioKey?.startsWith('power-chunk') ? 'text-amber-400 animate-pulse' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Real natural examples */}
                  {response.naturalExamples && response.naturalExamples.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Úsalo así en la vida real:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {response.naturalExamples.map((ex: any, i: number) => (
                          <div
                            key={i}
                            className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-xs sm:text-sm font-bold text-white">
                                "{ex.en}"
                              </p>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handlePlayVoice(ex.en, `ex-profe-${i}-slow`, 0.65)}
                                  className="text-[10px] text-slate-400 hover:text-amber-300 px-1 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                                  title="Escuchar lento (0.65x)"
                                >
                                  0.65x
                                </button>
                                <button
                                  onClick={() => handlePlayVoice(ex.en, `ex-profe-${i}`)}
                                  className="text-slate-400 hover:text-amber-400 p-1 cursor-pointer"
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
                              <p className="text-[11px] text-amber-300/90">
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
                    <div className="p-3 bg-sky-950/40 border border-sky-900/60 rounded-xl text-xs text-sky-200">
                      <strong>Truco de pronunciación: </strong> {response.soundTip}
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
