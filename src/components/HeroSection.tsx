import React, { useState, useEffect } from 'react';
import {
  HERO_IMAGE,
  CAFE_IMAGE,
  TRAVEL_IMAGE,
  ENTRECASA_IMAGE,
} from '../data/defaultData';
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
  MessageSquare,
  Star,
  Quote,
  Heart,
  Scissors,
  Send,
  Layers,
} from 'lucide-react';
import { playEnglishVoice } from '../services/audio';
import { askTeacher, fetchSpeakTweak } from '../services/api';
import { RealVisitsBadge } from './RealVisitsBadge';
import { DailyChallengeWidget } from './DailyChallengeWidget';

interface HeroSectionProps {
  onStartSimulator: () => void;
  onExploreChunks: () => void;
  onTryTweak: () => void;
  onExploreEntrecasa?: () => void;
  onStartDesdeCero?: () => void;
  onStartGym?: () => void;
  onOpenKit?: () => void;
  onAskTeacher?: () => void;
  onOpenBlog?: () => void;
  currentSpeed: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartSimulator,
  onExploreChunks,
  onTryTweak,
  onExploreEntrecasa,
  onStartDesdeCero,
  onStartGym,
  onOpenKit,
  onAskTeacher,
  onOpenBlog,
  currentSpeed,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playingSpeed, setPlayingSpeed] = useState<number | null>(null);
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);

  // Multi-panel interactive state (shortens page into organized switchable panels)
  const [activePanelTab, setActivePanelTab] = useState<'profe' | 'tweak' | 'challenge' | 'blog'>('profe');

  // Quick Profe Consultation State
  const [profeQuery, setProfeQuery] = useState('');
  const [isProfeLoading, setIsProfeLoading] = useState(false);
  const [profeResponse, setProfeResponse] = useState<any>(null);
  const [profeNotification, setProfeNotification] = useState<string | null>(null);
  const [profeTypingStep, setProfeTypingStep] = useState(0);

  // Quick SpeakTweak "Desarmar Frase" State
  const [tweakInput, setTweakInput] = useState('');
  const [isTweakLoading, setIsTweakLoading] = useState(false);
  const [tweakResult, setTweakResult] = useState<any>(null);
  const [tweakNotification, setTweakNotification] = useState<string | null>(null);
  const [tweakOriginal, setTweakOriginal] = useState<string>('');

  const demoExamples = [
    {
      context: 'En un café o restaurante',
      tag: 'Cafetería & Pedidos',
      icon: '☕',
      image: CAFE_IMAGE,
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
      image: HERO_IMAGE,
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
      image: ENTRECASA_IMAGE,
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
      image: TRAVEL_IMAGE,
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

  // Typing indicator stage animation for Profe consultation
  useEffect(() => {
    if (isProfeLoading) {
      setProfeTypingStep(1);
      const timer = setInterval(() => {
        setProfeTypingStep((prev) => (prev >= 3 ? 1 : prev + 1));
      }, 1200);
      return () => clearInterval(timer);
    } else {
      setProfeTypingStep(0);
    }
  }, [isProfeLoading]);

  const handleAskProfe = async (overrideText?: string) => {
    const q = (overrideText || profeQuery).trim();
    if (!q || isProfeLoading) return;
    setIsProfeLoading(true);
    setProfeNotification(null);
    try {
      const data = await askTeacher(q);
      setProfeResponse(data);
      setProfeNotification('✨ ¡La profe ha respondido a tu consulta con audio y fonética!');
    } catch {
      setProfeNotification('No se pudo conectar con la profe. Intenta nuevamente.');
    } finally {
      setIsProfeLoading(false);
    }
  };

  const handleRunTweak = async (overridePhrase?: string, overrideContext?: string) => {
    const text = (overridePhrase || tweakInput).trim();
    if (!text || isTweakLoading) return;
    setIsTweakLoading(true);
    setTweakNotification(null);
    setTweakOriginal(text);
    try {
      const data = await fetchSpeakTweak(text, overrideContext || '');
      setTweakResult(data);
      setTweakNotification('✨ ¡Frase desarmada y transformada a inglés real con éxito!');
    } catch {
      setTweakNotification('No se pudo desarmar la frase en este momento.');
    } finally {
      setIsTweakLoading(false);
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
              El método más fácil y rápido para aprender inglés desde casa
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto text-pretty">
            Aprende inglés a tu propio ritmo, sin salir de tu hogar o también en el coche, bus o caminando si decides descargar el auto kit de bolsillo sin conexión y a modo de colaboración para seguir manteniendo y mejorando el sitio.
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
            {onAskTeacher && (
              <button
                onClick={onAskTeacher}
                className="group relative px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 border border-purple-400/50 rounded-xl shadow-lg shadow-purple-900/30 transition-all cursor-pointer hover:scale-103 flex items-center gap-2"
                title="Escribe tu duda y la profe te responde con audio y fonética"
              >
                <span>👩‍🏫</span>
                <span>Preguntarle a la profe</span>
              </button>
            )}
            <button
              onClick={() => {
                setActivePanelTab('tweak');
                const el = document.getElementById('interactive-panels');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onTryTweak();
              }}
              className="px-5 py-3 text-sm font-bold text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/40 rounded-xl transition-all cursor-pointer hover:scale-102 flex items-center gap-1.5"
            >
              <span>✂️</span>
              <span>Desarmar Frase</span>
            </button>
            {onOpenKit && (
              <button
                onClick={onOpenKit}
                className="group relative px-5 py-3 text-sm font-bold text-amber-300 bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 border border-amber-400/50 hover:border-amber-400 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-103"
                title="Descargá el pack de 120 audios en MP3 y la guía para tu celular"
              >
                <Headphones className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>🎧 Audio-Kit de Bolsillo ($9.990)</span>
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
              <span>3 velocidades de audio (0.65x Lento · 0.8x Pausado · 1.0x Nativo)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-xs shadow-sky-400"></span>
              <span>Feedback humano sin jerga gramatical</span>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Scenario Bar with Gentle Live Ticker */}
        <div className="mt-8 sm:mt-10 max-w-5xl mx-auto">
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
          {/* Left Column: Hero Visual Asset with Floating Motion Badges & Dynamic Scenes */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#2E2463] bg-[#14102E] group h-full flex flex-col justify-end min-h-[360px]">
            <img
              key={currentDemo.tag}
              src={currentDemo.image || HERO_IMAGE}
              alt={currentDemo.context}
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.04] transition-all duration-700 opacity-90"
              fetchPriority="high"
              loading="eager"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/hero_natural_flow_1791483871015.jpg';
              }}
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

        {/* PANELES INTERACTIVOS DE PRÁCTICA Y CONSULTA (Acorta la página de forma masiva) */}
        <div id="interactive-panels" className="mt-10 sm:mt-14 max-w-5xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-b from-[#151035] via-[#100C2A] to-[#0D0922] border-2 border-[#2F2468] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Top Bar with Header & Tabs */}
            <div className="relative z-10 space-y-4 pb-6 border-b border-[#281F54]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Paneles de Práctica y Consulta Rápida</span>
                  </div>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Todo lo que necesitas en un solo lugar
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Cambia de panel con un clic: consulta a la profe, desarma frases literales, haz tu reto diario o lee opiniones.
                  </p>
                </div>
              </div>

              {/* 4 Interactive Switcher Tabs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                <button
                  onClick={() => setActivePanelTab('profe')}
                  className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-2.5 cursor-pointer ${
                    activePanelTab === 'profe'
                      ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-amber-400/80 shadow-lg shadow-purple-900/40 scale-[1.02]'
                      : 'bg-[#0A071E]/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="text-2xl shrink-0">👩‍🏫</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${activePanelTab === 'profe' ? 'text-amber-300' : 'text-slate-200'}`}>
                      Preguntarle a la Profe
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">Dudas sin vergüenza</p>
                  </div>
                </button>

                <button
                  onClick={() => setActivePanelTab('tweak')}
                  className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-2.5 cursor-pointer ${
                    activePanelTab === 'tweak'
                      ? 'bg-gradient-to-r from-amber-950/60 to-emerald-950/60 border-amber-400/80 shadow-lg shadow-amber-950/40 scale-[1.02]'
                      : 'bg-[#0A071E]/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="text-2xl shrink-0">✂️</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${activePanelTab === 'tweak' ? 'text-amber-300' : 'text-slate-200'}`}>
                      Desarmar Frase
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">Inglés de entrecasa</p>
                  </div>
                </button>

                <button
                  onClick={() => setActivePanelTab('challenge')}
                  className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-2.5 cursor-pointer ${
                    activePanelTab === 'challenge'
                      ? 'bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border-emerald-400/80 shadow-lg shadow-emerald-950/40 scale-[1.02]'
                      : 'bg-[#0A071E]/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="text-2xl shrink-0">⚡</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${activePanelTab === 'challenge' ? 'text-emerald-300' : 'text-slate-200'}`}>
                      Reto de 5 Minutos
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">Micro-práctica hoy</p>
                  </div>
                </button>

                <button
                  onClick={() => setActivePanelTab('blog')}
                  className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-2.5 cursor-pointer ${
                    activePanelTab === 'blog'
                      ? 'bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border-sky-400/80 shadow-lg shadow-sky-950/40 scale-[1.02]'
                      : 'bg-[#0A071E]/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="text-2xl shrink-0">💬</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${activePanelTab === 'blog' ? 'text-sky-300' : 'text-slate-200'}`}>
                      Blog & Opiniones
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">4.9/5 · Comunidad</p>
                  </div>
                </button>
              </div>
            </div>

            {/* TAB CONTENTS */}
            <div className="pt-6 relative z-10">
              {/* PANEL 1: PREGUNTARLE A LA PROFE */}
              {activePanelTab === 'profe' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span>👩‍🏫 Consulta directa con La Profe:</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">(Responde con audio y fonética)</span>
                      </label>
                      {onAskTeacher && (
                        <button
                          onClick={onAskTeacher}
                          className="text-xs text-amber-400 hover:text-amber-300 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ir a la sala completa</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={profeQuery}
                        onChange={(e) => setProfeQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAskProfe()}
                        placeholder="Escribe tu duda: ej. '¿Cómo pido un descuento sin sonar tacaño?'"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all"
                      />
                      <button
                        onClick={() => handleAskProfe()}
                        disabled={isProfeLoading || !profeQuery.trim()}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md whitespace-nowrap hover:scale-102"
                      >
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>{isProfeLoading ? 'Consultando...' : 'Preguntar a la Profe'}</span>
                      </button>
                    </div>

                    {/* Quick Preset Questions */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] font-semibold text-slate-400">Preguntas comunes:</span>
                      {[
                        '¿Cómo pido un descuento sin sonar tacaño?',
                        '¿Cómo cancelo una cita sin sonar grosero?',
                        '¿Cómo digo "me da pereza" sin inventar traducciones?',
                        '¿Cómo pido un café para llevar sin dar vueltas?',
                        '¿Por qué "I have hunger" suena tan mal?',
                      ].map((sample, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setProfeQuery(sample);
                            handleAskProfe(sample);
                          }}
                          className="text-xs text-slate-300 hover:text-white bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left"
                        >
                          {sample}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* INDICADOR DE 'ESCRIBIENDO...' (Typing Indicator) */}
                  {isProfeLoading && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-950 to-indigo-950/60 border border-amber-400/50 flex items-center gap-4 animate-in fade-in shadow-lg">
                      <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shrink-0 shadow-md animate-pulse">
                        👩‍🏫
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-amber-300">
                            La Profe está escribiendo tu respuesta
                          </span>
                          <span className="inline-flex gap-1 items-center">
                            <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {profeTypingStep === 1 && 'Desarmando la expresión a inglés de entrecasa...'}
                          {profeTypingStep === 2 && 'Preparando ejemplos cotidianos y trucos de ritmo...'}
                          {profeTypingStep >= 3 && 'Generando el audio pausado y la fonética...'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Success Notification Banner */}
                  {profeNotification && !isProfeLoading && (
                    <div className="bg-emerald-500/15 border border-emerald-400/50 text-emerald-200 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs sm:text-sm shadow-md animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold">{profeNotification}</span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-mono">Respuesta lista</span>
                    </div>
                  )}

                  {/* Profe Answer Card */}
                  {profeResponse && !isProfeLoading && (
                    <div className="bg-gradient-to-br from-[#1A1440]/90 to-slate-900/90 border-2 border-amber-400/50 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-[#2B205D] pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">👩‍🏫</span>
                          <div>
                            <span className="text-xs font-bold text-white uppercase tracking-wider block">
                              Respuesta de La Profe
                            </span>
                            <span className="text-[11px] text-emerald-400 font-medium">
                              Inglés real · Sin jerga gramatical
                            </span>
                          </div>
                        </div>
                        {profeResponse.powerChunk && (
                          <div className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                            Bloque: {profeResponse.powerChunk}
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line space-y-2">
                        {profeResponse.answer}
                      </div>

                      {/* Natural Examples with Audio */}
                      {profeResponse.naturalExamples && profeResponse.naturalExamples.length > 0 && (
                        <div className="pt-2 space-y-2">
                          <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                            Ejemplos en vivo con audio:
                          </p>
                          <div className="space-y-2">
                            {profeResponse.naturalExamples.map((ex: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                              >
                                <div className="space-y-0.5">
                                  <p className="text-sm font-bold text-white">&ldquo;{ex.en}&rdquo;</p>
                                  <p className="text-xs text-slate-400">{ex.es}</p>
                                  {ex.chunkNote && (
                                    <p className="text-[10px] text-emerald-300 font-medium">{ex.chunkNote}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => handlePlayAudio(ex.en, 0.65)}
                                    className="px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                    title="Escuchar en cámara lenta (0.65x)"
                                  >
                                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Lento (0.65x)</span>
                                  </button>
                                  <button
                                    onClick={() => handlePlayAudio(ex.en, 1.0)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                    title="Escuchar a velocidad normal (1.0x)"
                                  >
                                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Nativo (1.0x)</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SoundTip */}
                      {profeResponse.soundTip && (
                        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2">
                          <span className="text-base">🔊</span>
                          <div>
                            <span className="font-bold text-emerald-300 block">Truco de ritmo y pronunciación:</span>
                            <span>{profeResponse.soundTip}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* PANEL 2: DESARMAR FRASE (SPEAKTWEAK) */}
              {activePanelTab === 'tweak' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span>✂️ Escribe cualquier frase para desarmar:</span>
                        <span className="text-[10px] text-amber-400 font-semibold">(Elimina calcos del español)</span>
                      </label>
                      {onTryTweak && (
                        <button
                          onClick={onTryTweak}
                          className="text-xs text-amber-400 hover:text-amber-300 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ir al laboratorio completo</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={tweakInput}
                        onChange={(e) => setTweakInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRunTweak()}
                        placeholder="Ej: 'Quiero pedir un descuento sin sonar tacaño' o 'Tengo mucha hambre'"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all"
                      />
                      <button
                        onClick={() => handleRunTweak()}
                        disabled={isTweakLoading || !tweakInput.trim()}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md whitespace-nowrap hover:scale-102"
                      >
                        <Scissors className="w-4 h-4 text-slate-950" />
                        <span>{isTweakLoading ? 'Desarmando...' : 'Desarmar Frase'}</span>
                      </button>
                    </div>

                    {/* Presets */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Haz clic en un ejemplo para desarmarlo al instante:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Quiero pedir un descuento sin sonar tacaño',
                          '¿Cómo pido un café para llevar sin dar vueltas?',
                          'Tengo un hambre tremenda, vamos a comer algo',
                          'No voy a poder ir a la juntada pero con la mejor onda',
                          'Dejalo ahí que después me encargo yo',
                        ].map((phrase, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setTweakInput(phrase);
                              handleRunTweak(phrase);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/60 text-xs text-slate-300 hover:text-white transition-all cursor-pointer text-left flex items-center gap-1.5"
                          >
                            <span>✂️</span>
                            <span>"{phrase}"</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Loading Disassembly Indicator */}
                  {isTweakLoading && (
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
                          Identificando bloques nativos de entrecasa y preparando el audio pausado.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Success notification */}
                  {tweakNotification && !isTweakLoading && (
                    <div className="bg-emerald-500/15 border border-emerald-400/50 text-emerald-200 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs sm:text-sm shadow-md animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold">{tweakNotification}</span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-mono">Desarmada</span>
                    </div>
                  )}

                  {/* Tweak Result Card */}
                  {tweakResult && !isTweakLoading && (
                    <div className="space-y-4 pt-2 animate-in fade-in">
                      {tweakOriginal && (
                        <div className="text-xs text-slate-400 bg-slate-950/80 px-3.5 py-2 rounded-lg border border-slate-800 flex items-center gap-2">
                          <span className="font-bold text-amber-400">Frase original desarmada:</span>
                          <span className="text-slate-200 italic">"{tweakOriginal}"</span>
                        </div>
                      )}

                      <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-amber-950/30 border-2 border-emerald-500/50 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wide">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Como lo dice un nativo (100% Real y sin rodeos):</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handlePlayAudio(tweakResult.nativeReal, 0.65)}
                              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Escuchar en cámara lenta (0.65x)"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                              <span>Lento (0.65x)</span>
                            </button>
                            <button
                              onClick={() => handlePlayAudio(tweakResult.nativeReal, 1.0)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-400 text-slate-950 hover:bg-emerald-300 text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-md transition-colors"
                              title="Escuchar a velocidad normal nativa (1.0x)"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-slate-950" />
                              <span>Nativo (1.0x)</span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="text-xl sm:text-2xl font-black text-white font-heading">
                            &ldquo;{tweakResult.nativeReal}&rdquo;
                          </p>
                          {tweakResult.connectedSpeech && (
                            <p className="text-xs text-emerald-300 font-mono-clean mt-1">
                              🔊 Fonética continua: {tweakResult.connectedSpeech}
                            </p>
                          )}
                        </div>

                        {/* Literal school pitfall */}
                        {tweakResult.literalSchool && (
                          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/25 flex items-start gap-2.5 text-xs">
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] font-bold uppercase text-rose-400 block">
                                La traducción de libro que te traba la lengua:
                              </span>
                              <p className="text-slate-300 line-through decoration-rose-400/60">
                                &ldquo;{tweakResult.literalSchool}&rdquo;
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Power Chunk & Explanation */}
                        <div className="pt-2 border-t border-emerald-900/40 text-xs text-slate-300 space-y-1.5">
                          {tweakResult.powerChunk && (
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold text-[10px] uppercase">
                                Bloque Clave:
                              </span>
                              <span className="font-bold text-white text-sm">{tweakResult.powerChunk}</span>
                            </div>
                          )}
                          <p className="text-slate-300 leading-relaxed">{tweakResult.whyItSoundsNatural}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PANEL 3: RETO DIARIO (5 MINUTOS) */}
              {activePanelTab === 'challenge' && (
                <div className="animate-in fade-in duration-300">
                  <DailyChallengeWidget
                    onStartGym={onStartGym}
                    onExploreChunks={onExploreChunks}
                    onStartSimulator={onStartSimulator}
                    currentSpeed={currentSpeed}
                  />
                </div>
              )}

              {/* PANEL 4: BLOG & OPINIONES */}
              {activePanelTab === 'blog' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          Experiencias Reales
                        </span>
                        <span className="text-xs font-semibold text-amber-300 flex items-center gap-1 bg-amber-950/40 border border-amber-400/30 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>4.9 / 5</span>
                        </span>
                      </div>
                      <h4 className="font-heading text-lg font-bold text-white pt-1">
                        Lo que opinan quienes ya están hablando con soltura
                      </h4>
                    </div>
                    {onOpenBlog && (
                      <button
                        onClick={onOpenBlog}
                        className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all shadow-md hover:scale-103 flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <span>Ver todas en el Blog</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Opinion 1 */}
                    <div className="bg-[#0A071E]/90 border border-[#281F54] hover:border-emerald-400/50 rounded-2xl p-4 flex flex-col justify-between transition-all">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 font-bold text-xs flex items-center justify-center">
                              MT
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white leading-tight">Marisol T.</p>
                              <span className="text-[10px] text-emerald-300 font-medium">Principiante · Trabajo</span>
                            </div>
                          </div>
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed italic">
                          "Al fin perdí la vergüenza de atender en inglés: los bloques me salvaron en mi trabajo. Digo <strong className="text-emerald-300 not-italic">'Could I get your name?'</strong> sin titubear. ¡Los audios a 0.65x son un alivio!"
                        </p>
                      </div>
                      <div className="pt-2.5 mt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-rose-400">
                          <Heart className="w-3 h-3 fill-rose-500" />
                          <span>53 votos</span>
                        </span>
                        <span>Hace 4 días</span>
                      </div>
                    </div>

                    {/* Opinion 2 */}
                    <div className="bg-[#0A071E]/90 border border-[#281F54] hover:border-amber-400/50 rounded-2xl p-4 flex flex-col justify-between transition-all">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center justify-center">
                              MG
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white leading-tight">Marcos G. (45 años)</p>
                              <span className="text-[10px] text-amber-300 font-medium">Desde Cero</span>
                            </div>
                          </div>
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed italic">
                          "Empezando a los 45 años: al fin entiendo sin memorizar. Con la fonética en español y el audio pausado pude soltar frases en 2 días sin trabarme. ¡Cero listas de verbos!"
                        </p>
                      </div>
                      <div className="pt-2.5 mt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-rose-400">
                          <Heart className="w-3 h-3 fill-rose-500" />
                          <span>47 votos</span>
                        </span>
                        <span>Hace 2 semanas</span>
                      </div>
                    </div>

                    {/* Opinion 3 */}
                    <div className="bg-[#0A071E]/90 border border-[#281F54] hover:border-sky-400/50 rounded-2xl p-4 flex flex-col justify-between transition-all">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-sky-400/20 border border-sky-400/40 text-sky-300 font-bold text-xs flex items-center justify-center">
                              ER
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white leading-tight">Esteban R.</p>
                              <span className="text-[10px] text-sky-300 font-medium">Viajes</span>
                            </div>
                          </div>
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed italic">
                          "Mi primer viaje a EE.UU. sin entrar en pánico. Practiqué aquí y pedí mi café con <strong className="text-sky-300 not-italic">'Can I grab an iced latte to go?'</strong> y me entendieron a la primera."
                        </p>
                      </div>
                      <div className="pt-2.5 mt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-rose-400">
                          <Heart className="w-3 h-3 fill-rose-500" />
                          <span>61 votos</span>
                        </span>
                        <span>Hace 1 semana</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer with Blog CTA */}
                  <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>¿Tú también tienes una duda, anécdota o sugerencia para compartir?</span>
                    </span>
                    {onOpenBlog && (
                      <button
                        onClick={onOpenBlog}
                        className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>✍️ Dejar mi opinión en el Blog</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
