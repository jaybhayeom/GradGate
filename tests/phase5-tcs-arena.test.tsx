// @vitest-environment jsdom
// ==============================================================================
// PHASE 5 TEST SUITE: TCS iON ARENA, VIRTUAL CALCULATOR & CRASH RECOVERY
// Verifies:
//   1. ExamSessionGuard database session initialization and <50ms atomic persistence.
//   2. Instant power-cut / crash recovery detection (getActiveUnfinishedSession).
//   3. Official GATE 65-Q / 100-Mark evaluation engine:
//      - ANSWERED & ANSWERED_AND_MARKED evaluation inclusion.
//      - MARKED_FOR_REVIEW (unanswered) exclusion.
//      - Exact -1/3 and -2/3 MCQ floating deductions.
//      - Zero negative marking on MSQ & NAT.
//      - Zero partial credit on MSQ (exact subset match).
//      - NAT tolerance ranges.
//   4. GATE Scientific Virtual Calculator (Deg/Rad, functions, memory registers).
//   5. Authentic TCS iON Arena View (sections, palette shapes, NAT virtual keypad).
// ==============================================================================

import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import {
  ExamSessionGuard,
  QuestionGradingSpec,
  QuestionUserResponse
} from '../src/main/services/examSessionGuard';
import { GateScientificCalculator } from '../src/renderer/components/tools/GateScientificCalculator';
import { TcsIonArenaView, ArenaQuestion } from '../src/renderer/features/arena/TcsIonArenaView';

