import React, { useState } from 'react';
import { CONNECTED_SPEECH_LESSONS } from '../data/defaultData';
import { ConnectedSpeechLesson } from '../types';
import { playEnglishVoice } from '../services/audio';
import { KeyTakeawaysToggle, TakeawayItem } from './KeyTakeawaysToggle';
import { Volume2, Headphones } from 'lucide-react';

interface ConnectedSpeechLabProps {
  currentSpeed: number;
}

export const ConnectedSpeechLab: React.FC<ConnectedSpeechLabProps> = ({ currentSpeed }) => {
  const [selectedLesson, setSelectedLesson] = useState<ConnectedSpeechLesson>(
    CONNECTED_SPEECH_LESSONS[0]
  );
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);

  const handlePlayVoice = async (text: string, key: string, speed: number = 0.8) => {
    setPlayingAudioKey(key);
    try {
      await playEnglishVoice(text, 'Kore', speed);
    } finally {
      setPlayingAudioKey(null);
    }
  };

  const connectedSpeechTakeaways: TakeawayItem[] = [
    {
      point: 'Linking Consonante + Vocal',
      highlight: 'Turn off -> "tur-nof"',
      explanation: 'El inglés odia los espacios vacíos entre sonidos. La consonante final salta a la vocal siguiente ("hold on" suena "hol-don").',
    },
    {
      point: 'Flap T (La T suave como R en español)',
      highlight: 'Water -> "wa-der"',
      explanation: 'Entre vocales, la T norteamericana no suena explosiva; se relaja como una "r" suave de "pera" ("better", "city", "get out").',
    },
    {
      point: 'Reducciones automáticas de palabras gramaticales',
      highlight: 'Gonna / Wanna / Shoulda',
      explanation: 'Palabras auxiliares pierden volumen y duración para destacar las palabras que llevan significado (sustantivos y verbos principales).',
    },
    {
      point: 'Entrena primero a velocidad 0.65x o 0.8x',
      explanation: 'Cuando tu cerebro distingue la unión a velocidad pausada, inmediatamente la reconoce cuando un nativo habla a ritmo normal en una serie o podcast.',
    },
  ];

  return (
    <section id="connected" className="py-14 sm:py-20 bg-[#0E0926]/90 border-b border-[#281F54]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-amber-400">
            <span>El Laboratorio del Oído Nativo</span>
            <span aria-hidden="true">·</span>
            <span>Connected Speech & Velocidad Lenta</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Por qué no entiendes a los nativos (Y cómo solucionarlo hoy)
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Los nativos no hablan "demasiado rápido". En inglés las palabras se encadenan y se comprimen rítmicamente.
            Aquí puedes escuchar cada fenómeno a velocidad lenta (0.65x) para que tu oído distinga cada sonido sin perderse.
          </p>
        </div>

        {/* Key Takeaways Toggle */}
        <KeyTakeawaysToggle
          moduleName="Laboratorio de Connected Speech"
          takeaways={connectedSpeechTakeaways}
        />

        {/* Lesson Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CONNECTED_SPEECH_LESSONS.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                selectedLesson.id === lesson.id
                  ? 'bg-slate-900 border-amber-500/80 shadow-md ring-1 ring-amber-400/50'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                  {lesson.pattern}
                </span>
                <h3 className="text-sm font-bold text-white">
                  {lesson.title}
                </h3>
                <p className="text-xs text-slate-400">{lesson.subtitle}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Interactive Deep Dive Lab Card */}
        <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Patrón Acústico Activo
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                {selectedLesson.title}
              </h3>
            </div>

            {/* Speeds selector buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  handlePlayVoice(selectedLesson.spokenAudioText, 'main-super-slow', 0.65)
                }
                className="px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-400/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2
                  className={`w-3.5 h-3.5 ${
                    playingAudioKey === 'main-super-slow' ? 'animate-pulse text-amber-400' : ''
                  }`}
                />
                <span>0.65x (Super Lento)</span>
              </button>
              <button
                onClick={() =>
                  handlePlayVoice(selectedLesson.spokenAudioText, 'main-slow', 0.8)
                }
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2
                  className={`w-3.5 h-3.5 ${
                    playingAudioKey === 'main-slow' ? 'animate-pulse text-amber-400' : ''
                  }`}
                />
                <span>0.8x (Pausado)</span>
              </button>
              <button
                onClick={() =>
                  handlePlayVoice(selectedLesson.spokenAudioText, 'main-normal', 1.0)
                }
                className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Volume2
                  className={`w-3.5 h-3.5 ${
                    playingAudioKey === 'main-normal' ? 'animate-pulse text-slate-950' : ''
                  }`}
                />
                <span>1.0x (Nativo)</span>
              </button>
            </div>
          </div>

          {/* Side by side acoustic comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Palabras por separado (Forma escrita)
              </span>
              <p className="text-base font-semibold text-slate-300 italic">
                "{selectedLesson.schoolVersion}"
              </p>
              <p className="text-xs text-slate-500">
                Al leerlo palabra por palabra se pierde la musicalidad del habla diaria.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-amber-950/30 border border-amber-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                  Cómo suena en el mundo real (Conectado)
                </span>
                <span className="font-mono text-xs text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-amber-900/50">
                  {selectedLesson.phoneticGuide}
                </span>
              </div>
              <p className="text-base font-bold text-white">
                "{selectedLesson.nativePronunciation}"
              </p>
              <p className="text-xs text-slate-400">
                Un solo impulso sonoro continuo con ritmo acentual.
              </p>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-900/60 flex items-start gap-3">
            <Headphones className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                La Clave Biológica del Sonido
              </span>
              <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
                {selectedLesson.explanation}
              </p>
            </div>
          </div>

          {/* Practice examples grid */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Entrena tu oído con estos ejemplos (prueba escuchar en cámara lenta):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {selectedLesson.examples.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2 hover:border-amber-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Forma escrita: {item.formal}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          handlePlayVoice(
                            item.nativeSpoken,
                            `lesson-ex-${selectedLesson.id}-${idx}-slow`,
                            0.65
                          )
                        }
                        className="text-[10px] text-slate-400 hover:text-amber-300 px-1 py-0.5 rounded bg-slate-900 border border-slate-700 cursor-pointer"
                        title="Escuchar lento (0.65x)"
                      >
                        0.65x
                      </button>
                      <button
                        onClick={() =>
                          handlePlayVoice(
                            item.nativeSpoken,
                            `lesson-ex-${selectedLesson.id}-${idx}`,
                            1.0
                          )
                        }
                        className="text-slate-400 hover:text-white p-1 cursor-pointer"
                        title="Escuchar audio"
                      >
                        <Volume2
                          className={`w-3.5 h-3.5 ${
                            playingAudioKey?.startsWith(
                              `lesson-ex-${selectedLesson.id}-${idx}`
                            )
                              ? 'text-amber-400 animate-pulse'
                              : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white">
                    "{item.nativeSpoken}"
                  </p>
                  <p className="text-xs text-slate-400">{item.translation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
