import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('vibe_temp_tab');
      window.location.hash = '';
    } catch {
      // ignore
    }
    window.location.reload();
  };

  private handleGoHome = () => {
    try {
      window.location.hash = '';
      this.setState({ hasError: false, error: null });
    } catch {
      // ignore
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0C0A1D] text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#151030] border border-amber-400/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Inglés Fácil y Fluido
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Hubo un inconveniente al cargar esta sección. Puedes volver al inicio o recargar la página para continuar aprendiendo sin problemas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20"
              >
                <RotateCw className="w-4 h-4" />
                <span>Recargar página</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#20184A] hover:bg-[#2C2166] text-white font-bold text-xs border border-[#3E2F80] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-amber-400" />
                <span>Ir al Inicio</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
