import React, { useState, useEffect } from 'react';
import {
  X,
  Headphones,
  Sparkles,
  Download,
  Volume2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Check,
  ExternalLink,
} from 'lucide-react';
import { playEnglishVoice } from '../services/audio';
import { triggerConfetti } from '../utils/confetti';
import {
  generateAndDownloadZipPackage,
  downloadTextFile,
  generateMasterPdfHtml,
  generateOfflinePocketPlayerHtml,
} from '../utils/packGenerator';
import { Loader2 } from 'lucide-react';

interface AudioKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToFullKit: () => void;
  onOpenVault?: () => void;
}

const OFFICIAL_MERCADO_PAGO_URL = 'https://mpago.li/1PhcDv4';

const POPUP_SAMPLES = [
  {
    id: 'coffee',
    situation: '☕ En la cafetería',
    phrase: 'Can I get a large iced latte with oat milk, to go?',
    phonetics: 'ken-ai-guet a lardch aist lá-tei wid out milk, tu gou?',
    translation: '¿Me das un latte helado grande con leche de avena, para llevar?',
  },
  {
    id: 'bill',
    situation: '🍽️ Al pedir la cuenta',
    phrase: 'Could we get the check whenever you have a second?',
    phonetics: 'kud-wii guet de chek wen-éver iu jav a sékend?',
    translation: '¿Nos traés la cuenta cuando tengas un segundo?',
  },
  {
    id: 'rescue',
    situation: '🛟 Frase de rescate',
    phrase: 'Sorry, I did not catch that. Could you say it again slower?',
    phonetics: 'sóri, ai dídnt catch dat. kud iu séi it aguéin slóuer?',
    translation: 'Disculpá, no llegué a escuchar. ¿Me lo decís más despacio?',
  },
];

const CURRENCIES = [
  { code: 'ARS', symbol: '$', price: '9.900', note: 'Pesos Argentinos (Oferta Lanzamiento)' },
  { code: 'USD', symbol: '$', price: '9', note: 'Dólares (Pago único)' },
  { code: 'MXN', symbol: '$', price: '180', note: 'Pesos Mexicanos aprox.' },
  { code: 'EUR', symbol: '€', price: '8,50', note: 'Euros' },
  { code: 'COP', symbol: '$', price: '38.000', note: 'Pesos Colombianos aprox.' },
];

