// ==============================================================================
// LESSON RUNNER (Duolingo-grade Technical Exercise Shell)
// Features: Supports all 6 technical question formats, error boundary, scratchpad, feedback
// ==============================================================================

import React, { useState } from 'react';
import { ExerciseErrorBoundary } from './ExerciseErrorBoundary';
import { McqExercise } from './exercises/McqExercise';
import { MsqExercise } from './exercises/MsqExercise';
import { NatKeypadExercise } from './exercises/NatKeypadExercise';
import { TokenBuilderExercise } from './exercises/TokenBuilderExercise';
import { MatchMadnessExercise } from './exercises/MatchMadnessExercise';
import { AlgoTracerExercise } from './exercises/AlgoTracerExercise';
import { SnakeProgressBar } from '../../components/ui/SnakeProgressBar';
import { FeedbackDrawer } from '../../components/ui/FeedbackDrawer';
import { ScratchpadOverlay } from '../../components/tools/ScratchpadOverlay';
import { DuoButton } from '../../components/ui/DuoButton';
import { soundEngine } from '../../audio/soundEngine';
import type { Question, SteppingNode, UserStats } from '../../../shared/types';
import { X, Heart, PencilSimple, Trophy } from '@phosphor-icons/react';

export interface LessonRunnerProps {
  node: SteppingNode;
  questions: Question[];
  userStats: UserStats | null;
  onClose: () => void;
  onFinishLesson: (scorePct: number, totalXpEarned: number) => void;
}

