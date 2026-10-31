import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Volume2,
  Mic,
  Zap,
  Layers,
  Headphones,
  BarChart3,
  MessageSquare,
  Lightbulb,
  ArrowRight,
  Coffee,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Scissors,
  Award,
  Film,
} from 'lucide-react';
import { SkillLevel } from '../types';

export interface ModuleHubProps {
  onSelectModule: (moduleId: string) => void;
  activeLevel?: SkillLevel | 'all';
}

interface HubItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  levelBadge: string;
  levelColor: string;
  icon: React.ReactNode;
  accentColor: string;
  borderColor: string;
  hoverBg: string;
  features: string[];
}

interface HubPanel {
  id: 'fundamentos' | 'practica' | 'herramientas' | 'comunidad' | 'kit';
  title: string;
  shortLabel: string;
  icon: string;
  tagline: string;
  badge: string;
  themeColor: string;
  activeBorder: string;
  activeBg: string;
  items: HubItem[];
}

export const ModuleHub: React.FC<ModuleHubProps> = ({ onSelectModule, activeLevel }) => {
  const [activePanelId, setActivePanelId] = useState<string>('fundamentos');

  const panels: HubPanel[] = [
    {
      id: 'fundamentos',
      title: '🌱 Guías y Fundamentos',
      shortLabel: 'Guías Básicas',
      icon: '🌱',
      tagline: 'Para empezar desde cero y soltarse sin trabas',
      badge: '3 Módulos',
      themeColor: 'text-emerald-400',
      activeBorder: 'border-emerald-400/80 shadow-emerald-950/40',
      activeBg: 'bg-emerald-950/30 text-emerald-300',
      items: [
        {
          id: 'desde-cero',
          title: 'Nivel Cero Absoluto',
          tagline: '🌱 Para quien nunca habló inglés',
          description:
            'Aprende desde lo más básico con pronunciación amigable en español. Sin vergüenza, sin exámenes y a tu propio ritmo.',
          levelBadge: 'Nivel 0 · Principiante',
          levelColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
          accentColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/40 hover:border-emerald-400',
          hoverBg: 'hover:bg-emerald-950/20',
          features: ['Fonética fácil explicada', 'Saludos y supervivencia', 'Audio pausado a 0.65x'],
        },
        {
          id: 'entrecasa',
          title: 'Rincón de Entrecasa',
          tagline: '☕ El inglés de todos los días',
          description:
            'El lenguaje que se habla en pantuflas: cómo pedir un café sin rodeos, saludar a un vecino, comprar o charlar relajado.',
          levelBadge: 'Todos los Niveles',
          levelColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          icon: <Coffee className="w-5 h-5 text-amber-400" />,
          accentColor: 'text-amber-400',
          borderColor: 'border-amber-500/40 hover:border-amber-400',
          hoverBg: 'hover:bg-amber-950/20',
          features: ['Frases 100% de la vida real', 'Audios nativos', 'Cero términos gramaticales'],
        },
        {
          id: 'method',
          title: 'Las 4 Claves Sin Reglas',
          tagline: '💡 La filosofía detrás de la app',
          description:
            'Entiende por qué los métodos tradicionales con listas de verbos frustran y por qué el inglés de entrecasa funciona tan rápido.',
          levelBadge: 'Método y Claves',
          levelColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          icon: <Lightbulb className="w-5 h-5 text-emerald-400" />,
          accentColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/40 hover:border-emerald-400',
          hoverBg: 'hover:bg-emerald-950/20',
          features: ['Los 4 pilares de soltura', 'Elimina el miedo al error', 'Cómo fijar memoria'],
        },
      ],
    },
    {
      id: 'practica',
      title: '🎙️ Práctica y Diálogo en Vivo',
      shortLabel: 'Práctica con Voz',
      icon: '🎙️',
      tagline: 'Simulación interactiva, películas míticas y agilidad mental',
      badge: '3 Módulos',
      themeColor: 'text-amber-400',
      activeBorder: 'border-amber-400/80 shadow-amber-950/40',
      activeBg: 'bg-amber-950/30 text-amber-300',
      items: [
        {
          id: 'cinema',
          title: 'Cine & Películas en Inglés',
          tagline: '🎬 Acostumbra tu oído con películas famosas',
          description:
            'Entrena tu comprensión auditiva con Forrest Gump, El Rey León, Friends, Titanic y más. Incluye subtítulos en español y fonética.',
          levelBadge: '🎬 Subtítulos en Español',
          levelColor: 'bg-red-500/20 text-amber-300 border-amber-400/50 font-bold',
          icon: <Film className="w-5 h-5 text-amber-400" />,
          accentColor: 'text-amber-400',
          borderColor: 'border-amber-400/50 hover:border-amber-400 ring-1 ring-amber-400/30',
          hoverBg: 'hover:bg-amber-950/20',
          features: ['Escenas célebres del cine', 'Subtítulos en español ajustables', 'Audio a 0.65x y 1.0x'],
        },
        {
          id: 'simulator',
          title: 'Simulador de Charlas Reales',
          tagline: '🎙️ Conversación interactiva con audio',
          description:
            'Vive situaciones cotidianas (en el aeropuerto, cafetería, hotel) respondiendo con tu voz y escuchando réplicas nativas.',
          levelBadge: 'Interactivo con Voz',
          levelColor: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
          icon: <Mic className="w-5 h-5 text-amber-400" />,
          accentColor: 'text-amber-400',
          borderColor: 'border-amber-400/40 hover:border-amber-400',
          hoverBg: 'hover:bg-amber-950/20',
          features: ['Múltiples opciones de respuesta', 'Feedback amigable', 'Guía de pronunciación'],
        },
        {
          id: 'gym',
          title: 'Gimnasio de Reflejos en 5s',
          tagline: '⚡ Desactiva la traducción mental',
          description:
            'Un juego de reflejos rápidos: te plantean una situación y tienes 5 segundos para soltar el bloque natural en inglés.',
          levelBadge: 'Agilidad Mental',
          levelColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          icon: <Zap className="w-5 h-5 text-rose-400" />,
          accentColor: 'text-rose-400',
          borderColor: 'border-rose-500/40 hover:border-rose-400',
          hoverBg: 'hover:bg-rose-950/20',
          features: ['Temporizador de 5 segundos', 'Puntaje de reflejos', 'Asociación directa'],
        },
      ],
    },
    {
      id: 'herramientas',
      title: '✂️ Herramientas de Fluidez y Sonido',
      shortLabel: 'Herramientas',
      icon: '✂️',
      tagline: 'Desarmador de frases, bloques fijos y uniones de sonido',
      badge: '3 Módulos',
      themeColor: 'text-sky-400',
      activeBorder: 'border-sky-400/80 shadow-sky-950/40',
      activeBg: 'bg-sky-950/30 text-sky-300',
      items: [
        {
          id: 'tweak',
          title: 'Desarmar Frase (SpeakTweak)',
          tagline: '✂️ De frase rígida a inglés suelto de entrecasa',
          description:
            'Escribe lo que quieres decir en español o inglés rígido y descúbrelo desarmado en la versión natural que usan los nativos hoy.',
          levelBadge: 'Desarmador Instantáneo',
          levelColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
          icon: <Scissors className="w-5 h-5 text-sky-400" />,
          accentColor: 'text-sky-400',
          borderColor: 'border-sky-500/40 hover:border-sky-400',
          hoverBg: 'hover:bg-sky-950/20',
          features: ['Desarme de calcos literales', 'Audio lento (0.65x) y normal', 'Bloque clave destacado'],
        },
        {
          id: 'chunks',
          title: 'Bloques de Poder (Chunks)',
          tagline: '🧩 Los 50 comodines del idioma',
          description:
            'No aprendas palabras sueltas. Memoriza estos 50 bloques fijos y podrás armar el 80% de tus conversaciones sin dudar.',
          levelBadge: 'Atajo de Fluidez',
          levelColor: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
          icon: <Layers className="w-5 h-5 text-violet-400" />,
          accentColor: 'text-violet-400',
          borderColor: 'border-violet-500/40 hover:border-violet-400',
          hoverBg: 'hover:bg-violet-950/20',
          features: ['50 comodines probados', 'Filtros por situación', 'Ejemplos listos para usar'],
        },
        {
          id: 'connected',
          title: 'Laboratorio de Oído Rápido',
          tagline: '🎧 Cómo unen las palabras los nativos',
          description:
            '¿Por qué en las películas parece que hablan todo pegado? Aprende las uniones de sonido que te destraban el oído.',
          levelBadge: 'Entrenamiento Auditivo',
          levelColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          icon: <Headphones className="w-5 h-5 text-cyan-400" />,
          accentColor: 'text-cyan-400',
          borderColor: 'border-cyan-500/40 hover:border-cyan-400',
          hoverBg: 'hover:bg-cyan-950/20',
          features: ['Comparación de audio 0.65x vs 1.0x', 'Guía de sonidos unidos', 'Lecciones acústicas'],
        },
      ],
    },
    {
      id: 'comunidad',
      title: '📈 Dudas, Comunidad y Progreso',
      shortLabel: 'Dudas & Progreso',
      icon: '📈',
      tagline: 'Consultas a la profe, opiniones reales y tus medallas',
      badge: '3 Módulos',
      themeColor: 'text-purple-400',
      activeBorder: 'border-purple-400/80 shadow-purple-950/40',
      activeBg: 'bg-purple-950/30 text-purple-300',
      items: [
        {
          id: 'coach',
          title: 'Preguntarle a la Profe',
          tagline: '👩‍🏫 Tu mentora bilingüe cercana y paciente',
          description:
            '¿Tienes una duda de cómo se dice algo o te trabas con un sonido? Pregúntale a la profe en español y te responderá con calidez, bloques reales y audio.',
          levelBadge: 'Dudas & Asesoría',
          levelColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
          icon: <span className="text-xl">👩‍🏫</span>,
          accentColor: 'text-amber-400',
          borderColor: 'border-amber-400/50 hover:border-amber-400',
          hoverBg: 'hover:bg-amber-950/20',
          features: ['Respuestas con audio y fonética', 'Ejemplos cotidianos', 'Cero vergüenza'],
        },
        {
          id: 'blog',
          title: 'Blog & Opiniones de Alumnos',
          tagline: '💬 Experiencias Reales y Sugerencias',
          description:
            'Lee testimonios de estudiantes que empezaron de cero, comparte tu propia opinión y propón nuevas charlas y bloques para la app.',
          levelBadge: '4.9/5 · Experiencias Reales',
          levelColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 font-bold',
          icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
          accentColor: 'text-emerald-400',
          borderColor: 'border-emerald-400/50 hover:border-emerald-400',
          hoverBg: 'hover:bg-emerald-950/30',
          features: ['Opiniones de estudiantes reales', 'Buzón de sugerencias abierto', 'Comunidad activa de apoyo'],
        },
        {
          id: 'dashboard',
          title: 'Progreso Easy & Medallas',
          tagline: '📊 Estadísticas visuales y soltura real',
          description:
            'Visualiza cuántos bloques dominas, tu racha de días practicando y tus medallas ganadas con gráficos claros y sin estrés.',
          levelBadge: 'Progreso & Hábitos',
          levelColor: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
          icon: <BarChart3 className="w-5 h-5 text-amber-400" />,
          accentColor: 'text-amber-400',
          borderColor: 'border-amber-400/40 hover:border-amber-400',
          hoverBg: 'hover:bg-amber-950/20',
          features: ['Tu nivel Easy en vivo', 'Racha de días activos', 'Medallas ganadas'],
        },
      ],
    },
    {
      id: 'kit',
      title: '🎧 Audio-Kit de Bolsillo',
      shortLabel: 'Audio-Kit Offline',
      icon: '🎧',
      tagline: 'Pack descargable para escuchar sin internet en tu celular',
      badge: '1 Módulo',
      themeColor: 'text-amber-400',
      activeBorder: 'border-amber-400/80 shadow-amber-950/40',
      activeBg: 'bg-amber-950/30 text-amber-300',
      items: [
        {
          id: 'kit',
          title: 'Audio-Kit de Bolsillo',
          tagline: '🎧 Pack MP3 + Guía PDF para tu celular ($9 USD)',
          description:
            'Llevate los 120 audios en 2 velocidades y la guía visual de heladera para escuchar sin internet en el auto, caminando o cocinando.',
          levelBadge: '⭐ Destacado · Pack Offline',
          levelColor: 'bg-amber-400/20 text-amber-300 border-amber-400/60 font-extrabold',
          icon: <Headphones className="w-5 h-5 text-amber-400 animate-pulse" />,
          accentColor: 'text-amber-400',
          borderColor: 'border-amber-400/60 ring-2 ring-amber-400/30 hover:border-amber-400',
          hoverBg: 'hover:bg-amber-950/30',
          features: ['120 Audios MP3 descargables', 'Guía imprimible en PDF', 'Sin suscripciones mensuales'],
        },
      ],
    },
  ];

  const currentPanel = panels.find((p) => p.id === activePanelId) || panels[0];

  return (
    <section id="hub-panels" className="py-8 sm:py-12 bg-gradient-to-b from-[#0C0A1D] via-[#0E0C24] to-[#0A0819] border-t border-[#251D52]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header of the Learning Hub */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-[#251D52] pb-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-amber-400">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Centro de Aprendizaje por Paneles Temáticos</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              ¿Qué te gustaría practicar hoy?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Haz clic en cualquier panel para ver sus módulos relacionados. Sin listas interminables ni scrolls agotadores.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-slate-300 bg-[#14102E] px-3.5 py-1.5 rounded-xl border border-[#2D2361] shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Haz clic en un panel para desplegar sus ítems</span>
          </div>
        </div>

        {/* 1. THEMATIC PANELS SELECTOR BAR (Ultra-compact & switchable) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {panels.map((panel) => {
            const isSelected = panel.id === activePanelId;
            return (
              <button
                key={panel.id}
                onClick={() => setActivePanelId(panel.id)}
                className={`group relative p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 text-left cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? `bg-[#14102E] ${panel.activeBorder} ring-2 ring-amber-400/40 shadow-xl scale-[1.02]`
                    : 'bg-[#0E0B24]/90 border-slate-800/90 hover:border-slate-700 text-slate-400 hover:text-white hover:bg-[#120E2E]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full mb-1">
                  <span className="text-xl sm:text-2xl">{panel.icon}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? panel.activeBg
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {panel.badge}
                  </span>
                </div>

                <div className="w-full">
                  <h3
                    className={`text-xs sm:text-sm font-bold truncate ${
                      isSelected ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {panel.shortLabel}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {panel.tagline}
                  </p>
                </div>

                {/* Active arrow indicator */}
                {isSelected && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-400 rotate-45 rounded-xs" />
                )}
              </button>
            );
          })}
        </div>

        {/* 2. THEMATIC PANEL CONTENT: ONLY RELATED ITEMS APPEAR (Reduces vertical length by 70%) */}
        <div className="pt-2 animate-in fade-in duration-300">
          <div className="bg-[#120D2C]/90 border-2 border-[#2B215E] rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
            {/* Header of Active Panel */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#281F54]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentPanel.icon}</span>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-white">
                    {currentPanel.title}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 font-bold">
                    {currentPanel.items.length} {currentPanel.items.length === 1 ? 'ítem disponible' : 'ítems disponibles'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {currentPanel.tagline}
                </p>
              </div>

              <span className="text-[11px] text-slate-400 bg-slate-950/60 px-3 py-1 rounded-xl border border-slate-800 shrink-0">
                Selecciona cualquier ítem para abrirlo
              </span>
            </div>

            {/* Grid of related items belonging strictly to this panel */}
            <div
              className={`grid gap-4 pt-5 ${
                currentPanel.items.length === 1
                  ? 'grid-cols-1 max-w-xl mx-auto'
                  : currentPanel.items.length === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-3'
              }`}
            >
              {currentPanel.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  className={`group bg-[#0A071E]/95 border ${item.borderColor} ${item.hoverBg} rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-xl hover:shadow-black/60 hover:-translate-y-1 relative`}
                >
                  <div className="space-y-3.5">
                    {/* Top Badge & Icon */}
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-[#14102E] border border-white/10 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${item.levelColor}`}
                      >
                        {item.levelBadge}
                      </span>
                    </div>

                    {/* Title & Tagline */}
                    <div>
                      <h4 className="font-display text-base font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                        <span>{item.title}</span>
                      </h4>
                      <p className="text-xs font-medium text-amber-400/90 mt-0.5">
                        {item.tagline}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Feature Bullets */}
                    <div className="space-y-1 pt-2 border-t border-white/5">
                      {item.features.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          className="flex items-center gap-1.5 text-[11px] text-slate-400 group-hover:text-slate-300"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Open Item Action Button */}
                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
                      Abrir ítem
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors group-hover:translate-x-1 duration-200">
                      <span>Entrar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
