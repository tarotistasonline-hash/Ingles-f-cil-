import React from 'react';
import {
  Mail,
  AlertTriangle,
  ExternalLink,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface UrgentSupportButtonProps {
  failedFileName?: string;
  failureReason?: string;
  onDismiss?: () => void;
  className?: string;
}

export const UrgentSupportButton: React.FC<UrgentSupportButtonProps> = ({
  failedFileName = 'los archivos del pack',
  failureReason = 'No se pudo abrir o descargar el archivo en este dispositivo',
  onDismiss,
  className = '',
}) => {
  const mailSubject = encodeURIComponent(
    `Ayuda con descarga del Audio-Kit de Inglés: ${failedFileName}`
  );
  const mailBody = encodeURIComponent(
    `¡Hola! Compré el Audio-Kit de Inglés y tengo problemas para descargar o abrir el archivo "${failedFileName}" en mi celular.\n\nDetalle: ${failureReason}\n\n¿Me podrían enviar los archivos directos a mi correo? ¡Muchas gracias!`
  );
  const mailtoUrl = `mailto:inglesfacilyfluido@gmail.com?subject=${mailSubject}&body=${mailBody}`;

  return (
    <div
      role="alert"
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/90 via-[#2A1128] to-amber-950/90 border-2 border-rose-500/70 p-4 sm:p-5 shadow-2xl shadow-rose-950/40 animate-fade-in ${className}`}
    >
      {/* Top Warning Glow Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 animate-pulse" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0 mt-0.5">
            <AlertTriangle className="w-6 h-6 text-rose-400 animate-bounce" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-500/50 text-[10px] font-black uppercase tracking-wider">
                🚨 Soporte por Correo
              </span>
              <span className="text-xs text-rose-200 font-semibold truncate">
                Problema con: <strong className="text-white">{failedFileName}</strong>
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-black text-white leading-snug">
              ¿No pudiste descargar o escuchar tu archivo? ¡Te ayudamos!
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Solo en caso de no poder descargar el pack o escuchar los audios, escribinos directamente a{' '}
              <strong className="text-emerald-300 underline">inglesfacilyfluido@gmail.com</strong> para enviarte los archivos sueltos y asistirte.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
          <a
            href={mailtoUrl}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-102 active:scale-98 cursor-pointer no-underline"
          >
            <Mail className="w-4 h-4 text-slate-950 shrink-0" />
            <span>Escribir a inglesfacilyfluido@gmail.com</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center border border-white/10"
              title="Cerrar aviso de soporte"
              aria-label="Cerrar aviso de soporte"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Helpful Quick Tip for Phones */}
      <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-amber-200/90">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>Tip rápido en celulares:</strong> Si tu celular no tiene cómo descomprimir .ZIP, usá la opción "Archivos Sueltos" o "Audios en Vivo" sin instalar nada.
          </span>
        </span>
        <span className="text-slate-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Atención personalizada</span>
        </span>
      </div>
    </div>
  );
};
