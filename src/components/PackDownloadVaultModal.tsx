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

                {(() => {
                  const savedPhone = (() => {
                    try {
                      return localStorage.getItem('vibe_whatsapp_number') || '';
                    } catch {
                      return '';
                    }
                  })();
                  const clean = savedPhone.replace(/[^0-9]/g, '');
                  const helpMsg = encodeURIComponent(
                    '¡Hola! Pagué los $9.990 del Audio-Kit de Inglés por Mercado Pago y necesito validar mi comprobante de compra.'
                  );
                  const waHref = clean
                    ? `https://wa.me/${clean}?text=${helpMsg}`
                    : `https://wa.me/?text=${helpMsg}`;

                  return (
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 no-underline"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>¿Dudas? Escribir por WhatsApp</span>
                    </a>
                  );
                })()}

                <a
                  href="mailto:tarotistasonline@gmail.com?subject=Comprobante%20de%20Pago%20Audio-Kit%20de%20Ingl%C3%A9s&body=%C2%A1Hola!%20Abon%C3%A9%20los%20$9.990%20por%20Mercado%20Pago.%20Mi%20n%C3%BAmero%20de%20operaci%C3%B3n%20es%3A%20"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 no-underline"
                >
                  <span>📧 tarotistasonline@gmail.com</span>
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
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {/* Main Action Banner: 1-Click ZIP Download */}
              <div className="relative rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-emerald-950/70 via-[#192A32] to-[#141F3B] border-2 border-emerald-400/50 shadow-xl overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
                  <div className="space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Opción Más Rápida y Recomendada
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      Descargar Paquete Completo (.ZIP)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                      Incluye la <strong className="text-white">Guía Maestra Imprimible</strong>, los <strong className="text-white">100 Bloques en Cheatsheet</strong>, el <strong className="text-white">Reproductor de Bolsillo Offline</strong>, las <strong className="text-white">Flashcards Anki/Excel</strong> y el <strong className="text-white">Plan de 30 días</strong> en una sola carpeta lista para descomprimir.
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
                    <span className="text-[10px] text-slate-400 mt-1.5">
                      Compatible con iPhone, Android y PC (Sin internet)
                    </span>
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

              {/* Individual Deliverables Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Descarga Individual de Entregables (Archivos Directos)</span>
                  </h4>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    Tocá cualquier archivo para descargarlo solo
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Deliverable 1: Master Guide PDF */}
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
                        Diseñada en alta resolución para leer en el celular o imprimir directo.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={handleDownloadMasterHtml}
                        className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700 min-w-[105px]"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Bajar Archivo</span>
                      </button>
                      <button
                        onClick={() => setShowReaderPreview(true)}
                        className="py-2 px-3 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 text-xs font-bold text-amber-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-amber-400/30"
                        title="Abrir lector visual para leer o guardar como PDF"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Leer / Ver PDF</span>
                      </button>
                      <button
                        onClick={handlePrintMasterGuide}
                        className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-700"
                        title="Imprimir"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Imprimir</span>
                      </button>
                    </div>
                  </div>

                  {/* Deliverable 2: Offline Pocket App */}
                  <div className="p-4 rounded-xl bg-[#140E34] border border-[#2B1F5E] hover:border-emerald-400/40 transition-colors flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                          App Offline
                        </span>
                        <span className="text-xs text-slate-400">HTML Autónomo</span>
                      </div>
                      <h5 className="text-sm font-bold text-white">
                        Mini-App Reproductor de Bolsillo
                      </h5>
                      <p className="text-xs text-slate-400 leading-snug">
                        Se abre en el navegador de tu celular sin internet, con buscador y audio.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={handleDownloadOfflinePlayer}
                        className="w-full py-2 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-xs font-bold text-emerald-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Descargar Mini-App (.HTML)</span>
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
                        Texto limpio y rápido para guardar en WhatsApp o en notas de tu teléfono.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={handleDownloadCheatsheet}
                        className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Bajar Cheatsheet (.TXT)</span>
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
                        Importable con 1 clic en Anki, Quizlet o para estudiar desde Excel.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={handleDownloadCsv}
                        className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                      >
                        <Download className="w-3.5 h-3.5 text-violet-400" />
                        <span>Bajar Flashcards (.CSV)</span>
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
                        className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                      >
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        <span>Bajar Plan de 30 Días (.TXT)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions on how to extract and open */}
              <div className="p-4 rounded-2xl bg-[#0D0922] border border-[#251A4D] space-y-2 text-xs text-slate-300">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>¿Cómo abrir los archivos en tu teléfono?</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <strong className="text-white block font-semibold mb-0.5">🍏 En iPhone / iPad:</strong>
                    Descargás el archivo, abrís la app <em>Archivos</em> y tocás el archivo para reproducir o leer de inmediato.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <strong className="text-white block font-semibold mb-0.5">🤖 En Android:</strong>
                    Se guarda en la carpeta <em>Descargas</em> y lo abrís con la app <em>Files de Google</em> o tu lector preferido.
                  </div>
                </div>
              </div>
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
