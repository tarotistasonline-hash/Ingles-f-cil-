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
  MessageCircle,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { playEnglishVoice } from '../services/audio';
import { triggerConfetti } from '../utils/confetti';
import {
  generateAndDownloadZipPackage,
  downloadTextFile,
  generateMasterPdfHtml,
  generateTextCheatsheet,
  generateCsvFlashcards,
  generateStudyPlan,
  generateOfflinePocketPlayerHtml,
} from '../utils/packGenerator';
import { Loader2, Printer } from 'lucide-react';

interface OfflineKitSectionProps {
  onNavigateHome?: () => void;
  onNavigateToGym?: () => void;
  onOpenVault?: () => void;
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

export const OFFICIAL_MERCADO_PAGO_URL = 'https://mpago.li/1PhcDv4';

const CURRENCIES = [
  { code: 'USD', symbol: '$', price: '9', note: 'Dólares (Pago único)' },
  { code: 'ARS', symbol: '$', price: '9.990', note: 'Pesos Argentinos (Oferta Especial de Lanzamiento)' },
  { code: 'MXN', symbol: '$', price: '180', note: 'Pesos Mexicanos aprox.' },
  { code: 'EUR', symbol: '€', price: '8,50', note: 'Euros' },
  { code: 'COP', symbol: '$', price: '38.000', note: 'Pesos Colombianos aprox.' },
];

export const OfflineKitSection: React.FC<OfflineKitSectionProps> = ({
  onNavigateHome,
  onNavigateToGym,
  onOpenVault,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState('ARS');
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null);
  const [customCheckoutUrl, setCustomCheckoutUrl] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('vibe_custom_checkout_url');
      return stored && stored.trim() ? stored : OFFICIAL_MERCADO_PAGO_URL;
    } catch {
      return OFFICIAL_MERCADO_PAGO_URL;
    }
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempCheckoutUrl, setTempCheckoutUrl] = useState(customCheckoutUrl);
  const [copiedDeliveryMsg, setCopiedDeliveryMsg] = useState(false);
  const [copiedRedirectUrl, setCopiedRedirectUrl] = useState(false);

  const getDeliveryUrl = () => {
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      return `${window.location.origin}/?pago=exitoso#descarga`;
    }
    return 'https://ais-pre-tjt2vclyi7urss34qpdmmo-172786148761.us-east1.run.app/?pago=exitoso#descarga';
  };

  const getWhatsAppDeliveryMessage = () => {
    const url = getDeliveryUrl();
    return `¡Hola! Muchas gracias por tu compra del Audio-Kit de Inglés Fácil y Fluido ($9.990 ARS). 🚀\n\nAcá tenés tu enlace exclusivo y directo para descargar todo el material a tu celular o compu:\n👉 ${url}\n\nAl ingresar vas a tener acceso inmediato para descargar el paquete ZIP completo (audios MP3 pausados y velocidad real), la Guía Maestra PDF, la App Offline y el plan de estudio de 30 días. ¡Que lo disfrutes mucho!`;
  };

  const handleCopyDeliveryMsg = async () => {
    try {
      await navigator.clipboard.writeText(getWhatsAppDeliveryMessage());
      setCopiedDeliveryMsg(true);
      setTimeout(() => setCopiedDeliveryMsg(false), 3000);
    } catch {
      // fallback
    }
  };

  const handleCopyRedirectUrl = async () => {
    try {
      await navigator.clipboard.writeText(getDeliveryUrl());
      setCopiedRedirectUrl(true);
      setTimeout(() => setCopiedRedirectUrl(false), 3000);
    } catch {
      // fallback
    }
  };

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

  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipStepText, setZipStepText] = useState('');
  const [downloadSuccessItem, setDownloadSuccessItem] = useState<string | null>(null);

  const handleDownloadFullZip = async () => {
    setIsZipping(true);
    setZipProgress(10);
    setZipStepText('Iniciando empaquetado...');
    try {
      await generateAndDownloadZipPackage((percent, text) => {
        setZipProgress(percent);
        setZipStepText(text);
      });
      triggerConfetti({ particleCount: 75, spread: 80 });
      setDownloadSuccessItem('Pack Completo (.ZIP)');
      setTimeout(() => setDownloadSuccessItem(null), 6000);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadMasterHtml = () => {
    const html = generateMasterPdfHtml();
    downloadTextFile(html, '01_Guia_Maestra_Ingles_Facil_y_Fluido_Imprimible.html', 'text/html;charset=utf-8');
    setDownloadSuccessItem('Guía Maestra Imprimible (.HTML)');
    setTimeout(() => setDownloadSuccessItem(null), 5000);
  };

  const handleDownloadCheatsheet = () => {
    const txt = generateTextCheatsheet();
    downloadTextFile(txt, '02_100_Bloques_Conversacionales_Cheatsheet.txt');
    setDownloadSuccessItem('Cheatsheet 100 Bloques (.TXT)');
    setTimeout(() => setDownloadSuccessItem(null), 5000);
  };

  const handleDownloadCsv = () => {
    const csv = generateCsvFlashcards();
    downloadTextFile(csv, '04_Tarjetas_Flashcards_Anki_Excel.csv', 'text/csv;charset=utf-8');
    setDownloadSuccessItem('Flashcards Anki & Excel (.CSV)');
    setTimeout(() => setDownloadSuccessItem(null), 5000);
  };

  const handleDownloadStudyPlan = () => {
    const plan = generateStudyPlan();
    downloadTextFile(plan, '05_Plan_de_Accion_30_Dias_Fluidez.txt');
    setDownloadSuccessItem('Plan de Acción 30 Días (.TXT)');
    setTimeout(() => setDownloadSuccessItem(null), 5000);
  };

  const handleDownloadOfflinePlayer = () => {
    const playerHtml = generateOfflinePocketPlayerHtml();
    downloadTextFile(playerHtml, '06_Reproductor_Audio_Offline_De_Bolsillo.html', 'text/html;charset=utf-8');
    setDownloadSuccessItem('Reproductor Offline de Bolsillo (.HTML)');
    setTimeout(() => setDownloadSuccessItem(null), 5000);
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
          <span className="text-amber-400">Inglés Fácil y Fluido Offline</span>
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
            <span className="font-medium text-slate-200">Descarga inmediata en ZIP, MP3 y PDF</span>
          </div>
          <span aria-hidden="true" className="hidden sm:inline text-slate-600">·</span>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium text-slate-200">Para siempre en tu celular</span>
          </div>
        </div>

        {/* Action Button to Test / Download Pack */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              handleSimulatePurchase();
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{hasPurchasedMock ? '📦 Acceder a Descargas de tu Pack' : '📦 Probar Descarga del Pack de Entrega'}</span>
          </button>
        </div>
      </section>

      {/* Persistent Buyer Vault if Purchased */}
      {hasPurchasedMock && (
        <section className="bg-gradient-to-r from-emerald-950/80 via-[#10242E] to-[#121B3B] border-2 border-emerald-400/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pack Habilitado · Descargas Oficiales</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Archivos del Pack Listos para Descarga
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Tu compra te da acceso permanente a todos los archivos. Podés descargarlos cuantas veces quieras a tus dispositivos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadFullZip}
                disabled={isZipping}
                className="px-5 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-400/25 disabled:opacity-50"
              >
                {isZipping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Empaquetando ({zipProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Descargar Todo en ZIP</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Individual Deliverables Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <button
              onClick={handleDownloadMasterHtml}
              className="p-3.5 rounded-xl bg-[#0B1524] border border-[#234257] hover:border-amber-400 text-left space-y-1.5 cursor-pointer transition-all hover:scale-101"
            >
              <div className="flex items-center justify-between">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] text-amber-300 font-bold">PDF / HTML</span>
              </div>
              <p className="text-xs font-bold text-white leading-tight">Guía Maestra 100 Bloques</p>
              <span className="text-[11px] text-slate-400 block">Con fonética y ejemplos</span>
            </button>

            <button
              onClick={handleDownloadOfflinePlayer}
              className="p-3.5 rounded-xl bg-[#0B1524] border border-[#234257] hover:border-emerald-400 text-left space-y-1.5 cursor-pointer transition-all hover:scale-101"
            >
              <div className="flex items-center justify-between">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] text-emerald-300 font-bold">App Offline</span>
              </div>
              <p className="text-xs font-bold text-white leading-tight">Reproductor de Bolsillo</p>
              <span className="text-[11px] text-slate-400 block">100% sin internet</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="p-3.5 rounded-xl bg-[#0B1524] border border-[#234257] hover:border-blue-400 text-left space-y-1.5 cursor-pointer transition-all hover:scale-101"
            >
              <div className="flex items-center justify-between">
                <Download className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] text-blue-300 font-bold">Anki / Excel</span>
              </div>
              <p className="text-xs font-bold text-white leading-tight">Tarjetas Flashcards</p>
              <span className="text-[11px] text-slate-400 block">CSV formateado UTF-8</span>
            </button>

            <button
              onClick={handleDownloadCheatsheet}
              className="p-3.5 rounded-xl bg-[#0B1524] border border-[#234257] hover:border-violet-400 text-left space-y-1.5 cursor-pointer transition-all hover:scale-101"
            >
              <div className="flex items-center justify-between">
                <FileText className="w-4 h-4 text-violet-400" />
                <span className="text-[10px] text-violet-300 font-bold">Texto Plano</span>
              </div>
              <p className="text-xs font-bold text-white leading-tight">Cheatsheet 100 Bloques</p>
              <span className="text-[11px] text-slate-400 block">Para notas del celular</span>
            </button>

            <button
              onClick={handleDownloadStudyPlan}
              className="p-3.5 rounded-xl bg-[#0B1524] border border-[#234257] hover:border-rose-400 text-left space-y-1.5 cursor-pointer transition-all hover:scale-101"
            >
              <div className="flex items-center justify-between">
                <Download className="w-4 h-4 text-rose-400" />
                <span className="text-[10px] text-rose-300 font-bold">30 Días</span>
              </div>
              <p className="text-xs font-bold text-white leading-tight">Plan de Acción Diario</p>
              <span className="text-[11px] text-slate-400 block">10 min/día guiados</span>
            </button>
          </div>
        </section>
      )}

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
            <a
              href={customCheckoutUrl || OFFICIAL_MERCADO_PAGO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-extrabold text-base sm:text-lg shadow-xl shadow-amber-400/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer text-center no-underline"
            >
              <span>Obtener el Audio-Kit con Mercado Pago ($9.990)</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            {/* WhatsApp direct help & reassurance */}
            <div className="space-y-2 text-center pt-1">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="https://wa.me/?text=%C2%A1Hola!%20Tengo%20una%20consulta%20sobre%20el%20Audio-Kit%20de%20Ingl%C3%A9s%20F%C3%A1cil%20y%20Fluido%20($9.990)"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs font-semibold transition-colors no-underline cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¿Dudas antes de pagar? Consultanos por WhatsApp</span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Compra 100% protegida por Mercado Pago · Entrega inmediata</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-mono flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link oficial conectado: mpago.li/1PhcDv4</span>
              </div>
            </div>

            {/* Mini-guía visual: Cómo abrir el pack en tu celular */}
            <div className="mt-4 p-4 rounded-2xl bg-[#0E0A22] border border-[#2B205D] text-left space-y-2.5 max-w-xl mx-auto w-full">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>📱 ¿Cómo se abre el pack en tu celular? (En 2 toques simples)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <strong className="text-white block font-semibold">🍏 En iPhone / iPad:</strong>
                  <span>Tocás el archivo descargado y Safari lo abre directo en tu app <em>Archivos</em> listo para reproducir.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <strong className="text-white block font-semibold">🤖 En Android:</strong>
                  <span>Se guarda en tu carpeta <em>Descargas</em> y se abre con la app <em>Files de Google</em> o tu reproductor habitual.</span>
                </div>
              </div>
              <p className="text-[10px] text-emerald-400/90 font-medium text-center pt-1 border-t border-[#231A4D]">
                ✓ Además podés usar directamente la Mini-App Offline en tu navegador sin descomprimir nada.
              </p>
            </div>

            {/* Buyer Download Access Bar */}
            <div className="w-full max-w-xl mx-auto p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <span>¿Ya compraste y necesitás tu pack?</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black">DESCARGA INMEDIATA</span>
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Abrí tu bóveda para bajar el ZIP completo, la Guía Maestra PDF y audios MP3.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (onOpenVault) {
                    onOpenVault();
                  } else {
                    setShowSuccessModal(true);
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-black shrink-0 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Descargar mi Pack</span>
                <ArrowRight className="w-4 h-4" />
              </button>
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

      {/* 6. Settings Modal for Creator Payment Gateway URL & Buyer Delivery Tools */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#140F33] border border-[#3C2E75] rounded-2xl max-w-xl w-full p-5 sm:p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B205D]">
              <div className="flex items-center gap-2 text-white font-bold text-base sm:text-lg">
                <Settings className="w-5 h-5 text-amber-400" />
                <span>Gestión de Ventas y Entrega de Packs</span>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer text-sm font-bold p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* SECCIÓN URGENTE: Cliente que ya pagó */}
            <div className="bg-gradient-to-br from-amber-950/40 via-[#1F1735] to-emerald-950/30 border-2 border-amber-400/50 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="text-xl">🚨</span>
                <div>
                  <h3 className="text-sm font-black text-white">
                    ¿A una persona que compró no le llegó el pack?
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    <strong className="text-amber-300">¿Por qué sucede?</strong> Mercado Pago únicamente cobra el dinero; no aloja ni envía archivos por sí solo salvo que le indiques a dónde redirigir al comprador al finalizar la compra.
                  </p>
                </div>
              </div>

              {/* Solución 1: Inmediata para el cliente actual */}
              <div className="bg-[#0B081E] border border-[#2F2360] rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Paso 1: Enviale este mensaje ahora mismo por WhatsApp o Email</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed select-all">
                  {getWhatsAppDeliveryMessage()}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyDeliveryMsg}
                    className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    {copiedDeliveryMsg ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-slate-950" />
                        <span>¡Mensaje Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Mensaje para WhatsApp</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyRedirectUrl}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  >
                    {copiedRedirectUrl ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>¡Enlace Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar sólo Link de Descarga</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Solución 2: Automática para futuros compradores */}
              <div className="bg-[#0B081E] border border-[#2F2360] rounded-xl p-3.5 space-y-2.5 text-xs text-slate-300">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Paso 2: Automatizar la entrega en Mercado Pago para futuras compras</span>
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed text-slate-300 pl-0.5">
                  <li>
                    Entrá a tu app o web de Mercado Pago y andá a <strong className="text-white">"Links de pago"</strong>.
                  </li>
                  <li>
                    Editá tu link <code className="text-amber-300 bg-black/50 px-1 py-0.5 rounded">mpago.li/1PhcDv4</code> ($9.990 ARS).
                  </li>
                  <li>
                    Buscá la sección <strong className="text-white">"Opciones avanzadas"</strong> y activá <strong className="text-white">"Redireccionar al finalizar la compra"</strong>.
                  </li>
                  <li>
                    Pegá exactamente esta URL de redirección:
                    <div className="mt-1 flex items-center gap-2 p-1.5 rounded bg-black/60 border border-slate-800 text-[10px] font-mono text-emerald-400 overflow-x-auto">
                      <span className="truncate">{getDeliveryUrl()}</span>
                      <button
                        type="button"
                        onClick={handleCopyRedirectUrl}
                        className="text-xs px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded shrink-0 cursor-pointer"
                      >
                        {copiedRedirectUrl ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </li>
                  <li>
                    Guardás el link en Mercado Pago. ¡Listo! A partir de ese momento, cada comprador será enviado directamente a la pantalla de descarga inmediata.
                  </li>
                </ol>
              </div>
            </div>

            {/* Quick Explanation: Pesos vs Dólares */}
            <div className="bg-[#0B081E] border border-[#2B205D] rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <span>💡 ¿Cómo funciona Mercado Pago para cobrar $9 USD o Pesos?</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Mercado Pago Argentina procesa las transacciones en <strong className="text-white">Pesos Argentinos (ARS)</strong>. Para cobrar los <strong className="text-amber-300">$9 USD</strong>, en Mercado Pago creás el link por el equivalente en pesos (fijado en <strong className="text-emerald-400">$9.990 ARS</strong>).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300">
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <strong className="text-white block mb-0.5">🇦🇷 Si pagan en Pesos:</strong>
                  Pagan con débito, crédito o dinero en cuenta de Mercado Pago ($9.990 ARS).
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <strong className="text-white block mb-0.5">🌎 Si pagan desde el exterior en USD:</strong>
                  Pagan con tarjeta internacional (Visa/Mastercard); su banco hace la conversión de divisas automáticamente.
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveCheckoutUrl} className="space-y-4 pt-1 border-t border-[#2B205D]">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tu Enlace de Mercado Pago (o pasarela internacional):
                </label>
                <input
                  type="url"
                  placeholder="https://mpago.la/abc1234"
                  value={tempCheckoutUrl}
                  onChange={(e) => setTempCheckoutUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {tempCheckoutUrl && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Enlace listo para guardar
                  </span>
                  <a
                    href={tempCheckoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-300 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Probar enlace en nueva pestaña</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setTempCheckoutUrl('');
                  }}
                  className="text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  Restablecer
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
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 cursor-pointer shadow-md"
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

            {/* Download Progress or Status */}
            {isZipping && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 space-y-1.5 text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-300">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>{zipStepText || 'Comprimiendo paquete...'}</span>
                </div>
                <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${zipProgress}%` }}
                  />
                </div>
              </div>
            )}

            {downloadSuccessItem && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>¡Descargado con éxito: {downloadSuccessItem}!</span>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleDownloadFullZip}
                disabled={isZipping}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-400/25 disabled:opacity-50 transition-all"
              >
                {isZipping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generando ZIP ({zipProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Descargar Paquete Completo (.ZIP)</span>
                  </>
                )}
              </button>

              {/* Individual Deliverable Fast Downloads */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-left">
                <button
                  onClick={handleDownloadMasterHtml}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-400/50 text-[11px] font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Guía Maestra PDF</span>
                </button>

                <button
                  onClick={handleDownloadOfflinePlayer}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-400/50 text-[11px] font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">App Offline (.html)</span>
                </button>

                <button
                  onClick={handleDownloadCsv}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-blue-400/50 text-[11px] font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">Flashcards CSV</span>
                </button>

                <button
                  onClick={handleDownloadCheatsheet}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-violet-400/50 text-[11px] font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span className="truncate">Cheatsheet TXT</span>
                </button>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors mt-2"
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