export const AudioKitModal: React.FC<AudioKitModalProps> = ({
  isOpen,
  onClose,
  onGoToFullKit,
  onOpenVault,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState('ARS');
  const [activeSampleIndex, setActiveSampleIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showDirectDownloadSuccess, setShowDirectDownloadSuccess] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const activeCurrencyObj =
    CURRENCIES.find((c) => c.code === selectedCurrency) || CURRENCIES[0];

  const currentSample = POPUP_SAMPLES[activeSampleIndex];

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePlaySample = async (speed: number = 0.8) => {
    setIsPlayingAudio(true);
    try {
      await playEnglishVoice(currentSample.phrase, 'Kore', speed);
    } catch (err) {
      console.warn('Playback error', err);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await generateAndDownloadZipPackage((percent) => setZipProgress(percent));
      triggerConfetti({ particleCount: 75, spread: 80 });
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadPdf = () => {
    const html = generateMasterPdfHtml();
    downloadTextFile(html, '01_Guia_Maestra_Ingles_Facil_y_Fluido_Imprimible.html', 'text/html;charset=utf-8');
  };

  const handleActionClick = () => {
    const customUrl = localStorage.getItem('vibe_custom_checkout_url');
    if (customUrl) {
      window.open(customUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    try {
      localStorage.setItem('vibe_kit_purchased', 'true');
    } catch {
      // ignore
    }
    // Simulate purchase & celebration
    setShowDirectDownloadSuccess(true);
    triggerConfetti({ particleCount: 80, spread: 85 });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audio-kit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0 cursor-pointer -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#17123A] via-[#110D2C] to-[#0A071E] border border-amber-400/40 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden my-auto">
        {/* Glow Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-300" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-7 space-y-6">
          {/* Header Badge & Title */}
          <div className="space-y-2 pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wide uppercase">
              <Headphones className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Pack Offline · Para llevar en el celular</span>
            </div>

            <h2
              id="audio-kit-modal-title"
              className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug"
            >
              El Audio-Kit de Bolsillo:{' '}
              <span className="text-amber-400">Inglés Fácil y Fluido Offline</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Todo el método y las frases cotidianas listas para escuchar{' '}
              <strong className="text-amber-300 font-semibold">
                sin conexión a internet
              </strong>
              , en el auto, caminando, en el gimnasio o cocinando.
            </p>
          </div>

          {/* Currency Selector Pills */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 pb-1 border-y border-white/10">
            <span className="text-[11px] text-slate-400 font-medium">
              Moneda sugerida:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => setSelectedCurrency(curr.code)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    selectedCurrency === curr.code
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {curr.code} ({curr.symbol}
                  {curr.price})
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Live Audio Sample Preview */}
          <div className="bg-[#0C0822] rounded-2xl border border-[#2B215E] p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Escuchá una muestra real
                </span>
              </div>
              <div className="flex gap-1">
                {POPUP_SAMPLES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSampleIndex(idx)}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                      activeSampleIndex === idx
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white bg-white/5'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-amber-300">
                {currentSample.situation}
              </span>
              <p className="text-base sm:text-lg font-bold text-white font-mono leading-snug">
                "{currentSample.phrase}"
              </p>
              <p className="text-xs text-amber-300/90 font-mono">
                🗣️ Fonética fácil: {currentSample.phonetics}
              </p>
              <p className="text-xs text-slate-400 italic">
                "{currentSample.translation}"
              </p>
            </div>

            {/* Play Audio Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => handlePlaySample(0.7)}
                disabled={isPlayingAudio}
                className="px-3 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Escuchar a 0.7x (Pausado)</span>
              </button>
              <button
                onClick={() => handlePlaySample(1.0)}
                disabled={isPlayingAudio}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Escuchar a 1.0x (Nativo)</span>
              </button>
            </div>
          </div>

          {/* What's Inside 4 Bullet Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">120 Audios MP3 Descargables</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  En 2 velocidades para tu celular o reproductor favorito.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-400/20 text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">Guía PDF Imprimible</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Fórmulas visuales para pegar en la heladera o repasar en papel.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-400/20 text-indigo-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">300 Frases de Rescate</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Soluciones para viajar, compras, comida y hablar sin trabarte.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-400/20 text-rose-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">100% Sin Conexión</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Cero consumo de datos móviles, ideal para viajes o la ruta.
                </p>
              </div>
            </div>
          </div>

          {/* Direct Download Active Card */}
          {showDirectDownloadSuccess && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#0E262A] to-[#141F3B] border border-emerald-400/50 text-emerald-200 space-y-3 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm sm:text-base font-extrabold text-white">
                    ¡Acceso al Pack Habilitado!
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  Listo para Descargar
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Descargá el paquete completo con los 120 audios, la Guía Maestra en PDF, los 100 bloques y las flashcards para tu celular.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-400/20 disabled:opacity-50 transition-all"
                >
                  {isZipping ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Empaquetando ({zipProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Descargar Pack (.ZIP)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadPdf}
                  className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guía PDF</span>
                </button>

                {onOpenVault && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenVault();
                    }}
                    className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>Ver Todo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Pricing & Call to Actions */}
          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="flex items-baseline justify-center sm:justify-start gap-1.5">
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Pago Único:
                </span>
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-amber-400">
                  {activeCurrencyObj.symbol}
                  {activeCurrencyObj.price}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {activeCurrencyObj.code}
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 font-semibold">
                ✓ Acceso de por vida · Sin suscripciones mensuales
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => {
                  onClose();
                  onGoToFullKit();
                }}
                className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center"
              >
                Ver Detalles
              </button>

              <a
                href={localStorage.getItem('vibe_custom_checkout_url') || OFFICIAL_MERCADO_PAGO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer no-underline text-center"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Pagar con Mercado Pago ($9.900)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
