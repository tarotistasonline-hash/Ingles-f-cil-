import React, { useState } from 'react';
import {
  Download,
  Headphones,
  FileText,
  Sparkles,
  Check,
  ShieldCheck,
  Volume2,
  ExternalLink,
  Settings,
  HelpCircle,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Gift,
} from 'lucide-react';
import { playEnglishVoice } from '../services/audio';
import { triggerConfetti } from '../utils/confetti';

interface OfflineKitSectionProps {
  onNavigateHome?: () => void;
  onNavigateToGym?: () => void;
}

interface AudioSample {
  id: string;
  situation: string;
  phrase: string;
  phonetics: string;
  translation: string;
  contextNote: string;
}

const AUDIO_SAMPLES: AudioSample[] = [
  {
    id: 'coffee',
    situation: '☕ En la cafetería sin dudar',
    phrase: 'Can I get a large iced latte with oat milk, to go?',
    phonetics: 'ken-ai-guet a lardch aist lá-tei wid out milk, tu gou?',
    translation: '¿Me das un latte helado grande con leche de avena, para llevar?',
    contextNote: 'Cero vueltas formales: "Can I get" es como piden el 90% de los nativos.',
  },
  {
    id: 'bill',
    situation: '🍽️ En el restaurante al terminar',
    phrase: 'Could we get the check whenever you have a second?',
    phonetics: 'kud-wii guet de chek wen-éver iu jav a sékend?',
    translation: '¿Nos traés la cuenta cuando tengas un segundo?',
    contextNote: 'Súper amable, natural y sin sonar autoritario ni pedir perdón.',
  },
  {
    id: 'rescue',
    situation: '🛟 Frase salvavidas cuando no entendiste',
    phrase: 'Sorry, I did not catch that. Could you say it again slower?',
    phonetics: 'sóri, ai dídnt catch dat. kud iu séi it aguéin slóuer?',
    translation: 'Disculpá, no llegué a escuchar. ¿Me lo decís más despacio?',
    contextNote: 'Mucho más natural que decir "Repeat please" o quedarse congelado.',
  },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', price: '9', note: 'Dólares (Pago único)' },
  { code: 'ARS', symbol: '$', price: '10.500', note: 'Pesos Argentinos aprox.' },
  { code: 'MXN', symbol: '$', price: '180', note: 'Pesos Mexicanos aprox.' },
  { code: 'EUR', symbol: '€', price: '8,50', note: 'Euros' },
  { code: 'COP', symbol: '$', price: '38.000', note: 'Pesos Colombianos aprox.' },
];

