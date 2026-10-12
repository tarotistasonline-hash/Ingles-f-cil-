import React, { useState, useEffect } from 'react';
import { HERO_IMAGE } from '../data/defaultData';
import {
  Volume2,
  ArrowRight,
  Sparkles,
  Headphones,
  Play,
  RotateCw,
  CheckCircle2,
  XCircle,
  Radio,
  Zap,
} from 'lucide-react';
import { playEnglishVoice } from '../services/audio';
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
  const [playingSpeed, setPlayingSpeed] = useState<number | null>(null);
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);

  const demoExamples = [
    {
      context: 'En un café o restaurante',
      tag: 'Cafetería & Pedidos',
      icon: '☕',
      literalSpanish: '¿Puedo tener un café para llevar por favor?',
      literalEnglishFailed: 'Can I have please a coffee for take away?',
      nativeSaying: 'Can I grab an Americano to go?',
      chunk: 'Can I grab...',
      nativeSecret:
        "Los nativos usan 'Can I grab...' para el 90% de sus pedidos sin pensar en verbos ni tiempos gramaticales.",
      phonetic: 'kə-naɪ ɡræb ən ə-mɛ-rɪ-ˈkɑ-noʊ tə ɡoʊ',
      phoneticSimple: 'ka-nai grab an a-me-ri-kóu-nou tu gou',
    },
    {
      context: 'Pidiendo un favor o ayuda rápida',
      tag: 'Trabajo & Favores',
      icon: '💼',
      literalSpanish: '¿Puedes tú mirar esto muy rápido?',
      literalEnglishFailed: 'Can you look this very quickly please?',
      nativeSaying: 'Any chance you could look over this real quick?',
      chunk: 'Any chance you could...',
      nativeSecret:
        'Suaviza la petición al instante y suena como un colega cercano, natural y considerado.',
      phonetic: 'ˈɛ-ni tʃæns ju kʊd lʊk ˈoʊ-vər ðɪs riəl kwɪk',
      phoneticSimple: 'e-ni chens iu cud luk óu-ver dis rial cuik',
    },
    {
      context: 'Despidiéndote o yéndote a casa',
      tag: 'Salidas & Despedidas',
      icon: '👋',
      literalSpanish: 'Yo voy a ir a mi casa ahora, te veo luego',
      literalEnglishFailed: 'I will go to my home now, see you later',
      nativeSaying: "I'm about to head out, catch you later!",
      chunk: "I'm about to head out...",
      nativeSecret:
        "'Head out' es el bloque universal de los nativos para despedirse sin vueltas.",
      phonetic: 'aɪm ə-ˈbaʊt tə hɛd aʊt, kætʃ ju ˈleɪ-tər',
      phoneticSimple: 'aim a-báut tu hed áut, ketch iu léi-ter',
    },
    {
      context: 'Al llegar a un aeropuerto o terminal',
      tag: 'Viajes & Direcciones',
      icon: '✈️',
      literalSpanish: '¿Dónde está la puerta para mi vuelo?',
      literalEnglishFailed: 'Where is the gate of my airplane fly?',
      nativeSaying: 'Which gate is flight 402 boarding at?',
      chunk: 'Which gate is... boarding at?',
      nativeSecret:
        'El orden natural nativo une la acción con la preposición final sin traducciones mecánicas.',
      phonetic: 'wɪtʃ ɡeɪt ɪz flaɪt fɔr-oʊ-tu ˈbɔr-dɪŋ æt',
      phoneticSimple: 'uich geit is flait for-ou-tu bór-ding at',
    },
  ];

  const currentDemo = demoExamples[activeDemoIndex];

  // Auto-advance rotation every 9 seconds if not playing audio
  useEffect(() => {
    if (isPlayingAudio) return;
    const interval = setInterval(() => {
      setActiveDemoIndex((prev) => (prev + 1) % demoExamples.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [isPlayingAudio, demoExamples.length]);

  const handlePlayAudio = async (text: string, customSpeed: number) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    setPlayingSpeed(customSpeed);
    try {
      await playEnglishVoice(text, 'Kore', customSpeed);
    } catch {
      // Audio playback caught gracefully
    } finally {
      setIsPlayingAudio(false);
      setPlayingSpeed(null);
    }
  };

  return (
    <section className="relative pt-6 pb-16 md:pt-12 md:pb-24 overflow-hidden bg-transparent">
      {/* Dynamic Animated Ambient Glow Lights (Breathe & Float in background) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-violet-600/15 via-amber-500/15 to-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-ambient -z-10" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-float-slow -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-float-reverse -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Tagline with Real Visits Indicator - Centered & Animated */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-amber-300 bg-[#16113A]/90 border border-[#2F2468] px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold">🌱 Desde Cero</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-amber-300 font-bold">☕ Principiantes</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-violet-400 font-bold">⚡ Fluidez Real</span>
          </div>
          <RealVisitsBadge compact={true} />
        </div>

        {/* Main Centralized Hero Header with Typography Polish & Gradient Shimmer */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12] text-balance">
            <span className="inline-block bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
              Inglés Fácil y Fluido
            </span>
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-semibold text-amber-400 mt-2 sm:mt-3 font-subheading tracking-normal">
              Una forma sencilla de aprender el idioma y hablarlo con fluidez
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto text-pretty">
            Sin recetas complicadas ni exámenes con bolígrafo rojo. Diseñado para{' '}
            <strong className="text-emerald-300 font-semibold">empezar desde cero absoluto</strong> con fonética fácil en español, consolidar el día a día para{' '}
            <strong className="text-amber-300 font-semibold">principiantes</strong> y dar el salto a modismos y reflejos espontáneos para quienes buscan un nivel{' '}
            <strong className="text-violet-300 font-semibold">un poco más avanzado</strong>.
          </p>

          {/* Quick Action Buttons - Centered & Tactile */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onStartDesdeCero && (
              <button
                onClick={onStartDesdeCero}
                className="group relative px-6 py-3 text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-400/25 transition-all duration-300 flex items-center gap-2 cursor-pointer hover:scale-103 hover:shadow-emerald-400/40"
              >
                <span>🌱 Empezar Desde Cero</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            <button
              onClick={onStartSimulator}
              className="px-5 py-3 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-400/20 transition-all duration-300 flex items-center gap-2 cursor-pointer hover:scale-103 hover:shadow-amber-400/35"
            >
              <Radio className="w-4 h-4 text-slate-950" />
              <span>Simulador de Charlas Reales</span>
            </button>
            {onExploreEntrecasa && (
              <button
                onClick={onExploreEntrecasa}
                className="px-5 py-3 text-sm font-semibold text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-xl transition-all cursor-pointer hover:scale-102"
              >
                Vida Cotidiana
              </button>
            )}
            <button
              onClick={onTryTweak}
              className="px-5 py-3 text-sm font-medium text-slate-200 bg-[#1A1440]/90 hover:bg-[#231B56] border border-[#352A72] rounded-xl transition-all cursor-pointer hover:scale-102"
            >
              Transformar Frase
            </button>
            {onOpenKit && (
              <button
                onClick={onOpenKit}
                className="group relative px-5 py-3 text-sm font-bold text-amber-300 bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 border border-amber-400/50 hover:border-amber-400 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-103"
                title="Descargá el pack de 120 audios en MP3 y la guía para tu celular"
              >
                <Headphones className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>🎧 Audio-Kit de Bolsillo ($9)</span>
              </button>
            )}
          </div>

          {/* Micro proof points - Centered with lively visual dots */}
          <div className="pt-4 border-t border-[#261E52]/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400"></span>
              <span>Reflejos automáticos sin traducir</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs shadow-amber-400"></span>
              <span>Audio pausado (0.65x) para principiantes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-xs shadow-sky-400"></span>
              <span>Feedback humano sin jerga gramatical</span>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Scenario Bar with Gentle Live Ticker */}
        <div className="mt-10 max-w-5xl mx-auto">
          <div className="bg-[#120D2C]/90 border border-[#2B215E] rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 px-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Situaciones en Vivo:</span>
              </span>
            </div>

            {/* Scenario Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {demoExamples.map((ex, idx) => {
                const isActive = activeDemoIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveDemoIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25 scale-102'
                        : 'bg-slate-900/80 border border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{ex.icon}</span>
                    <span>{ex.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Symmetrical 2-Column Showcase Centered under Hero with Movement */}
        <div className="mt-6 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left Column: Hero Visual Asset with Floating Motion Badges */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#2E2463] bg-[#14102E] group h-full flex flex-col justify-end min-h-[350px]">
            <img
              src={HERO_IMAGE}
              alt="Dos personas conversando en inglés de forma natural y espontánea en una cafetería"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.04] transition-transform duration-700 opacity-85"
              referrerPolicy="no-referrer"
            />

            {/* Floating Top Badge with Animated Soundwave (Movement) */}
            <div className="absolute top-4 left-4 z-20 animate-float-slow">
              <div className="bg-[#0D0B1E]/90 border border-amber-400/40 rounded-xl px-3 py-2 shadow-xl backdrop-blur-md flex items-center gap-2.5">
                {/* Mini dancing soundwave equalizer */}
                <div className="flex items-end gap-0.5 h-4 w-5">
                  <span
                    className="w-1 bg-amber-400 rounded-full animate-pulse"
                    style={{ height: '70%' }}
                  ></span>
                  <span
                    className="w-1 bg-emerald-400 rounded-full animate-pulse"
                    style={{ height: '100%', animationDelay: '0.2s' }}
                  ></span>
                  <span
                    className="w-1 bg-sky-400 rounded-full animate-pulse"
                    style={{ height: '50%', animationDelay: '0.4s' }}
                  ></span>
                  <span
                    className="w-1 bg-amber-300 rounded-full animate-pulse"
                    style={{ height: '85%', animationDelay: '0.15s' }}
                  ></span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white leading-tight">
                    Audios nativos claros
                  </p>
                  <p className="text-[10px] text-amber-300">
                    Velocidad lenta y normal
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Bottom-Right Badge with Gentle Counter-Motion */}
            <div className="absolute top-4 right-4 z-20 animate-float-reverse hidden sm:block">
              <div className="bg-[#0D0B1E]/90 border border-emerald-400/40 rounded-xl px-3 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>0% gramática aburrida</span>
              </div>
            </div>

            {/* Quick Play Overlay Trigger right on the photo */}
            <button
              onClick={() => handlePlayAudio(currentDemo.nativeSaying, 1.0)}
              disabled={isPlayingAudio}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors cursor-pointer"
              title="Haz clic para escuchar cómo suena en inglés real"
            >
              <div className="w-14 h-14 rounded-full bg-amber-400/90 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-amber-400/50 group-hover:scale-110 transition-transform cursor-pointer border-2 border-white/40">
                {isPlayingAudio ? (
                  <div className="flex items-center gap-0.5">
                    <span className="w-1.5 h-5 bg-slate-950 rounded-full animate-pulse"></span>
                    <span className="w-1.5 h-6 bg-slate-950 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-4 bg-slate-950 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                ) : (
                  <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
                )}
              </div>
            </button>

            {/* Bottom Caption Overlay */}
            <div className="relative z-10 bg-gradient-to-t from-[#0C0A1D] via-[#0C0A1D]/85 to-transparent p-6 text-white space-y-2 pointer-events-none">
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

          {/* Right Column: Interactive Live Demonstration Card with Real Movement */}
          <div className="bg-[#14102E]/90 rounded-2xl border border-[#2E2463] p-5 sm:p-6 shadow-xl space-y-4 backdrop-blur-md flex flex-col justify-between h-full">
            {/* Header of Demo Card */}
            <div className="flex items-center justify-between pb-3 border-b border-[#251D52]">
              <div className="flex items-center gap-2">
                <span className="text-base">{currentDemo.icon}</span>
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    {currentDemo.tag}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {currentDemo.context}
                  </span>
                </div>
              </div>

              {/* Animated Soundwave Visualizer when playing audio */}
              <div className="flex items-center gap-2">
                {isPlayingAudio && (
                  <div className="flex items-end gap-1 h-5 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-lg">
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: '80%' }}></span>
                    <span className="w-1 bg-emerald-300 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.15s' }}></span>
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.3s' }}></span>
                    <span className="w-1 bg-amber-400 rounded-full animate-pulse" style={{ height: '60%', animationDelay: '0.2s' }}></span>
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: '90%', animationDelay: '0.4s' }}></span>
                  </div>
                )}

                <button
                  onClick={() =>
                    setActiveDemoIndex((prev) => (prev + 1) % demoExamples.length)
                  }
                  className="p-1.5 text-xs text-slate-400 hover:text-amber-300 hover:bg-[#1D1744] rounded-lg border border-[#2B205D] transition-colors cursor-pointer"
                  title="Ver siguiente ejemplo"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Direct Comparison: Spanish / Word-by-Word vs. Real Native English */}
            <div className="space-y-3">
              {/* Common Pitfall / Word-by-Word mental translation */}
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/25 flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                    Traducción mental que traba la lengua:
                  </span>
                  <p className="text-slate-300 line-through decoration-rose-400/60">
                    &ldquo;{currentDemo.literalEnglishFailed}&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-400">
                    ({currentDemo.literalSpanish})
                  </p>
                </div>
              </div>

              {/* Native Colloquial Real English */}
              <div className="space-y-3 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-amber-950/25 border-2 border-emerald-500/50 rounded-xl p-4 shadow-lg shadow-emerald-950/30">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                      Como lo dice un nativo:
                    </span>
                  </div>

                  {/* Dual Speed Play Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handlePlayAudio(currentDemo.nativeSaying, 0.65)}
                      disabled={isPlayingAudio}
                      className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        isPlayingAudio && playingSpeed === 0.65
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md shadow-amber-400/30 animate-pulse'
                          : 'text-amber-300 hover:text-amber-200 bg-[#0C0A1D] hover:bg-[#161235] border-[#2E2463]'
                      }`}
                      title="Escuchar en cámara lenta para principiantes"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lento (0.65x)</span>
                    </button>
                    <button
                      onClick={() => handlePlayAudio(currentDemo.nativeSaying, 1.0)}
                      disabled={isPlayingAudio}
                      className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        isPlayingAudio && playingSpeed === 1.0
                          ? 'bg-emerald-400 text-slate-950 border-emerald-300 font-bold shadow-md shadow-emerald-400/30 animate-pulse'
                          : 'text-emerald-300 hover:text-emerald-200 bg-[#0C0A1D] hover:bg-[#161235] border-[#2E2463]'
                      }`}
                      title="Escuchar a velocidad normal nativa"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Nativo (1.0x)</span>
                    </button>
                  </div>
                </div>

                {/* Main Native Phrase */}
                <div className="pt-1">
                  <p className="text-lg sm:text-xl font-black text-white font-heading tracking-tight leading-snug">
                    &ldquo;{currentDemo.nativeSaying}&rdquo;
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-emerald-300 font-mono-clean bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      🔊 Fonética: {currentDemo.phoneticSimple}
                    </span>
                  </div>
                </div>

                {/* Secret Chunk Explanation */}
                <div className="pt-2.5 border-t border-emerald-900/40 text-[11px] text-slate-300 leading-relaxed space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold text-[10px] uppercase">
                      Bloque clave:
                    </span>
                    <span className="font-bold text-white text-xs">
                      {currentDemo.chunk}
                    </span>
                  </div>
                  <p className="text-slate-300">{currentDemo.nativeSecret}</p>
                </div>
              </div>
            </div>

            {/* Bottom Mini CTA to start Practicing */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Cambia de ejemplo cada pocos segundos</span>
              </span>
              <button
                onClick={onStartSimulator}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Probar diálogo interactivo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
