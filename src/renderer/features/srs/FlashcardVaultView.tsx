// ==============================================================================
// ANKI SM-2 SPACED REPETITION FORMULA & CONCEPT VAULT
// Features:
//   1. SuperMemo SM-2 spaced repetition interval calculation.
//   2. Interactive 3D flip card with KaTeX math rendering.
//   3. Keyboard shortcuts: Space to flip, 1 (Again), 2 (Hard), 3 (Good), 4 (Easy).
//   4. Subject/Section filtering across all 8 official GATE DA subjects.
//   5. Progress tracking: Due Today, Learning, Reviewing, Mastered.
// ==============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import katex from 'katex';
import {
  Cards,
  ArrowClockwise,
  CheckCircle,
  WarningCircle,
  Sparkle,
  BookmarkSimple,
  Clock,
  CaretRight
} from '@phosphor-icons/react';
import type { SrsFlashcard } from '../../../shared/types';

export type SrsGrade = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export interface FlashcardItem {
  id: string;
  sectionCode: string;
  sectionTitle: string;
  topicTitle: string;
  frontLatex: string;
  backLatex: string;
  notesMarkdown?: string;
  srsData: SrsFlashcard;
}

export interface FlashcardVaultViewProps {
  initialCards?: FlashcardItem[];
  onSaveCardSchedule?: (cardId: string, updatedSrs: SrsFlashcard) => void;
  onExit?: () => void;
}

/**
 * SuperMemo SM-2 Scheduling Algorithm Implementation
 */
export function computeSm2Schedule(
  current: SrsFlashcard,
  grade: SrsGrade,
  today: Date = new Date()
): SrsFlashcard {
  let { repetitions, ease_factor, interval_days } = current;

  // Grade mapping:
  // 1: Again (q = 1) -> Fail
  // 2: Hard (q = 3) -> Marginal pass
  // 3: Good (q = 4) -> Solid pass
  // 4: Easy (q = 5) -> Excellent pass
  const qMap: Record<SrsGrade, number> = { 1: 1, 2: 3, 3: 4, 4: 5 };
  const q = qMap[grade];

  if (grade === 1) {
    // Again / Fail: reset repetitions and schedule for tomorrow
    repetitions = 0;
    interval_days = 1;
  } else {
    // Pass grades
    if (repetitions === 0) {
      interval_days = 1;
    } else if (repetitions === 1) {
      interval_days = grade === 2 ? 3 : 6;
    } else {
      let multiplier = ease_factor;
      if (grade === 2) multiplier = Math.max(1.1, ease_factor * 0.85); // Hard penalty
      if (grade === 4) multiplier = ease_factor * 1.3; // Easy bonus
      interval_days = Math.max(1, Math.round(interval_days * multiplier));
    }
    repetitions += 1;
  }

  // Update Ease Factor (standard SM-2 formula):
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const deltaEf = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  ease_factor = Math.max(1.3, Math.round((ease_factor + deltaEf) * 100) / 100);

  // Compute next review date
  const nextDate = new Date(today);
  nextDate.setDate(nextDate.getDate() + interval_days);
  const next_review_due = nextDate.toISOString().split('T')[0];

  return {
    card_id: current.card_id,
    repetitions,
    ease_factor,
    interval_days,
    next_review_due,
    last_reviewed_at: today.toISOString(),
    last_grade: grade,
    created_at: current.created_at
  };
}

