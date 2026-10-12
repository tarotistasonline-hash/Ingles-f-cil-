import React from 'react';
import {
  Compass,
  Sparkles,
  Volume2,
  Mic,
  Zap,
  Layers,
  Headphones,
  BarChart3,
  MessageCircle,
  MessageSquare,
  Lightbulb,
  ArrowRight,
  Coffee,
  CheckCircle2,
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
  category: 'inicio' | 'practica' | 'herramientas' | 'progreso';
  icon: React.ReactNode;
  accentColor: string;
  borderColor: string;
  hoverBg: string;
  features: string[];
}

export const ModuleHub: React.FC<ModuleHubProps> = ({ onSelectModule }) => {
  const hubItems: HubItem[] = [
    {
      id: 'desde-cero',
      title: 'Nivel Cero Absoluto',
      tagline: '🌱 Para quien nunca habló inglés',
      description:
        'Aprende desde lo más básico con pronunciación amigable en español. Sin vergüenza, sin exámenes y a tu propio ritmo.',
      levelBadge: 'Nivel 0 · Principiante',
      levelColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      category: 'inicio',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      accentColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400/70',
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
      category: 'inicio',
      icon: <Coffee className="w-5 h-5 text-amber-400" />,
      accentColor: 'text-amber-400',
      borderColor: 'border-amber-500/30 hover:border-amber-400/70',
      hoverBg: 'hover:bg-amber-950/20',
      features: ['Frases 100% de la vida real', 'Audios nativos', 'Cero términos gramaticales'],
    },
    {
      id: 'simulator',
      title: 'Simulador de Charlas Reales',
      tagline: '🎙️ Conversación interactiva con audio',
      description:
        'Vive situaciones cotidianas (en el aeropuerto, cafetería, hotel) respondiendo con tu voz y escuchando réplicas nativas.',
      levelBadge: 'Interactivo con Voz',
      levelColor: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
      category: 'practica',
      icon: <Mic className="w-5 h-5 text-amber-400" />,
      accentColor: 'text-amber-400',
      borderColor: 'border-amber-400/30 hover:border-amber-400/70',
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
      category: 'practica',
      icon: <Zap className="w-5 h-5 text-rose-400" />,
      accentColor: 'text-rose-400',
      borderColor: 'border-rose-500/30 hover:border-rose-400/70',
      hoverBg: 'hover:bg-rose-950/20',
      features: ['Temporizador de 5 segundos', 'Puntaje de reflejos', 'Asociación directa'],
    },
    {
      id: 'tweak',
      title: 'Habla Coloquial (Transformador)',
      tagline: '🔄 De frase rígida a inglés suelto',
      description:
        'Escribe lo que quieres decir en español o inglés rígido y descúbrelo en la versión natural que usan los nativos hoy.',
      levelBadge: 'Herramienta Rápida',
      levelColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      category: 'herramientas',
      icon: <Volume2 className="w-5 h-5 text-sky-400" />,
      accentColor: 'text-sky-400',
      borderColor: 'border-sky-500/30 hover:border-sky-400/70',
      hoverBg: 'hover:bg-sky-950/20',
      features: ['Conversión instantánea', 'Audio lento y normal', 'Bloque clave destacado'],
    },
    {
      id: 'chunks',
      title: 'Bloques de Poder (Chunks)',
      tagline: '🧩 Los 50 comodines del idioma',
      description:
        'No aprendas palabras sueltas. Memoriza estos 50 bloques fijos y podrás armar el 80% de tus conversaciones sin dudar.',
      levelBadge: 'Atajo de Fluidez',
      levelColor: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
      category: 'herramientas',
      icon: <Layers className="w-5 h-5 text-violet-400" />,
      accentColor: 'text-violet-400',
      borderColor: 'border-violet-500/30 hover:border-violet-400/70',
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
      category: 'herramientas',
      icon: <Headphones className="w-5 h-5 text-cyan-400" />,
      accentColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400/70',
      hoverBg: 'hover:bg-cyan-950/20',
      features: ['Comparación de audio 0.65x vs 1.0x', 'Guía de sonidos unidos', 'Lecciones acústicas'],
    },
    {
      id: 'dashboard',
      title: 'Progreso Easy & Medallas',
      tagline: '📊 Estadísticas visuales y soltura real',
      description:
        'Visualiza cuántos bloques dominas, tu racha de días practicando y tus medallas ganadas con gráficos claros y sin estrés.',
      levelBadge: 'Progreso & Hábitos',
      levelColor: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
      category: 'progreso',
      icon: <BarChart3 className="w-5 h-5 text-amber-400" />,
      accentColor: 'text-amber-400',
      borderColor: 'border-amber-400/30 hover:border-amber-400/70',
      hoverBg: 'hover:bg-amber-950/20',
      features: ['Tu nivel Easy en vivo', 'Racha de días activos', 'Medallas ganadas'],
    },
    {
      id: 'coach',
      title: 'Pregúntale a Leo',
      tagline: '💬 Tu coach bilingüe paciente',
      description:
        '¿Tienes una duda de cómo se dice algo o te trabas con un sonido? Pregúntale en español y te responderá con calidez.',
      levelBadge: 'Asesoría 24/7',
      levelColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      category: 'progreso',
      icon: <MessageCircle className="w-5 h-5 text-indigo-400" />,
      accentColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30 hover:border-indigo-400/70',
      hoverBg: 'hover:bg-indigo-950/20',
      features: ['Respuestas en español', 'Ejemplos cotidianos', 'Cero tecnicismos'],
    },
    {
      id: 'method',
      title: 'Las 4 Claves Sin Reglas',
      tagline: '💡 La filosofía detrás de la app',
      description:
        'Entiende por qué los métodos tradicionales con listas de verbos frustran y por qué el inglés de entrecasa funciona tan rápido.',
      levelBadge: 'Método y Claves',
      levelColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      category: 'progreso',
      icon: <Lightbulb className="w-5 h-5 text-emerald-400" />,
      accentColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400/70',
      hoverBg: 'hover:bg-emerald-950/20',
      features: ['Los 4 pilares de soltura', 'Elimina el miedo al error', 'Cómo fijar memoria'],
    },
    {
      id: 'blog',
      title: 'Blog de la Comunidad',
      tagline: '💬 Opiniones y Sugerencias',
      description:
        'Buzón abierto para que los visitantes propongan nuevas ideas, compartan su experiencia aprendiendo y opinen libremente.',
      levelBadge: 'Feedback & Ideas',
      levelColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      category: 'progreso',
      icon: <MessageSquare className="w-5 h-5 text-rose-400" />,
      accentColor: 'text-rose-400',
      borderColor: 'border-rose-500/30 hover:border-rose-400/70',
      hoverBg: 'hover:bg-rose-950/20',
      features: ['Buzón de sugerencias abierto', 'Opiniones y debates', 'Escucha activa del creador'],
    },
    {
      id: 'kit',
      title: 'Audio-Kit de Bolsillo',
      tagline: '🎧 Pack MP3 + Guía PDF para tu celular ($9 USD)',
      description:
        'Llevate los 120 audios en 2 velocidades y la guía visual de heladera para escuchar sin internet en el auto, caminando o cocinando.',
      levelBadge: '⭐ Destacado · Pack Offline',
      levelColor: 'bg-amber-400/20 text-amber-300 border-amber-400/60 font-extrabold',
      category: 'herramientas',
      icon: <Headphones className="w-5 h-5 text-amber-400 animate-pulse" />,
      accentColor: 'text-amber-400',
      borderColor: 'border-amber-400/60 ring-2 ring-amber-400/30 hover:border-amber-400',
      hoverBg: 'hover:bg-amber-950/30',
      features: ['120 Audios MP3 descargables', 'Guía imprimible en PDF', 'Sin suscripciones mensuales'],
    },
  ];

  return (
    <section className="py-10 sm:py-14 bg-gradient-to-b from-[#0C0A1D] via-[#0E0C24] to-[#0A0819] border-t border-[#251D52]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header of the Learning Hub */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#251D52] pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-amber-400">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Centro de Aprendizaje · Inglés Real</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              ¿Por dónde quieres empezar hoy?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Elige el módulo que mejor se adapte a tu momento. Entra directamente a practicar sin perderte en una página infinita.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#14102E] px-3.5 py-2 rounded-xl border border-[#2D2361] shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Haz clic en cualquier módulo para abrirlo en pantalla enfocada</span>
          </div>
        </div>

        {/* Categories / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hubItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`group bg-[#14102E]/90 border ${item.borderColor} ${item.hoverBg} rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1 relative overflow-hidden`}
            >
              <div className="space-y-4">
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[#0C0A1D] border border-white/10 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${item.levelColor}`}
                  >
                    {item.levelBadge}
                  </span>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                    {item.title}
                  </h3>
                  <p className="text-xs font-medium text-amber-400/90 mt-0.5">
                    {item.tagline}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                {/* Feature bullets */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  {item.features.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-slate-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
                  Abrir este módulo
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors group-hover:translate-x-1 duration-200">
                  <span>Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
