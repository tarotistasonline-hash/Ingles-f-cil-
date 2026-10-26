import React, { useState } from 'react';
import { playEnglishVoice } from '../services/audio';
import {
  Sprout,
  Volume2,
  CheckCircle,
  HelpCircle,
  Smile,
  Shield,
  Coffee,
  Heart,
  Sparkles,
  ArrowRight,
  Turtle,
} from 'lucide-react';
import { KeyTakeawaysToggle } from './KeyTakeawaysToggle';
import { triggerConfetti, triggerSuperConfetti } from '../utils/confetti';

interface DesdeCeroGuideProps {
  currentSpeed: number;
  onExploreNextLevel: () => void;
}

interface BasicPhrase {
  id: string;
  situation: string;
  english: string;
  phoneticSimple: string; // Pronunciación figurada clara para hispanohablantes
  spanish: string;
  goldenRule: string;
  category: 'saludos' | 'pedir' | 'salvavidas' | 'cortesia';
}

export const DesdeCeroGuide: React.FC<DesdeCeroGuideProps> = ({
  currentSpeed,
  onExploreNextLevel,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const basicPhrases: BasicPhrase[] = [
    {
      id: 'cero-1',
      category: 'salvavidas',
      situation: 'Cuando te hablaron muy rápido y no entendiste nada',
      english: 'Could you speak a little slower, please?',
      phoneticSimple: 'Kud iu spiik e li-tl slou-er, pliiz?',
      spanish: '¿Podrías hablar un poco más despacio, por favor?',
      goldenRule: 'Tu salvavidas número 1. Nunca tengas vergüenza de pedirlo; a los nativos les encanta ayudar cuando eres sincero.',
    },
    {
      id: 'cero-2',
      category: 'salvavidas',
      situation: 'Cuando necesitas que te repitan la última frase',
      english: 'Sorry, one more time?',
      phoneticSimple: 'Sor-ri, uan mor taim?',
      spanish: 'Perdón, ¿me lo dices una vez más?',
      goldenRule: 'Infinitamente mejor y más cálido que decir "¿What?". Cuatro palabras cortas que resuelven cualquier malentendido.',
    },
    {
      id: 'cero-3',
      category: 'saludos',
      situation: 'Saludar a alguien de confianza en casa o en la calle',
      english: "Hey! How's it going?",
      phoneticSimple: 'Jey! Jaus it gou-ing?',
      spanish: '¡Hola! ¿Cómo te va / todo bien?',
      goldenRule: 'El saludo más común del planeta. Olvida el rígido "Good morning sir"; esto suena natural desde el primer día.',
    },
    {
      id: 'cero-4',
      category: 'saludos',
      situation: 'Responder cuando te preguntan "¿Cómo estás?"',
      english: "Pretty good, you?",
      phoneticSimple: 'Pri-ti gud, iu?',
      spanish: 'Bastante bien, ¿y tú?',
      goldenRule: 'Respuesta ultra corta y cómoda. La "tt" en "Pretty" suena casi como una "r" suave: "Priti".',
    },
    {
      id: 'cero-5',
      category: 'pedir',
      situation: 'Pedir agua, un té, o un café sin complicaciones',
      english: 'Can I have some water, please?',
      phoneticSimple: 'Ken ai jav sam uá-ter, pliiz?',
      spanish: '¿Me das un poco de agua, por favor?',
      goldenRule: 'Usa "Can I have..." para pedir cualquier cosa en la vida: una taza, un cargador, una servilleta.',
    },
    {
      id: 'cero-6',
      category: 'cortesia',
      situation: 'Aceptar una propuesta o plan amablemente',
      english: 'Yeah, sounds good to me!',
      phoneticSimple: 'Iea, saunds gud tu mi!',
      spanish: '¡Sí, me parece genial!',
      goldenRule: 'El "sí" universal que te hace sonar con onda y buena disposición en cualquier charla.',
    },
    {
      id: 'cero-7',
      category: 'pedir',
      situation: 'Preguntar por el baño o por algo esencial',
      english: 'Where is the bathroom?',
      phoneticSimple: 'Uer is de baz-rum?',
      spanish: '¿Dónde está el baño?',
      goldenRule: 'Directo y esencial. "Bathroom" se pronuncia con una z suave española en el medio: "baz-rum".',
    },
    {
      id: 'cero-8',
      category: 'cortesia',
      situation: 'Agradecer de corazón y despedirte con una sonrisa',
      english: 'Thanks a lot, see you soon!',
      phoneticSimple: 'Zenks e lot, sii iu suun!',
      spanish: '¡Muchas gracias, nos vemos pronto!',
      goldenRule: 'Cierra cualquier encuentro con calidez. "Thanks a lot" es más cercano que el simple "Thank you".',
    },
  ];

  const handlePlayAudio = async (text: string, id: string, speedModifier: number = 0.65) => {
    setPlayingId(id);
    try {
      await playEnglishVoice(text, 'Kore', speedModifier);
    } finally {
      setPlayingId(null);
    }
  };

  const toggleLearned = (id: string) => {
    setLearnedIds((prev) => {
      const isAlreadyLearned = prev.includes(id);
      if (isAlreadyLearned) {
        return prev.filter((item) => item !== id);
      }
      const updated = [...prev, id];
      if (updated.length === basicPhrases.length) {
        triggerSuperConfetti();
      } else {
        triggerConfetti({ particleCount: 30, spread: 45 });
      }
      return updated;
    });
  };

  const filtered =
    selectedFilter === 'all'
      ? basicPhrases
      : basicPhrases.filter((p) => p.category === selectedFilter);

  return (
    <section id="desde-cero" className="py-14 sm:py-20 bg-[#0A071E] border-b border-[#2A1F5E]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nivel 0 · Inglés Desde Cero (Sin Miedo ni Gramática)</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            ¿Empiezas desde cero absoluto? Este es tu punto de partida
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Si sientes que no recuerdas nada o te da pánico trabarte, relájate. No necesitas listas de verbos irregulares ni exámenes.
            Solo necesitas estas frases salvavidas cotidianas con <strong className="text-emerald-300 font-semibold">fonética simple en español</strong> y audio ultra lento para escuchar cada sonido con calma.
          </p>
        </div>

        {/* Key Takeaways */}
        <KeyTakeawaysToggle
          moduleName="Inglés Desde Cero (Primeros Pasos)"
          takeaways={[
            {
              point: 'Pierde el miedo con las frases salvavidas',
              highlight: 'Could you speak slower? / One more time?',
              explanation: 'Saber pedir que te hablen más despacio te quita el 90% del estrés de entrada.',
            },
            {
              point: 'La fonética figurada te da seguridad inicial',
              highlight: 'Lee como suena en español',
              explanation: 'Para quien arranca hoy, saber que "Where is the bathroom" suena "Uer is de baz-rum" evita que la mente se congele al intentar adivinar letras mudas.',
            },
            {
              point: 'Escucha en las 3 velocidades (0.65x Lento, 0.8x Pausado y 1.0x Nativo)',
              highlight: 'Velocidad a tu medida',
              explanation: 'Usa 0.65x para fijarte en cada letra y fonema sin apuro, 0.8x (pausado) para repetir con calma, y 1.0x para acostumbrar el oído a la velocidad nativa.',
            },
            {
              point: 'Aprende 1 o 2 frases por día',
              explanation: 'No intentes memorizar 50 palabras en un día. Con dominar 2 frases reales por día, en una semana resuelves situaciones completas.',
            },
          ]}
        />

        {/* 3 Golden Rescue Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#120E32] border border-emerald-500/30 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-sm font-bold text-white">El Salvavidas del Ritmo</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Decir <span className="text-emerald-300 font-semibold">"A little slower, please"</span> no te hace ver mal; demuestra que tienes ganas reales de comunicarte. Los nativos bajan el ritmo con gusto.
            </p>
          </div>

          <div className="bg-[#120E32] border border-amber-500/30 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-sm font-bold text-white">El Bloque Todoterreno: "Can I have..."</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              En lugar de dudar entre verbos como "give", "bring", "buy" o "want", usa siempre <span className="text-amber-300 font-semibold">"Can I have [cosa]?"</span>. Resuelve comida, bebidas, ayuda y compras.
            </p>
          </div>

          <div className="bg-[#120E32] border border-indigo-500/30 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-sm font-bold text-white">La Regla de la Sonrisa y la Entonación</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Un <span className="text-indigo-300 font-semibold">"Thanks a lot!"</span> dicho con calidez vale más que una oración gramaticalmente perfecta dicha con miedo y frialdad.
            </p>
          </div>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            {[
              { id: 'all', label: 'Todas las Frases de Inicio' },
              { id: 'salvavidas', label: '🛟 Salvavidas (Si te trabas)' },
              { id: 'saludos', label: '👋 Saludos de Entrecasa' },
              { id: 'pedir', label: '☕ Pedir cosas cotidianas' },
              { id: 'cortesia', label: '✨ Responder y Agradecer' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-emerald-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400">
            Has dominado <strong className="text-emerald-400">{learnedIds.length}</strong> de {basicPhrases.length} frases
          </div>
        </div>

        {/* Phrase Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const isLearned = learnedIds.includes(item.id);
            const isPlaying = playingId === item.id;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  isLearned
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                    : 'bg-[#130F33]/80 border-[#261E58] hover:border-emerald-500/30'
                }`}
              >
                <div className="space-y-3">
                  {/* Situation badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-emerald-400/90 uppercase tracking-wide">
                      {item.situation}
                    </span>
                    <button
                      onClick={() => toggleLearned(item.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isLearned
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold'
                          : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{isLearned ? 'Aprendida' : 'Marcar aprendida'}</span>
                    </button>
                  </div>

                  {/* English phrase */}
                  <div className="space-y-1">
                    <div className="font-display text-lg sm:text-xl font-bold text-white">
                      "{item.english}"
                    </div>
                    <div className="text-sm text-slate-300">
                      = {item.spanish}
                    </div>
                  </div>

                  {/* Easy Phonetic Guide */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        Pronunciación fácil (léela en español):
                      </div>
                      <div className="font-mono text-sm font-semibold text-amber-200 tracking-wide mt-0.5">
                        {item.phoneticSimple}
                      </div>
                    </div>

                    {/* Dual Audio Speed Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Ultra slow button */}
                      <button
                        onClick={() => handlePlayAudio(item.english, item.id, 0.65)}
                        disabled={isPlaying}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Escuchar en cámara lenta (0.65x) para principiantes"
                      >
                        <Turtle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">0.65x</span>
                        <span className="sm:hidden">Lento</span>
                      </button>

                      {/* Normal conversational speed */}
                      <button
                        onClick={() => handlePlayAudio(item.english, item.id, currentSpeed)}
                        disabled={isPlaying}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Escuchar a velocidad pausada recomendada (0.8x)"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Play</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Golden Tip */}
                <div className="pt-2 border-t border-white/5 text-xs text-slate-400 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item.goldenRule}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progression Callout to Level 1 and Level 2 */}
        <div className="bg-gradient-to-r from-[#17103F] to-[#120C30] border border-[#2F2468] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center justify-center md:justify-start gap-1.5">
              <span>Ruta de Aprendizaje Gradual</span>
              <span aria-hidden="true">·</span>
              <span>Paso a Paso</span>
            </div>
            <h3 className="font-display text-xl font-bold text-white">
              ¿Ya te sientes cómodo con estas bases?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Pasa al siguiente escalón: el <strong>Nivel Principiante (A1-A2)</strong> para charlas en la cocina y pedidos en cafés, o al <strong>Nivel Más Avanzado</strong> para dominar modismos y connected speech nativo.
            </p>
          </div>

          <button
            onClick={onExploreNextLevel}
            className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-amber-400/10"
          >
            <span>Ver Bloques de Poder (Nivel 1 & 2)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