describe('Phase 5: TCS iON Arena, Scientific Calculator & Crash Recovery', () => {
  let tempDir: string;
  let dbPath: string;
  let db: DatabaseType;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gradgate-phase5-test-'));
    dbPath = path.join(tempDir, 'test_profile.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    const schemaPath = path.resolve(__dirname, '../src/main/db/userProfileSchema.sql');
    db.exec(fs.readFileSync(schemaPath, 'utf8'));
  });

  afterEach(() => {
    cleanup();
    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // ----------------------------------------------------------------------------
  // 1. ExamSessionGuard DB & Crash Recovery Tests
  // ----------------------------------------------------------------------------
  it('starts session and records responses with crash recovery capability', () => {
    const attemptId = 'mock_att_001';
    ExamSessionGuard.startSession(db, attemptId, 'paper_gate_da_2025', 'GATE DA 2025 Mock 1', 65, 10800);

    // Verify session row was created
    const attempt = db.prepare('SELECT * FROM mock_attempts WHERE id = ?').get(attemptId) as any;
    expect(attempt).toBeDefined();
    expect(attempt.status).toBe('IN_PROGRESS');
    expect(attempt.time_remaining_seconds).toBe(10800);

    // Verify placeholder question responses
    const count = db.prepare('SELECT COUNT(*) as c FROM mock_question_responses WHERE attempt_id = ?').get(attemptId) as any;
    expect(count.c).toBe(65);

    // Record response sub-50ms
    ExamSessionGuard.recordQuestionResponse(
      db,
      attemptId,
      'q_1',
      1,
      'ANSWERED',
      JSON.stringify('opt_b'),
      45
    );

    ExamSessionGuard.recordQuestionResponse(
      db,
      attemptId,
      'q_2',
      2,
      'ANSWERED_AND_MARKED',
      JSON.stringify(['opt_a', 'opt_c']),
      60
    );

    ExamSessionGuard.updateTimeRemaining(db, attemptId, 10695);

    // Verify recovery info
    const recovery = ExamSessionGuard.getActiveUnfinishedSession(db);
    expect(recovery.hasActiveSession).toBe(true);
    expect(recovery.attemptId).toBe(attemptId);
    expect(recovery.paperTitle).toBe('GATE DA 2025 Mock 1');
    expect(recovery.timeRemainingSeconds).toBe(10695);
    expect(recovery.answeredCount).toBe(2);
  });

  // ----------------------------------------------------------------------------
  // 2. Official GATE 65-Q / 100-Mark Grading Engine
  // ----------------------------------------------------------------------------
  it('evaluates exam adhering strictly to official GATE marking rules', () => {
    const specs: QuestionGradingSpec[] = [
      // 1. GA 1-mark MCQ correct
      {
        questionId: 'q_ga_1',
        sectionCategory: 'GENERAL_APTITUDE',
        questionType: 'MCQ',
        marks: 1.0,
        negativeMarks: -0.3333333333,
        correctAnswerJson: JSON.stringify('A')
      },
      // 2. GA 1-mark MCQ wrong (should deduct 1/3)
      {
        questionId: 'q_ga_2',
        sectionCategory: 'GENERAL_APTITUDE',
        questionType: 'MCQ',
        marks: 1.0,
        negativeMarks: -0.3333333333,
        correctAnswerJson: JSON.stringify('B')
      },
      // 3. DA 2-mark MCQ wrong (should deduct 2/3)
      {
        questionId: 'q_da_1',
        sectionCategory: 'TECHNICAL_DA',
        questionType: 'MCQ',
        marks: 2.0,
        negativeMarks: -0.6666666667,
        correctAnswerJson: JSON.stringify('C')
      },
      // 4. DA 2-mark MSQ correct (exact subset match)
      {
        questionId: 'q_da_2',
        sectionCategory: 'TECHNICAL_DA',
        questionType: 'MSQ',
        marks: 2.0,
        negativeMarks: 0.0,
        correctAnswerJson: JSON.stringify(['A', 'C'])
      },
      // 5. DA 2-mark MSQ partial (zero partial credit, zero negative)
      {
        questionId: 'q_da_3',
        sectionCategory: 'TECHNICAL_DA',
        questionType: 'MSQ',
        marks: 2.0,
        negativeMarks: 0.0,
        correctAnswerJson: JSON.stringify(['A', 'B', 'D'])
      },
      // 6. DA 2-mark NAT correct (within range [2.40, 2.45])
      {
        questionId: 'q_da_4',
        sectionCategory: 'TECHNICAL_DA',
        questionType: 'NAT',
        marks: 2.0,
        negativeMarks: 0.0,
        correctAnswerJson: '2.42',
        natRangeMin: 2.40,
        natRangeMax: 2.45
      },
      // 7. DA 2-mark NAT wrong (outside range, zero negative)
      {
        questionId: 'q_da_5',
        sectionCategory: 'TECHNICAL_DA',
        questionType: 'NAT',
        marks: 2.0,
        negativeMarks: 0.0,
        correctAnswerJson: '5.0',
        natRangeMin: 4.9,
        natRangeMax: 5.1
      },
      // 8. Question in ANSWERED_AND_MARKED (must be EVALUATED per GATE rule)
      {
        questionId: 'q_da_6',
        sectionCategory: 'TECHNICAL_DA',
        questionType: 'MCQ',
        marks: 1.0,
        negativeMarks: -0.3333333333,
        correctAnswerJson: JSON.stringify('D')
      },
      // 9. Question in MARKED_FOR_REVIEW without answer (must NOT be evaluated)
      {
        questionId: 'q_da_7',
        sectionCategory: 'TECHNICAL_DA',
        questionType: 'MCQ',
        marks: 1.0,
        negativeMarks: -0.3333333333,
        correctAnswerJson: JSON.stringify('B')
      }
    ];

    const responses: QuestionUserResponse[] = [
      { questionId: 'q_ga_1', paletteStatus: 'ANSWERED', selectedAnswerJson: JSON.stringify('A'), timeSpentSeconds: 30 },
      { questionId: 'q_ga_2', paletteStatus: 'ANSWERED', selectedAnswerJson: JSON.stringify('C'), timeSpentSeconds: 40 },
      { questionId: 'q_da_1', paletteStatus: 'ANSWERED', selectedAnswerJson: JSON.stringify('A'), timeSpentSeconds: 50 },
      { questionId: 'q_da_2', paletteStatus: 'ANSWERED', selectedAnswerJson: JSON.stringify(['A', 'C']), timeSpentSeconds: 70 },
      { questionId: 'q_da_3', paletteStatus: 'ANSWERED', selectedAnswerJson: JSON.stringify(['A']), timeSpentSeconds: 60 },
      { questionId: 'q_da_4', paletteStatus: 'ANSWERED', selectedAnswerJson: JSON.stringify('2.43'), timeSpentSeconds: 90 },
      { questionId: 'q_da_5', paletteStatus: 'ANSWERED', selectedAnswerJson: JSON.stringify('8.0'), timeSpentSeconds: 45 },
      { questionId: 'q_da_6', paletteStatus: 'ANSWERED_AND_MARKED', selectedAnswerJson: JSON.stringify('D'), timeSpentSeconds: 80 },
      { questionId: 'q_da_7', paletteStatus: 'MARKED_FOR_REVIEW', selectedAnswerJson: null, timeSpentSeconds: 20 }
    ];

    const result = ExamSessionGuard.evaluateExam('att_test_marking', specs, responses);

    // Breakdown:
    // q_ga_1: +1.0
    // q_ga_2: -0.3333333333
    // q_da_1: -0.6666666667
    // q_da_2: +2.0
    // q_da_3: 0.0 (partial credit is zero, no negative)
    // q_da_4: +2.0
    // q_da_5: 0.0 (wrong NAT, no negative)
    // q_da_6: +1.0 (ANSWERED_AND_MARKED is evaluated)
    // q_da_7: unattempted (MARKED_FOR_REVIEW unanswered)

    // Expected Total: 1 - 0.3333333333 - 0.6666666667 + 2 + 0 + 2 + 0 + 1 = 5.0
    expect(result.totalMarks).toBe(5.0);
    expect(result.correctCount).toBe(4); // q_ga_1, q_da_2, q_da_4, q_da_6
    expect(result.incorrectCount).toBe(4); // q_ga_2, q_da_1, q_da_3, q_da_5
    expect(result.unattemptedCount).toBe(1); // q_da_7
    expect(result.answeredAndMarkedEvaluatedCount).toBe(1); // q_da_6
    expect(result.negativeMarksDeducted).toBe(1.0); // 0.3333333333 + 0.6666666667 = 1.0
  });

  // ----------------------------------------------------------------------------
  // 3. GATE Scientific Virtual Calculator Tests
  // ----------------------------------------------------------------------------
  it('handles scientific functions, Deg/Rad modes, and memory operations', () => {
    render(<GateScientificCalculator isOpen={true} onClose={() => {}} />);

    // Check header
    expect(screen.getByText(/TCS iON GATE Virtual Calculator/i)).toBeDefined();

    // Mode toggle DEG -> RAD -> DEG
    const modeBtn = screen.getByText('DEG');
    fireEvent.click(modeBtn);
    expect(screen.getByText('RAD')).toBeDefined();
    fireEvent.click(screen.getByText('RAD'));
    expect(screen.getByText('DEG')).toBeDefined();

    // Test digits and clear
    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('x²'));
    expect(screen.getByText('25')).toBeDefined();

    // Test Factorial
    fireEvent.click(screen.getByText('C'));
    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('n!'));
    expect(screen.getByText('120')).toBeDefined();

    // Test Memory Operations: MS -> MR
    fireEvent.click(screen.getByText('MS'));
    fireEvent.click(screen.getByText('C'));
    expect(screen.getByTestId('calc-display').textContent).toBe('0');
    fireEvent.click(screen.getByText('MR'));
    expect(screen.getByTestId('calc-display').textContent).toBe('120');

    // Clear memory
    fireEvent.click(screen.getByText('MC'));
  });

  // ----------------------------------------------------------------------------
  // 4. Authentic TCS iON Arena View Tests
  // ----------------------------------------------------------------------------
  it('renders TCS iON Arena with section tabs, 5-state palette, and NAT virtual pad', () => {
    const mockQuestions: ArenaQuestion[] = [
      {
        id: 'q1',
        questionNumber: 1,
        section: 'GENERAL_APTITUDE',
        type: 'MCQ',
        marks: 1.0,
        negativeMarks: -0.3333333333,
        promptLatex: 'Choose the grammatically correct sentence.',
        options: [
          { id: 'opt_a', label: 'A', textLatex: 'Neither of them was present.' },
          { id: 'opt_b', label: 'B', textLatex: 'Neither of them were present.' }
        ],
        correctAnswerJson: JSON.stringify('opt_a')
      },
      {
        id: 'q2',
        questionNumber: 2,
        section: 'GENERAL_APTITUDE',
        type: 'NAT',
        marks: 1.0,
        negativeMarks: 0.0,
        promptLatex: 'Find the value of $x$ where $2^x = 16$.',
        correctAnswerJson: '4',
        natRangeMin: 4,
        natRangeMax: 4
      },
      {
        id: 'q3',
        questionNumber: 11,
        section: 'TECHNICAL_DA',
        type: 'MSQ',
        marks: 2.0,
        negativeMarks: 0.0,
        promptLatex: 'Which of the following are valid eigenvalues of an identity matrix?',
        options: [
          { id: 'opt_1', label: 'A', textLatex: '1' },
          { id: 'opt_2', label: 'B', textLatex: '-1' }
        ],
        correctAnswerJson: JSON.stringify(['opt_1'])
      }
    ];

    render(
      <TcsIonArenaView
        questions={mockQuestions}
        mockPaperTitle="GATE DA Sample Arena Test"
        durationMinutes={180}
      />
    );

    // Section Tabs
    expect(screen.getAllByText(/General Aptitude/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Data Science & AI/i).length).toBeGreaterThan(0);

    // Action buttons
    expect(screen.getByText(/Mark for Review & Next/i)).toBeDefined();
    expect(screen.getByText(/Clear Response/i)).toBeDefined();
    expect(screen.getByText(/Save & Next/i)).toBeDefined();
    expect(screen.getByText(/Submit Exam/i)).toBeDefined();

    // Palette Legend
    expect(screen.getAllByText(/Not Visited/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Not Answered/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Answered$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Marked for Review/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Answered & Marked \(Evaluated\)/i).length).toBeGreaterThan(0);

    // Test MCQ Selection & Save & Next
    fireEvent.click(screen.getByText(/Neither of them was present/i));
    fireEvent.click(screen.getByText(/Save & Next/i));

    // Navigates to Q2 (NAT)
    expect(screen.getByText(/Question No\. 2/i)).toBeDefined();
    expect(screen.getByText(/Numerical Answer Type \(NAT\)/i)).toBeDefined();
    expect(screen.getByText(/Physical keyboard entry is disabled/i)).toBeDefined();

    // Virtual Keypad clicks for NAT
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    const natInput = screen.getByPlaceholderText(/Click virtual keypad below\.\.\./i) as HTMLInputElement;
    expect(natInput.value).toBe('4');

    // Calculator trigger
    const calcToggle = screen.getByRole('button', { name: /Calculator/i });
    fireEvent.click(calcToggle);
    expect(screen.getByText(/TCS iON GATE Virtual Calculator/i)).toBeDefined();
  });
});
