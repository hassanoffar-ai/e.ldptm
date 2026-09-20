import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearAndReset = () => {
    try {
      localStorage.removeItem('eldptm_auth_session');
      localStorage.removeItem('eldptm_student_session');
    } catch {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-2">
              Sistemdə Xəta Baş Verdi
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              Səhifənin yüklənməsi zamanı gözlənilməz uyğunsuzluq yarandı. Səhifəni yeniləyə və ya əsas səhifəyə qayıda bilərsiniz.
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-left">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Xəta detalı:</span>
                <p className="text-xs text-rose-300 font-mono break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-[#5300b7] hover:bg-[#430094] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Səhifəni Yenilə</span>
              </button>

              <button
                onClick={this.handleClearAndReset}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Sessiyanı Sıfırla və Əsas Səhifəyə Keç</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
