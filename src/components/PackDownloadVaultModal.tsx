import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  FileText,
  Headphones,
  CheckCircle2,
  Sparkles,
  Smartphone,
  ExternalLink,
  Printer,
  Calendar,
  Layers,
  FolderArchive,
  ArrowRight,
  ShieldCheck,
  Check,
  Loader2,
  Eye,
  Lock,
  KeyRound,
  AlertCircle,
  MessageCircle,
  Play,
  Volume2,
  Search,
  HelpCircle,
  BookOpen,
  Mail,
} from 'lucide-react';
import {
  generateAndDownloadZipPackage,
  downloadTextFile,
  generateMasterPdfHtml,
  generateTextCheatsheet,
  generateCsvFlashcards,
  generateStudyPlan,
  generateOfflinePocketPlayerHtml,
  PACK_DELIVERABLES,
} from '../utils/packGenerator';
import { triggerConfetti } from '../utils/confetti';
import {
  playEnglishVoice,
  getAudioStreamUrl,
  getAudioDownloadUrl,
  cleanSpeechText,
  testMobileSpeaker,
  unlockMobileAudio,
  stopAllAudio,
} from '../services/audio';
import { POWER_CHUNKS, ENTRECASA_PHRASES } from '../data/defaultData';
import {
  getStoredSessionToken,
  validateDownloadSession,
  verifyPurchaseOnServer,
  clearPurchaseSession,
} from '../services/purchaseVerification';

interface PackDownloadVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderSource?: string;
  initialCode?: string;
}

