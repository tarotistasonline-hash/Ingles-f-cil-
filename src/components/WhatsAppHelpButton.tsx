import React, { useState } from 'react';
import { MessageCircle, X, ExternalLink } from 'lucide-react';

interface WhatsAppHelpButtonProps {
  customPhone?: string;
  defaultMessage?: string;
}

export const WhatsAppHelpButton: React.FC<WhatsAppHelpButtonProps> = ({
  customPhone = '',
  defaultMessage = '¡Hola! Tengo una consulta sobre el Audio-Kit de Inglés Fácil y Fluido ($9.990)',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(() => {
    try {
      return localStorage.getItem('vibe_whatsapp_number') || customPhone;
    } catch {
      return customPhone;
    }
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      try {
        const updated = localStorage.getItem('vibe_whatsapp_number') || '';
        setPhoneNumber(updated);
      } catch {
        // ignore
      }
    };
    window.addEventListener('vibe_whatsapp_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('vibe_whatsapp_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const encodedMsg = encodeURIComponent(defaultMessage);
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
    : `https://wa.me/?text=${encodedMsg}`;

  return (
    <div className="fixed bottom-5 left-4 sm:left-6 z-40 flex flex-col items-start gap-2">
      {/* Expanded popup box */}
      {isExpanded && (
        <div className="p-4 rounded-2xl bg-[#0F1E17] border-2 border-emerald-400/60 shadow-2xl shadow-emerald-500/20 max-w-xs w-full space-y-3 animate-fade-in backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Soporte Directo por WhatsApp</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white p-1 rounded cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">
            ¿Tenés alguna duda sobre el pack, los audios, cómo descargarlo en tu celular o cómo pagar con Mercado Pago?
          </p>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer no-underline"
          >
            <MessageCircle className="w-4 h-4 fill-slate-950" />
            <span>Chatear por WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3.5 py-2.5 rounded-full bg-[#10241A]/95 hover:bg-[#153123] border border-emerald-400/50 hover:border-emerald-400 shadow-xl shadow-emerald-500/15 backdrop-blur-md flex items-center gap-2 text-xs font-bold text-emerald-300 transition-all hover:scale-103 cursor-pointer group"
        title="Consultar por WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
        <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">¿Dudas? WhatsApp</span>
        <span className="sm:hidden">WhatsApp</span>
      </button>
    </div>
  );
};
