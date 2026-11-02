import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface AdSenseBannerProps {
  client?: string; // ej: 'ca-pub-XXXXXXXXXXXXXXXX'
  slot?: string;   // ej: '1234567890'
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  client = 'ca-pub-8099027931324700',
  slot = '',
  format = 'auto',
  responsive = true,
  className = 'my-6 flex justify-center text-center overflow-hidden'
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch {
      // Ignorar si el bloque ya fue inicializado o AdBlock está activo
    }
  }, []);

  // Si aún no se ha configurado un slot manual específico, no renderizar nada para no interferir con Auto Ads
  if (!slot) {
    return null;
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};
