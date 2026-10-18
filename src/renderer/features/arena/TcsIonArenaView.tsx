// ==============================================================================
// AUTHENTIC TCS iON MOCK EXAM ARENA
// Pixel-accurate recreation of the official GATE computer-based test interface.
// Key Features:
//   - Official Section Tabs (General Aptitude [10 Qs, 15 M] & Data Science & AI [55 Qs, 85 M])
//   - Collapsible 5-State Question Palette with official TCS iON shapes and colors:
//       1. NOT_VISITED (Silver/Grey border)
//       2. NOT_ANSWERED (Red inverted shield)
//       3. ANSWERED (Green shield)
//       4. MARKED_FOR_REVIEW (Purple circle - NOT evaluated)
//       5. ANSWERED_AND_MARKED (Purple circle with green check badge - EVALUATED)
//   - Bottom Action Bar: Mark for Review & Next, Clear Response, Save & Next, Submit
//   - Physical keyboard input disabled inside NAT questions (On-screen virtual keypad only)
//   - Integrated GateScientificCalculator modal
//   - Full Question Paper & Instructions Modals
//   - Crash Recovery Banner with instant state restoration
//   - Instant GATE 65-Q evaluation and score breakdown
// ==============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import katex from 'katex';
import {
  Calculator,
  FileText,
  Info,
  CaretLeft,
  CaretRight,
  CheckCircle,
  WarningCircle,
  Clock,
  ArrowClockwise,
  Check,
  X,
  User
} from '@phosphor-icons/react';
import { GateScientificCalculator } from '../../components/tools/GateScientificCalculator';
import {
  ExamSessionGuard,
  QuestionGradingSpec,
  QuestionUserResponse,
  ExamEvaluationResult,
  ActiveSessionRecoveryInfo
} from '../../../main/services/examSessionGuard';
import type { PaletteStatus } from '../../../shared/types';

export interface ArenaQuestion {
  id: string;
  questionNumber: number;
  section: 'GENERAL_APTITUDE' | 'TECHNICAL_DA';
  type: 'MCQ' | 'MSQ' | 'NAT';
  marks: 1.0 | 2.0;
  negativeMarks: 0.0 | -0.3333333333 | -0.6666666667;
  promptLatex: string;
  options?: { id: string; label: string; textLatex: string }[];
  correctAnswerJson: string;
  natRangeMin?: number | null;
  natRangeMax?: number | null;
  solutionLatex?: string;
}

export interface TcsIonArenaViewProps {
  mockPaperTitle?: string;
  candidateName?: string;
  questions: ArenaQuestion[];
  durationMinutes?: number;
  initialRecoverySession?: ActiveSessionRecoveryInfo | null;
  onRecordResponse?: (
    questionId: string,
    questionNumber: number,
    status: PaletteStatus,
    answerJson: string | null,
    timeSpentSeconds: number
  ) => void;
  onTimerTick?: (timeRemainingSeconds: number) => void;
  onSubmitExam?: (result: ExamEvaluationResult) => void;
  onExit?: () => void;
}

