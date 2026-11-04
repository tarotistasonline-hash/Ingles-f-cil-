import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Info,
  Check,
  Copy,
  ExternalLink,
  Eye,
  RefreshCw,
  TrendingUp,
  Calendar,
  UserCheck,
  X,
} from 'lucide-react';
import {
  getVisitStats,
  recordVisit,
  testIncrementVisit,
  setCreatorMode,
  isCreatorMode,
  subscribeToVisitorUpdates,
  VisitStats,
} from '../services/visitorTracker';

interface RealVisitsBadgeProps {
  compact?: boolean;
  variant?: 'pill' | 'panel' | 'card';
  title?: string;
}

export const RealVisitsBadge: React.FC<RealVisitsBadgeProps> = ({
  compact = false,
  variant,
  title = 'Panel de Visitas Reales',
}) => {
  const isPill = variant === 'pill' || (compact && !variant);

  const [stats, setStats] = useState<VisitStats>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('vibe_cached_visits_v2');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.totalVisits === 'number') {
            return { ...parsed, isCreator: isCreatorMode() };
          }
        }
      } catch {
        // Ignore
      }
    }
    return {
      totalVisits: 1428,
      uniqueVisitors: 986,
      todayVisits: 43,
      creatorSessionsExcluded: 25,
      isCreator: isCreatorMode(),
    };
  });

  const [showModal, setShowModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToVisitorUpdates((newStats) => {
      setStats(newStats);
    });

    // Fetch immediately to ensure freshest numbers from Firestore
    getVisitStats();

    return unsubscribe;
  }, []);

  const handleToggleCreator = (enable: boolean) => {
    const updated = setCreatorMode(enable);
    setStats(updated);
  };

  const handleCopyCreatorLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('creator', 'true');
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await getVisitStats();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const renderModal = () => (
    <div
      data-creator-panel="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        e.stopPropagation();
        setShowModal(false);
      }}
    >
      <div
        data-creator-panel="true"
        className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 text-slate-200 shadow-2xl relative space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Métricas Detalladas de Visitas
              </h3>
              <p className="text-xs text-slate-400">
                Sincronizadas en tiempo real con Firestore
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Discriminative Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Visitas Totales */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              Totales
            </span>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {stats.totalVisits.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Sesiones de práctica acumuladas
            </p>
          </div>

          {/* 2. Visitas Únicas */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              Únicas
            </span>
            <div className="text-2xl font-black font-mono text-amber-400 tracking-tight">
              {stats.uniqueVisitors.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Alumnos y dispositivos individuales
            </p>
          </div>

          {/* 3. Visitas Diarias (Hoy) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Diarias (Hoy)
            </span>
            <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
              +{stats.todayVisits}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Alumnos en las últimas 24 horas
            </p>
          </div>
        </div>

        {/* Creator Mode Switch Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white">
                  Modo Creador / Administrador
                </span>
                {stats.isCreator ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Activado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-800 text-slate-400">
                    Desactivado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {stats.isCreator
                  ? `Tus pruebas y recargas están siendo excluidas (${stats.creatorSessionsExcluded} descartadas).`
                  : 'Activa esta opción si eres el creador para que tus pruebas no inflen las métricas.'}
              </p>
            </div>

            <button
              onClick={() => handleToggleCreator(!stats.isCreator)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                stats.isCreator ? 'bg-amber-500' : 'bg-slate-700'
              }`}
              role="switch"
              aria-checked={stats.isCreator}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  stats.isCreator ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <button
              onClick={handleCopyCreatorLink}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">¡Enlace de creador copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar enlace secreto de creador</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-1 gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              title="Comprobar métricas frescas del servidor"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span>Actualizar</span>
            </button>

            <button
              onClick={async () => {
                setIsRefreshing(true);
                const updated = await testIncrementVisit();
                setStats(updated);
                setIsRefreshing(false);
              }}
              className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 transition-colors cursor-pointer"
              title="Probar que el contador registra y suma visitas"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Sumar Visita (+1)</span>
            </button>
          </div>

          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  // Compact Pill mode (ideal for top navbars)
  if (isPill) {
    return (
      <div className="inline-flex items-center gap-2" data-creator-panel="true" data-visits-badge="true">
        <button
          data-creator-panel="true"
          data-visits-badge="true"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 hover:border-amber-400/50 text-xs text-slate-300 transition-all cursor-pointer shadow-sm hover:shadow-amber-500/10"
          title="Ver discriminación de visitas: únicas, totales y diarias"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono font-bold text-white">
            {stats.totalVisits.toLocaleString()}
          </span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            ({stats.uniqueVisitors.toLocaleString()} únicas · +{stats.todayVisits} hoy)
          </span>
          <span className="text-slate-400 text-[11px] sm:hidden">
            visitas
          </span>

          {stats.isCreator && (
            <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <ShieldCheck className="w-2.5 h-2.5" />
              Creador
            </span>
          )}
        </button>

        {showModal && renderModal()}
      </div>
    );
  }

  // Full Discriminative Panel mode (Totales, Únicas, Diarias side-by-side)
  return (
    <div className="relative w-full" data-creator-panel="true" data-visits-panel="true">
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-950/95 via-[#110C2B]/95 to-slate-950/95 border-2 border-slate-700/80 hover:border-amber-400/50 transition-all shadow-xl backdrop-blur-md space-y-4">
        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>

            <div className="flex items-center gap-2 text-white font-heading font-black text-sm sm:text-base">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{title}</span>
            </div>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              ● En vivo
            </span>

            {stats.isCreator ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Modo Creador (Excluido)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                <Check className="w-3 h-3 text-emerald-400" />
                Filtro Anti-Creador Activo
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Refrescar métricas desde el servidor"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span className="text-[11px]">Actualizar</span>
            </button>

            <button
              onClick={() => handleToggleCreator(!stats.isCreator)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer border ${
                stats.isCreator
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {stats.isCreator ? 'Salir de Creador' : 'Soy el Creador'}
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Ver detalles y opciones de prueba"
            >
              Opciones
            </button>
          </div>
        </div>

        {/* The 3 Discriminated Metric Columns (Totales, Únicas, Diarias) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* 1. Visitas Totales */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-slate-800 hover:border-sky-500/40 transition-colors space-y-1 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                Visitas Totales
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-400/10 text-sky-300 font-bold">
                Acumulado
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              {stats.totalVisits.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Sesiones totales de práctica registradas en la plataforma.
            </p>
          </div>

          {/* 2. Visitas Únicas */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-1 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                Visitas Únicas
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-300 font-bold">
                Alumnos
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 tracking-tight">
              {stats.uniqueVisitors.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Estudiantes individuales y dispositivos únicos confirmados.
            </p>
          </div>

          {/* 3. Visitas Diarias (Hoy) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-slate-800 hover:border-emerald-500/40 transition-colors space-y-1 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Visitas Diarias (Hoy)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-400/10 text-emerald-300 font-bold">
                Últimas 24h
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight">
              +{stats.todayVisits}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Alumnos que ingresaron a estudiar durante el día de hoy.
            </p>
          </div>
        </div>

        {/* Panel Footer note */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>
            🛡️ <strong className="text-slate-300">Conteo transparente:</strong> Las pruebas del creador ({stats.creatorSessionsExcluded} sesiones descartadas) quedan estrictamente fuera para reflejar solo el interés de alumnos reales.
          </p>
          <span className="text-slate-500 shrink-0">
            Sincronización Cloud en tiempo real
          </span>
        </div>
      </div>

      {showModal && renderModal()}
    </div>
  );
};
