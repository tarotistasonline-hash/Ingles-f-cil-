import React, { useState, useRef } from 'react';
import { fetchSpeakTweak } from '../services/api';
import { SpeakTweakResult } from '../types';
import { playEnglishVoice } from '../services/audio';
import { KeyTakeawaysToggle } from './KeyTakeawaysToggle';
import { triggerConfetti } from '../utils/confetti';
import { recordSpeakTweakUse } from '../services/fluencyTracker';
import {
  Sparkles,
  Volume2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  Scissors,
  Check,
} from 'lucide-react';

interface SpeakTweakToolProps {
  currentSpeed: number;
}

export const SpeakTweakTool: React.FC<SpeakTweakToolProps> = ({ currentSpeed }) => {
  const [userInput, setUserInput] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SpeakTweakResult | null>(null);
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const [lastDisassembledText, setLastDisassembledText] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const presets = [
    {
      phrase: 'Quiero pedir un descuento sin sonar tacaño',
      context: 'En una tienda, mercado o contratación de servicios',
    },
    {
      phrase: '¿Cómo pido un café para llevar sin dar vueltas?',
      context: 'En un café / Pedidos rápidos',
    },
    {
      phrase: 'Tengo un hambre tremenda, vamos a comer algo',
      context: 'Con amigos o compañeros de trabajo',
    },
    {
      phrase: 'No voy a poder ir a la juntada pero con la mejor onda',
      context: 'Vida social / Planes',
    },
    {
      phrase: 'Dejalo ahí que después me encargo yo',
      context: 'En casa o en el trabajo / Convivencia',
    },
  ];

  const handleRunTweak = async (phraseToUse?: string, ctxToUse?: string) => {
    const text = phraseToUse || userInput;
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setSuccessToast(null);
    setLastDisassembledText(text);

    try {
      const data = await fetchSpeakTweak(text, ctxToUse || context);
      setResult(data);
      setSuccessToast('✨ ¡Frase desarmada y transformada a inglés real con éxito!');
      recordSpeakTweakUse();
      triggerConfetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      console.error('Failed to tweak phrase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (text: string, key: string, speedOverride?: number) => {
    setPlayingAudioKey(key);
    try {
      await playEnglishVoice(text, 'Kore', speedOverride || currentSpeed);
    } finally {
      setPlayingAudioKey(null);
    }
  };

  return (
    <section id="tweak" className="py-12 sm:py-16 bg-[#0E0A26]/80 border-b border-[#281F54]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-amber-400">
            <span>✂️ Desarmador de Frases Rígidas</span>
            <span aria-hidden="true">·</span>
            <span>SpeakTweak a Inglés Real</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Desarmar Frase: De Traducción Literal a Inglés Coloquial</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Escribe cualquier frase o idea tal como te sale de la cabeza. La herramienta la <strong>desarma al instante</strong>, elimina las traducciones rígidas de libro y te entrega el bloque conversacional exacto que usan los nativos hoy.
          </p>
        </div>

        {/* Key Takeaways Toggle */}
        <KeyTakeawaysToggle
          moduleName="Herramienta de Desarme (SpeakTweak)"
          takeaways={[
            {
              point: 'Desarma los calcos literales del español al instante',
              highlight: 'I have hunger -> I\'m starving',
              explanation: 'Traducir estructuras en español palabra por palabra suena robótico. El desarmador reemplaza tu fórmula mental por la frase nativa exacta.',
            },
            {
              point: 'Diferencia el inglés protocolar del inglés de entrecasa',
              explanation: 'Decir "I request assistance" en una cena suena exagerado. Decir "Could you give me a hand?" suena cálido y natural.',
            },
            {
              point: 'Escucha la entonación con el botón de voz lenta (0.65x)',
              explanation: 'No basta con leer la frase corregida: dale play al audio con velocidad ajustada para asimilar el ritmo y la musicalidad.',
            },
          ]}
        />

        {/* Input Box & Presets */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Escribe la frase que quieres desarmar o traducir con fluidez:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunTweak()}
                placeholder="Ej: 'Quiero pedir un descuento sin sonar tacaño' o 'I desire to buy a coffee'"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all"
              />
              <button
                onClick={() => handleRunTweak()}
                disabled={isLoading || !userInput.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md whitespace-nowrap hover:scale-102"
              >
                <Scissors className="w-4 h-4 text-slate-950" />
                <span>{isLoading ? 'Desarmando frase...' : 'Desarmar Frase'}</span>
              </button>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Prueba un caso típico (haz clic para desarmar de inmediato):
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setUserInput(preset.phrase);
                    setContext(preset.context);
                    handleRunTweak(preset.phrase, preset.context);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/60 text-xs text-slate-300 hover:text-white transition-all cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span>✂️</span>
                  <span>"{preset.phrase}"</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-emerald-950/40 border border-amber-400/50 flex items-center gap-4 animate-in fade-in shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl shrink-0 animate-bounce">
                ✂️
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-300">
                    Desarmando la frase y eliminando la rigidez del español...
                  </span>
                  <span className="inline-flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Detectando bloques nativos de entrecasa y preparando el audio pausado.
                </p>
              </div>
            </div>
          )}

          {/* Success Notification */}
          {successToast && !isLoading && (
            <div className="bg-emerald-500/15 border border-emerald-400/50 text-emerald-200 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs sm:text-sm shadow-md animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{successToast}</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">Listo</span>
            </div>
          )}

          {/* Results Display */}
          {result && !isLoading && (
            <div
              ref={resultsRef}
              className="pt-6 border-t border-slate-800 space-y-6 animate-in fade-in"
            >
              {lastDisassembledText && (
                <div className="text-xs text-slate-400 bg-slate-950/70 px-3.5 py-2 rounded-lg border border-slate-800/80 flex items-center gap-2">
                  <span className="font-bold text-amber-400">Frase original desarmada:</span>
                  <span className="text-slate-200 italic">"{lastDisassembledText}"</span>
                </div>
              )}

              {/* Real Native way - Direct, Simple & Colloquial */}
              <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-amber-950/30 border-2 border-emerald-500/50 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-wide uppercase">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Tu Frase de Entrecasa (Sencilla, Real y Coloquial)</span>
                  </div>
                  {/* Dual speed audio */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePlayAudio(result.nativeReal, 'native-slow', 0.65)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 hover:text-white text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors"
                      title="Escuchar en cámara lenta (0.65x)"
                    >
                      🐢 0.65x
                    </button>
                    <button
                      onClick={() => handlePlayAudio(result.nativeReal, 'native-normal')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                      title="Escuchar a velocidad normal"
                    >
                      <Volume2
                        className={`w-4 h-4 ${
                          playingAudioKey === 'native-normal' ? 'animate-pulse' : ''
                        }`}
                      />
                      <span>Escuchar</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-heading text-2xl sm:text-3xl font-black text-white tracking-tight">
                    "{result.nativeReal}"
                  </p>
                  {result.connectedSpeech && (
                    <p className="text-xs sm:text-sm font-mono text-emerald-300/90 pt-1">
                      🗣️ Suena así: <span className="underline decoration-dotted underline-offset-4">{result.connectedSpeech}</span>
                    </p>
                  )}
                </div>

                {/* Why it sounds natural */}
                <div className="p-4 bg-slate-950/70 border border-emerald-900/40 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                    ¿Por qué se desarma así y suena mucho mejor?
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {result.whyItSoundsNatural}
                  </p>
                </div>

                {/* Power Chunk Callout */}
                {result.powerChunk && (
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🧩</span>
                      <span className="text-xs text-slate-300">
                        Bloque comodín para reutilizar: <strong className="text-amber-300 font-bold">"{result.powerChunk}"</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Side-by-Side: Literal vs Casual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Literal (School way to avoid) */}
                <div className="bg-slate-950/80 border border-rose-900/30 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wide">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Traducción Rígida de Escuela (Evitar)</span>
                  </div>
                  <p className="text-sm font-medium text-slate-300 italic">
                    "{result.literalSchool}"
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Es gramaticalmente correcta en los libros, pero suena acartonada, pesada y de robot.
                  </p>
                </div>

                {/* Casual Slang (Friends & confianza) */}
                <div className="bg-slate-950/80 border border-sky-900/30 rounded-xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wide">
                      <Zap className="w-4 h-4 text-sky-400" />
                      <span>Versión Muy Relajada (Amigos & Confianza)</span>
                    </div>
                    {result.casualSlang && (
                      <button
                        onClick={() => handlePlayAudio(result.casualSlang, 'casual')}
                        className="p-1 rounded text-slate-400 hover:text-sky-300"
                        title="Escuchar versión relajada"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white">
                    "{result.casualSlang}"
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Ideal para mensajes de texto, salir a tomar algo o charlas espontáneas sin filtro.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
