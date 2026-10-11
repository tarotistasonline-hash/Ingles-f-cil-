import React, { useState } from 'react';
import { fetchSpeakTweak } from '../services/api';
import { SpeakTweakResult } from '../types';
import { playEnglishVoice } from '../services/audio';
import { KeyTakeawaysToggle, TakeawayItem } from './KeyTakeawaysToggle';
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
} from 'lucide-react';

interface SpeakTweakToolProps {
  currentSpeed: number;
}

export const SpeakTweakTool: React.FC<SpeakTweakToolProps> = ({ currentSpeed }) => {
  const [userInput, setUserInput] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SpeakTweakResult | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const presets = [
    {
      phrase: '¿Cómo pido un café para llevar sin dar vueltas?',
      context: 'En un café / Pedidos rápidos',
    },
    {
      phrase: 'Tengo un hambre tremenda, vamos a comer algo',
      context: 'Con amigos o compañeros',
    },
    {
      phrase: 'No voy a poder ir a la juntada pero con la mejor onda',
      context: 'Vida social / Planes',
    },
    {
      phrase: 'Dejalo ahí que después me encargo yo',
      context: 'En casa / Convivencia',
    },
  ];

  const handleRunTweak = async (phraseToUse?: string, ctxToUse?: string) => {
    const text = phraseToUse || userInput;
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const data = await fetchSpeakTweak(text, ctxToUse || context);
      setResult(data);
      recordSpeakTweakUse();
      triggerConfetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Failed to tweak phrase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (text: string, speedOverride?: number) => {
    setIsPlayingAudio(true);
    await playEnglishVoice(text, 'Kore', speedOverride || currentSpeed);
    setIsPlayingAudio(false);
  };

  return (
    <section id="tweak" className="py-14 sm:py-20 bg-[#0E0A26]/80 border-b border-[#281F54]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-amber-400">
            <span>Herramienta de Fluidez</span>
            <span aria-hidden="true">·</span>
            <span>Transformador a Inglés Coloquial</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Tu Frase en Inglés de Entrecasa: Sencillo y Coloquial
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Escribe cómo dirías una idea en español o en inglés. Obtén al instante el bloque
            conversacional directo que usan los nativos todos los días, con audio adaptable y ritmo natural.
          </p>
        </div>

        {/* Key Takeaways Toggle */}
        <KeyTakeawaysToggle
          moduleName="Herramienta de Desarme (SpeakTweak)"
          takeaways={[
            {
              point: 'Detecta los calcos literales del español al instante',
              highlight: 'I have hunger -> I\'m starving',
              explanation: 'Traducir estructuras en español palabra por palabra suena robótico. El transformador reemplaza tu fórmula mental por la frase nativa exacta.',
            },
            {
              point: 'Diferencia el inglés protocolar del inglés de entrecasa',
              explanation: 'Decir "I request assistance" en una cena suena exagerado. Decir "Could you give me a hand?" suena cálido y natural.',
            },
            {
              point: 'Escucha la entonación con el botón de voz lenta',
              explanation: 'No basta con leer la frase corregida: dale play al audio con velocidad ajustada para asimilar el ritmo y la musicalidad.',
            },
          ]}
        />

        {/* Input Box & Presets */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              ¿Qué quieres decir o qué frase te suena artificial?
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunTweak()}
                placeholder="Ej: 'I desire to buy a coffee' o 'Quiero pedir un descuento sin sonar tacaño'"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400"
              />
              <button
                onClick={() => handleRunTweak()}
                disabled={isLoading || !userInput.trim()}
                className="px-6 py-3 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm hover:bg-amber-300 disabled:opacity-40 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{isLoading ? 'Desarmando...' : 'Transformar a Nativo'}</span>
              </button>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Prueba un caso típico:
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
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/60 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer text-left"
                >
                  "{preset.phrase}"
                </button>
              ))}
            </div>
          </div>

          {/* Results Display */}
          {result && (
            <div className="pt-6 border-t border-slate-800 space-y-6 animate-in fade-in">
              {/* Real Native way - Direct, Simple & Colloquial */}
              <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-amber-950/30 border border-emerald-500/40 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-wide uppercase">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Tu Frase de Entrecasa (Sencilla y Coloquial)</span>
                  </div>
                  {/* Dual speed audio */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePlayAudio(result.nativeReal, 0.65)}
                      disabled={isPlayingAudio}
                      className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-400/30 hover:border-amber-400/60 cursor-pointer transition-colors shadow-xs"
                      title="Escuchar en cámara lenta para asimilar cada sonido"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lento (0.65x)</span>
                    </button>
                    <button
                      onClick={() => handlePlayAudio(result.nativeReal, 1.0)}
                      disabled={isPlayingAudio}
                      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-slate-950 px-3 py-1.5 rounded-xl border border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer transition-colors shadow-xs"
                      title="Escuchar a velocidad normal y espontánea"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Nativo (1.0x)</span>
                    </button>
                  </div>
                </div>

                <p className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  &ldquo;{result.nativeReal}&rdquo;
                </p>

                {result.casualSlang && (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Versión entre amigos (Súper informal):
                    </span>
                    <span className="text-sm font-semibold text-slate-100 italic">
                      &ldquo;{result.casualSlang}&rdquo;
                    </span>
                  </div>
                )}
              </div>

              {/* Connected Speech and Power Chunk row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                    Bloque de Oro Reutilizable
                  </span>
                  <p className="text-sm font-bold text-white">
                    {result.powerChunk}
                  </p>
                  <p className="text-xs text-slate-400">
                    Memoriza este bloque como un solo sonido. Úsalo para decenas de situaciones.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">
                    Cómo suena realmente en la calle
                  </span>
                  <p className="text-sm font-mono font-medium text-amber-200 bg-slate-900 p-1.5 rounded border border-slate-800">
                    {result.connectedSpeech}
                  </p>
                  <p className="text-xs text-slate-400">
                    Sin pausas intermedias: las palabras se conectan en un solo golpe rítmico.
                  </p>
                </div>
              </div>

              {/* Plain language explanation */}
              <div className="bg-amber-950/30 border border-amber-900/60 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Por qué suena natural (Explicación sin enredos)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {result.whyItSoundsNatural}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
