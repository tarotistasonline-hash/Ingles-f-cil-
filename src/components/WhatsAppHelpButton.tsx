import React, { useState } from 'react';
import { Mail, X, ExternalLink } from 'lucide-react';

interface WhatsAppHelpButtonProps {
  customEmail?: string;
}

export const WhatsAppHelpButton: React.FC<WhatsAppHelpButtonProps> = ({
  customEmail = 'inglesfacilyfluido@gmail.com',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const emailSubject = encodeURIComponent('Ayuda con la Descarga del Audio-Kit de Inglés');
  const emailBody = encodeURIComponent(
    '¡Hola!\n\nCompré el Audio-Kit de Inglés Fácil y Fluido y necesito ayuda para descargar el contenido a mi dispositivo.\n\nMi Número de Operación de Mercado Pago es: '
  );
  const mailtoUrl = `mailto:${customEmail}?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div className="fixed bottom-5 left-4 sm:left-6 z-40 flex flex-col items-start gap-2">
      {/* Expanded popup box */}
      {isExpanded && (
        <div className="p-4 rounded-2xl bg-[#0F1528] border-2 border-emerald-400/60 shadow-2xl shadow-emerald-500/20 max-w-xs w-full space-y-3 animate-fade-in backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Soporte de Descarga Oficial</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white p-1 rounded cursor-pointer text-xs"
              aria-label="Cerrar ayuda"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">
            ¿Tuviste algún problema al descargar o descomprimir los archivos de tu Audio-Kit?
          </p>

          <div className="p-2.5 rounded-xl bg-black/40 border border-slate-700 text-[11px] text-amber-300 space-y-1">
            <strong>Solo en caso de no poder descargar el pack:</strong>
            <p className="text-slate-300">
              Escribinos con tu número de comprobante de Mercado Pago y te lo resolvemos de inmediato.
            </p>
          </div>

          <a
            href={mailtoUrl}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer no-underline"
          >
            <Mail className="w-4 h-4" />
            <span>inglesfacilyfluido@gmail.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3.5 py-2.5 rounded-full bg-[#0F1528]/95 hover:bg-[#16203D] border border-emerald-400/50 hover:border-emerald-400 shadow-xl shadow-emerald-500/15 backdrop-blur-md flex items-center gap-2 text-xs font-bold text-emerald-300 transition-all hover:scale-103 cursor-pointer group"
        title="Solo en caso de no poder descargar el pack: inglesfacilyfluido@gmail.com"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
        <Mail className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">¿Problemas al descargar? Email</span>
        <span className="sm:hidden">Soporte Email</span>
      </button>
    </div>
  );
};

export const SupportHelpButton = WhatsAppHelpButton;
