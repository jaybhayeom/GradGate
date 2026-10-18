// ==============================================================================
// NAT KEYPAD EXERCISE (Numerical Answer Type)
// Virtual numeric keypad (0-9, ., -, Backspace, Clear) + Range verification
// ==============================================================================

import React, { useEffect } from 'react';
import katex from 'katex';
import { Backspace, Trash } from '@phosphor-icons/react';

export interface NatKeypadExerciseProps {
  promptLatex: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const NatKeypadExercise: React.FC<NatKeypadExerciseProps> = ({
  promptLatex,
  value,
  onChange,
  disabled = false
}) => {
  const handleKeyClick = (key: string): void => {
    if (disabled) return;
    if (key === 'CLEAR') {
      onChange('');
    } else if (key === 'BACKSPACE') {
      onChange(value.slice(0, -1));
    } else if (key === '.') {
      if (!value.includes('.')) {
        onChange(value + '.');
      }
    } else if (key === '-') {
      if (value.startsWith('-')) {
        onChange(value.slice(1));
      } else {
        onChange('-' + value);
      }
    } else {
      // Append number (limit to 12 digits)
      if (value.length < 12) {
        onChange(value + key);
      }
    }
  };

  // Keyboard typing listener
  useEffect(() => {
    if (disabled) return undefined;
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleKeyClick(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleKeyClick('.');
      } else if (e.key === '-') {
        e.preventDefault();
        handleKeyClick('-');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeyClick('BACKSPACE');
      } else if (e.key === 'Delete' || e.key === 'Escape') {
        e.preventDefault();
        handleKeyClick('CLEAR');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, disabled]);

  const renderLatex = (content: string): string => {
    try {
      return katex.renderToString(content, { throwOnError: false, displayMode: false });
    } catch {
      return content;
    }
  };

  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '-', '0', '.'];

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto select-none">
      {/* Prompt */}
      <div
        className="text-base text-slate-100 font-medium leading-relaxed overflow-x-auto p-4 rounded-2xl bg-slate-900 border border-slate-800"
        dangerouslySetInnerHTML={{ __html: renderLatex(promptLatex) }}
      />

      {/* Answer Display Field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Numerical Answer (Rounded to 2 decimal places if required)
        </label>
        <div className="h-14 px-4 rounded-2xl bg-slate-900 border-2 border-slate-700 focus-within:border-emerald-500 flex items-center justify-between shadow-inner">
          <span className="font-mono text-2xl font-black text-white tracking-wider">
            {value || <span className="text-slate-600 font-normal">0.00</span>}
          </span>
          <span className="w-2.5 h-6 bg-emerald-500 animate-pulse rounded-sm" />
        </div>
      </div>

      {/* Virtual Keypad Grid */}
      <div className="grid grid-cols-3 gap-2.5 p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            disabled={disabled}
            onClick={() => handleKeyClick(k)}
            className="h-12 rounded-xl bg-slate-800 hover:bg-slate-750 active:translate-y-[2px] border-b-2 border-slate-950 font-mono font-bold text-lg text-slate-200 transition shadow-sm"
          >
            {k}
          </button>
        ))}

        {/* Backspace & Clear */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKeyClick('BACKSPACE')}
          className="col-span-2 h-12 rounded-xl bg-amber-950/40 hover:bg-amber-950/60 active:translate-y-[2px] border-b-2 border-slate-950 font-bold text-amber-300 text-sm flex items-center justify-center gap-2 border border-amber-800/40 transition shadow-sm"
        >
          <Backspace size={18} weight="bold" />
          <span>Backspace</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKeyClick('CLEAR')}
          className="h-12 rounded-xl bg-rose-950/40 hover:bg-rose-950/60 active:translate-y-[2px] border-b-2 border-slate-950 font-bold text-rose-300 text-sm flex items-center justify-center gap-1 border border-rose-800/40 transition shadow-sm"
        >
          <Trash size={16} weight="bold" />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
};