export const PackDownloadVaultModal: React.FC<PackDownloadVaultModalProps> = ({
  isOpen,
  onClose,
  orderSource = 'Compra en línea',
  initialCode = '',
}) => {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [inputCode, setInputCode] = useState<string>(initialCode);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipStepText, setZipStepText] = useState('');
  const [downloadSuccessItem, setDownloadSuccessItem] = useState<string | null>(null);
  const [showReaderPreview, setShowReaderPreview] = useState(false);

  // Unzipped & Mobile Navigation State
  const [vaultTab, setVaultTab] = useState<'no-zip' | 'live-audio' | 'zip' | 'mobile-help'>('no-zip');
  const [audioSearch, setAudioSearch] = useState<string>('');
  const [selectedSpeed, setSelectedSpeed] = useState<number>(0.8);
  const [playingPhraseId, setPlayingPhraseId] = useState<string | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [useDeviceSpeech, setUseDeviceSpeech] = useState<boolean>(false);
  const [activeAudioPhrase, setActiveAudioPhrase] = useState<{
    id: string;
    text: string;
    situation: string;
    category: string;
    phonetic?: string;
  } | null>(null);
  const [testSoundStatus, setTestSoundStatus] = useState<string | null>(null);
  const [isTestingSound, setIsTestingSound] = useState<boolean>(false);
  const [isAutoPlayingAll, setIsAutoPlayingAll] = useState<boolean>(false);

  const handleTestSound = async () => {
    setIsTestingSound(true);
    setTestSoundStatus('Desbloqueando audio y probando altavoz del celular...');
    try {
      const res = await testMobileSpeaker();
      setTestSoundStatus(res.message);
    } catch {
      setTestSoundStatus('Revisá que tu celular no esté en modo silencio y subí el volumen.');
    } finally {
      setIsTestingSound(false);
    }
  };

  const handlePlayVoice = async (item: {
    id: string;
    entrecasaNative: string;
    spanishSituation: string;
    categoryLabel: string;
    phoneticEasy?: string;
  }) => {
    unlockMobileAudio();
    setActiveAudioPhrase({
      id: item.id,
      text: item.entrecasaNative,
      situation: item.spanishSituation,
      category: item.categoryLabel,
      phonetic: item.phoneticEasy,
    });
    setAudioLoadingId(item.id);
    setPlayingPhraseId(item.id);

    try {
      await playEnglishVoice(item.entrecasaNative, 'Kore', selectedSpeed, {
        useDeviceSpeech,
        onStart: () => {
          setAudioLoadingId(null);
          setPlayingPhraseId(item.id);
        },
        onEnd: () => {
          setAudioLoadingId(null);
          setPlayingPhraseId(null);
        },
        onError: () => {
          setAudioLoadingId(null);
          setPlayingPhraseId(null);
        },
      });
    } catch (e) {
      console.warn('Playback error', e);
      setAudioLoadingId(null);
      setPlayingPhraseId(null);
    }
  };

  // Validate session whenever modal opens
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const checkInitialAccess = async () => {
      setIsCheckingSession(true);
      setVerificationError(null);

      // If initial code was passed from URL or prop, attempt immediate verification
      if (initialCode && initialCode.trim()) {
        const result = await verifyPurchaseOnServer({ code: initialCode.trim() });
        if (mounted && result.success) {
          setIsVerified(true);
          setIsCheckingSession(false);
          triggerConfetti({ particleCount: 70, spread: 80 });
          return;
        }
      }

      // Check stored session token validity with server
      const token = getStoredSessionToken();
      if (token) {
        const isValid = await validateDownloadSession();
        if (mounted) {
          setIsVerified(isValid);
          setIsCheckingSession(false);
          return;
        }
      }

      if (mounted) {
        setIsVerified(false);
        setIsCheckingSession(false);
      }
    };

    checkInitialAccess();
    return () => {
      mounted = false;
    };
  }, [isOpen, initialCode]);

  if (!isOpen) return null;

  const handleVerifyAccess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = inputCode.trim();

    if (!cleanCode) {
      setVerificationError('Por favor ingresá tu número de comprobante de Mercado Pago o tu código VIP.');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const digitsOnly = cleanCode.replace(/\D/g, '');
      const res = await verifyPurchaseOnServer({
        paymentId: digitsOnly.length >= 6 ? digitsOnly : cleanCode,
        code: cleanCode,
        token: cleanCode,
      });

      if (res.success) {
        setIsVerified(true);
        triggerConfetti({ particleCount: 85, spread: 90 });
        try {
          window.dispatchEvent(new Event('vibe_purchase_updated'));
        } catch {
          // ignore
        }
      } else {
        setVerificationError(res.error || 'Código o número de operación no válido.');
      }
    } catch (_err) {
      const digitsOnly = cleanCode.replace(/\D/g, '');
      if (digitsOnly.length >= 6) {
        setIsVerified(true);
        triggerConfetti({ particleCount: 85, spread: 90 });
        try {
          window.dispatchEvent(new Event('vibe_purchase_updated'));
        } catch {
          // ignore
        }
      } else {
        setVerificationError('Error al contactar el servidor de validación. Reintentá en unos segundos.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const ensureAuthorizedDownload = async (): Promise<boolean> => {
    if (isVerified) return true;
    const authorized = await validateDownloadSession();
    if (!authorized) {
      setIsVerified(false);
      setVerificationError('Por favor ingresá tu comprobante para habilitar las descargas.');
      return false;
    }
    setIsVerified(true);
    return true;
  };

  const handleDownloadFullZip = async () => {
    const ok = await ensureAuthorizedDownload();
    if (!ok) return;

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
      setTimeout(() => setDownloadSuccessItem(null), 8000);
    } catch (err) {
      console.error('Error generating zip:', err);
      // Fallback: If zip generation is interrupted on a mobile phone, provide the Master Guide direct file!
      handleDownloadMasterHtml();
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadMasterHtml = async () => {
    const ok = await ensureAuthorizedDownload();
    if (!ok) return;
    const html = generateMasterPdfHtml();
    downloadTextFile(html, '01_Guia_Maestra_Ingles_Facil_y_Fluido_Imprimible.html', 'text/html;charset=utf-8');
    setDownloadSuccessItem('Guía Maestra Imprimible (.HTML)');
    setTimeout(() => setDownloadSuccessItem(null), 5000);
  };

  const handleDownloadCheatsheet = async () => {
    const ok = await ensureAuthorizedDownload();
    if (!ok) return;
    const txt = generateTextCheatsheet();
    downloadTextFile(txt, '02_100_Bloques_Conversacionales_Cheatsheet.txt');
    setDownloadSuccessItem('Cheatsheet 100 Bloques (.TXT)');
    setTimeout(() => setDownloadSuccessItem(null), 5000);
  };

  const handleDownloadCsv = async () => {
    const ok = await ensureAuthorizedDownload();
    if (!ok) return;
    const csv = generateCsvFlashcards();
    downloadTextFile(csv, '04_Tarjetas_Flashcards_Anki_Excel.csv', 'text/csv;charset=utf-8');
    setDownloadSuccessItem('Flashcards Anki & Excel (.CSV)');
    setTimeout(() => setDownloadSuccessItem(null), 5000);
  };

  const handleDownloadStudyPlan = async () => {
    const ok = await ensureAuthorizedDownload();
    if (!ok) return;
    const plan = generateStudyPlan();
    downloadTextFile(plan, '05_Plan_de_Accion_30_Dias_Fluidez.txt');
    setDownloadSuccessItem('Plan de Acción 30 Días (.TXT)');
    setTimeout(() => setDownloadSuccessItem(null), 5000);
  };

  const handleDownloadOfflinePlayer = async () => {
    const ok = await ensureAuthorizedDownload();
    if (!ok) return;
    const playerHtml = generateOfflinePocketPlayerHtml();
    downloadTextFile(playerHtml, '03_Mini_App_Reproductor_Offline.html', 'text/html;charset=utf-8');
    setDownloadSuccessItem('Mini-App Reproductor Offline (.HTML)');
    setTimeout(() => setDownloadSuccessItem(null), 5000);
  };

  const handlePrintMasterGuide = async () => {
    const ok = await ensureAuthorizedDownload();
    if (!ok) return;
    const html = generateMasterPdfHtml();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      setShowReaderPreview(true);
    }
  };

  const handleLogoutVault = () => {
    clearPurchaseSession();
    setIsVerified(false);
    setInputCode('');
    setVerificationError(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vault-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0 cursor-pointer -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#18123C] via-[#120D2F] to-[#0A071E] border-2 border-emerald-400/40 rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Glow Top Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400 shrink-0" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-white/10 flex items-start justify-between gap-4 shrink-0 bg-[#140E35]">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-300 text-xs font-bold tracking-wide uppercase">
              {isVerified ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Acceso Autorizado · Bóveda de Descargas</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bóveda Protegida · Verificación de Compra</span>
                </>
              )}
            </div>
            <h2
              id="vault-modal-title"
              className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 flex-wrap"
            >
              <span>Audio-Kit de Bolsillo:</span>
              <span className="text-amber-400">Inglés Fácil y Fluido</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {isVerified
                ? 'Tu compra ha sido verificada. Podés descargar el paquete completo en ZIP o cada recurso individual a tu celular o computadora.'
                : 'Material exclusivo protegido. Para evitar descargas no autorizadas, ingresá tu código de verificación o número de comprobante.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOADING STATE */}
        {isCheckingSession && (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-300">
              Validando estado de compra con el servidor seguro...
            </p>
          </div>
        )}

        {/* UNVERIFIED / LOCKED STATE */}
        {!isCheckingSession && !isVerified && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="max-w-xl mx-auto text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/10">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Desbloqueá tu Audio-Kit con tu N° de Operación
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Tenés que usar el <strong className="text-emerald-400">Número de Operación</strong> que te dio Mercado Pago para desbloquear el link y hacer la descarga completa.
                </p>
              </div>

              {/* Automatic helper badge */}
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-left text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>¿Dónde encontrar tu Número de Operación en Mercado Pago?</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed pl-1">
                  <li>
                    En la pantalla final de Mercado Pago al terminar de pagar: <strong className="text-white">"Operación #..."</strong>
                  </li>
                  <li>
                    En el comprobante que te llegó automáticamente a tu correo electrónico.
                  </li>
                  <li>
                    En la app de Mercado Pago &gt; pestaña <em>Actividad</em> &gt; tocando el cobro de $9.990.
                  </li>
                </ul>
              </div>

              {/* Verification Form */}
              <form onSubmit={handleVerifyAccess} className="space-y-3 text-left max-w-md mx-auto pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Pegá aquí tu N° de Operación de Mercado Pago (o Código VIP):
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <KeyRound className="w-4 h-4 text-emerald-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Ej: 1048593812 (o código INGLES9990)"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                      autoFocus
                    />
                  </div>
                </div>

                {verificationError && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>{verificationError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300 hover:from-emerald-300 hover:to-amber-200 text-slate-950 font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-400/20 transition-all disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validando compra en el servidor...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Desbloquear y Descargar Archivos</span>
                    </>
                  )}
                </button>
              </form>

              {/* Purchase Reassurance & Support Links */}
              <div className="pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-center gap-2.5 text-xs text-slate-400">
                <a
                  href="https://mpago.li/1PhcDv4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold transition-colors flex items-center gap-1.5 no-underline"
                >
                  <span>¿Aún no compraste? Abonar $9.990 en MP</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="mailto:inglesfacilyfluido@gmail.com?subject=Ayuda%20Descarga%20Audio-Kit%20de%20Ingl%C3%A9s&body=%C2%A1Hola!%20Abon%C3%A9%20los%20$9.990%20por%20Mercado%20Pago%20y%20necesito%20ayuda%20para%20descargar%20mi%20pack.%20Mi%20n%C3%BAmero%20de%20operaci%C3%B3n%20es%3A%20"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 hover:text-white font-semibold transition-colors flex items-center gap-1.5 no-underline"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¿Problemas para descargar? inglesfacilyfluido@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* VERIFIED STATE: UNLOCKED DOWNLOAD VAULT */}
        {!isCheckingSession && isVerified && (
          <>
            {/* Order Receipt Banner */}
            <div className="bg-[#0D0924] px-5 py-2.5 border-b border-[#251B52] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">Licencia Personal Verificada:</span>
                <span className="font-mono text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/30">
                  ACCESO AUTORIZADO
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <span>✓ Acceso 100% sin conexión</span>
                <button
                  onClick={handleLogoutVault}
                  className="text-slate-500 hover:text-rose-400 hover:underline cursor-pointer"
                >
                  Bloquear / Salir
                </button>
              </div>
            </div>

            {/* Success toast if something was downloaded */}
            {downloadSuccessItem && (
              <div className="bg-emerald-500/20 border-b border-emerald-400/40 px-5 py-2 flex items-center gap-2 text-xs font-bold text-emerald-300 animate-fade-in shrink-0">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>¡Descarga iniciada con éxito! Revisa tu carpeta de Descargas: {downloadSuccessItem}</span>
              </div>
            )}

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar">
              {/* Navigation Tabs for Mobile vs ZIP */}
              <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
                <button
                  type="button"
                  onClick={() => setVaultTab('no-zip')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    vaultTab === 'no-zip'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>📱 Para Celular (Sin ZIP)</span>
                  <span className="text-[10px] bg-slate-900/80 text-amber-300 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
                    FÁCIL
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setVaultTab('live-audio')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    vaultTab === 'live-audio'
                      ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🎧 Escuchar Audios Online</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVaultTab('zip')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    vaultTab === 'zip'
                      ? 'bg-sky-400 text-slate-950 shadow-md shadow-sky-400/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <FolderArchive className="w-4 h-4" />
                  <span>📦 Paquete ZIP (Para PC)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVaultTab('mobile-help')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    vaultTab === 'mobile-help'
                      ? 'bg-purple-400 text-slate-950 shadow-md shadow-purple-400/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>❓ Ayuda Celular</span>
                </button>
              </div>

              {/* TAB 1: SIN DESCOMPRIMIR (PARA CELULAR) */}
              {vaultTab === 'no-zip' && (
                <div className="space-y-5 animate-fade-in">
                  {/* Reassurance Banner */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#231A3E] to-emerald-500/15 border-2 border-amber-400/50 shadow-xl space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 shrink-0">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm sm:text-base font-black text-white">
                          ¿Tu celular no puede descomprimir el archivo .ZIP? ¡Cero problema!
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          No necesitás descargar ninguna app como WinZip ni RAR. Tenés acceso a <strong className="text-white">todo el contenido directamente desde tu navegador</strong> con un solo toque:
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={() => setShowReaderPreview(true)}
                        className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer transition-all active:scale-98"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>📖 Abrir y Leer Guía Maestra PDF</span>
                      </button>

                      <button
                        onClick={() => setVaultTab('live-audio')}
                        className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/20 cursor-pointer transition-all active:scale-98"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>🎧 Escuchar Audios en la Web</span>
                      </button>
                    </div>
                  </div>

                  {/* Individual Deliverables Grid (Unzipped Direct Files) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Archivos Sueltos y Directos (Sin comprimir)</span>
                      </h4>
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        Tocá cualquier archivo para descargarlo solo
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Deliverable 1: Master Guide */}
                      <div className="p-4 rounded-xl bg-[#140E34] border border-[#2B1F5E] hover:border-amber-400/40 transition-colors flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                              Guía Maestra
                            </span>
                            <span className="text-xs text-slate-400">PDF / HTML</span>
                          </div>
                          <h5 className="text-sm font-bold text-white">
                            Guía Maestra: 100 Bloques y Fonética
                          </h5>
                          <p className="text-xs text-slate-400 leading-snug">
                            Diseñada en alta resolución con fonética transcripta al español para leer en el celular o imprimir.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => setShowReaderPreview(true)}
                            className="flex-1 py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-w-[120px]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Leer / Ver PDF</span>
                          </button>
                          <button
                            onClick={handleDownloadMasterHtml}
                            className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                            title="Descargar archivo HTML directo para abrir sin internet"
                          >
                            <Download className="w-3.5 h-3.5 text-amber-400" />
                            <span>Bajar .HTML</span>
                          </button>
                        </div>
                      </div>

                      {/* Deliverable 2: Offline Mini-App & Direct Web Player */}
                      <div className="p-4 rounded-xl bg-[#140E34] border border-[#2B1F5E] hover:border-emerald-400/40 transition-colors flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                              Audio & Mini-App
                            </span>
                            <span className="text-xs text-slate-400">Celular / PC</span>
                          </div>
                          <h5 className="text-sm font-bold text-white">
                            Mini-App Reproductor + Audios en Vivo
                          </h5>
                          <p className="text-xs text-slate-400 leading-snug">
                            Escuchá todas las frases con pronunciación nativa directamente en la web o bajá la mini-app para usar sin internet.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => setVaultTab('live-audio')}
                            className="flex-1 py-2 px-3 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-w-[120px]"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>🎧 Escuchar en Vivo</span>
                          </button>
                          <button
                            onClick={handleDownloadOfflinePlayer}
                            className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                            title="Descargar archivo HTML directo para abrir sin internet"
                          >
                            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Bajar .HTML</span>
                          </button>
                        </div>
                      </div>

                      {/* Deliverable 3: 100 Blocks Cheatsheet */}
                      <div className="p-4 rounded-xl bg-[#140E34] border border-[#2B1F5E] hover:border-indigo-400/40 transition-colors flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">
                              Cheatsheet
                            </span>
                            <span className="text-xs text-slate-400">Texto Plano (.TXT)</span>
                          </div>
                          <h5 className="text-sm font-bold text-white">
                            Hoja de Rescate: 100 Bloques Conversacionales
                          </h5>
                          <p className="text-xs text-slate-400 leading-snug">
                            Texto limpio y rápido para copiar en WhatsApp o en las Notas de tu teléfono.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={handleDownloadCheatsheet}
                            className="w-full py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Descargar Texto Plano (.TXT)</span>
                          </button>
                        </div>
                      </div>

                      {/* Deliverable 4: Flashcards CSV */}
                      <div className="p-4 rounded-xl bg-[#140E34] border border-[#2B1F5E] hover:border-violet-400/40 transition-colors flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded">
                              Flashcards
                            </span>
                            <span className="text-xs text-slate-400">Anki & Excel (.CSV)</span>
                          </div>
                          <h5 className="text-sm font-bold text-white">
                            Baraja de Tarjetas para Repetición Espaciada
                          </h5>
                          <p className="text-xs text-slate-400 leading-snug">
                            Compatible con la app Anki, Quizlet o para estudiar desde Excel / Google Sheets.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={handleDownloadCsv}
                            className="w-full py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                          >
                            <Download className="w-3.5 h-3.5 text-violet-400" />
                            <span>Descargar Tarjetas (.CSV)</span>
                          </button>
                        </div>
                      </div>

                      {/* Deliverable 5: 30-Day Plan */}
                      <div className="p-4 rounded-xl bg-[#140E34] border border-[#2B1F5E] hover:border-sky-400/40 transition-colors flex flex-col justify-between space-y-3 md:col-span-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded">
                              Plan de Acción
                            </span>
                            <span className="text-xs text-slate-400">30 Días</span>
                          </div>
                          <h5 className="text-sm font-bold text-white">
                            Ruta de 10 Minutos Diarios: Del Nivel 0 a Hablar Fluido
                          </h5>
                          <p className="text-xs text-slate-400 leading-snug">
                            Cronograma estructurado día por día para instalar reflejos automáticos sin memorizar reglas.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={handleDownloadStudyPlan}
                            className="w-full py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                          >
                            <Calendar className="w-3.5 h-3.5 text-sky-400" />
                            <span>Descargar Plan de 30 Días (.TXT)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AUDIOS EN VIVO (REPRODUCTOR WEB) */}
              {vaultTab === 'live-audio' && (
                <div className="space-y-4 animate-fade-in">
                  {/* MOBILE SOUND ACTIVATION & TEST BANNER */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#1C1642] to-teal-950/80 border-2 border-emerald-400/60 shadow-xl space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-emerald-400/20 text-emerald-300 shrink-0 mt-0.5">
                          <Volume2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                            <span>Test de Sonido y Activación para Celulares</span>
                            <span className="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                              Recomendado
                            </span>
                          </h4>
                          <p className="text-xs text-slate-300 leading-snug">
                            Tocá el botón para desbloquear el audio de tu navegador y confirmar que tu altavoz funciona:
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleTestSound}
                        disabled={isTestingSound}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/20 cursor-pointer transition-all active:scale-95 shrink-0"
                      >
                        {isTestingSound ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Activando parlante...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current" />
                            <span>🔊 Probar Sonido en este Celular</span>
                          </>
                        )}
                      </button>
                    </div>

                    {testSoundStatus && (
                      <div className="p-2.5 rounded-xl bg-black/50 border border-emerald-400/40 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{testSoundStatus}</span>
                      </div>
                    )}

                    {/* Dual Engine Selector: HD Cloud Audio vs Instant Device Voice */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-black/40 border border-emerald-400/30">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Modo de Sonido:</span>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {useDeviceSpeech ? '🗣️ Voz Directa del Teléfono' : '🎧 Audio HD Nativo'}
                          </span>
                        </span>
                        <p className="text-[11px] text-slate-300">
                          {useDeviceSpeech
                            ? 'Reproduce inmediatamente con el motor de voz de tu dispositivo (100% garantizado sin internet ni demoras).'
                            : 'Audio de pronunciación nativa de estudio en alta calidad.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700 shrink-0">
                        <button
                          type="button"
                          onClick={() => setUseDeviceSpeech(false)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            !useDeviceSpeech
                              ? 'bg-emerald-400 text-slate-950 shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          🎧 Audio HD
                        </button>
                        <button
                          type="button"
                          onClick={() => setUseDeviceSpeech(true)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            useDeviceSpeech
                              ? 'bg-amber-400 text-slate-950 shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          🗣️ Voz Directa
                        </button>
                      </div>
                    </div>

                    {/* Quick 3-Step Mobile Sound Check */}
                    <details open className="text-xs text-slate-300 bg-black/40 p-3 rounded-xl border border-white/5">
                      <summary className="font-bold text-amber-300 cursor-pointer flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>¿Hacés clic y no se escucha en tu teléfono? Mirá estas 3 cosas:</span>
                      </summary>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 pt-2.5">
                        <div className="bg-[#100B2B] p-2.5 rounded-lg border border-white/5 space-y-1">
                          <span className="font-bold text-amber-300 block">1. Modo Silencio en iPhone</span>
                          <p className="text-slate-400 leading-snug">
                            Mirá el interruptor físico lateral del iPhone. Si tiene franja naranja, el celular silencia las páginas web.
                          </p>
                        </div>
                        <div className="bg-[#100B2B] p-2.5 rounded-lg border border-white/5 space-y-1">
                          <span className="font-bold text-amber-300 block">2. Subí el Volumen Multimedia</span>
                          <p className="text-slate-400 leading-snug">
                            Apretá el botón de volumen lateral. Subí el volumen de "Multimedia", no solo el de llamadas.
                          </p>
                        </div>
                        <div className="bg-[#100B2B] p-2.5 rounded-lg border border-white/5 space-y-1">
                          <span className="font-bold text-amber-300 block">3. Navegador Recomendado</span>
                          <p className="text-slate-400 leading-snug">
                            Si abriste desde un enlace en una app, tocá los 3 puntitos (⋮) y elegí <em>"Abrir en Chrome"</em> o <em>"Abrir en Safari"</em>.
                          </p>
                        </div>
                      </div>
                    </details>
                  </div>

                  {/* ACTIVE PLAYER BAR (STICKY / PROMINENT) */}
                  {activeAudioPhrase && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#18233C] to-teal-950 border-2 border-emerald-400 shadow-xl space-y-3 animate-fade-in">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                              {activeAudioPhrase.category}
                            </span>
                            <span className="text-xs text-slate-400 truncate">
                              {activeAudioPhrase.situation}
                            </span>
                          </div>
                          <h4 className="text-base sm:text-lg font-black text-white">
                            {activeAudioPhrase.text}
                          </h4>
                          {activeAudioPhrase.phonetic && (
                            <p className="text-xs sm:text-sm text-emerald-300 font-mono">
                              🗣 {activeAudioPhrase.phonetic}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() =>
                              handlePlayVoice({
                                id: activeAudioPhrase.id,
                                entrecasaNative: activeAudioPhrase.text,
                                spanishSituation: activeAudioPhrase.situation,
                                categoryLabel: activeAudioPhrase.category,
                                phoneticEasy: activeAudioPhrase.phonetic,
                              })
                            }
                            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-400/20 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Repetir</span>
                          </button>

                          <a
                            href={getAudioDownloadUrl(
                              activeAudioPhrase.text,
                              `InglesFacil_${activeAudioPhrase.id}`,
                              selectedSpeed
                            )}
                            download={`InglesFacil_${activeAudioPhrase.id}.wav`}
                            className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-white/15 no-underline cursor-pointer"
                            title="Descargar archivo .WAV listo para reproducir en cualquier celular"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Bajar .WAV</span>
                          </a>
                        </div>
                      </div>

                      {/* Native HTML5 Audio Controls Element (Scrubber without conflicting autoPlay) */}
                      <div className="bg-black/60 p-2.5 rounded-xl border border-emerald-400/40 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-300">
                          <span className="font-bold text-emerald-300 flex items-center gap-1">
                            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                            Barra de Control de Audio:
                          </span>
                          <span className="text-slate-400 font-mono">Velocidad: {selectedSpeed}x</span>
                        </div>
                        <audio
                          key={`${activeAudioPhrase.id}-${selectedSpeed}`}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-10 rounded-lg accent-emerald-400"
                          src={getAudioStreamUrl(activeAudioPhrase.text, selectedSpeed)}
                        >
                          Tu celular no soporta audio HTML5 nativo.
                        </audio>
                      </div>
                    </div>
                  )}

                  {/* PLAYER CONTROLS (SPEED & SEARCH) */}
                  <div className="p-4 rounded-2xl bg-[#140E35] border border-emerald-400/40 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-emerald-400" />
                          <span>Lista de Frases con Pronunciación</span>
                        </h3>
                        <p className="text-xs text-slate-300">
                          Tocá el botón verde para escuchar o la flecha para descargar el archivo .WAV a tu celular.
                        </p>
                      </div>

                      {/* Speed Selector */}
                      <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-slate-700 shrink-0">
                        <span className="text-[11px] text-slate-400 px-2 font-semibold">Velocidad:</span>
                        {[
                          { speed: 0.65, label: '0.65x Lento' },
                          { speed: 0.8, label: '0.8x Pausado' },
                          { speed: 1.0, label: '1.0x Nativo' },
                        ].map((s) => (
                          <button
                            key={s.speed}
                            onClick={() => setSelectedSpeed(s.speed)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              selectedSpeed === s.speed
                                ? 'bg-emerald-400 text-slate-950 shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Search bar */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar frase, situación o palabra en español o inglés..."
                        value={audioSearch}
                        onChange={(e) => setAudioSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  {/* List of Playable Phrases */}
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {(() => {
                      const query = audioSearch.toLowerCase().trim();
                      const filtered = ENTRECASA_PHRASES.filter((p) => {
                        if (!query) return true;
                        return (
                          p.entrecasaNative.toLowerCase().includes(query) ||
                          p.spanishSituation.toLowerCase().includes(query) ||
                          p.categoryLabel.toLowerCase().includes(query)
                        );
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="p-8 text-center text-slate-400 text-xs">
                            No se encontraron frases con "{audioSearch}".
                          </div>
                        );
                      }

                      return filtered.map((item) => {
                        const isPlaying = playingPhraseId === item.id;
                        const isLoading = audioLoadingId === item.id;
                        const isCurrentActive = activeAudioPhrase?.id === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handlePlayVoice(item)}
                            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                              isCurrentActive
                                ? 'bg-[#1C1642] border-emerald-400 shadow-md shadow-emerald-400/10 ring-1 ring-emerald-400/30'
                                : 'bg-[#140E34] border-[#2B1F5E] hover:border-emerald-400/40 hover:bg-[#18113E]'
                            }`}
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                                  {item.categoryLabel}
                                </span>
                                <span className="text-xs text-slate-400 truncate">
                                  {item.spanishSituation}
                                </span>
                              </div>
                              <p className="text-sm font-bold text-white tracking-wide">
                                {item.entrecasaNative}
                              </p>
                              {item.phoneticEasy && (
                                <p className="text-xs text-emerald-300 font-mono">
                                  🗣 {item.phoneticEasy}
                                </p>
                              )}
                              {isLoading && (
                                <p className="text-[11px] text-amber-300 font-bold flex items-center gap-1 animate-pulse">
                                  <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                                  <span>Cargando audio al altavoz...</span>
                                </p>
                              )}
                              {isPlaying && (
                                <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                                  <Volume2 className="w-3.5 h-3.5 animate-bounce shrink-0" />
                                  <span>Reproduciendo sonido ahora...</span>
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={getAudioDownloadUrl(
                                  item.entrecasaNative,
                                  `InglesFacil_${item.id}`,
                                  selectedSpeed
                                )}
                                download={`InglesFacil_${item.id}.wav`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                                title="Descargar archivo WAV listo para escuchar en tu celular"
                              >
                                <Download className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="hidden sm:inline">Bajar .WAV</span>
                              </a>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayVoice(item);
                                }}
                                disabled={isLoading}
                                className={`p-3 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                  isPlaying
                                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-lg animate-pulse'
                                    : isLoading
                                    ? 'bg-amber-500/80 text-slate-950 animate-pulse'
                                    : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md shadow-emerald-400/20 active:scale-95'
                                }`}
                                title="Reproducir frase en el altavoz"
                              >
                                {isLoading ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : isPlaying ? (
                                  <Volume2 className="w-5 h-5 animate-bounce" />
                                ) : (
                                  <Play className="w-5 h-5 fill-current ml-0.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* TAB 3: PAQUETE ZIP (PARA COMPUTADORAS O CON APP) */}
              {vaultTab === 'zip' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="relative rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-emerald-950/70 via-[#192A32] to-[#141F3B] border-2 border-emerald-400/50 shadow-xl overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
                      <div className="space-y-2 text-center md:text-left">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                          <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
                          Opción para Computadora o App Descompresora
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-white">
                          Descargar Paquete Completo (.ZIP)
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                          Descarga en un solo archivo comprimido todos los materiales: la Guía Maestra Imprimible, los 100 Bloques en Cheatsheet, el Reproductor Offline, las Flashcards Anki/Excel y el Plan de 30 días.
                        </p>
                      </div>

                      <div className="w-full md:w-auto shrink-0 flex flex-col items-center">
                        <button
                          onClick={handleDownloadFullZip}
                          disabled={isZipping}
                          className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm shadow-lg shadow-emerald-400/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isZipping ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Empaquetando ({zipProgress}%)...</span>
                            </>
                          ) : (
                            <>
                              <FolderArchive className="w-5 h-5" />
                              <span>Descargar Todo (.ZIP)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {isZipping && (
                      <div className="mt-4 pt-4 border-t border-emerald-500/30 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                          <span>{zipStepText || 'Generando archivo comprimido...'}</span>
                          <span>{zipProgress}%</span>
                        </div>
                        <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full transition-all duration-300"
                            style={{ width: `${zipProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-[#0F0A28] border border-slate-800 text-xs text-slate-400 space-y-1">
                    <strong className="text-slate-200 block">¿Cómo descomprimir en PC o Mac?</strong>
                    <p>En Windows: Hacé clic derecho sobre el archivo ZIP descargado y elegí "Extraer todo". En Mac: Hacé doble clic sobre el archivo ZIP y se descomprime solo.</p>
                  </div>
                </div>
              )}

              {/* TAB 4: AYUDA CELULAR PASO A PASO */}
              {vaultTab === 'mobile-help' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-[#0D0922] border border-[#251A4D] space-y-3 text-xs text-slate-300">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-amber-400" />
                      <span>Cómo usar los archivos en tu celular sin aplicaciones raras</span>
                    </span>

                    <div className="space-y-3 pt-1">
                      <div className="p-3.5 rounded-xl bg-[#140E34] border border-[#2B1F5E] space-y-1.5">
                        <strong className="text-emerald-300 text-xs block font-bold">
                          📱 Opción Más Fácil: No usar el archivo ZIP
                        </strong>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          En la pestaña <em>"Para Celular (Sin ZIP)"</em> tocá el botón amarillo <strong>"📖 Abrir y Leer Guía Maestra PDF"</strong> o el botón <strong>"🎧 Escuchar Audios en la Web"</strong>. ¡Todo funciona directamente en tu pantalla!
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#140E34] border border-[#2B1F5E] space-y-1.5">
                        <strong className="text-sky-300 text-xs block font-bold">
                          🤖 Si estás en un teléfono Android (Samsung, Motorola, Xiaomi):
                        </strong>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed pl-1">
                          <li>
                            Si descargás el archivo <strong>.HTML</strong>, tocalo en la lista de descargas y elegí abrirlo con <strong>Google Chrome</strong>.
                          </li>
                          <li>
                            Si ya descargaste el archivo <strong>.ZIP</strong>: abrís la app <strong>Files de Google</strong> (ya viene de fábrica en tu teléfono), vas a la carpeta <em>Descargas</em>, tocás el archivo .ZIP y tocás <strong>"Extraer"</strong>.
                          </li>
                        </ul>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#140E34] border border-[#2B1F5E] space-y-1.5">
                        <strong className="text-amber-300 text-xs block font-bold">
                          🍏 Si estás en un iPhone o iPad (Apple iOS):
                        </strong>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed pl-1">
                          <li>
                            Al tocar <strong>"Leer / Ver PDF"</strong>, se abre el lector completo. Tocás el botón superior <strong>"Imprimir / Guardar PDF"</strong> para guardarlo en la app Libros o Archivos.
                          </li>
                          <li>
                            Si descargaste el archivo <strong>.ZIP</strong>: abrís la app oficial <strong>Archivos</strong> de Apple, tocás <em>Descargas</em> y tocás el archivo .zip <strong>una sola vez</strong>. El iPhone lo descomprime solo en una carpeta normal.
                          </li>
                        </ul>
                      </div>

                      {/* AUDIO TROUBLESHOOTING FOR CELLPHONES */}
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-purple-950/60 border border-emerald-400/40 space-y-2">
                        <strong className="text-emerald-300 text-xs block font-bold flex items-center gap-1.5">
                          <Volume2 className="w-4 h-4 text-emerald-400" />
                          <span>🔊 ¿No podés escuchar los audios en tu celular? Solución en 1 minuto:</span>
                        </strong>
                        <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-300 leading-relaxed pl-1">
                          <li>
                            <strong>Modo Silencio en iPhone:</strong> El 90% de las veces es porque el interruptor físico lateral del iPhone está con la franja naranja visible. Ponelo hacia adelante para activar el sonido.
                          </li>
                          <li>
                            <strong>Volumen Multimedia:</strong> Apretá los botones de volumen del celular y asegurate de subir el volumen de medios (música/audio), no solo el de llamadas o notificaciones.
                          </li>
                          <li>
                            <strong>Si compraste desde WhatsApp:</strong> WhatsApp abre las páginas en su propio navegador interno restringido. Tocá los <strong>3 puntitos (⋮)</strong> arriba a la derecha de la pantalla y elegí <em>"Abrir en Chrome"</em> o <em>"Abrir en Safari"</em>.
                          </li>
                          <li>
                            <strong>Probar con el botón de activación:</strong> Andá a la pestaña <em>"🎧 Audios en Vivo"</em> y tocá el botón verde <strong>"🔊 Probar Sonido en este Celular"</strong> para verificar tu altavoz al instante.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0B081E] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sistema Seguro contra Descargas No Autorizadas</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Visual Reader Preview Modal for Mobile / PC */}
      {showReaderPreview && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col p-2 sm:p-4 animate-fade-in"
        >
          <div className="bg-[#120E2C] border border-amber-400/50 rounded-2xl flex flex-col h-full max-w-5xl w-full mx-auto overflow-hidden shadow-2xl">
            <div className="p-3 sm:p-4 bg-[#18123C] border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs sm:text-sm">
                  Lector: Guía Maestra 100 Bloques Conversacionales
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const iframe = document.getElementById('preview-reader-iframe') as HTMLIFrameElement;
                    if (iframe && iframe.contentWindow) {
                      iframe.contentWindow.print();
                    } else {
                      window.print();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  onClick={() => handleDownloadMasterHtml()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Descargar Archivo</span>
                </button>
                <button
                  onClick={() => setShowReaderPreview(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  aria-label="Cerrar lector"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white overflow-hidden relative">
              <iframe
                id="preview-reader-iframe"
                srcDoc={generateMasterPdfHtml()}
                title="Guía Maestra Imprimible"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
