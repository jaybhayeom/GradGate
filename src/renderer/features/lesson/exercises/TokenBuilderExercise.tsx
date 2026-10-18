// ==============================================================================
// TOKEN BUILDER EXERCISE (Duolingo-style Tap-to-Assemble Algorithm/SQL Builder)
// Features: Assembles Python code, SQL queries or math proofs token-by-token
// ==============================================================================

import React from 'react';
import katex from 'katex';
import { soundEngine } from '../../../audio/soundEngine';

export interface TokenItem {
  id: string;
  text: string;
}

export interface TokenBuilderExerciseProps {
  promptLatex: string;
  availableTokens: TokenItem[];
  assembledTokenIds: string[];
  onChange: (assembledIds: string[]) => void;
  disabled?: boolean;
}

export const TokenBuilderExercise: React.FC<TokenBuilderExerciseProps> = ({
  promptLatex,
  availableTokens,
  assembledTokenIds,
  onChange,
  disabled = false
}) => {
  const handleSelectToken = (tokenId: string): void => {
    if (disabled) return;
    soundEngine.playClick();
    onChange([...assembledTokenIds, tokenId]);
  };

  const handleRemoveToken = (indexToRemove: number): void => {
    if (disabled) return;
    soundEngine.playClick();
    const updated = assembledTokenIds.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const renderLatex = (content: string): string => {
    try {
      return katex.renderToString(content, { throwOnError: false, displayMode: false });
    } catch {
      return content;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto select-none">
      {/* Prompt */}
      <div
        className="text-base text-slate-100 font-medium leading-relaxed overflow-x-auto p-4 rounded-2xl bg-slate-900 border border-slate-800"
        dangerouslySetInnerHTML={{ __html: renderLatex(promptLatex) }}
      />

      {/* Assembled Tokens Drop Area */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Assembled Code / Proof Statement
        </span>
        <div className="min-h-[90px] p-4 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 flex flex-wrap items-center gap-2 shadow-inner">
          {assembledTokenIds.length === 0 ? (
            <span className="text-xs text-slate-500 italic">
              Tap tokens below in exact syntactic sequence...
            </span>
          ) : (
            assembledTokenIds.map((tId, idx) => {
              const token = availableTokens.find((t) => t.id === tId);
              if (!token) return null;
              return (
                <button
                  key={`${tId}_${idx}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRemoveToken(idx)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 border-b-2 border-emerald-700 text-slate-950 font-mono font-bold text-xs shadow-sm hover:bg-emerald-400 active:translate-y-[1px] transition"
                >
                  {token.text}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Available Token Bank */}
      <div className="flex flex-col gap-2 pt-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Token Bank
        </span>
        <div className="flex flex-wrap gap-2.5 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          {availableTokens.map((token) => {
            const isUsed = assembledTokenIds.includes(token.id);

            return (
              <button
                key={token.id}
                type="button"
                disabled={disabled || isUsed}
                onClick={() => handleSelectToken(token.id)}
                className={`
                  px-4 py-2 rounded-xl font-mono text-xs font-bold transition shadow-sm
                  ${
                    isUsed
                      ? 'bg-slate-800 border-b-2 border-slate-900 text-slate-600 opacity-40 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-slate-750 active:translate-y-[2px] border-b-3 border-slate-950 text-slate-200 hover:text-white border border-slate-700/80'
                  }
                `}
              >
                {token.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