export const LessonRunner: React.FC<LessonRunnerProps> = ({
  node,
  questions,
  userStats,
  onClose,
  onFinishLesson
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [heartsRemaining, setHeartsRemaining] = useState(userStats?.hearts ?? 5);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);

  // Per-question interactive states
  const [mcqAnswer, setMcqAnswer] = useState<string | null>(null);
  const [msqAnswers, setMsqAnswers] = useState<string[]>([]);
  const [natAnswer, setNatAnswer] = useState<string>('');
  const [tokenAnswers, setTokenAnswers] = useState<string[]>([]);
  const [algoSequence, setAlgoSequence] = useState<string[]>([]);

  // Feedback Drawer state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);
  const [isSavedToMistakes, setIsSavedToMistakes] = useState(false);

  // Lesson Finished Summary State
  const [isComplete, setIsComplete] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQ = questions[currentIndex] || questions[0];
  const progressPercent = ((currentIndex) / (questions.length || 1)) * 100;

  // Grade current question response
  const handleCheckAnswer = (): void => {
    if (!currentQ) return;
    let correct = false;

    try {
      if (currentQ.question_type === 'MCQ') {
        const expected = JSON.parse(currentQ.correct_answer_json);
        correct = mcqAnswer === expected;
      } else if (currentQ.question_type === 'MSQ') {
        const expected: string[] = JSON.parse(currentQ.correct_answer_json);
        // GATE Zero Partial Credit: exact set matching
        correct =
          msqAnswers.length === expected.length &&
          msqAnswers.every((ans) => expected.includes(ans));
      } else if (currentQ.question_type === 'NAT') {
        const userNum = parseFloat(natAnswer);
        const minVal = currentQ.nat_range_min ?? -Infinity;
        const maxVal = currentQ.nat_range_max ?? Infinity;
        correct = !isNaN(userNum) && userNum >= minVal && userNum <= maxVal;
      } else if (currentQ.question_type === 'TOKEN_BUILD') {
        const expected: string[] = JSON.parse(currentQ.correct_answer_json);
        correct =
          tokenAnswers.length === expected.length &&
          tokenAnswers.every((token, i) => token === expected[i]);
      } else if (currentQ.question_type === 'ALGO_TRACE') {
        const expected: string[] = JSON.parse(currentQ.correct_answer_json);
        correct =
          algoSequence.length === expected.length &&
          algoSequence.every((seq, i) => seq === expected[i]);
      } else {
        // MATCH_PAIRS is self-graded
        correct = true;
      }
    } catch {
      correct = false;
    }

    setIsCurrentCorrect(correct);
    if (correct) {
      setComboCount((c) => c + 1);
      setCorrectCount((c) => c + 1);
    } else {
      setComboCount(0);
      setHeartsRemaining((h) => Math.max(0, h - 1));
    }

    setFeedbackOpen(true);
  };

  const handleContinueAfterFeedback = (): void => {
    setFeedbackOpen(false);
    setIsSavedToMistakes(false);

    // Reset interactive states for next question
    setMcqAnswer(null);
    setMsqAnswers([]);
    setNatAnswer('');
    setTokenAnswers([]);
    setAlgoSequence([]);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Lesson complete!
      setIsComplete(true);
      soundEngine.playLevelComplete();
    }
  };

  if (isComplete) {
    const scorePct = Math.round((correctCount / (questions.length || 1)) * 100);
    const xpEarned = node.total_xp + (scorePct === 100 ? 10 : 0);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8 select-none">
        <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-8 flex flex-col items-center text-center gap-6 shadow-2xl">
          <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Trophy size={54} weight="fill" className="animate-bounce" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-3xl font-black text-white tracking-tight">Lesson Complete!</h2>
            <p className="text-sm text-slate-400">
              You scored {correctCount} of {questions.length} correct ({scorePct}%)
            </p>
          </div>

          <div className="w-full grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-400 uppercase">XP Earned</span>
              <span className="text-2xl font-black text-emerald-400">+{xpEarned} XP</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Accuracy</span>
              <span className="text-2xl font-black text-amber-400">{scorePct}%</span>
            </div>
          </div>

          <DuoButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => onFinishLesson(scorePct, xpEarned)}
          >
            Claim Rewards &amp; Return
          </DuoButton>
        </div>
      </div>
    );
  }

  // Parse options for current question
  let parsedOptions = [];
  try {
    parsedOptions = currentQ?.options_json ? JSON.parse(currentQ.options_json) : [];
  } catch {
    parsedOptions = [];
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none pb-28">
      {/* Top Exercise Header */}
      <header className="h-16 px-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between gap-6 sticky top-0 z-30">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Exit Lesson"
        >
          <X size={20} weight="bold" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 max-w-xl">
          <SnakeProgressBar progressPercent={progressPercent} comboCount={comboCount} />
        </div>

        {/* Right Tools: Scratchpad & Hearts */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setScratchpadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold border border-slate-700 transition"
            title="Open Scratchpad (Ctrl+D)"
          >
            <PencilSimple size={16} weight="bold" className="text-amber-400" />
            <span className="hidden sm:inline">Scratchpad</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-rose-400 text-xs font-black border border-slate-700">
            <Heart size={16} weight="fill" className="text-rose-500" />
            <span>{heartsRemaining}/5</span>
          </div>
        </div>
      </header>

      {/* Main Exercise Renderer */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 flex flex-col justify-center">
        <ExerciseErrorBoundary onReset={() => setFeedbackOpen(false)}>
          {currentQ?.question_type === 'MCQ' && (
            <McqExercise
              promptLatex={currentQ.prompt_latex}
              options={parsedOptions}
              selectedOptionId={mcqAnswer}
              onSelectOption={(id) => setMcqAnswer(id)}
              disabled={feedbackOpen}
            />
          )}

          {currentQ?.question_type === 'MSQ' && (
            <MsqExercise
              promptLatex={currentQ.prompt_latex}
              options={parsedOptions}
              selectedOptionIds={msqAnswers}
              onToggleOption={(id) => {
                setMsqAnswers((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                );
              }}
              disabled={feedbackOpen}
            />
          )}

          {currentQ?.question_type === 'NAT' && (
            <NatKeypadExercise
              promptLatex={currentQ.prompt_latex}
              value={natAnswer}
              onChange={(v) => setNatAnswer(v)}
              disabled={feedbackOpen}
            />
          )}

          {currentQ?.question_type === 'TOKEN_BUILD' && (
            <TokenBuilderExercise
              promptLatex={currentQ.prompt_latex}
              availableTokens={parsedOptions}
              assembledTokenIds={tokenAnswers}
              onChange={(ids) => setTokenAnswers(ids)}
              disabled={feedbackOpen}
            />
          )}

          {currentQ?.question_type === 'MATCH_PAIRS' && (
            <MatchMadnessExercise
              promptLatex={currentQ.prompt_latex}
              pairs={parsedOptions}
              onComplete={(isPerfect) => {
                setIsCurrentCorrect(isPerfect);
                setFeedbackOpen(true);
              }}
              disabled={feedbackOpen}
            />
          )}

          {currentQ?.question_type === 'ALGO_TRACE' && (
            <AlgoTracerExercise
              promptLatex={currentQ.prompt_latex}
              graphNodes={parsedOptions?.nodes || []}
              graphEdges={parsedOptions?.edges || []}
              clickedSequence={algoSequence}
              onSequenceChange={(seq) => setAlgoSequence(seq)}
              disabled={feedbackOpen}
            />
          )}
        </ExerciseErrorBoundary>
      </main>

      {/* Bottom Check Bar (Visible when drawer is closed) */}
      {!feedbackOpen && (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-slate-900 border-t border-slate-800 px-8 flex items-center justify-between z-20">
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Question #{currentIndex + 1} of {questions.length} • {currentQ?.marks} Mark(s)
          </span>

          <DuoButton
            variant="primary"
            size="lg"
            shortcut="Enter"
            onClick={handleCheckAnswer}
          >
            Check Answer
          </DuoButton>
        </div>
      )}

      {/* Feedback Drawer */}
      <FeedbackDrawer
        isOpen={feedbackOpen}
        isCorrect={isCurrentCorrect}
        xpEarned={currentQ?.marks ? currentQ.marks * 10 : 15}
        comboCount={comboCount}
        correctAnswerText={currentQ?.correct_answer_json}
        solutionLatex={currentQ?.solution_latex}
        onContinue={handleContinueAfterFeedback}
        onAddToMistakes={() => setIsSavedToMistakes(true)}
        isSavedToMistakes={isSavedToMistakes}
      />

      {/* Transparent Scratchpad Overlay */}
      <ScratchpadOverlay
        isOpen={scratchpadOpen}
        onClose={() => setScratchpadOpen(false)}
      />
    </div>
  );
};
