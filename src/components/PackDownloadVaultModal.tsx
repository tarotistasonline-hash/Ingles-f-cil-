import React, { useState } from 'react';
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

interface PackDownloadVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderSource?: string;
}

export const PackDownloadVaultModal: React.FC<PackDownloadVaultModalProps> = ({
  isOpen,
  onClose,
  orderSource = 'Compra en línea',
}) => {
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipStepText, setZipStepText] = useState('');
  const [downloadSuccessItem, setDownloadSuccessItem] = useState<string | null>(null);
  const [showReaderPreview, setShowReaderPreview] = useState(false);

  if (!isOpen) return null;

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

  const handleOpenPrintableWindow = () => {
    const html = generateMasterPdfHtml();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      setShowReaderPreview(true);
    }
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
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Entrega Inmediata · Materiales del Pack</span>
            </div>
            <h2
              id="vault-modal-title"
              className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 flex-wrap"
            >
              <span>Descargá tu Pack:</span>
              <span className="text-amber-400">Inglés Fácil y Fluido</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Aquí tenés todos los entregables listos. Podés bajar el paquete completo en un solo archivo ZIP o descargar cada recurso individualmente a tu celular o computadora.
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

        {/* Order Receipt Banner */}
        <div className="bg-[#0D0924] px-5 py-2.5 border-b border-[#251B52] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">Licencia Personal Vitalicia:</span>
            <span className="font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              ENG-EASY-9842-VIP
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>✓ Acceso 100% sin conexión</span>
            <span>✓ Sin cuotas mensuales</span>
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

                {isZipping && (
                  <div className="w-full mt-2 space-y-1">
                    <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${zipProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-emerald-300 text-center font-medium">
                      {zipStepText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Individual Downloads */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>O Descarga Archivo por Archivo</span>
              </h3>
              <span className="text-xs text-slate-400">
                Seleccioná el formato que prefieras
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* 1. Guía Maestra PDF / Imprimible */}
              <div className="p-4 rounded-xl bg-[#140F33] border border-[#2B205D] hover:border-amber-400/40 transition-colors flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 font-bold text-[10px] uppercase">
                      Ebook & Imprimible
                    </span>
                    <span className="text-[11px] text-slate-400">Formato .HTML / PDF</span>
                  </div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Guía Maestra: 100 Bloques Conversacionales</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Formateado con diseño editorial listo para leer en pantalla, imprimir o guardar como PDF en un clic.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleDownloadMasterHtml}
                    className="flex-1 py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Guía</span>
                  </button>
                  <button
                    onClick={handleOpenPrintableWindow}
                    title="Abre la versión con botón de imprimir o guardar como PDF"
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300" />
                    <span>Imprimir / PDF</span>
                  </button>
                </div>
              </div>

              {/* 2. Reproductor Offline de Bolsillo */}
              <div className="p-4 rounded-xl bg-[#140F33] border border-[#2B205D] hover:border-emerald-400/40 transition-colors flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-400/10 text-emerald-300 font-bold text-[10px] uppercase">
                      App Offline Móvil / PC
                    </span>
                    <span className="text-[11px] text-slate-400">100% Sin Datos</span>
                  </div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Reproductor de Audio de Bolsillo (.HTML)</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Mini aplicación autónoma para llevar en el celular. Funciona sin internet con pronunciación nativa en 2 velocidades.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleDownloadOfflinePlayer}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Mini-App Offline</span>
                  </button>
                </div>
              </div>

              {/* 3. Cheatsheet de 100 Bloques TXT */}
              <div className="p-4 rounded-xl bg-[#140F33] border border-[#2B205D] hover:border-violet-400/40 transition-colors flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-violet-400/10 text-violet-300 font-bold text-[10px] uppercase">
                      Notas del Celular
                    </span>
                    <span className="text-[11px] text-slate-400">Texto Plano .TXT</span>
                  </div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>Cheatsheet Condensado de 100 Bloques</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Archivo de texto limpio para copiar a Google Keep, Notas de iPhone o tu chat personal de WhatsApp.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleDownloadCheatsheet}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-violet-300" />
                    <span>Descargar Cheatsheet (.TXT)</span>
                  </button>
                </div>
              </div>

              {/* 4. Flashcards Anki & Excel CSV */}
              <div className="p-4 rounded-xl bg-[#140F33] border border-[#2B205D] hover:border-blue-400/40 transition-colors flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-400/10 text-blue-300 font-bold text-[10px] uppercase">
                      Flashcards & Tablas
                    </span>
                    <span className="text-[11px] text-slate-400">Formato .CSV UTF-8</span>
                  </div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Tarjetas Anki / Quizlet / Excel</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Listo para importar a la app de repetición espaciada Anki o para explorar en Excel con pronunciación en español.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleDownloadCsv}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-300" />
                    <span>Descargar CSV Flashcards</span>
                  </button>
                </div>
              </div>

              {/* 5. Plan de Estudio 30 Días */}
              <div className="p-4 rounded-xl bg-[#140F33] border border-[#2B205D] hover:border-rose-400/40 transition-colors flex flex-col justify-between space-y-3 md:col-span-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-rose-400/10 text-rose-300 font-bold text-[10px] uppercase">
                      Rutina Diaria
                    </span>
                    <span className="text-[11px] text-slate-400">10 Minutos / Día</span>
                  </div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Plan de Acción de 30 Días para Soltar la Lengua</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Cronograma estructurado día a día con ejercicios musculares y fonéticos para que se vuelva un hábito automático.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Semana 1: Chunks · Semana 2: Entrecasa · Semana 3: Fluidez · Semana 4: Automatización
                  </span>
                  <button
                    onClick={handleDownloadStudyPlan}
                    className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-rose-300" />
                    <span>Descargar Plan 30 Días (.TXT)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#140E35] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>¿Preguntas o dudas con la descarga?</span>
            <span className="text-amber-400 font-semibold">soporte@inglesfacil.app</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              Listo, Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* In-App Reader / Print preview modal if popups are blocked */}
      {showReaderPreview && (
        <div className="fixed inset-0 z-60 bg-black/90 flex flex-col p-4 sm:p-8">
          <div className="flex items-center justify-between pb-3 border-b border-white/20">
            <h3 className="text-white font-bold text-sm">Vista Previa de la Guía Maestra</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / Guardar PDF</span>
              </button>
              <button
                onClick={() => setShowReaderPreview(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
          <iframe
            srcDoc={generateMasterPdfHtml()}
            title="Guía Maestra"
            className="w-full flex-1 mt-3 rounded-xl bg-white border-0"
          />
        </div>
      )}
    </div>
  );
};