export const OfflineKitSection: React.FC<OfflineKitSectionProps> = ({
  onNavigateHome,
  onNavigateToGym,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null);
  const [customCheckoutUrl, setCustomCheckoutUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('vibe_custom_checkout_url') || '';
    } catch {
      return '';
    }
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempCheckoutUrl, setTempCheckoutUrl] = useState(customCheckoutUrl);
  const [hasPurchasedMock, setHasPurchasedMock] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vibe_kit_purchased') === 'true';
    } catch {
      return false;
    }
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const activeCurrencyObj =
    CURRENCIES.find((c) => c.code === selectedCurrency) || CURRENCIES[0];

  const handlePlaySample = async (sample: AudioSample, speed: number = 0.8) => {
    setPlayingSampleId(sample.id);
    try {
      await playEnglishVoice(sample.phrase, 'Kore', speed);
    } catch (err) {
      console.warn('Playback error', err);
    } finally {
      setPlayingSampleId(null);
    }
  };

  const handleSaveCheckoutUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = tempCheckoutUrl.trim();
    setCustomCheckoutUrl(cleanUrl);
    try {
      if (cleanUrl) {
        localStorage.setItem('vibe_custom_checkout_url', cleanUrl);
      } else {
        localStorage.removeItem('vibe_custom_checkout_url');
      }
    } catch {
      // ignore
    }
    setShowConfigModal(false);
  };

  const handleBuyClick = () => {
    if (customCheckoutUrl) {
      // Open configured gateway link (Mercado Pago, Gumroad, Lemon Squeezy, Hotmart, Stripe)
      window.open(customCheckoutUrl, '_blank', 'noopener,noreferrer');
    } else {
      // If no custom gateway is set yet, show preview modal or open quick config
      setShowSuccessModal(true);
      triggerConfetti({ particleCount: 70, spread: 80 });
    }
  };

  const handleSimulatePurchase = () => {
    try {
      localStorage.setItem('vibe_kit_purchased', 'true');
    } catch {
      // ignore
    }
    setHasPurchasedMock(true);
    setShowSuccessModal(true);
    triggerConfetti({ particleCount: 90, spread: 90 });
  };

  const handleResetPurchase = () => {
    try {
      localStorage.removeItem('vibe_kit_purchased');
    } catch {
      // ignore
    }
    setHasPurchasedMock(false);
    setShowSuccessModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* 1. Header & Value Hero */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Edición Especial Offline · Para llevar en el celular</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight text-balance">
          El Audio-Kit de Bolsillo:{' '}
          <span className="text-amber-400">Inglés Real Offline</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed text-pretty">
          Todo el método y las frases cotidianas listas para escuchar{' '}
          <strong className="text-amber-300 font-semibold">
            sin conexión a internet
          </strong>
          , en el auto, caminando o cocinando. Incluye audios en MP3 en 2 velocidades,
          la guía visual para imprimir y 300 frases extra de rescate diario.
        </p>

        {/* Clear Guarantee Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400 pt-2">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium text-slate-200">Pago único, sin suscripciones</span>
          </div>
          <span aria-hidden="true" className="hidden sm:inline text-slate-600">·</span>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium text-slate-200">Descarga inmediata en MP3 y PDF</span>
          </div>
          <span aria-hidden="true" className="hidden sm:inline text-slate-600">·</span>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium text-slate-200">Para siempre en tu celular</span>
          </div>
        </div>
      </section>

      {/* 2. What is inside the Kit (The 3 Pillars) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: Audio Pack */}
        <div className="bg-[#130E2E]/90 border border-[#2B205D] rounded-2xl p-6 relative flex flex-col justify-between hover:border-amber-400/40 transition-colors">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Audio-Pack Completo (120+ MP3)
              </h3>
              <p className="text-xs text-amber-300/90 font-medium mt-0.5">
                Dos velocidades: 0.8x Pausado y 1.0x Real
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Archivos en alta fidelidad organizados por carpetas para pasar a tu
              WhatsApp, Spotify local o reproductor del celu. Diseñado para entrenar el oído
              mientras hacés otras cosas, sin tener la pantalla prendida.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-300 border-t border-[#231A4D]">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Sonido limpio y pronunciación nativa conversacional</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Pausas calculadas para que repitas en voz alta</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>No gasta datos móviles ni batería con videos</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pillar 2: Printable PDF Cheatsheet */}
        <div className="bg-[#130E2E]/90 border border-[#2B205D] rounded-2xl p-6 relative flex flex-col justify-between hover:border-emerald-400/40 transition-colors">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Guía de Bolsillo (PDF Imprimible)
              </h3>
              <p className="text-xs text-emerald-300/90 font-medium mt-0.5">
                Formato Cheatsheet · Celular y Heladera
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              12 páginas visuales ultralimpias que resumen los 50 conectores salvavidas,
              las respuestas automáticas y la fonética aproximada en español para no dudar al
              abrir la boca.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-300 border-t border-[#231A4D]">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Versión a color para el celu y blanco/negro económica</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Fonética figurada en español debajo de cada frase</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Ideal para consultar rápido antes de una llamada o viaje</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pillar 3: Bonus 300 Phrases */}
        <div className="bg-[#130E2E]/90 border border-[#2B205D] rounded-2xl p-6 relative flex flex-col justify-between hover:border-violet-400/40 transition-colors">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center text-violet-400">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Bonus: 300 Frases de Rescate
              </h3>
              <p className="text-xs text-violet-300/90 font-medium mt-0.5">
                Situaciones cotidianas adicionales
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Expresiones para situaciones muy concretas que no están en la app web:
              compras de supermercado, resolver un problema en un Airbnb, responderle al vecino
              y romper el hielo en el trabajo sin vergüenza.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-300 border-t border-[#231A4D]">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Respuestas cortas de 3 a 5 palabras de alto impacto</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Clasificadas por situación de urgencia</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Audio sincronizado incluido para cada una</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Interactive Audio Samples Preview */}
      <section className="bg-[#100C27] border border-[#2B205D] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Volume2 className="w-4 h-4" />
              <span>Escuchá una Muestra Real</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Probá cómo suenan los audios del Kit
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Audios claros, relajados y sin velocidad de ametralladora, para que tu cerebro asimile
            cada sonido sin traducirlo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {AUDIO_SAMPLES.map((sample) => (
            <div
              key={sample.id}
              className="bg-[#181339] border border-[#2C215A] rounded-xl p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1">
                  {sample.situation}
                </span>
                <p className="text-sm font-bold text-white leading-snug">
                  "{sample.phrase}"
                </p>
                <p className="text-xs text-amber-300/80 font-mono mt-1">
                  {sample.phonetics}
                </p>
                <p className="text-xs text-slate-400 italic mt-1">
                  {sample.translation}
                </p>
              </div>

              <div className="pt-3 border-t border-[#231A4D] flex items-center justify-between gap-2">
                <button
                  onClick={() => handlePlaySample(sample, 0.8)}
                  disabled={playingSampleId === sample.id}
                  className="px-3 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{playingSampleId === sample.id ? 'Reproduciendo...' : 'Escuchar (0.8x)'}</span>
                </button>
                <button
                  onClick={() => handlePlaySample(sample, 1.0)}
                  disabled={playingSampleId === sample.id}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  title="Escuchar a velocidad natural 1.0x"
                >
                  1.0x
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Pricing Box & Checkout Action */}
      <section className="bg-gradient-to-br from-[#16103A] to-[#0D0924] border-2 border-amber-400/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto text-center space-y-6 relative z-10">
          {/* Currency Selector */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl inline-flex mx-auto">
            {CURRENCIES.map((curr) => (
              <button
                key={curr.code}
                onClick={() => setSelectedCurrency(curr.code)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedCurrency === curr.code
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {curr.code}
              </button>
            ))}
          </div>

          {/* Big Price Highlight */}
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Inversión única · Acceso de por vida
            </span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl sm:text-6xl font-black text-white">
                {activeCurrencyObj.symbol}
                {activeCurrencyObj.price}
              </span>
              <span className="text-slate-400 text-sm font-semibold">
                {activeCurrencyObj.code}
              </span>
            </div>
            <p className="text-xs text-emerald-400 font-medium">
              ✓ {activeCurrencyObj.note} · Sin cuotas sorpresas ni renovaciones automáticas
            </p>
          </div>

          {/* Action Buy Button */}
          <div className="pt-2 flex flex-col items-center gap-3">
            <button
              onClick={handleBuyClick}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-extrabold text-base sm:text-lg shadow-xl shadow-amber-400/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>Obtener el Audio-Kit de Bolsillo</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Micro reassurance */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Compra 100% segura · Entrega automática por email al instante</span>
            </div>
          </div>

          {/* Creator Configuration Helper */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <button
              onClick={() => {
                setTempCheckoutUrl(customCheckoutUrl);
                setShowConfigModal(true);
              }}
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>
                {customCheckoutUrl
                  ? 'Pasarela conectada: ' + customCheckoutUrl.slice(0, 30) + '...'
                  : '⚙️ Configurar enlace de pago (Mercado Pago / Gumroad / Hotmart)'}
              </span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleSimulatePurchase}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Probar pantalla de descarga post-compra
            </button>
          </div>
        </div>
      </section>

      {/* 5. Frequently Asked Questions */}
      <section className="bg-[#100C27]/90 border border-[#2B205D] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Preguntas Frecuentes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Todo transparente y claro, como la filosofía de entrecasa.
          </p>
        </div>

        <div className="space-y-3 max-w-2xl mx-auto pt-2">
          {[
            {
              q: '¿Cómo recibo el material una vez realizado el pago?',
              a: 'De forma inmediata y 100% automática. En el momento en que se confirma el pago, recibís un correo electrónico con el enlace seguro de descarga directa del archivo ZIP con todos los MP3 ordenados y el PDF en alta resolución.',
            },
            {
              q: '¿Es una suscripción mensual o un solo pago?',
              a: 'Es un único pago. No hay cuotas mensuales ni cobros recurrentes de ninguna clase. Pagás una vez y el material es tuyo para siempre.',
            },
            {
              q: '¿Necesito instalar alguna aplicación rara?',
              a: 'No. Los audios vienen en formato MP3 estándar (reproducibles en cualquier reproductor de audio, iPhone, Android, computadora o auto) y la guía en PDF estándar (abrible en cualquier lector de documentos o imprimible).',
            },
            {
              q: '¿Puedo escucharlo sin internet?',
              a: '¡Sí, esa es la principal ventaja! Una vez descargados los archivos en tu celular o compu, podés escucharlos en el subte, en el avión, mientras manejás o salís a caminar sin gastar tus datos móviles.',
            },
            {
              q: '¿Sirve si estoy empezando desde cero?',
              a: 'Totalmente. Incluye la versión a 0.8x pausada de cada frase y la fonética transcripta en español para que no tengas que adivinar cómo se pronuncia cada palabra.',
            },
          ].map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="border border-[#261E52] rounded-xl overflow-hidden bg-[#16113A]/60"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full px-4 py-3.5 text-left text-sm font-semibold text-white flex items-center justify-between gap-3 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-slate-400 font-mono text-base">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-[#231A4D]/80">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Settings Modal for Creator Payment Gateway URL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#140F33] border border-[#3C2E75] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Settings className="w-5 h-5 text-amber-400" />
                <span>Configurar Pasarela de Pago</span>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Pegá el link del producto creado en tu plataforma favorita (
              <strong className="text-amber-300">Mercado Pago</strong>,{' '}
              <strong className="text-amber-300">Gumroad</strong>,{' '}
              <strong className="text-amber-300">Lemon Squeezy</strong>,{' '}
              <strong className="text-amber-300">Hotmart</strong> o{' '}
              <strong className="text-amber-300">Stripe Payment Link</strong>).
              Cuando tus visitantes hagan clic en "Obtener el Audio-Kit", serán redirigidos
              directamente allí para pagar.
            </p>

            <form onSubmit={handleSaveCheckoutUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL de Checkout / Enlace de Pago:
                </label>
                <input
                  type="url"
                  placeholder="https://mpago.la/... o https://gumroad.com/l/..."
                  value={tempCheckoutUrl}
                  onChange={(e) => setTempCheckoutUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTempCheckoutUrl('');
                  }}
                  className="text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  Restablecer por defecto
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 cursor-pointer"
                  >
                    Guardar Enlace
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Post-Purchase / Instant Download Demo Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#140F33] border-2 border-emerald-400/50 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                ¡Acceso Habilitado al Audio-Kit!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Tu compra fue procesada con éxito. Ya podés descargar los materiales a tu celular o computadora.
              </p>
            </div>

            <div className="bg-[#0B081E] border border-[#2B205D] rounded-xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#231A4D] text-xs font-semibold text-slate-300">
                <span>Archivos Listos para Descarga</span>
                <span className="text-emerald-400">Comprimido .ZIP (88 MB)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-amber-400" />
                  <span>120 Audios MP3 (Carpetas 0.8x Pausado y 1.0x Real)</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Guía Cheatsheet de Bolsillo en PDF Imprimible</span>
                </li>
                <li className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-violet-400" />
                  <span>Bonus 300 Expresiones Cotidianas de Rescate</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  alert(
                    '¡Simulación exitosa! En producción, este botón descarga directamente el paquete ZIP y el PDF de tu hosting o drive seguro.'
                  );
                }}
                className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-400/20"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Paquete Completo (.ZIP)</span>
              </button>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-2">
              <span>¿Querés probar de nuevo el flujo?</span>
              <button
                onClick={handleResetPurchase}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                Restablecer estado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