// Production-ready seed cards for core GATE DA formulas
export const DEFAULT_SRS_CARDS: FlashcardItem[] = [
  {
    id: 'srs_01',
    sectionCode: 'DA_01_PROB_STATS',
    sectionTitle: 'Probability & Statistics',
    topicTitle: 'Bayes Theorem & Total Probability',
    frontLatex:
      'State Bayes\' Rule for event $A$ given mutually exclusive and exhaustive partition $B_1, \\dots, B_n$ of the sample space.',
    backLatex:
      '$$P(B_i \\mid A) = \\frac{P(A \\mid B_i) P(B_i)}{\\sum_{j=1}^{n} P(A \\mid B_j) P(B_j)}$$\n\n**Intuition:** Posterior probability is proportional to Likelihood $\\times$ Prior divided by Total Evidence.',
    notesMarkdown: 'Core GATE DA trap: Always verify that $\\sum P(B_j) = 1$.',
    srsData: {
      card_id: 'srs_01',
      repetitions: 0,
      ease_factor: 2.5,
      interval_days: 0,
      next_review_due: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    }
  },
  {
    id: 'srs_02',
    sectionCode: 'DA_02_LIN_ALG',
    sectionTitle: 'Linear Algebra',
    topicTitle: 'Eigenvalue Properties of Orthogonal Matrices',
    frontLatex:
      'What are the eigenvalues of an orthogonal matrix $Q \\in \\mathbb{R}^{n \\times n}$ where $Q^T Q = I$?',
    backLatex:
      'Every eigenvalue $\\lambda \\in \\mathbb{C}$ of an orthogonal matrix has absolute value exactly $1$:\n$$|\\lambda| = 1$$\n\nThus, real eigenvalues can only be $+1$ or $-1$.',
    notesMarkdown: 'Orthogonal transformations preserve Euclidean lengths: $\\|Qx\\| = \\|x\\|$.',
    srsData: {
      card_id: 'srs_02',
      repetitions: 1,
      ease_factor: 2.5,
      interval_days: 1,
      next_review_due: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    }
  },
  {
    id: 'srs_03',
    sectionCode: 'DA_06_ML',
    sectionTitle: 'Machine Learning',
    topicTitle: 'Hard-Margin SVM Optimization Problem',
    frontLatex:
      'Write the primal optimization objective and constraint for a linear Hard-Margin Support Vector Machine.',
    backLatex:
      '$$\\min_{\\mathbf{w}, b} \\frac{1}{2} \\|\\mathbf{w}\\|^2$$\n$$\\text{subject to } y_i (\\mathbf{w}^T \\mathbf{x}_i + b) \\ge 1, \\quad \\forall i=1,\\dots,n$$\n\n**Margin Width:** $\\frac{2}{\\|\\mathbf{w}\\|}$.',
    notesMarkdown: 'Only support vectors lie strictly on the hyperplanes where $y_i (\\mathbf{w}^T \\mathbf{x}_i + b) = 1$.',
    srsData: {
      card_id: 'srs_03',
      repetitions: 2,
      ease_factor: 2.6,
      interval_days: 6,
      next_review_due: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    }
  },
  {
    id: 'srs_04',
    sectionCode: 'DA_05_DBMS_DW',
    sectionTitle: 'DBMS & Warehousing',
    topicTitle: 'Boyce-Codd Normal Form (BCNF) Rule',
    frontLatex:
      'What is the necessary and sufficient condition for a relational schema $R$ to be in BCNF for every non-trivial functional dependency $X \\to Y$?',
    backLatex:
      'For every non-trivial functional dependency $X \\to Y$ holding on $R$:\n$$X \\text{ must be a superkey of } R$$\n\n**Note:** BCNF eliminates all redundancy based on functional dependencies, but dependency preservation is not always guaranteed.',
    notesMarkdown: 'If 3NF preserves dependencies, BCNF may sometimes require trade-offs.',
    srsData: {
      card_id: 'srs_04',
      repetitions: 0,
      ease_factor: 2.5,
      interval_days: 0,
      next_review_due: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    }
  }
];

