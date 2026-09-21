import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
    // Log internal error safely for developers without leaking sensitive secrets
    console.error('[ErrorBoundary] Unhandled UI error caught:', error.message, errorInfo.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#07080d] text-slate-100">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0d101c] border border-white/10 shadow-2xl shadow-purple-950/40 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
              Something went wrong.
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              An unexpected hiccup occurred in the study companion. Don&apos;t worry, your progress and session data remain safe.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-left text-xs font-mono text-rose-300 max-h-36 overflow-auto">
                <p className="font-bold text-rose-200 mb-1">{this.state.error.name}: {this.state.error.message}</p>
                <pre className="text-[10px] text-rose-400/80 whitespace-pre-wrap">{this.state.error.stack?.split('\n').slice(1, 4).join('\n')}</pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try again</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
