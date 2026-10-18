// ==============================================================================
// FEEDBACK DRAWER (Duolingo-grade Bottom Slide-Up Feedback Sheet)
// Green Celebratory State (XP/Combo) vs Red Diagnostic State (KaTeX + Mistakes Vault)
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DuoButton } from './DuoButton';
import { soundEngine } from '../../audio/soundEngine';
import katex from 'katex';
import { CheckCircle, XCircle, BookmarkSimple, CaretDown, CaretUp } from '@phosphor-icons/react';

export interface FeedbackDrawerProps {
  isOpen: boolean;
  isCorrect: boolean;
  xpEarned?: number;
  comboCount?: number;
  correctAnswerText?: string;
  solutionLatex?: string;
  onContinue: () => void;
  onAddToMistakes?: () => void;
  isSavedToMistakes?: boolean;
}

export const FeedbackDrawer: React.FC<FeedbackDrawerProps> = ({
  isOpen,
  isCorrect,
  xpEarned = 15,
  comboCount = 0,
  correctAnswerText,
  solutionLatex,
  onContinue,
  onAddToMistakes,
  isSavedToMistakes = false
}) => {
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowSolution(false);
      if (isCorrect) {
        if (comboCount >= 3) {
          soundEngine.playCombo(comboCount);
        } else {
          soundEngine.playCorrect();
        }
      } else {
        soundEngine.playWrong();
      }
    }
  }, [isOpen, isCorrect, comboCount]);

  // Keyboard shortcut listener for [Enter] to continue
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onContinue]);

  const renderLatex = (latex: string): string => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: true });
    } catch {
      return latex;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className={`fixed bottom-0 left-0 right-0 z-50 border-t-2 shadow-2xl p-6 select-none ${
            isCorrect
              ? 'bg-slate-900/95 border-emerald-500/80 backdrop-blur-md text-white'
              : 'bg-slate-900/95 border-rose-500/80 backdrop-blur-md text-white'
          }`}
        >
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Status Information */}
            <div className="flex items-start gap-4 flex-1">
              <div className="mt-1">
                {isCorrect ? (
                  <CheckCircle size={40} weight="fill" className="text-emerald-400" />
                ) : (
                  <XCircle size={40} weight="fill" className="text-rose-400" />
                )}
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <h3
                    className={`text-xl font-black tracking-tight ${
                      isCorrect ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isCorrect ? 'Outstanding!' : 'Review Concept'}
                  </h3>
                  {isCorrect && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      +{xpEarned} XP
                    </span>
                  )}
                  {isCorrect && comboCount >= 3 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      🔥 {comboCount} IN A ROW!
                    </span>
                  )}
                </div>

                {!isCorrect && correctAnswerText && (
                  <p className="text-sm text-slate-300">
                    Correct Answer: <strong className="text-white font-mono">{correctAnswerText}</strong>
                  </p>
                )}

                {/* Collapsible Step-by-Step KaTeX Derivation */}
                {!isCorrect && solutionLatex && (
                  <div className="mt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSolution((prev) => !prev)}
                      className="text-xs font-bold text-rose-300 hover:text-rose-200 flex items-center gap-1.5 w-fit"
                    >
                      {showSolution ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
                      {showSolution ? 'Hide Step-by-Step Solution' : 'View Step-by-Step Derivation (KaTeX)'}
                    </button>

                    {showSolution && (
                      <div
                        className="bg-slate-950/80 p-4 rounded-xl border border-rose-900/40 text-sm overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: renderLatex(solutionLatex) }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {!isCorrect && onAddToMistakes && (
                <button
                  type="button"
                  onClick={onAddToMistakes}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-bold border transition flex items-center gap-1.5 ${
                    isSavedToMistakes
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <BookmarkSimple size={16} weight={isSavedToMistakes ? 'fill' : 'regular'} />
                  {isSavedToMistakes ? 'In Mistakes Vault' : 'Save Mistake'}
                </button>
              )}

              <DuoButton
                variant={isCorrect ? 'primary' : 'danger'}
                size="md"
                shortcut="Enter"
                onClick={onContinue}
              >
                Continue
              </DuoButton>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
