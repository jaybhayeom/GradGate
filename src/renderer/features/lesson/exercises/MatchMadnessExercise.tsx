// ==============================================================================
// MATCH MADNESS EXERCISE (Two-Column Fast-Paced Technical Matching)
// Pairs Distributions <-> Properties, Complexities <-> Algos, etc. with combos
// ==============================================================================

import React, { useState } from 'react';
import katex from 'katex';
import { soundEngine } from '../../../audio/soundEngine';
import { Sparkle, Check } from '@phosphor-icons/react';

export interface MatchPair {
  id: string;
  leftText: string;
  rightText: string;
}

export interface MatchMadnessExerciseProps {
  promptLatex: string;
  pairs: MatchPair[];
  onComplete: (isPerfect: boolean) => void;
  disabled?: boolean;
}

export const MatchMadnessExercise: React.FC<MatchMadnessExerciseProps> = ({
  promptLatex,
  pairs,
  onComplete,
  disabled = false
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongSelection, setWrongSelection] = useState<boolean>(false);
  const [combo, setCombo] = useState<number>(0);

  // Shuffle right column deterministically once
  const [shuffledRight] = useState(() => {
    return [...pairs].sort(() => 0.5 - Math.random());
  });

  const renderLatex = (content: string): string => {
    try {
      return katex.renderToString(content, { throwOnError: false, displayMode: false });
    } catch {
      return content;
    }
  };

  const handleLeftClick = (id: string): void => {
    if (disabled || matchedIds.includes(id)) return;
    soundEngine.playClick();
    setSelectedLeft(id);

    if (selectedRight) {
      checkMatch(id, selectedRight);
    }
  };

  const handleRightClick = (id: string): void => {
    if (disabled || matchedIds.includes(id)) return;
    soundEngine.playClick();
    setSelectedRight(id);

    if (selectedLeft) {
      checkMatch(selectedLeft, id);
    }
  };

  const checkMatch = (leftId: string, rightId: string): void => {
    if (leftId === rightId) {
      // Correct match!
      const nextMatched = [...matchedIds, leftId];
      const nextCombo = combo + 1;
      setMatchedIds(nextMatched);
      setCombo(nextCombo);
      setSelectedLeft(null);
      setSelectedRight(null);
      soundEngine.playCombo(nextCombo);

      if (nextMatched.length === pairs.length) {
        soundEngine.playLevelComplete();
        onComplete(true);
      }
    } else {
      // Wrong match!
      setWrongSelection(true);
      soundEngine.playWrong();
      setCombo(0);
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongSelection(false);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto select-none">
      {/* Header & Combo Counter */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
          Match Madness Drill ({matchedIds.length} / {pairs.length} Matched)
        </span>

        {combo >= 2 && (
          <span className="text-xs font-black text-amber-400 flex items-center gap-1 animate-bounce">
            <Sparkle size={14} weight="fill" />
            <span>{combo}x STREAK!</span>
          </span>
        )}
      </div>

      {/* Prompt */}
      <div
        className="text-base text-slate-100 font-medium leading-relaxed overflow-x-auto p-4 rounded-2xl bg-slate-900 border border-slate-800"
        dangerouslySetInnerHTML={{ __html: renderLatex(promptLatex) }}
      />

      {/* Two Columns Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column (Concepts) */}
        <div className="flex flex-col gap-3">
          {pairs.map((p) => {
            const isMatched = matchedIds.includes(p.id);
            const isSelected = selectedLeft === p.id;

            return (
              <button
                key={`left_${p.id}`}
                type="button"
                disabled={disabled || isMatched}
                onClick={() => handleLeftClick(p.id)}
                className={`
                  p-4 rounded-2xl border text-left text-xs font-bold transition-all duration-75 min-h-[58px] flex items-center justify-between
                  ${
                    isMatched
                      ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400 opacity-50 cursor-default'
                      : isSelected
                      ? wrongSelection
                        ? 'bg-rose-950/60 border-rose-500 text-white animate-shake'
                        : 'bg-emerald-950/60 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200'
                  }
                `}
              >
                <span dangerouslySetInnerHTML={{ __html: renderLatex(p.leftText) }} />
                {isMatched && <Check size={16} weight="bold" className="text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Right Column (Definitions/Properties) */}
        <div className="flex flex-col gap-3">
          {shuffledRight.map((p) => {
            const isMatched = matchedIds.includes(p.id);
            const isSelected = selectedRight === p.id;

            return (
              <button
                key={`right_${p.id}`}
                type="button"
                disabled={disabled || isMatched}
                onClick={() => handleRightClick(p.id)}
                className={`
                  p-4 rounded-2xl border text-left text-xs font-bold transition-all duration-75 min-h-[58px] flex items-center justify-between
                  ${
                    isMatched
                      ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400 opacity-50 cursor-default'
                      : isSelected
                      ? wrongSelection
                        ? 'bg-rose-950/60 border-rose-500 text-white animate-shake'
                        : 'bg-emerald-950/60 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200'
                  }
                `}
              >
                <span dangerouslySetInnerHTML={{ __html: renderLatex(p.rightText) }} />
                {isMatched && <Check size={16} weight="bold" className="text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