export const TcsIonArenaView: React.FC<TcsIonArenaViewProps> = ({
  mockPaperTitle = 'GATE 2026: Data Science & Artificial Intelligence (DA) Full Mock Test 1',
  candidateName = 'GATE Aspirant',
  questions,
  durationMinutes = 180,
  initialRecoverySession = null,
  onRecordResponse,
  onTimerTick,
  onSubmitExam,
  onExit
}) => {
  // Timer state
  const totalAllocatedSeconds = durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    initialRecoverySession?.timeRemainingSeconds ?? totalAllocatedSeconds
  );
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);

  // Active navigation state
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<'GENERAL_APTITUDE' | 'TECHNICAL_DA'>('GENERAL_APTITUDE');
  const [isPaletteExpanded, setIsPaletteExpanded] = useState<boolean>(true);

  // Tools & Modals
  const [isCalcOpen, setIsCalcOpen] = useState<boolean>(false);
  const [isQuestionPaperOpen, setIsQuestionPaperOpen] = useState<boolean>(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<ExamEvaluationResult | null>(null);

  // Recovery Alert Banner
  const [showRecoveryBanner, setShowRecoveryBanner] = useState<boolean>(
    Boolean(initialRecoverySession?.hasActiveSession)
  );

  // Question state stores
  const [paletteStates, setPaletteStates] = useState<Record<string, PaletteStatus>>(() => {
    const map: Record<string, PaletteStatus> = {};
    questions.forEach((q, idx) => {
      // First question is marked as NOT_ANSWERED upon viewing if not previously set
      map[q.id] = idx === 0 ? 'NOT_ANSWERED' : 'NOT_VISITED';
    });
    return map;
  });

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [questionTimeSpent, setQuestionTimeSpent] = useState<Record<string, number>>({});

  const activeQuestion = questions[activeQuestionIndex] || questions[0];

  // Sync active section when question changes
  useEffect(() => {
    if (activeQuestion && activeQuestion.section !== activeSection) {
      setActiveSection(activeQuestion.section);
    }
  }, [activeQuestion, activeSection]);

  // Track per-question time spent
  useEffect(() => {
    if (!isTimerActive || evaluationResult) return;
    const interval = setInterval(() => {
      if (activeQuestion) {
        setQuestionTimeSpent((prev) => ({
          ...prev,
          [activeQuestion.id]: (prev[activeQuestion.id] || 0) + 1
        }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuestion, isTimerActive, evaluationResult]);

  // Exam countdown timer
  useEffect(() => {
    if (!isTimerActive || evaluationResult) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerActive(false);
          handleFinalSubmit();
          return 0;
        }
        const next = prev - 1;
        if (next % 10 === 0 && onTimerTick) {
          onTimerTick(next);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerActive, evaluationResult, onTimerTick]);

  // Format seconds to HH:MM:SS
  const formatTimer = (totalSec: number): string => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Section filtering
  const sectionQuestions = useMemo(() => {
    return questions.filter((q) => q.section === activeSection);
  }, [questions, activeSection]);

  // Section Status Counts
  const getSectionCounts = (section: 'GENERAL_APTITUDE' | 'TECHNICAL_DA') => {
    const secQs = questions.filter((q) => q.section === section);
    let answered = 0;
    let notAnswered = 0;
    let notVisited = 0;
    let markedForReview = 0;
    let answeredAndMarked = 0;

    secQs.forEach((q) => {
      const st = paletteStates[q.id] || 'NOT_VISITED';
      if (st === 'ANSWERED') answered++;
      else if (st === 'NOT_ANSWERED') notAnswered++;
      else if (st === 'NOT_VISITED') notVisited++;
      else if (st === 'MARKED_FOR_REVIEW') markedForReview++;
      else if (st === 'ANSWERED_AND_MARKED') answeredAndMarked++;
    });

    return {
      total: secQs.length,
      answered,
      notAnswered,
      notVisited,
      markedForReview,
      answeredAndMarked
    };
  };

  const gaCounts = useMemo(() => getSectionCounts('GENERAL_APTITUDE'), [questions, paletteStates]);
  const daCounts = useMemo(() => getSectionCounts('TECHNICAL_DA'), [questions, paletteStates]);

  // Helper to render KaTeX safely
  const renderMath = (latex: string, displayMode = false): string => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode });
    } catch {
      return latex;
    }
  };

  // Move to a question and update its visited state
  const navigateToQuestion = (index: number): void => {
    if (index < 0 || index >= questions.length) return;
    const targetQ = questions[index];
    setActiveQuestionIndex(index);

    // If target question is NOT_VISITED, it becomes NOT_ANSWERED upon viewing
    setPaletteStates((prev) => {
      if (prev[targetQ.id] === 'NOT_VISITED') {
        const next = { ...prev, [targetQ.id]: 'NOT_ANSWERED' as PaletteStatus };
        if (onRecordResponse) {
          onRecordResponse(
            targetQ.id,
            targetQ.questionNumber,
            'NOT_ANSWERED',
            selectedAnswers[targetQ.id] || null,
            questionTimeSpent[targetQ.id] || 0
          );
        }
        return next;
      }
      return prev;
    });
  };

  // Option selection handlers
  const handleSelectMcq = (optId: string): void => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: JSON.stringify(optId)
    }));
  };

  const handleToggleMsq = (optId: string): void => {
    const raw = selectedAnswers[activeQuestion.id];
    let currentList: string[] = [];
    try {
      if (raw) currentList = JSON.parse(raw);
    } catch {
      currentList = [];
    }

    let nextList: string[];
    if (currentList.includes(optId)) {
      nextList = currentList.filter((item) => item !== optId);
    } else {
      nextList = [...currentList, optId].sort();
    }

    setSelectedAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: nextList.length > 0 ? JSON.stringify(nextList) : ''
    }));
  };

  // Virtual Keypad for NAT
  const handleNatKeyClick = (key: string): void => {
    const current = selectedAnswers[activeQuestion.id]
      ? JSON.parse(selectedAnswers[activeQuestion.id])
      : '';
    let next = current;

    if (key === 'CLEAR') {
      next = '';
    } else if (key === 'BACKSPACE') {
      next = current.slice(0, -1);
    } else if (key === '.') {
      if (!current.includes('.')) next = current + '.';
    } else if (key === '-') {
      if (current.startsWith('-')) next = current.substring(1);
      else next = '-' + current;
    } else {
      next = current + key;
    }

    setSelectedAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: next ? JSON.stringify(next) : ''
    }));
  };

  // Action Buttons
  const handleSaveAndNext = (): void => {
    const hasAnswer = Boolean(selectedAnswers[activeQuestion.id]);
    const nextStatus: PaletteStatus = hasAnswer ? 'ANSWERED' : 'NOT_ANSWERED';

    setPaletteStates((prev) => ({ ...prev, [activeQuestion.id]: nextStatus }));

    if (onRecordResponse) {
      onRecordResponse(
        activeQuestion.id,
        activeQuestion.questionNumber,
        nextStatus,
        selectedAnswers[activeQuestion.id] || null,
        questionTimeSpent[activeQuestion.id] || 0
      );
    }

    if (activeQuestionIndex < questions.length - 1) {
      navigateToQuestion(activeQuestionIndex + 1);
    }
  };

  const handleMarkForReviewAndNext = (): void => {
    const hasAnswer = Boolean(selectedAnswers[activeQuestion.id]);
    // GATE Rule: If student has answered AND marked for review, it is ANSWERED_AND_MARKED (evaluated)
    // If student has NOT answered and marked for review, it is MARKED_FOR_REVIEW (NOT evaluated)
    const nextStatus: PaletteStatus = hasAnswer ? 'ANSWERED_AND_MARKED' : 'MARKED_FOR_REVIEW';

    setPaletteStates((prev) => ({ ...prev, [activeQuestion.id]: nextStatus }));

    if (onRecordResponse) {
      onRecordResponse(
        activeQuestion.id,
        activeQuestion.questionNumber,
        nextStatus,
        selectedAnswers[activeQuestion.id] || null,
        questionTimeSpent[activeQuestion.id] || 0
      );
    }

    if (activeQuestionIndex < questions.length - 1) {
      navigateToQuestion(activeQuestionIndex + 1);
    }
  };

  const handleClearResponse = (): void => {
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[activeQuestion.id];
      return next;
    });

    setPaletteStates((prev) => ({
      ...prev,
      [activeQuestion.id]: 'NOT_ANSWERED'
    }));

    if (onRecordResponse) {
      onRecordResponse(
        activeQuestion.id,
        activeQuestion.questionNumber,
        'NOT_ANSWERED',
        null,
        questionTimeSpent[activeQuestion.id] || 0
      );
    }
  };

  // Submission & Evaluation
  const handleFinalSubmit = useCallback((): void => {
    setIsSubmitConfirmOpen(false);
    setIsTimerActive(false);

    // Build specs & responses for ExamSessionGuard
    const specs: QuestionGradingSpec[] = questions.map((q) => ({
      questionId: q.id,
      sectionCategory: q.section,
      questionType: q.type,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      correctAnswerJson: q.correctAnswerJson,
      natRangeMin: q.natRangeMin,
      natRangeMax: q.natRangeMax
    }));

    const responses: QuestionUserResponse[] = questions.map((q) => ({
      questionId: q.id,
      paletteStatus: paletteStates[q.id] || 'NOT_VISITED',
      selectedAnswerJson: selectedAnswers[q.id] || null,
      timeSpentSeconds: questionTimeSpent[q.id] || 0
    }));

    const result = ExamSessionGuard.evaluateExam('mock_submission_' + Date.now(), specs, responses);
    setEvaluationResult(result);

    if (onSubmitExam) {
      onSubmitExam(result);
    }
  }, [questions, paletteStates, selectedAnswers, questionTimeSpent, onSubmitExam]);

  // Render official TCS iON shape for a status
  const renderPaletteIcon = (status: PaletteStatus, number: number, isActive: boolean) => {
    const baseClass = `flex items-center justify-center font-bold text-xs cursor-pointer select-none transition-transform duration-100 ${
      isActive ? 'ring-2 ring-blue-500 scale-105 z-10' : ''
    }`;

    switch (status) {
      case 'ANSWERED':
        // Green shield / polygon
        return (
          <div
            className={`${baseClass} w-9 h-9 bg-emerald-600 text-white rounded-t-lg rounded-b-sm shadow`}
            title={`Q${number}: Answered`}
          >
            {number}
          </div>
        );
      case 'NOT_ANSWERED':
        // Red inverted shield
        return (
          <div
            className={`${baseClass} w-9 h-9 bg-red-600 text-white rounded-b-lg rounded-t-sm shadow`}
            title={`Q${number}: Not Answered`}
          >
            {number}
          </div>
        );
      case 'MARKED_FOR_REVIEW':
        // Purple circle (NOT evaluated)
        return (
          <div
            className={`${baseClass} w-9 h-9 bg-purple-600 text-white rounded-full shadow`}
            title={`Q${number}: Marked for Review (Will NOT be evaluated)`}
          >
            {number}
          </div>
        );
      case 'ANSWERED_AND_MARKED':
        // Purple circle with green check badge (EVALUATED per GATE rules)
        return (
          <div
            className={`${baseClass} relative w-9 h-9 bg-purple-600 text-white rounded-full shadow`}
            title={`Q${number}: Answered & Marked for Review (WILL BE EVALUATED for marks)`}
          >
            {number}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border border-white rounded-full flex items-center justify-center text-[9px] text-white">
              ✓
            </span>
          </div>
        );
      case 'NOT_VISITED':
      default:
        // Silver / Grey square border
        return (
          <div
            className={`${baseClass} w-9 h-9 bg-slate-100 border border-slate-400 text-slate-800 rounded-sm hover:bg-slate-200`}
            title={`Q${number}: Not Visited`}
          >
            {number}
          </div>
        );
    }
  };

  // If score report is ready, show comprehensive Result View
  if (evaluationResult) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 p-6 flex flex-col items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-xl shadow-xl border border-slate-300 overflow-hidden">
          {/* Header */}
          <div className="bg-[#1A2634] text-white p-6 border-b border-slate-700">
            <h1 className="text-2xl font-bold tracking-tight">GATE DA Exam Result & Performance Summary</h1>
            <p className="text-slate-400 text-sm mt-1">{mockPaperTitle}</p>
          </div>

          {/* Marks Scorecards */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">Total Score</span>
                <div className="text-3xl font-extrabold text-emerald-600 mt-1">
                  {evaluationResult.totalMarks} / 100
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-xs uppercase font-bold text-blue-800 tracking-wider">General Aptitude</span>
                <div className="text-3xl font-extrabold text-blue-600 mt-1">
                  {evaluationResult.marksGeneralAptitude} / 15
                </div>
              </div>
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <span className="text-xs uppercase font-bold text-indigo-800 tracking-wider">Technical DA</span>
                <div className="text-3xl font-extrabold text-indigo-600 mt-1">
                  {evaluationResult.marksTechnicalDa} / 85
                </div>
              </div>
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                <span className="text-xs uppercase font-bold text-rose-800 tracking-wider">Negative Deductions</span>
                <div className="text-3xl font-extrabold text-rose-600 mt-1">
                  -{evaluationResult.negativeMarksDeducted}
                </div>
              </div>
            </div>

            {/* Counts Breakdown */}
            <div className="grid grid-cols-4 gap-4 text-center text-sm font-semibold">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500">Correct Questions</span>
                <div className="text-xl font-bold text-emerald-600">{evaluationResult.correctCount}</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500">Incorrect Questions</span>
                <div className="text-xl font-bold text-rose-600">{evaluationResult.incorrectCount}</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500">Unattempted</span>
                <div className="text-xl font-bold text-slate-600">{evaluationResult.unattemptedCount}</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                <span className="text-purple-700">Answered & Marked (Evaluated)</span>
                <div className="text-xl font-bold text-purple-700">
                  {evaluationResult.answeredAndMarkedEvaluatedCount}
                </div>
              </div>
            </div>

            {/* Official Marking Rule Notice */}
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded text-xs text-amber-900 leading-relaxed">
              <strong>Official GATE Evaluation Rule Verified:</strong> As per GATE organizing institute guidelines, all
              questions in status <em>Answered</em> and <em>Answered & Marked for Review</em> were evaluated for marks.
              Questions marked for review without an answer were safely discarded. Exact negative marks (-1/3 for 1-mark
              MCQ and -2/3 for 2-mark MCQ) were applied with zero negative marks on MSQ and NAT.
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              {onExit && (
                <button
                  onClick={onExit}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg shadow transition"
                >
                  Return to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F4F6F9] text-slate-800 font-sans select-none overflow-hidden">
      {/* Crash Recovery Notification Banner */}
      {showRecoveryBanner && initialRecoverySession && (
        <div className="bg-amber-500 text-slate-900 px-4 py-2 flex items-center justify-between text-xs font-bold border-b border-amber-600">
          <div className="flex items-center space-x-2">
            <WarningCircle size={18} weight="fill" />
            <span>
              Resume Unfinished Mock Exam at {formatTimer(initialRecoverySession.timeRemainingSeconds || 0)} Remaining
              ({initialRecoverySession.answeredCount} answered of {initialRecoverySession.totalQuestions} questions)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRecoveryBanner(false)}
              className="px-3 py-1 bg-slate-900 text-white rounded hover:bg-slate-800 transition"
            >
              Resume Exam
            </button>
            <button
              onClick={() => {
                setShowRecoveryBanner(false);
                setSecondsRemaining(totalAllocatedSeconds);
              }}
              className="px-2 py-1 bg-amber-600 text-slate-900 rounded hover:bg-amber-700 transition"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

      {/* TCS iON Official Header */}
      <header className="h-14 bg-[#1E3A5F] text-white flex items-center justify-between px-4 shadow-md border-b-2 border-amber-500 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-sm tracking-wide uppercase">{mockPaperTitle}</span>
        </div>

        {/* Top Header Tools & Timer */}
        <div className="flex items-center space-x-4">
          {/* Question Paper & Instructions Modals */}
          <button
            onClick={() => setIsQuestionPaperOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-[#2B4E7A] hover:bg-[#345D91] rounded border border-blue-400/40 text-blue-100 transition"
          >
            <FileText size={14} />
            <span>Question Paper</span>
          </button>

          <button
            onClick={() => setIsInstructionsOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-[#2B4E7A] hover:bg-[#345D91] rounded border border-blue-400/40 text-blue-100 transition"
          >
            <Info size={14} />
            <span>Instructions</span>
          </button>

          {/* Calculator Trigger */}
          <button
            onClick={() => setIsCalcOpen(!isCalcOpen)}
            className={`flex items-center space-x-1 px-2.5 py-1 text-xs rounded border transition ${
              isCalcOpen
                ? 'bg-amber-600 text-white border-amber-400'
                : 'bg-[#2B4E7A] hover:bg-[#345D91] text-blue-100 border-blue-400/40'
            }`}
          >
            <Calculator size={14} />
            <span>Calculator</span>
          </button>

          {/* Countdown Timer */}
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded border font-mono font-bold text-sm ${
              secondsRemaining < 300
                ? 'bg-rose-700 text-white border-rose-400 animate-pulse'
                : secondsRemaining < 900
                ? 'bg-amber-600 text-white border-amber-400'
                : 'bg-[#102238] text-emerald-400 border-slate-600'
            }`}
          >
            <Clock size={16} />
            <span>Time Left: {formatTimer(secondsRemaining)}</span>
          </div>
        </div>
      </header>

      {/* Sections Tab Bar */}
      <nav className="h-10 bg-[#E2E8F0] border-b border-slate-300 flex items-center px-4 space-x-2 flex-shrink-0 text-xs font-semibold">
        <span className="text-slate-500 font-bold uppercase mr-2 text-[11px]">Sections:</span>

        {/* Section 1: General Aptitude */}
        <div className="relative group">
          <button
            onClick={() => {
              setActiveSection('GENERAL_APTITUDE');
              const firstGa = questions.findIndex((q) => q.section === 'GENERAL_APTITUDE');
              if (firstGa !== -1) navigateToQuestion(firstGa);
            }}
            className={`px-4 py-1.5 rounded-t border-t border-x transition flex items-center space-x-1 ${
              activeSection === 'GENERAL_APTITUDE'
                ? 'bg-white border-slate-300 text-blue-800 font-bold border-b-2 border-b-blue-600 shadow-sm'
                : 'bg-slate-200 border-transparent text-slate-600 hover:bg-slate-300'
            }`}
          >
            <span>General Aptitude</span>
            <span className="text-[10px] text-slate-500 ml-1">({gaCounts.answered}/{gaCounts.total})</span>
          </button>

          {/* Hover Status Breakdown Tooltip */}
          <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-30 bg-slate-900 text-white p-3 rounded shadow-xl text-xs w-64">
            <div className="font-bold border-b border-slate-700 pb-1 mb-2 text-blue-300">
              General Aptitude Summary
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Answered:</span> <span className="text-emerald-400 font-bold">{gaCounts.answered}</span>
              </div>
              <div className="flex justify-between">
                <span>Not Answered:</span> <span className="text-red-400 font-bold">{gaCounts.notAnswered}</span>
              </div>
              <div className="flex justify-between">
                <span>Not Visited:</span> <span className="text-slate-400">{gaCounts.notVisited}</span>
              </div>
              <div className="flex justify-between">
                <span>Marked for Review:</span>{' '}
                <span className="text-purple-400 font-bold">{gaCounts.markedForReview}</span>
              </div>
              <div className="flex justify-between">
                <span>Answered & Marked (Evaluated):</span>{' '}
                <span className="text-purple-300 font-bold">{gaCounts.answeredAndMarked}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Data Science & AI */}
        <div className="relative group">
          <button
            onClick={() => {
              setActiveSection('TECHNICAL_DA');
              const firstDa = questions.findIndex((q) => q.section === 'TECHNICAL_DA');
              if (firstDa !== -1) navigateToQuestion(firstDa);
            }}
            className={`px-4 py-1.5 rounded-t border-t border-x transition flex items-center space-x-1 ${
              activeSection === 'TECHNICAL_DA'
                ? 'bg-white border-slate-300 text-blue-800 font-bold border-b-2 border-b-blue-600 shadow-sm'
                : 'bg-slate-200 border-transparent text-slate-600 hover:bg-slate-300'
            }`}
          >
            <span>Data Science & AI</span>
            <span className="text-[10px] text-slate-500 ml-1">({daCounts.answered}/{daCounts.total})</span>
          </button>

          {/* Hover Status Breakdown Tooltip */}
          <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-30 bg-slate-900 text-white p-3 rounded shadow-xl text-xs w-64">
            <div className="font-bold border-b border-slate-700 pb-1 mb-2 text-indigo-300">
              Data Science & AI Summary
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Answered:</span> <span className="text-emerald-400 font-bold">{daCounts.answered}</span>
              </div>
              <div className="flex justify-between">
                <span>Not Answered:</span> <span className="text-red-400 font-bold">{daCounts.notAnswered}</span>
              </div>
              <div className="flex justify-between">
                <span>Not Visited:</span> <span className="text-slate-400">{daCounts.notVisited}</span>
              </div>
              <div className="flex justify-between">
                <span>Marked for Review:</span>{' '}
                <span className="text-purple-400 font-bold">{daCounts.markedForReview}</span>
              </div>
              <div className="flex justify-between">
                <span>Answered & Marked (Evaluated):</span>{' '}
                <span className="text-purple-300 font-bold">{daCounts.answeredAndMarked}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Workspace Body: Question Area (Left) + Question Palette (Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question Content & Option Inputs */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden border-r border-slate-300">
          {/* Question Sub-header */}
          <div className="h-10 bg-[#F1F5F9] border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0 text-xs font-semibold text-slate-700">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-slate-900">Question No. {activeQuestion.questionNumber}</span>
              <span className="text-slate-400">|</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">
                {activeQuestion.type === 'MCQ'
                  ? 'Multiple Choice Question (MCQ)'
                  : activeQuestion.type === 'MSQ'
                  ? 'Multiple Select Question (MSQ)'
                  : 'Numerical Answer Type (NAT)'}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-emerald-700">Marks for correct answer: +{activeQuestion.marks.toFixed(1)}</span>
              <span className="text-rose-700">
                Negative Marks: {activeQuestion.negativeMarks === 0 ? '0.00' : activeQuestion.negativeMarks.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Question Body Scrollable Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Prompt LaTeX */}
            <div
              className="text-base text-slate-900 leading-relaxed font-serif"
              dangerouslySetInnerHTML={{ __html: renderMath(activeQuestion.promptLatex, false) }}
            />

            {/* Answer Options Area */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              {/* MCQ Renderer */}
              {activeQuestion.type === 'MCQ' && activeQuestion.options && (
                <div className="space-y-3">
                  {activeQuestion.options.map((opt) => {
                    const isSelected = selectedAnswers[activeQuestion.id] === JSON.stringify(opt.id);
                    return (
                      <label
                        key={opt.id}
                        onClick={() => handleSelectMcq(opt.id)}
                        className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 shadow-sm'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`mcq_${activeQuestion.id}`}
                          checked={isSelected}
                          onChange={() => handleSelectMcq(opt.id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-bold text-sm text-slate-700 w-6">({opt.label})</span>
                        <div
                          className="flex-1 text-sm text-slate-900"
                          dangerouslySetInnerHTML={{ __html: renderMath(opt.textLatex, false) }}
                        />
                      </label>
                    );
                  })}
                </div>
              )}

              {/* MSQ Renderer */}
              {activeQuestion.type === 'MSQ' && activeQuestion.options && (
                <div className="space-y-3">
                  <div className="p-2.5 bg-indigo-50 border-l-4 border-indigo-500 text-xs text-indigo-900 rounded mb-4">
                    <strong>Note:</strong> Multiple options may be correct. No negative marking, but zero partial credit
                    (all correct options must be selected).
                  </div>
                  {activeQuestion.options.map((opt) => {
                    let isSelected = false;
                    try {
                      const list: string[] = JSON.parse(selectedAnswers[activeQuestion.id] || '[]');
                      isSelected = list.includes(opt.id);
                    } catch {
                      isSelected = false;
                    }

                    return (
                      <label
                        key={opt.id}
                        onClick={() => handleToggleMsq(opt.id)}
                        className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 shadow-sm'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleMsq(opt.id)}
                          className="mt-1 h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="font-bold text-sm text-slate-700 w-6">({opt.label})</span>
                        <div
                          className="flex-1 text-sm text-slate-900"
                          dangerouslySetInnerHTML={{ __html: renderMath(opt.textLatex, false) }}
                        />
                      </label>
                    );
                  })}
                </div>
              )}

              {/* NAT Virtual Keypad & Disabled Physical Typing */}
              {activeQuestion.type === 'NAT' && (
                <div className="max-w-md">
                  <div className="p-2.5 bg-amber-50 border-l-4 border-amber-500 text-xs text-amber-900 rounded mb-4">
                    <strong>Official TCS iON Rule:</strong> Physical keyboard entry is disabled for Numerical Answer
                    Type questions. Please click the on-screen keypad to enter your response.
                  </div>

                  {/* Read-only Answer Input */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Your Answer:
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={
                        selectedAnswers[activeQuestion.id]
                          ? JSON.parse(selectedAnswers[activeQuestion.id])
                          : ''
                      }
                      placeholder="Click virtual keypad below..."
                      onKeyDown={(e) => e.preventDefault()}
                      className="w-full text-xl font-mono font-bold px-3 py-2 border-2 border-slate-400 bg-slate-50 rounded text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* On-Screen Virtual Numeric Keypad */}
                  <div className="bg-slate-200 p-3 rounded-lg border border-slate-300 shadow-sm">
                    <div className="grid grid-cols-4 gap-1.5 text-sm font-bold">
                      {['7', '8', '9', 'BACKSPACE'].map((btn) => (
                        <button
                          key={btn}
                          onClick={() => handleNatKeyClick(btn)}
                          className={`py-2.5 rounded transition ${
                            btn === 'BACKSPACE'
                              ? 'bg-rose-600 hover:bg-rose-500 text-white text-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs'
                          }`}
                        >
                          {btn === 'BACKSPACE' ? 'Bksp' : btn}
                        </button>
                      ))}

                      {['4', '5', '6', 'CLEAR'].map((btn) => (
                        <button
                          key={btn}
                          onClick={() => handleNatKeyClick(btn)}
                          className={`py-2.5 rounded transition ${
                            btn === 'CLEAR'
                              ? 'bg-rose-700 hover:bg-rose-600 text-white text-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs'
                          }`}
                        >
                          {btn}
                        </button>
                      ))}

                      {['1', '2', '3', '-'].map((btn) => (
                        <button
                          key={btn}
                          onClick={() => handleNatKeyClick(btn)}
                          className="py-2.5 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs"
                        >
                          {btn}
                        </button>
                      ))}

                      {['0', '.', ''].map((btn, idx) => {
                        if (btn === '') {
                          return <div key={`empty_${idx}`} className="col-span-2" />;
                        }
                        return (
                          <button
                            key={btn}
                            onClick={() => handleNatKeyClick(btn)}
                            className="py-2.5 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs"
                          >
                            {btn}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Bar */}
          <footer className="h-16 bg-[#F8FAFC] border-t border-slate-300 flex items-center justify-between px-6 flex-shrink-0">
            {/* Left Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleMarkForReviewAndNext}
                className="px-4 py-2 bg-white hover:bg-purple-50 text-purple-700 font-semibold border border-purple-300 rounded shadow-xs text-xs transition"
              >
                Mark for Review & Next
              </button>

              <button
                onClick={handleClearResponse}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-300 rounded shadow-xs text-xs transition"
              >
                Clear Response
              </button>
            </div>

            {/* Center Navigation */}
            <div className="flex items-center space-x-2">
              <button
                disabled={activeQuestionIndex === 0}
                onClick={() => navigateToQuestion(activeQuestionIndex - 1)}
                className={`flex items-center space-x-1 px-3 py-2 text-xs font-semibold rounded border transition ${
                  activeQuestionIndex === 0
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <CaretLeft size={14} />
                <span>Previous</span>
              </button>

              <button
                disabled={activeQuestionIndex === questions.length - 1}
                onClick={() => navigateToQuestion(activeQuestionIndex + 1)}
                className={`flex items-center space-x-1 px-3 py-2 text-xs font-semibold rounded border transition ${
                  activeQuestionIndex === questions.length - 1
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <span>Next</span>
                <CaretRight size={14} />
              </button>
            </div>

            {/* Right Action: Save & Next */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveAndNext}
                className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded shadow text-xs transition flex items-center space-x-1"
              >
                <span>Save & Next</span>
                <CaretRight size={14} />
              </button>

              <button
                onClick={() => setIsSubmitConfirmOpen(true)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow text-xs transition uppercase tracking-wide"
              >
                Submit Exam
              </button>
            </div>
          </footer>
        </div>

        {/* Right: Collapsible Official Question Palette */}
        <aside
          className={`bg-[#E8EDF2] border-l border-slate-300 flex flex-col transition-all duration-200 ${
            isPaletteExpanded ? 'w-80' : 'w-10'
          }`}
        >
          {/* Palette Toggle Bar */}
          <div
            onClick={() => setIsPaletteExpanded(!isPaletteExpanded)}
            className="h-10 bg-[#D4DCE5] border-b border-slate-300 flex items-center justify-between px-3 cursor-pointer hover:bg-slate-300 text-xs font-bold text-slate-700 flex-shrink-0"
          >
            {isPaletteExpanded ? (
              <>
                <span>Question Palette</span>
                <CaretRight size={16} />
              </>
            ) : (
              <CaretLeft size={16} className="mx-auto" />
            )}
          </div>

          {isPaletteExpanded && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Candidate Info Profile Card */}
              <div className="p-3 bg-white border-b border-slate-300 flex items-center space-x-3 flex-shrink-0">
                <div className="w-11 h-11 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 border border-slate-300">
                  <User size={24} weight="bold" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">{candidateName}</div>
                  <div className="text-slate-500 font-mono text-[11px]">Roll No: DA2026-88492</div>
                </div>
              </div>

              {/* Official 5-State Legend */}
              <div className="p-3 bg-white border-b border-slate-200 text-[11px] grid grid-cols-2 gap-2 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-slate-100 border border-slate-400 text-slate-800 text-[10px] font-bold rounded-sm flex items-center justify-center">
                    0
                  </div>
                  <span className="text-slate-600">Not Visited</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-red-600 text-white text-[10px] font-bold rounded-b-md rounded-t-xs flex items-center justify-center">
                    0
                  </div>
                  <span className="text-slate-600">Not Answered</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-emerald-600 text-white text-[10px] font-bold rounded-t-md rounded-b-xs flex items-center justify-center">
                    0
                  </div>
                  <span className="text-slate-600">Answered</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    0
                  </div>
                  <span className="text-slate-600">Marked for Review</span>
                </div>

                <div className="flex items-center space-x-2 col-span-2">
                  <div className="relative w-6 h-6 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    0
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full flex items-center justify-center text-[7px] text-white">
                      ✓
                    </span>
                  </div>
                  <span className="text-slate-600 text-[10px]">
                    Answered & Marked (Evaluated)
                  </span>
                </div>
              </div>

              {/* Section Filter Indicator */}
              <div className="px-3 py-2 bg-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between flex-shrink-0">
                <span>{activeSection === 'GENERAL_APTITUDE' ? 'General Aptitude' : 'Data Science & AI'}</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {sectionQuestions.length} Questions
                </span>
              </div>

              {/* Palette Grid Buttons */}
              <div className="flex-1 p-3 overflow-y-auto">
                <div className="grid grid-cols-5 gap-2">
                  {sectionQuestions.map((q) => {
                    const status = paletteStates[q.id] || 'NOT_VISITED';
                    const globalIdx = questions.findIndex((item) => item.id === q.id);
                    const isActive = globalIdx === activeQuestionIndex;

                    return (
                      <div
                        key={q.id}
                        onClick={() => navigateToQuestion(globalIdx)}
                        className="flex justify-center"
                      >
                        {renderPaletteIcon(status, q.questionNumber, isActive)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Floating GATE Scientific Calculator */}
      <GateScientificCalculator isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />

      {/* Question Paper Full-View Modal */}
      {isQuestionPaperOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-[#1E3A5F] text-white flex items-center justify-between">
              <h2 className="font-bold text-base">Full Question Paper View</h2>
              <button
                onClick={() => setIsQuestionPaperOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>
                      Q{q.questionNumber} ({q.section})
                    </span>
                    <span>
                      {q.type} | +{q.marks.toFixed(1)} Marks | Neg: {q.negativeMarks.toFixed(2)}
                    </span>
                  </div>
                  <div
                    className="text-sm text-slate-800"
                    dangerouslySetInnerHTML={{ __html: renderMath(q.promptLatex, false) }}
                  />
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsQuestionPaperOpen(false)}
                className="px-5 py-2 bg-slate-800 text-white rounded font-semibold text-xs"
              >
                Close Question Paper
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {isInstructionsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-[#1E3A5F] text-white flex items-center justify-between">
              <h2 className="font-bold text-base">GATE DA Exam Day Instructions</h2>
              <button
                onClick={() => setIsInstructionsOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
              <h3 className="font-bold text-sm text-slate-900">General Instructions:</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Total duration of the examination is 180 minutes (3 hours).</li>
                <li>The paper consists of 65 questions carrying a total of 100 marks.</li>
                <li>Questions 1 to 10 belong to General Aptitude (GA) carrying 15 marks.</li>
                <li>Questions 11 to 65 belong to Data Science & AI (DA) carrying 85 marks.</li>
                <li>
                  There are three types of questions: Multiple Choice Questions (MCQ), Multiple Select Questions
                  (MSQ), and Numerical Answer Type (NAT).
                </li>
              </ul>

              <h3 className="font-bold text-sm text-slate-900 mt-4">Negative Marking Rules:</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>For 1-mark MCQ questions, 1/3 mark (-0.33) will be deducted for wrong answers.</li>
                <li>For 2-mark MCQ questions, 2/3 mark (-0.67) will be deducted for wrong answers.</li>
                <li>There is NO negative marking for MSQ and NAT questions.</li>
                <li>For MSQ, zero partial credit is awarded. All correct options must be selected.</li>
              </ul>

              <h3 className="font-bold text-sm text-slate-900 mt-4">Official Evaluation Status:</h3>
              <p>
                Only questions in status <strong>Answered</strong> and <strong>Answered & Marked for Review</strong> will
                be considered for evaluation. Questions marked for review without choosing an answer will NOT be
                evaluated.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsInstructionsOpen(false)}
                className="px-5 py-2 bg-slate-800 text-white rounded font-semibold text-xs"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {isSubmitConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#1E3A5F] text-white flex items-center justify-between">
              <h2 className="font-bold text-base">Final Exam Submission Summary</h2>
              <button
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-xs text-slate-600 mb-4">
                Please review your answer status before submitting. Once submitted, you cannot modify your answers.
              </p>

              {/* Status Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Section</th>
                      <th className="p-2.5 text-center">Answered</th>
                      <th className="p-2.5 text-center">Not Answered</th>
                      <th className="p-2.5 text-center">Marked Review</th>
                      <th className="p-2.5 text-center">Answered & Marked</th>
                      <th className="p-2.5 text-center">Not Visited</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    <tr>
                      <td className="p-2.5 font-semibold">General Aptitude</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">{gaCounts.answered}</td>
                      <td className="p-2.5 text-center text-red-600">{gaCounts.notAnswered}</td>
                      <td className="p-2.5 text-center text-purple-600">{gaCounts.markedForReview}</td>
                      <td className="p-2.5 text-center text-purple-700 font-bold">{gaCounts.answeredAndMarked}</td>
                      <td className="p-2.5 text-center text-slate-500">{gaCounts.notVisited}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Data Science & AI</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">{daCounts.answered}</td>
                      <td className="p-2.5 text-center text-red-600">{daCounts.notAnswered}</td>
                      <td className="p-2.5 text-center text-purple-600">{daCounts.markedForReview}</td>
                      <td className="p-2.5 text-center text-purple-700 font-bold">{daCounts.answeredAndMarked}</td>
                      <td className="p-2.5 text-center text-slate-500">{daCounts.notVisited}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsSubmitConfirmOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-semibold text-xs"
                >
                  Return to Test
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs shadow transition"
                >
                  Yes, Submit Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
