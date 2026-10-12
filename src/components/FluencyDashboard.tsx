import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Zap,
  Award,
  Timer,
  Flame,
  Layers,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Mic,
  Smile,
  Compass,
} from 'lucide-react';
import {
  getFluencyDashboardData,
  subscribeToFluencyUpdates,
  recordGymInteraction,
  FluencyDashboardData,
} from '../services/fluencyTracker';
import { triggerConfetti } from '../utils/confetti';
import { BadgesProfileSection } from './BadgesProfileSection';
import { QuickDailyTip } from './QuickDailyTip';

interface FluencyDashboardProps {
  onNavigateToGym?: () => void;
  onNavigateToSimulator?: () => void;
  onNavigateToTweak?: () => void;
}

export const FluencyDashboard: React.FC<FluencyDashboardProps> = ({
  onNavigateToGym,
  onNavigateToSimulator,
  onNavigateToTweak,
}) => {
  const [data, setData] = useState<FluencyDashboardData>(() => getFluencyDashboardData());
  const [activeChartTab, setActiveChartTab] = useState<'timeline' | 'radar' | 'tools'>('timeline');

  // Keep synced with tool interactions in real time
  useEffect(() => {
    const refresh = () => {
      setData(getFluencyDashboardData());
    };
    refresh();
    const unsubscribe = subscribeToFluencyUpdates(refresh);
    return unsubscribe;
  }, []);

  const handleSimulateBoost = () => {
    // Allows user to test live chart responsiveness immediately
    recordGymInteraction(92, 2.5);
    triggerConfetti({ particleCount: 45, spread: 60 });
  };

  // Activity breakdown data for BarChart
  const toolActivityData = useMemo(() => {
    const s = data.toolStats;
    return [
      {
        tool: 'Simulador Diálogos',
        count: s.roleplayTurns,
        fill: '#F59E0B',
        label: `${s.roleplayTurns} turnos`,
      },
      {
        tool: 'Gimnasio Reflejos',
        count: s.gymAttempts,
        fill: '#10B981',
        label: `${s.gymAttempts} desafíos`,
      },
      {
        tool: 'SpeakTweak',
        count: s.tweakCount,
        fill: '#38BDF8',
        label: `${s.tweakCount} frases coloquiales`,
      },
      {
        tool: 'Audios Escuchados',
        count: s.audioListensCount,
        fill: '#A855F7',
        label: `${s.audioListensCount} reproducciones`,
      },
      {
        tool: 'Módulos Dominados',
        count: s.completedModulesCount,
        fill: '#EC4899',
        label: `${s.completedModulesCount} lecciones`,
      },
    ];
  }, [data.toolStats]);

  return (
    <section id="fluency-dashboard" className="py-14 sm:py-20 bg-[#0B0820] border-b border-[#281F54] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/5">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Métricas de Progreso Real · Sin Exámenes Rígidos</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Progreso Easy: Tu Soltura en Tiempo Real
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Descubre cómo tu mente deja de traducir palabra por palabra y empieza a disparar bloques
              automáticos y fáciles (<span className="text-amber-300 font-semibold italic">easy english</span>) en el <strong className="text-white font-semibold">Simulador de Voz</strong> y el <strong className="text-white font-semibold">Gimnasio de Reflejos</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              type="button"
              onClick={handleSimulateBoost}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400/15 hover:bg-amber-400 hover:text-slate-950 text-amber-300 text-xs font-bold transition-all cursor-pointer border border-amber-400/30 shadow-xs"
              title="Registrar una práctica y celebrar con confeti"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simular Práctica Rápida (+XP)</span>
            </button>
          </div>
        </div>

        {/* Quick Daily Fluency Tip Floating / Featured Card */}
        <div className="relative">
          <QuickDailyTip onExploreTopic={onNavigateToGym || onNavigateToSimulator} />
        </div>

        {/* 4 High-Impact KPI Scorecards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Overall Easy Score */}
          <div className="bg-gradient-to-br from-[#18113E] to-[#110D2C] p-5 sm:p-6 rounded-2xl border border-amber-500/40 shadow-xl space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="uppercase tracking-wider">Nivel Easy Global</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl font-black text-amber-400 tabular-nums">
                {data.currentOverallScore}%
              </span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                +14% vs Inicio
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-white truncate">
                {data.currentLevelBadge}
              </div>
              <p className="text-[11px] text-slate-400">
                Nivel estimado: <span className="text-amber-300 font-semibold">{data.estimatedSpeakingLevel}</span>
              </p>
            </div>
          </div>

          {/* Card 2: Average Reflex Time */}
          <div className="bg-gradient-to-br from-[#141238] to-[#0E0C28] p-5 sm:p-6 rounded-2xl border border-[#2D2363] shadow-xl space-y-3 group hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="uppercase tracking-wider">Tiempo de Reflejo</span>
              <Timer className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl font-black text-emerald-400 tabular-nums">
                {data.averageReflexSec}s
              </span>
              <span className="text-xs font-semibold text-slate-400">
                (Meta: &lt; 5s)
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">
                {data.averageReflexSec <= 3.5 ? '⚡ Reflejo Instantáneo' : 'En Zona de Mejora'}
              </div>
              <p className="text-[11px] text-slate-400">
                Mejor marca en el Gym: <span className="text-emerald-300 font-semibold">{data.toolStats.gymBestScore}%</span>
              </p>
            </div>
          </div>

          {/* Card 3: Total Spoken & Practiced Interactions */}
          <div className="bg-gradient-to-br from-[#141238] to-[#0E0C28] p-5 sm:p-6 rounded-2xl border border-[#2D2363] shadow-xl space-y-3 group hover:border-sky-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="uppercase tracking-wider">Interacciones Prácticas</span>
              <Layers className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl font-black text-sky-400 tabular-nums">
                {data.totalInteractions}
              </span>
              <span className="text-xs font-medium text-slate-400">
                acciones reales
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">
                {data.toolStats.roleplayTurns} turnos de voz conversados
              </div>
              <p className="text-[11px] text-slate-400">
                {data.toolStats.tweakCount} frases transformadas a inglés coloquial
              </p>
            </div>
          </div>

          {/* Card 4: Consistency Streak & Modules Mastered */}
          <div className="bg-gradient-to-br from-[#141238] to-[#0E0C28] p-5 sm:p-6 rounded-2xl border border-[#2D2363] shadow-xl space-y-3 group hover:border-pink-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="uppercase tracking-wider">Racha & Dominio</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl font-black text-rose-400 tabular-nums">
                {data.toolStats.streakDays}
              </span>
              <span className="text-xs font-semibold text-rose-300">
                Días Consecutivos 🔥
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">
                {data.toolStats.completedModulesCount} lecciones completadas
              </div>
              <p className="text-[11px] text-slate-400">
                Constancia diaria = fluidez natural
              </p>
            </div>
          </div>
        </div>

        {/* Profile & Badges Showcase Section */}
        <BadgesProfileSection
          fluencyData={data}
          onNavigateToGym={onNavigateToGym}
          onNavigateToSimulator={onNavigateToSimulator}
          onNavigateToTweak={onNavigateToTweak}
        />

        {/* Interactive Chart Tab Bar */}
        <div className="bg-[#120D30] p-1.5 rounded-2xl border border-[#2C2160] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveChartTab('timeline')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeChartTab === 'timeline'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Evolución de Soltura Easy</span>
            </button>

            <button
              onClick={() => setActiveChartTab('radar')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeChartTab === 'radar'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Radar: 5 Pilares de Entrecasa</span>
            </button>

            <button
              onClick={() => setActiveChartTab('tools')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeChartTab === 'tools'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Actividad por Herramienta</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 pr-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Datos calculados con tus sesiones de práctica</span>
          </div>
        </div>

        {/* Visual Charts Container */}
        <div className="bg-gradient-to-b from-[#130E33] to-[#0D0924] rounded-3xl border border-[#2B205E] p-4 sm:p-7 shadow-2xl space-y-6">
          {/* TAB 1: AreaChart (Time Progression) */}
          {activeChartTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>Curva de Soltura Conversacional vs. Parálisis Tradicional</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    A medida que avanzas en los simuladores, el uso de bloques automáticos sube y la parálisis desaparece.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    Soltura Easy
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                    Espontaneidad
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                    Uso de Chunks
                  </span>
                </div>
              </div>

              <div className="h-72 sm:h-96 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorSpontaneity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorChunks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#251C52" opacity={0.6} />

                    <XAxis
                      dataKey="sessionLabel"
                      stroke="#8E88B4"
                      fontSize={11}
                      tickLine={false}
                      dy={8}
                    />

                    <YAxis
                      domain={[40, 100]}
                      stroke="#8E88B4"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `${val}%`}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#120B2E',
                        borderColor: '#3D2F7E',
                        borderRadius: '16px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                        color: '#F8FAFC',
                        fontSize: '12px',
                        padding: '12px 16px',
                      }}
                      itemStyle={{ padding: '2px 0' }}
                      formatter={(value: any, name: any) => {
                        const labels: Record<string, string> = {
                          overallScore: 'Fluidez Global',
                          spontaneity: 'Espontaneidad',
                          chunksUsage: 'Uso de Chunks',
                          reflexSpeed: 'Velocidad Reflejo (seg)',
                        };
                        return [`${value}%`, labels[name as string] || name];
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="overallScore"
                      name="overallScore"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorOverall)"
                    />

                    <Area
                      type="monotone"
                      dataKey="spontaneity"
                      name="spontaneity"
                      stroke="#10B981"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#colorSpontaneity)"
                    />

                    <Area
                      type="monotone"
                      dataKey="chunksUsage"
                      name="chunksUsage"
                      stroke="#38BDF8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorChunks)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom Insight Footer */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Interpretación del Gráfico: </strong> En tus primeras sesiones la traducción literal dominaba tu pensamiento. Tras interactuar con los bloques de poder y el simulador, tu espontaneidad ha crecido <strong className="text-white">+28 puntos</strong>, logrando que el 90% de tus respuestas salgan con ritmo natural sin pasar por el filtro del español.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: RadarChart (5 Core Pillars) */}
          {activeChartTab === 'radar' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 h-80 sm:h-96 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data.pillars}>
                    <PolarGrid stroke="#2C2162" />
                    <PolarAngleAxis
                      dataKey="pillar"
                      stroke="#C5BFE3"
                      fontSize={11}
                      tickLine={false}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      stroke="#6B6299"
                      fontSize={10}
                      tick={false}
                    />
                    <Radar
                      name="Tu Nivel Actual"
                      dataKey="score"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      fillOpacity={0.4}
                      strokeWidth={2.5}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#120B2E',
                        borderColor: '#3D2F7E',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`${val}/100`, 'Puntuación de Dominio']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <h4 className="font-display text-lg font-bold text-white">
                  Equilibrio de los 5 Pilares de Entrecasa
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  La fluidez de la vida real no es saber 10,000 palabras aisladas, sino mantener un equilibrio
                  armónico entre estos 5 pilares prácticos:
                </p>

                <div className="space-y-2.5">
                  {data.pillars.map((pil, idx) => (
                    <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{pil.pillar}</span>
                        <span className="font-mono font-bold text-amber-400 tabular-nums">{pil.score}%</span>
                      </div>
                      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-700"
                          style={{ width: `${pil.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={onNavigateToGym}
                    className="w-full py-2.5 rounded-xl bg-[#1C1445] hover:bg-[#251B5A] text-amber-300 border border-amber-400/30 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Entrenar Reflejos en el Gym</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BarChart (Tool Activity Breakdown) */}
          {activeChartTab === 'tools' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Distribución de Práctica por Herramienta
                  </h3>
                  <p className="text-xs text-slate-400">
                    Compara cuánto tiempo has dedicado a cada dinámica conversacional de la aplicación.
                  </p>
                </div>
              </div>

              <div className="h-72 sm:h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={toolActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#251C52" opacity={0.6} />
                    <XAxis
                      dataKey="tool"
                      stroke="#8E88B4"
                      fontSize={11}
                      tickLine={false}
                      dy={10}
                      interval={0}
                    />
                    <YAxis
                      stroke="#8E88B4"
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#120B2E',
                        borderColor: '#3D2F7E',
                        borderRadius: '16px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                        padding: '12px 16px',
                      }}
                      formatter={(val: any, _name: any, item: any) => [
                        item?.payload?.label || `${val} veces`,
                        'Prácticas Realizadas',
                      ]}
                    />
                    <Bar
                      dataKey="count"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Action shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={onNavigateToSimulator}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/30 hover:border-amber-400 text-left cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Mic className="w-3.5 h-3.5" />
                    <span>Simulador de Diálogos</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Practica situaciones de viaje, café o visitas.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={onNavigateToGym}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-500/30 hover:border-emerald-400 text-left cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Timer className="w-3.5 h-3.5" />
                    <span>Gimnasio de 5s</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Dispara respuestas en menos de 5 segundos.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={onNavigateToTweak}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-sky-500/30 hover:border-sky-400 text-left cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>SpeakTweak Tool</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Convierte cualquier idea en inglés de entrecasa fluido.
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
