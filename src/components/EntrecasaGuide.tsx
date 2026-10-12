import React, { useState } from 'react';
import { ENTRECASA_PHRASES, ENTRECASA_IMAGE } from '../data/defaultData';
import { EntrecasaPhrase, SkillLevel } from '../types';
import { playEnglishVoice } from '../services/audio';
import { KeyTakeawaysToggle, TakeawayItem } from './KeyTakeawaysToggle';
import {
  Coffee,
  Volume2,
  Sparkles,
  Home,
  Utensils,
  Moon,
  Users,
  Check,
  ArrowRight,
  Heart,
  Smile,
  Sprout,
  Zap,
  Turtle,
} from 'lucide-react';

interface EntrecasaGuideProps {
  currentSpeed: number;
  onGoToSimulator: () => void;
  onGoToTweak: () => void;
  initialLevel?: SkillLevel | 'all';
}

export const EntrecasaGuide: React.FC<EntrecasaGuideProps> = ({
  currentSpeed,
  onGoToSimulator,
  onGoToTweak,
  initialLevel = 'all',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | 'all'>(initialLevel);
  const [activePhraseId, setActivePhraseId] = useState<string | null>(ENTRECASA_PHRASES[0].id);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Todas las Frases', icon: Home },
    { id: 'cocina_comida', label: 'Cocina & Comida', icon: Utensils },
    { id: 'descanso_hogar', label: 'Descanso en Casa', icon: Moon },
    { id: 'favores_convivencia', label: 'Favores & Convivencia', icon: Heart },
    { id: 'charlas_amigos', label: 'Charlas Relajadas', icon: Users },
  ];

  const filteredPhrases = ENTRECASA_PHRASES.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || p.level === selectedLevel;
    return matchesCategory && matchesLevel;
  });

  const activePhrase =
    filteredPhrases.find((p) => p.id === activePhraseId) || filteredPhrases[0] || ENTRECASA_PHRASES[0];

  const handlePlay = async (phrase: EntrecasaPhrase, speedModifier?: number) => {
    setPlayingId(phrase.id);
    await playEnglishVoice(phrase.audioText, 'Kore', speedModifier || currentSpeed);
    setPlayingId(null);
  };

  const entrecasaTakeaways: TakeawayItem[] = [
    {
      point: 'Evita la traducción palabra por palabra del español',
      highlight: "Leave it, I'll do it later",
      explanation: 'En casa decimos "dejalo ahí que después lo lavo". La mente principiante suele traducir "leave it there that afterwards I will wash it". Los nativos van directo a la acción con economía de palabras.',
    },
    {
      point: 'Aprende la melodía completa como si fuera una canción',
      highlight: "I'm wiped / I'm craving...",
      explanation: 'Frases como "I\'m wiped" (estoy fusilado) o "I\'m craving something sweet" se dicen de un solo tirón rítmico, no separando cada palabra.',
    },
    {
      point: 'Para pedir favores de entrecasa, la cortesía es corta y cálida',
      highlight: 'Could you pass me...? / Mind giving me a hand?',
      explanation: 'Evita sonar como una orden militar ("help me") o excesivamente protocolar ("Would you be so kind as to assist me"). Lo cotidiano es directo y relajado.',
    },
    {
      point: 'Aprender en pantuflas genera memoria sin estrés',
      explanation: 'La fluidez real no nace de memorizar conjugaciones para exámenes, sino de asociar situaciones domésticas concretas (la pava hirviendo, lavar los platos, el sillón) con su reflejo natural en inglés.',
    },
  ];

  return (
    <section className="py-14 sm:py-20 border-b border-[#281F54]/70 bg-gradient-to-b from-transparent via-[#130E2E]/40 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            <span>Inglés Fácil y Fluido · Una Forma Sencilla de Aprender</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            El inglés que se habla en zapatillas y con una taza en la mano
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed">
            Sin fórmulas académicas ni oraciones de libro de texto que nadie dice.
            Aprende a resolver la vida cotidiana: en la cocina, con amigos, al preparar algo rico o descansar en el sillón.
          </p>
        </div>

        {/* Key Takeaways Toggle */}
        <div className="mb-10 max-w-4xl">
          <KeyTakeawaysToggle
            moduleName="Rincón de Entrecasa"
            takeaways={entrecasaTakeaways}
          />
        </div>

        {/* Featured Atmospheric Banner */}
        <div className="mb-12 rounded-2xl overflow-hidden border border-[#2D2260] bg-[#16103A] shadow-xl grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full">
            <img
              src={ENTRECASA_IMAGE}
              alt="Ambiente acogedor de entrecasa preparando té y café"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#16103A] via-transparent to-transparent opacity-90 lg:opacity-70" />
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs text-amber-200 flex items-center gap-2">
              <Smile className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Ambiente distendido: acá no hay notas ni exámenes, solo soltura.</span>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                La Regla de Oro de Entrecasa
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-1">
                Menos palabras complicadas, más fluidez espontánea
              </h3>
              <p className="text-sm text-slate-300 mt-2.5 leading-relaxed">
                Cuando los nativos están en su casa con amigos o familia, no conjugan oraciones de 15 palabras.
                Usan expresiones cortas de 3 a 5 palabras que se sienten como un abrazo:
                <em className="text-amber-300 font-medium"> &ldquo;What are you feeling for dinner?&rdquo;</em>,
                <em className="text-amber-300 font-medium"> &ldquo;Could you give me a hand?&rdquo;</em>,
                <em className="text-amber-300 font-medium"> &ldquo;I&apos;m beat&rdquo;</em>.
              </p>
            </div>

            {/* Quick Interactive Spotlight Card */}
            <div className="p-4 rounded-xl bg-[#20174F] border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Frase del momento
                </div>
                <div className="text-lg font-bold text-white font-display">
                  &ldquo;{activePhrase.entrecasaNative}&rdquo;
                </div>
                <div className="text-xs text-amber-300/90">
                  {activePhrase.spanishSituation}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handlePlay(activePhrase)}
                  disabled={playingId === activePhrase.id}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-60"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{playingId === activePhrase.id ? 'Escuchando...' : 'Escuchar'}</span>
                </button>
                <button
                  onClick={() => handlePlay(activePhrase, 0.75)}
                  disabled={playingId === activePhrase.id}
                  className="px-3 py-2.5 rounded-xl bg-[#2E226E] hover:bg-[#3B2C8C] text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  title="Escuchar en cámara lenta (0.75x) para principiantes"
                >
                  0.75x Lento
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Level Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#140E35]/90 border border-[#2B2062] mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Nivel:
            </span>
            <span className="text-xs text-slate-400">
              Filtra por tu grado de experiencia
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: '🌟 Todos', color: 'bg-amber-400 text-slate-950 font-bold' },
              { id: 'cero', label: '🌱 Desde Cero', color: 'bg-emerald-400 text-slate-950 font-bold' },
              { id: 'principiante', label: '☕ Principiante', color: 'bg-amber-400 text-slate-950 font-bold' },
              { id: 'avanzado', label: '⚡ Más Avanzado', color: 'bg-violet-400 text-slate-950 font-bold' },
            ].map((lvl) => {
              const isSelected = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id as SkillLevel | 'all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? lvl.color
                      : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-[#18123C] text-slate-300 hover:text-white hover:bg-[#221A52] border-[#2E2466]'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grid of Entrecasa Phrases */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredPhrases.map((phrase) => {
            const isPlayingThis = playingId === phrase.id;
            const isSelected = activePhraseId === phrase.id;

            let levelBadge = null;
            if (phrase.level === 'cero') {
              levelBadge = (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  🌱 Desde Cero
                </span>
              );
            } else if (phrase.level === 'principiante') {
              levelBadge = (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  ☕ Principiante
                </span>
              );
            } else if (phrase.level === 'avanzado') {
              levelBadge = (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/15 border border-violet-500/30 text-violet-300">
                  ⚡ Más Avanzado
                </span>
              );
            }

            return (
              <div
                key={phrase.id}
                onClick={() => setActivePhraseId(phrase.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-[#1B1446] border-amber-400/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-400/40'
                    : 'bg-[#140E35] border-[#291F5E] hover:border-[#3D2F8A] hover:bg-[#181140]'
                }`}
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        {phrase.categoryLabel}
                      </span>
                      {levelBadge}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlay(phrase);
                      }}
                      disabled={isPlayingThis}
                      className="p-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400 text-amber-300 hover:text-slate-950 transition-colors cursor-pointer"
                      title="Escuchar audio"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-100">
                    {phrase.spanishSituation}
                  </h4>
                </div>

                {/* Entrecasa native phrase card */}
                <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/40 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Frase de Entrecasa (Sencilla y Coloquial)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold">
                      100% Real
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-white font-display">
                    &ldquo;{phrase.entrecasaNative}&rdquo;
                  </p>
                  <p className="text-[11px] text-amber-200/90 font-mono-clean">
                    🔊 Ritmo nativo: {phrase.pronunciationGuide}
                  </p>
                  {phrase.phoneticEasy && (
                    <div className="p-2 rounded-lg bg-black/40 border border-emerald-500/20">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-0.5">
                        Pronunciación fácil (léela en español):
                      </span>
                      <span className="text-xs font-semibold text-emerald-200 font-mono-clean">
                        {phrase.phoneticEasy}
                      </span>
                    </div>
                  )}
                </div>

                {/* Practical Tip */}
                <div className="pt-2 border-t border-[#291F5E]/60 text-xs text-slate-300 leading-relaxed">
                  <p>{phrase.cozyTip}</p>
                </div>

                {/* Fast Action */}
                <div className="pt-1 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlay(phrase, 0.6);
                      }}
                      className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold hover:bg-emerald-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Escuchar súper lento (0.6x)"
                    >
                      <Turtle className="w-3 h-3" />
                      <span>0.6x</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlay(phrase, 0.75);
                      }}
                      className="px-2 py-1 rounded-lg bg-[#251B54] text-slate-300 text-[11px] font-medium hover:text-white transition-colors cursor-pointer"
                      title="Escuchar a 0.75x"
                    >
                      0.75x
                    </button>
                  </div>

                  <span className="text-[11px] font-semibold text-amber-400/90">
                    Práctica Rápida
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom invitation */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#1E164C] to-[#16103A] border border-[#342777] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-white font-display">
              ¿Querés poner a prueba estas frases en una charla real?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              Usa el simulador de voz con Sam en la cocina de casa o transforma cualquier frase que tengas en mente.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onGoToSimulator}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <span>Ir al Simulador de Cocina</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onGoToTweak}
              className="px-4 py-2.5 rounded-xl bg-[#281E60] hover:bg-[#34287D] text-slate-200 font-semibold text-xs sm:text-sm transition-colors cursor-pointer border border-[#3D2F8A]"
            >
              Probar una Frase Tuya
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
