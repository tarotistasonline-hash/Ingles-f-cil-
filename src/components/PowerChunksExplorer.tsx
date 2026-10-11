import React, { useState } from 'react';
import { POWER_CHUNKS } from '../data/defaultData';
import { PowerChunk, SkillLevel } from '../types';
import { playEnglishVoice } from '../services/audio';
import { KeyTakeawaysToggle, TakeawayItem } from './KeyTakeawaysToggle';
import { Volume2, Sparkles, AlertTriangle, Turtle } from 'lucide-react';

interface PowerChunksExplorerProps {
  currentSpeed: number;
}

export const PowerChunksExplorer: React.FC<PowerChunksExplorerProps> = ({ currentSpeed }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | 'all'>('all');
  const [playingExample, setPlayingExample] = useState<string | null>(null);
  const [userCustomTry, setUserCustomTry] = useState<{ [chunkId: string]: string }>({});

  const categories = [
    { id: 'all', label: 'Todos los Bloques' },
    { id: 'starters', label: 'Arrancar Frases' },
    { id: 'polite', label: 'Pedir con Suavidad' },
    { id: 'opinions', label: 'Dar Opiniones' },
    { id: 'reactions', label: 'Reacciones Nativas' },
    { id: 'casual', label: 'Casual y Amigos' },
    { id: 'fillers', label: 'Ganar Tiempo' },
  ];

  const filteredChunks = POWER_CHUNKS.filter((c) => {
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || c.level === selectedLevel;
    return matchesCategory && matchesLevel;
  });

  const handlePlayVoice = async (text: string, key: string, speedOverride?: number) => {
    setPlayingExample(key);
    try {
      await playEnglishVoice(text, 'Kore', speedOverride || currentSpeed);
    } finally {
      setPlayingExample(null);
    }
  };

  const powerChunksTakeaways: TakeawayItem[] = [
    {
      point: 'Aprende unidades de sonido completas, no palabras aisladas',
      highlight: 'Chunks = Lego blocks',
      explanation: 'Cuando aprendes "I was wondering if...", no dudas si "wonder" va en pasado o continuo; lo disparas en bloque con entonación natural.',
    },
    {
      point: 'Gana de 2 a 3 segundos de ventaja mental',
      highlight: 'As a matter of fact / To be honest...',
      explanation: 'Los "starters" y "fillers" nativos te dan tiempo para pensar tu idea central sin quedarte en silencio incómodo ni hacer "ehhh...".',
    },
    {
      point: 'Cero conjugación en vivo',
      highlight: 'I feel like + ing',
      explanation: 'Al usar "I feel like..." solo agregas la acción ("ordering food", "going out"). Tu cerebro no se traba calculando reglas gramaticales complejas.',
    },
    {
      point: 'Cambia un solo ingrediente para crear decenas de oraciones',
      explanation: 'Dominar 10 bloques de poder te permite armar más de 100 oraciones fluidas simplemente sustituyendo el final.',
    },
  ];

  return (
    <section id="chunks" className="py-14 sm:py-20 bg-[#0C0822]/80 border-b border-[#281F54]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-amber-400">
              <span>La Caja de Herramientas</span>
              <span aria-hidden="true">·</span>
              <span>Bloques Prefabricados</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Bloques de Poder: Habla sin Conjugar
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Los nativos no arman oraciones sumando sujeto + verbo + objeto. Usan bloques ya fabricados
              que encajan como piezas de Lego. Puedes escucharlos despacio para aprender la melodía exacta.
            </p>
          </div>

          {/* Interactive Category Segmented Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Level Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-[#2B2062]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Nivel de los Bloques:
            </span>
            <span className="text-xs text-slate-400">
              Adapta la dificultad a tu momento actual
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: '🌟 Todos los Bloques', color: 'bg-amber-400 text-slate-950 font-bold' },
              { id: 'cero', label: '🌱 Desde Cero', color: 'bg-emerald-400 text-slate-950 font-bold' },
              { id: 'principiante', label: '☕ Principiante (A1-A2)', color: 'bg-amber-400 text-slate-950 font-bold' },
              { id: 'avanzado', label: '⚡ Más Avanzado (B1+)', color: 'bg-violet-400 text-slate-950 font-bold' },
            ].map((lvl) => {
              const isSelected = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id as SkillLevel | 'all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? lvl.color
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Key Takeaways Toggle */}
        <KeyTakeawaysToggle
          moduleName="Bloques de Poder (Power Chunks)"
          takeaways={powerChunksTakeaways}
        />

        {/* Chunks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChunks.map((chunk) => {
            let levelBadge = null;
            if (chunk.level === 'cero') {
              levelBadge = (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  🌱 Desde Cero
                </span>
              );
            } else if (chunk.level === 'principiante') {
              levelBadge = (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  ☕ Principiante
                </span>
              );
            } else if (chunk.level === 'avanzado') {
              levelBadge = (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/15 border border-violet-500/30 text-violet-300">
                  ⚡ Avanzado
                </span>
              );
            }

            return (
              <div
                key={chunk.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-5 hover:border-amber-500/50 transition-colors shadow-xl"
              >
                <div className="space-y-4">
                  {/* Header chunk & translation */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-400">
                          Bloque Clave
                        </span>
                        {levelBadge}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePlayVoice(chunk.chunk, `chunk-${chunk.id}-slow`, 0.6)}
                          className="text-[10px] text-emerald-300 hover:bg-emerald-500/20 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-0.5 cursor-pointer"
                          title="Escuchar súper lento (0.6x)"
                        >
                          <Turtle className="w-3 h-3" />
                          <span>0.6x</span>
                        </button>
                        <button
                          onClick={() => handlePlayVoice(chunk.chunk, `chunk-${chunk.id}`)}
                          className="text-slate-400 hover:text-amber-400 transition-colors p-1 cursor-pointer"
                          title="Escuchar audio"
                        >
                          <Volume2
                            className={`w-4 h-4 ${
                              playingExample?.startsWith(`chunk-${chunk.id}`)
                                ? 'text-amber-400 animate-pulse'
                                : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-display text-2xl font-bold text-white tracking-tight">
                      &ldquo;{chunk.chunk}&rdquo;
                    </h3>

                    {chunk.phoneticSpelling && (
                      <div className="text-xs font-semibold text-emerald-300 font-mono-clean">
                        Pronunciación: {chunk.phoneticSpelling}
                      </div>
                    )}

                    <p className="text-xs text-slate-400 italic">
                      Literal: &ldquo;{chunk.literalMeaning}&rdquo;
                    </p>
                  </div>

                {/* Practical use explanation */}
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  {chunk.realUse}
                </p>

                {/* Practical fluency tip */}
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-amber-300">Clave de entrecasa: </strong>
                    {chunk.trapToAvoid}
                  </div>
                </div>

                {/* Real examples with individual audio play */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Ejemplos en contexto real:
                  </span>
                  <div className="space-y-2">
                    {chunk.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-100 leading-snug">
                            "{ex.en}"
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() =>
                                handlePlayVoice(ex.en, `ex-${chunk.id}-${i}-slow`, 0.65)
                              }
                              className="text-[10px] text-slate-400 hover:text-amber-300 px-1 py-0.5 rounded bg-slate-900 border border-slate-700 cursor-pointer"
                              title="Escuchar lento (0.65x)"
                            >
                              0.65x
                            </button>
                            <button
                              onClick={() => handlePlayVoice(ex.en, `ex-${chunk.id}-${i}`)}
                              className="text-slate-400 hover:text-white p-1 cursor-pointer"
                              title="Escuchar audio"
                            >
                              <Volume2
                                className={`w-3.5 h-3.5 ${
                                  playingExample?.startsWith(`ex-${chunk.id}-${i}`)
                                    ? 'text-amber-400 animate-pulse'
                                    : ''
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400">{ex.es}</p>
                        {ex.soundTip && (
                          <p className="text-[10px] text-amber-300/90 font-medium">
                            💡 Ritmo: {ex.soundTip}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Try-it mini field */}
              <div className="pt-3 border-t border-slate-800 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-300 block">
                  Completa tu propia frase con "{chunk.chunk}":
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userCustomTry[chunk.id] || ''}
                    onChange={(e) =>
                      setUserCustomTry({ ...userCustomTry, [chunk.id]: e.target.value })
                    }
                    placeholder={`${chunk.chunk} ...`}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  {userCustomTry[chunk.id] && (
                    <button
                      onClick={() =>
                        handlePlayVoice(userCustomTry[chunk.id], `custom-${chunk.id}`)
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 cursor-pointer"
                      title="Escuchar tu frase"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
};
