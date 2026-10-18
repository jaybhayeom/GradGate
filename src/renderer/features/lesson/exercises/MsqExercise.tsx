// ==============================================================================
// MSQ EXERCISE RENDERER (Multi-Select Question)
// Enforces official GATE zero-partial-credit grading: all correct options must be selected.
// ==============================================================================

import React, { useEffect } from 'react';
import katex from 'katex';
import { Check } from '@phosphor-icons/react';

export interface MsqOption {
  id: string; // 'A', 'B', 'C', 'D'
  text: string;
}

export interface MsqExerciseProps {
  promptLatex: string;
  options: MsqOption[];
  selectedOptionIds: string[];
  onToggleOption: (optionId: string) => void;
  disabled?: boolean;
}

export const MsqExercise: React.FC<MsqExerciseProps> = ({
  promptLatex,
  options,
  selectedOptionIds,
  onToggleOption,
  disabled = false
}) => {
  useEffect(() => {
    if (disabled) return undefined;
    const handleKeyDown = (e: KeyboardEvent): void => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= options.length) {
        e.preventDefault();
        onToggleOption(options[num - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, onToggleOption, disabled]);

  const renderLatex = (content: string): string => {
    try {
      return katex.renderToString(content, { throwOnError: false, displayMode: false });
    } catch {
      return content;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
          GATE MSQ — Multi-Select (Zero Partial Credit)
        </span>
        <span className="text-[11px] text-slate-400 font-mono">Press [1..{options.length}] to toggle</span>
      </div>

      {/* Prompt */}
      <div
        className="text-base text-slate-100 font-medium leading-relaxed overflow-x-auto p-4 rounded-2xl bg-slate-900 border border-slate-800"
        dangerouslySetInnerHTML={{ __html: renderLatex(promptLatex) }}
      />

      {/* Checkbox Options */}
      <div className="flex flex-col gap-3">
        {options.map((opt, idx) => {
          const isSelected = selectedOptionIds.includes(opt.id);

          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onToggleOption(opt.id)}
              className={`
                group relative w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all duration-75
                ${
                  isSelected
                    ? 'bg-blue-950/60 border-blue-500 shadow-md ring-2 ring-blue-500/20 text-white border-b-4 border-b-blue-600'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-200 border-b-4 border-b-slate-950 active:translate-y-[2px]'
                }
              `}
            >
              <div className="flex items-center gap-3.5 flex-1 overflow-x-auto">
                {/* Square Checkbox */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs border transition ${
                    isSelected
                      ? 'bg-blue-500 text-white border-blue-400'
                      : 'bg-slate-800 border-slate-700 text-transparent'
                  }`}
                >
                  <Check size={16} weight="bold" />
                </div>

                <div
                  className="text-sm font-medium leading-normal flex-1"
                  dangerouslySetInnerHTML={{ __html: renderLatex(opt.text) }}
                />
              </div>

              <kbd className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                [{idx + 1}]
              </kbd>
            </button>
          );
        })}
      </div>
    </div>
  );
};
