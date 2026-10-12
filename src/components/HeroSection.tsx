import React, { useState } from 'react';
import { HERO_IMAGE } from '../data/defaultData';
import { Volume2, ArrowRight, Sparkles, Check, X, Headphones } from 'lucide-react';
import { playEnglishVoice, getGlobalAudioSpeed } from '../services/audio';
import { RealVisitsBadge } from './RealVisitsBadge';

interface HeroSectionProps {
  onStartSimulator: () => void;
  onExploreChunks: () => void;
  onTryTweak: () => void;
  onExploreEntrecasa?: () => void;
  onStartDesdeCero?: () => void;
  onOpenKit?: () => void;
  currentSpeed: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartSimulator,
  onExploreChunks,
  onTryTweak,
  onExploreEntrecasa,
  onStartDesdeCero,
  onOpenKit,
  currentSpeed,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);

  const demoExamples = [
    {
      context: 'En un café o restaurante',
      situation: 'Pedir tu café para llevar sin vueltas',
      nativeSaying: "Can I grab an Americano to go?",
      chunk: "Can I grab...",
      nativeSecret: "Los nativos usan 'Can I grab...' para el 90% de sus pedidos sin pensar en verbos ni tiempos.",
      phonetic: "kə-naɪ ɡræb ən ə-mɛ-rɪ-ˈkɑ-noʊ tə ɡoʊ",
    },
    {
      context: 'Pidiendo un favor o ayuda rápida',
      situation: 'Pedir que le echen un vistazo rápido a algo',
      nativeSaying: "Any chance you could look over this real quick?",
      chunk: "Any chance you could...",
      nativeSecret: "Suaviza la petición al instante y suena como un colega cercano y considerado.",
      phonetic: "ˈɛ-ni tʃæns ju kʊd lʊk ˈoʊ-vər ðɪs riəl kwɪk",
    },
    {
      context: 'Despidiéndote o yéndote a casa',
      situation: 'Avisar que ya te vas de forma cálida y espontánea',
      nativeSaying: "I'm about to head out, catch you later!",
      chunk: "I'm about to head out...",
      nativeSecret: "'Head out' es el bloque universal de los nativos para despedirse sin vueltas.",
      phonetic: "aɪm ə-ˈbaʊt tə hɛd aʊt, kætʃ ju ˈleɪ-tər",
    },
  ];

  const currentDemo = demoExamples[activeDemoIndex];

  const handlePlayAudio = async (text: string, customSpeed?: number) => {
    setIsPlayingAudio(true);
    await playEnglishVoice(text, 'Kore', customSpeed || currentSpeed);
    setIsPlayingAudio(false);
  };

  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Tagline with Real Visits Indicator - Centered */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide uppercase text-amber-400 bg-[#16113A]/90 border border-[#2F2468] px-4 py-1.5 rounded-full shadow-xs">
            <span className="text-emerald-400 font-bold">🌱 Desde Cero</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-amber-300 font-bold">☕ Principiantes</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-violet-400 font-bold">⚡ Fluidez Real</span>
          </div>
          <RealVisitsBadge compact={true} />
        </div>

        {/* Main Centralized Hero Header */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12] text-balance">
            Inglés Fácil y Fluido
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-semibold text-amber-400 mt-2 sm:mt-3 font-subheading tracking-normal">
              Una forma sencilla de aprender el idioma y hablarlo con fluidez
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto text-pretty">
            Sin recetas complicadas ni exámenes con bolígrafo rojo. Diseñado para <strong className="text-emerald-300 font-semibold">empezar desde cero absoluto</strong> con fonética fácil en español, consolidar el día a día para <strong className="text-amber-300 font-semibold">principiantes</strong> y dar el salto a modismos y fluidez para quienes buscan un nivel <strong className="text-violet-300 font-semibold">un poco más avanzado</strong>.
          </p>

          {/* Quick Action Buttons - Centered & Evenly Padded */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onStartDesdeCero && (
              <button
                onClick={onStartDesdeCero}
                className="px-6 py-3 text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-400/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
              >
                <span>🌱 Empezar Desde Cero</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onStartSimulator}
              className="px-5 py-3 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-400/10 transition-colors flex items-center gap-2 cursor-pointer hover:scale-102"
            >
              <span>Simulador de Charlas Reales</span>
            </button>
            {onExploreEntrecasa && (
              <button
                onClick={onExploreEntrecasa}
                className="px-5 py-3 text-sm font-semibold text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-xl transition-colors cursor-pointer"
              >
                Vida Cotidiana
              </button>
            )}
            <button
              onClick={onTryTweak}
              className="px-5 py-3 text-sm font-medium text-slate-200 bg-[#1A1440]/90 hover:bg-[#231B56] border border-[#352A72] rounded-xl transition-colors cursor-pointer"
            >
              Transformar Frase
            </button>
            {onOpenKit && (
              <button
                onClick={onOpenKit}
                className="px-5 py-3 text-sm font-bold text-amber-300 bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 border border-amber-400/50 hover:border-amber-400 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-102"
                title="Descargá el pack de 120 audios en MP3 y la guía para tu celular"
              >
                <Headphones className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>🎧 Audio-Kit de Bolsillo ($9)</span>
              </button>
            )}
          </div>

          {/* Micro proof points - Centered */}
          <div className="pt-4 border-t border-[#261E52]/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 max-w-3xl mx-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Reflejos automáticos sin traducir</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Audio pausado para principiantes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>Feedback humano sin jerga gramatical</span>
            </div>
          </div>
        </div>

        {/* Symmetrical 2-Column Showcase Centered under Hero */}
        <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left Column: Hero Visual Asset */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#2E2463] bg-[#14102E] group h-full flex flex-col justify-end min-h-[320px]">
            <img
              src={HERO_IMAGE}
              alt="Dos personas conversando en inglés de forma natural y espontánea en una cafetería"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500 opacity-85"
              referrerPolicy="no-referrer"
            />
            <div className="relative z-10 bg-gradient-to-t from-[#0C0A1D] via-[#0C0A1D]/80 to-transparent p-6 text-white space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Fluidez Conversacional Real</span>
              </div>
              <p className="text-base font-semibold leading-snug text-slate-100">
                &ldquo;La fluidez no es saber mil reglas. Es tener 50 bloques listos en la punta de la lengua.&rdquo;
              </p>
              <p className="text-xs text-slate-400">
                Práctica diaria sin presiones · Habla desde el primer día
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Live Entrecasa Demonstration Card */}
          <div className="bg-[#14102E]/90 rounded-2xl border border-[#2E2463] p-5 sm:p-6 shadow-xl space-y-4 backdrop-blur-md flex flex-col justify-between h-full">
            <div className="flex items-center justify-between pb-3 border-b border-[#251D52]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Inglés Real en Vivo
                </span>
              </div>
              <div className="flex gap-1 bg-[#0C0A1D] p-0.5 rounded-lg border border-[#251D52]">
                {demoExamples.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDemoIndex(idx)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeDemoIndex === idx
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Ejemplo {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Native Colloquial Card */}
            <div className="space-y-3 bg-gradient-to-br from-emerald-950/30 via-slate-900/80 to-amber-950/20 border border-emerald-500/40 rounded-xl p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-300 mb-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                      {currentDemo.context}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {currentDemo.situation}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handlePlayAudio(currentDemo.nativeSaying, 0.65)}
                      disabled={isPlayingAudio}
                      className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 bg-[#0C0A1D] px-2 py-1 rounded-lg border border-[#2E2463] cursor-pointer shadow-xs"
                      title="Escuchar en cámara lenta para principiantes"
                    >
                      <Volume2 className="w-3 h-3 text-amber-400" />
                      <span>Lento (0.65x)</span>
                    </button>
                    <button
                      onClick={() => handlePlayAudio(currentDemo.nativeSaying, 1.0)}
                      disabled={isPlayingAudio}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 bg-[#0C0A1D] px-2 py-1 rounded-lg border border-[#2E2463] cursor-pointer shadow-xs"
                      title="Escuchar a velocidad normal"
                    >
                      <Volume2 className="w-3 h-3 text-emerald-400" />
                      <span>Nativo (1.0x)</span>
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <p className="text-base sm:text-lg font-extrabold text-white font-heading">
                    &ldquo;{currentDemo.nativeSaying}&rdquo;
                  </p>
                  <p className="text-[11px] text-amber-200/90 font-mono-clean mt-1">
                    🔊 {currentDemo.phonetic}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-900/40 text-[11px] text-slate-300 leading-relaxed space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold text-[10px] uppercase">
                    Bloque clave:
                  </span>
                  <span className="font-bold text-white text-xs">{currentDemo.chunk}</span>
                </div>
                <p className="text-slate-300">{currentDemo.nativeSecret}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
