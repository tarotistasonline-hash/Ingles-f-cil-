import React, { useState } from 'react';
import { AlertCircle, Zap, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { KeyTakeawaysToggle, TakeawayItem } from './KeyTakeawaysToggle';

export const MethodComparison: React.FC<{ onNavigateToSimulator: () => void }> = ({
  onNavigateToSimulator,
}) => {
  const [selectedPillar, setSelectedPillar] = useState<number>(0);

  const pillars = [
    {
      title: '1. Chunks (Bloques) vs. Fórmulas de Gramática',
      traditionalTrap:
        'Memorizar tablas de tiempos verbales (Present Perfect Continuous, Past Participle) e intentar encajar sujeto + auxiliar + verbo en 1 segundo mientras alguien te habla.',
      naturalWay:
        'Aprender paquetes de palabras completos como si fueran una sola palabra ("I was wondering if...", "You might as well..."). No tienes que conjugar nada en tu mente.',
      exampleTrap: '"I have been wanting to tell you that..." (tartamudeando en la conjugación)',
      exampleNatural: '"I\'ve been meaning to tell you..." (disparado en 0.2 segundos como un reflejo)',
    },
    {
      title: '2. Ritmo y Conexión vs. Palabras Aisladas de Diccionario',
      traditionalTrap:
        'Aprender palabras sueltas con pronunciación aislada ("What", "do", "you", "want"). Cuando un nativo habla rápido diciendo "Whaddya want?", tu oído no reconoce nada.',
      naturalWay:
        'Entrenar el oído para las reducciones y enlaces de sonido (Connected Speech). El inglés es un idioma rítmico, no silábico.',
      exampleTrap: 'Buscar las pausas entre palabras que en el inglés real NUNCA existen.',
      exampleNatural: '"Pick it up" no son tres palabras; suena como "Pi-ki-tup". Al saberlo, entiendes películas y personas reales.',
    },
    {
      title: '3. Reflejos en 5 Segundos vs. Traducción Mental Lenta',
      traditionalTrap:
        'Pensar la frase en español -> buscar los equivalentes en inglés -> revisar si la regla gramatical es correcta -> abrir la boca cuando la conversación ya cambió de tema.',
      naturalWay:
        'Asociar situaciones emocionales o cotidianas directamente con el reflejo en inglés. Cero traducción intermedia.',
      exampleTrap: 'Te preguntan "¿Tienes fuego?" y piensas: "Do you possess fire?"',
      exampleNatural: 'El reflejo directo sin pensar: "Got a lighter?"',
    },
    {
      title: '4. Expresión Humana Real vs. Corrección Obsesiva',
      traditionalTrap:
        'El miedo constante a equivocarte con una preposición ("in" vs "on" vs "at") te paraliza y te hace callar.',
      naturalWay:
        'Priorizar la conexión y la espontaneidad. Un nativo te entenderá y te apreciará por tu soltura, no por si usaste la preposición perfecta de un examen.',
      exampleTrap: 'Quedarte en silencio en una reunión por dudar si es "at the meeting" o "in the meeting".',
      exampleNatural: 'Lanzarte con un bloque seguro: "From what I see, let\'s move forward."',
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[#0C0A1D]/70 border-y border-[#261E52]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-amber-400">
            <span>Método Simple y Directo</span>
            <span aria-hidden="true">·</span>
            <span>Las 4 Claves de la Fluidez</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white text-balance">
            Aprende a hablar con soltura: de entrecasa, sencillo y coloquial
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed text-pretty">
            Olvídate de memorizar tablas de tiempos verbales o traducir palabra por palabra en tu mente.
            Aquí aprendes bloques conversacionales completos para charlar con amigos, pedir un café,
            viajar y desenvolverte sin dudar.
          </p>
        </div>

        {/* Key Takeaways Toggle */}
        <KeyTakeawaysToggle
          moduleName="Las 4 Claves de la Fluidez de Entrecasa"
          takeaways={[
            {
              point: 'Aprender bloques elimina la parálisis por análisis',
              explanation: 'El cerebro no puede procesar tablas de tiempos verbales a velocidad de conversación real. Los bloques de palabras ya resueltos fluyen en milisegundos.',
            },
            {
              point: 'El inglés es rítmico, no silábico como el español',
              explanation: 'En español cada sílaba tiene casi la misma duración. En inglés, las palabras importantes se alargan y los conectores se comprimen ("Connected Speech").',
            },
            {
              point: 'Prioriza la conexión humana sobre la perfección gramatical',
              explanation: 'Nadie interrumpe a un amigo para marcarle una preposición errada. Lo que genera simpatía y empatía es la soltura, la entonación y la calidez.',
            },
            {
              point: 'El ambiente relajado es indispensable para fijar memoria a largo plazo',
              explanation: 'Con altos niveles de cortisol o miedo al ridículo, el cerebro bloquea el acceso al vocabulario. En pantuflas y sin presión, el idioma se incorpora de manera orgánica.',
            },
          ]}
        />

        {/* Comparison Pillars Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Pillar Selector Buttons */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Los 4 Principios de la Fluidez
            </span>
            {pillars.map((pillar, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPillar(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedPillar === idx
                    ? 'bg-amber-400/10 border-amber-400/80 text-amber-200 shadow-sm'
                    : 'bg-[#14102E]/70 border-[#281F54] text-slate-300 hover:bg-[#1E1745] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                  <span>{pillar.title}</span>
                  {selectedPillar === idx && (
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                </div>
              </button>
            ))}

            <div className="pt-4">
              <button
                onClick={onNavigateToSimulator}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-400/10"
              >
                <span>Probar en el Simulador</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Pillar Deep Dive Card */}
          <div className="lg:col-span-8 bg-[#14102E]/90 border border-[#2D245A] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-md">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
              {pillars[selectedPillar].title}
            </h3>

            <div className="space-y-4">
              {/* Natural Colloquial Solution - Hero Card */}
              <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-amber-950/25 rounded-2xl border border-emerald-500/40 p-6 sm:p-7 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-wide uppercase">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>El Enfoque Coloquial y Natural</span>
                </div>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                  {pillars[selectedPillar].naturalWay}
                </p>

                <div className="pt-3 border-t border-emerald-900/40 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    Cómo lo dices de entrecasa (Respuesta directa):
                  </span>
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/30">
                    <p className="text-base sm:text-lg font-bold text-white font-display">
                      &ldquo;{pillars[selectedPillar].exampleNatural}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Advantage note */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                <span className="text-amber-400 font-bold shrink-0">💡 Clave:</span>
                <p>
                  Evita traducir mentalmente desde el español palabra por palabra. Al disparar el bloque completo, ganas seguridad y velocidad en menos de un segundo.
                </p>
              </div>
            </div>

            {/* Practical takeaway */}
            <div className="p-4 rounded-xl bg-amber-950/25 border border-amber-900/50 flex items-start gap-3 text-xs sm:text-sm text-amber-200">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-300">La regla de oro: </strong>
                Nunca memorices palabras huérfanas ni tablas de conjugación. Aprende frases completas de 3 a 5 palabras que puedas intercambiar al instante.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
