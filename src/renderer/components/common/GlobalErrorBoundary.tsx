// ==============================================================================
// GLOBAL ERROR BOUNDARY FOR GRADGATE
// Catches React render exceptions and prevents blank white/black screens.
// Displays exact component stack trace, actionable recovery options, and reset triggers.
// ==============================================================================

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { WarningCircle, ArrowClockwise, Trash, Copy } from '@phosphor-icons/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[GLOBAL ERROR BOUNDARY CAUGHT ERROR]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleReset = (): void => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore in restricted sandboxes
    }
    window.location.reload();
  };

  private handleCopyError = (): void => {
    const errorDetails = `Error: ${this.state.error?.message}\n\nStack:\n${this.state.error?.stack}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack}`;
    navigator.clipboard.writeText(errorDetails).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-2xl w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <WarningCircle className="w-7 h-7" weight="duotone" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-black text-white tracking-tight">
                  GradGate Encountered an Issue
                </h1>
                <p className="text-sm text-slate-400">
                  A component error was caught safely before crashing the entire desktop application.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="text-red-400 font-bold break-all">
                {this.state.error?.message || 'Unknown runtime error'}
              </div>
              {this.state.error?.stack && (
                <div className="text-slate-500 max-h-48 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed pt-2 border-t border-slate-900">
                  {this.state.error.stack}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition duration-150 shadow-lg shadow-emerald-900/30 cursor-pointer"
              >
                <ArrowClockwise className="w-4 h-4" weight="bold" />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition duration-150 border border-slate-700 cursor-pointer"
              >
                <Trash className="w-4 h-4" />
                <span>Reset Local State & Reload</span>
              </button>

              <button
                type="button"
                onClick={this.handleCopyError}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 font-medium text-xs transition duration-150 border border-slate-800 cursor-pointer ml-auto"
              >
                <Copy className="w-4 h-4" />
                <span>{this.state.copied ? 'Copied to Clipboard!' : 'Copy Error Details'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