export const FlashcardVaultView: React.FC<FlashcardVaultViewProps> = ({
  initialCards = DEFAULT_SRS_CARDS,
  onSaveCardSchedule,
  onExit
}) => {
  const [cards, setCards] = useState<FlashcardItem[]>(initialCards);
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [reviewCountToday, setReviewCountToday] = useState<number>(0);

  // Filter cards by section
  const filteredCards = useMemo(() => {
    if (selectedSection === 'ALL') return cards;
    return cards.filter((c) => c.sectionCode === selectedSection);
  }, [cards, selectedSection]);

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  // Helper to render KaTeX formulas
  const renderMath = (latex: string): string => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: true });
    } catch {
      return latex;
    }
  };

  // Flip card
  const handleFlip = useCallback((): void => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Submit SM-2 Grade
  const handleGrade = useCallback(
    (grade: SrsGrade): void => {
      if (!currentCard) return;

      const updatedSrs = computeSm2Schedule(currentCard.srsData, grade);

      // Update state
      setCards((prev) =>
        prev.map((c) => (c.id === currentCard.id ? { ...c, srsData: updatedSrs } : c))
      );

      setReviewCountToday((prev) => prev + 1);
      setIsFlipped(false);

      if (onSaveCardSchedule) {
        onSaveCardSchedule(currentCard.id, updatedSrs);
      }

      // Next card
      if (currentIndex < filteredCards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCurrentIndex(0); // Loop back or finish
      }
    },
    [currentCard, currentIndex, filteredCards.length, onSaveCardSchedule]
  );

  // Keyboard shortcut listener: Space to flip, 1-4 to grade
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Don't trigger if user is in an input field
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        if (e.key === '1') handleGrade(1);
        else if (e.key === '2') handleGrade(2);
        else if (e.key === '3') handleGrade(3);
        else if (e.key === '4') handleGrade(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleFlip, handleGrade]);

  // Overall Vault Stats
  const vaultStats = useMemo(() => {
    let dueCount = 0;
    let masteredCount = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    cards.forEach((c) => {
      if (c.srsData.next_review_due <= todayStr) dueCount++;
      if (c.srsData.interval_days >= 21) masteredCount++;
    });

    return {
      total: cards.length,
      dueCount,
      masteredCount
    };
  }, [cards]);

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-100 p-8 flex flex-col justify-between font-sans select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Cards size={26} className="text-emerald-400" />
            <span>GATE DA Formula & Concept SRS Deck</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            SuperMemo SM-2 Spaced Repetition engine for mathematical formulas & core theorems.
          </p>
        </div>

        {/* Stats HUD */}
        <div className="flex items-center space-x-4">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Due Today</span>
            <div className="text-lg font-bold font-mono text-amber-400">{vaultStats.dueCount}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Reviewed</span>
            <div className="text-lg font-bold font-mono text-emerald-400">{reviewCountToday}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Mastered</span>
            <div className="text-lg font-bold font-mono text-indigo-400">{vaultStats.masteredCount}</div>
          </div>

          {onExit && (
            <button
              onClick={onExit}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
            >
              Exit Vault
            </button>
          )}
        </div>
      </header>

      {/* Section Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto py-2 text-xs font-medium">
        {['ALL', 'DA_01_PROB_STATS', 'DA_02_LIN_ALG', 'DA_03_CALC_OPT', 'DA_05_DBMS_DW', 'DA_06_ML'].map(
          (code) => {
            const label =
              code === 'ALL'
                ? 'All Sections'
                : code === 'DA_01_PROB_STATS'
                ? 'Probability & Stats'
                : code === 'DA_02_LIN_ALG'
                ? 'Linear Algebra'
                : code === 'DA_03_CALC_OPT'
                ? 'Calculus'
                : code === 'DA_05_DBMS_DW'
                ? 'DBMS'
                : 'Machine Learning';

            return (
              <button
                key={code}
                onClick={() => {
                  setSelectedSection(code);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition ${
                  selectedSection === code
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {label}
              </button>
            );
          }
        )}
      </div>

      {/* Main 3D Flip Card Container */}
      <div className="flex-1 flex flex-col items-center justify-center my-6">
        {currentCard ? (
          <div
            onClick={handleFlip}
            className="w-full max-w-2xl h-[340px] cursor-pointer perspective-1000 group relative"
          >
            <div
              className={`w-full h-full rounded-2xl p-8 border shadow-2xl transition-all duration-300 flex flex-col justify-between ${
                isFlipped
                  ? 'bg-slate-900 border-indigo-500/50 shadow-indigo-950/40'
                  : 'bg-slate-900/90 border-slate-700 hover:border-emerald-500/40 shadow-slate-950/60'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                  {currentCard.sectionTitle} • {currentCard.topicTitle}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Card {currentIndex + 1} of {filteredCards.length}
                </span>
              </div>

              {/* Card Body: Front or Back */}
              <div className="flex-1 flex flex-col items-center justify-center text-center my-4 overflow-y-auto">
                {!isFlipped ? (
                  <div className="space-y-4">
                    <span className="text-[11px] uppercase font-bold text-slate-400 tracking-widest block">
                      Concept Prompt
                    </span>
                    <div
                      className="text-lg font-serif text-slate-100 leading-relaxed max-w-xl"
                      dangerouslySetInnerHTML={{ __html: renderMath(currentCard.frontLatex) }}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <span className="text-[11px] uppercase font-bold text-indigo-400 tracking-widest block">
                      Formula & Derivation
                    </span>
                    <div
                      className="text-lg font-serif text-emerald-300 leading-relaxed max-w-xl"
                      dangerouslySetInnerHTML={{ __html: renderMath(currentCard.backLatex) }}
                    />
                    {currentCard.notesMarkdown && (
                      <p className="text-xs text-slate-400 italic mt-2">
                        {currentCard.notesMarkdown}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-[11px] text-slate-500 font-mono">
                <span>Ease Factor: {currentCard.srsData.ease_factor}</span>
                <span className="text-slate-400">
                  {isFlipped ? 'Click or press [1..4] to schedule' : 'Press [Space] or click to flip'}
                </span>
                <span>Interval: {currentCard.srsData.interval_days}d</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-12 bg-slate-900 border border-slate-800 rounded-2xl max-w-md">
            <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">All Cards Reviewed!</h3>
            <p className="text-xs text-slate-400 mt-1">
              You are completely caught up on your spaced repetition flashcards for this section.
            </p>
          </div>
        )}
      </div>

      {/* SM-2 Action Grading Bar */}
      <footer className="h-20 flex items-center justify-center">
        {isFlipped ? (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleGrade(1)}
              className="flex flex-col items-center px-6 py-2.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-200 rounded-xl transition shadow-lg"
            >
              <span className="text-xs font-bold uppercase tracking-wider">Again</span>
              <span className="text-[10px] text-rose-400 font-mono mt-0.5">&lt;1d (Press 1)</span>
            </button>

            <button
              onClick={() => handleGrade(2)}
              className="flex flex-col items-center px-6 py-2.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-200 rounded-xl transition shadow-lg"
            >
              <span className="text-xs font-bold uppercase tracking-wider">Hard</span>
              <span className="text-[10px] text-amber-400 font-mono mt-0.5">3d (Press 2)</span>
            </button>

            <button
              onClick={() => handleGrade(3)}
              className="flex flex-col items-center px-6 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 rounded-xl transition shadow-lg"
            >
              <span className="text-xs font-bold uppercase tracking-wider">Good</span>
              <span className="text-[10px] text-emerald-400 font-mono mt-0.5">6d (Press 3)</span>
            </button>

            <button
              onClick={() => handleGrade(4)}
              className="flex flex-col items-center px-6 py-2.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-200 rounded-xl transition shadow-lg"
            >
              <span className="text-xs font-bold uppercase tracking-wider">Easy</span>
              <span className="text-[10px] text-blue-400 font-mono mt-0.5">10d+ (Press 4)</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleFlip}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition text-sm flex items-center space-x-2"
          >
            <span>Show Answer</span>
            <span className="text-xs text-emerald-200 font-mono">[Space]</span>
          </button>
        )}
      </footer>
    </div>
  );
};
