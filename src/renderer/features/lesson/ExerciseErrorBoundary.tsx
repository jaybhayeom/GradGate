// ==============================================================================
// EXERCISE ERROR BOUNDARY
// Prevents malformed LaTeX, invalid JSON or rendering exceptions from crashing the app.
// ==============================================================================

import React, { Component, type ReactNode } from 'react';
import { WarningCircle, ArrowClockwise } from '@phosphor-icons/react';
import { DuoButton } from '../../components/ui/DuoButton';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ExerciseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[EXERCISE ERROR BOUNDARY CAUGHT]:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="w-full p-8 rounded-3xl bg-slate-900 border border-rose-900/60 shadow-xl flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center">
            <WarningCircle size={32} weight="fill" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg">Exercise Display Error</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              {this.props.fallbackMessage ||
                'A rendering error occurred in this exercise (malformed LaTeX equation or JSON syntax). You can skip or retry.'}
            </p>
            {this.state.error && (
              <pre className="mt-3 p-3 rounded-xl bg-slate-950 text-[11px] font-mono text-rose-300 overflow-x-auto max-w-md text-left">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <DuoButton
            variant="secondary"
            size="sm"
            onClick={this.handleRetry}
            icon={<ArrowClockwise size={16} weight="bold" />}
          >
            Retry Exercise
          </DuoButton>
        </div>
      );
    }

    return this.props.children;
  }
}
