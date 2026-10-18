// ==============================================================================
// MCQ EXERCISE RENDERER (Single Choice Question)
// Features: Hotkeys [1..4], right-click option elimination strike-out, KaTeX rendering
// ==============================================================================

import React, { useEffect, useState } from 'react';
import katex from 'katex';

export interface McqOption {
  id: string; // e.g. 'A', 'B', 'C', 'D'
  text: string;
}

export interface McqExerciseProps {
  promptLatex: string;
  options: McqOption[];
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  disabled?: boolean;
}

export const McqExercise: React.FC<McqExerciseProps> = ({
  promptLatex,
  options,
  selectedOptionId,
  onSelectOption,
  disabled = false
}) => {
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, boolean>>({});

  // Hotkeys [1..4] listener
  useEffect(() => {
    if (disabled) return undefined;
    const handleKeyDown = (e: KeyboardEvent): void => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= options.length) {
        e.preventDefault();
        onSelectOption(options[num - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, onSelectOption, disabled]);

  const renderLatex = (content: string): string => {
    try {
      return katex.renderToString(content, { throwOnError: false, displayMode: false });
    } catch {
      return content;
    }
  };

  const handleContextMenu = (e: React.MouseEvent, optionId: string): void => {
    e.preventDefault();
    if (disabled) return;
    setEliminatedOptions((prev) => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto select-none">
      {/* Prompt */}
      <div
        className="text-base text-slate-100 font-medium leading-relaxed overflow-x-auto p-4 rounded-2xl bg-slate-900 border border-slate-800"
        dangerouslySetInnerHTML={{ __html: renderLatex(promptLatex) }}
      />

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>Press [1..{options.length}] to select</span>
        <span>Right-click to strike out option</span>
      </div>

      {/* Options List */}
      <div className="flex flex-col gap-3">
        {options.map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id;
          const isEliminated = Boolean(eliminatedOptions[opt.id]);

          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectOption(opt.id)}
              onContextMenu={(e) => handleContextMenu(e, opt.id)}
              className={`
                group relative w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all duration-75
                ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500 shadow-md ring-2 ring-emerald-500/20 text-white border-b-4 border-b-emerald-600'
                    : isEliminated
                    ? 'bg-slate-950/40 border-slate-850 opacity-40 line-through text-slate-500'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-200 border-b-4 border-b-slate-950 active:translate-y-[2px]'
                }
              `}
            >
              <div className="flex items-center gap-3 flex-1 overflow-x-auto">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs border ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {opt.id}
                </span>

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
