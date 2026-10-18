// ==============================================================================
// EXAM SESSION GUARD & POWER-CUT CRASH RECOVERY
// Responsibilities:
//   1. Sub-50ms atomic state persistence for every TCS iON question response.
//   2. Instant Power-Cut / App Crash recovery: "Resume Unfinished Mock Exam".
//   3. Official GATE 65-Question / 100-Mark Grading Engine:
//      - Evaluates ANSWERED and ANSWERED_AND_MARKED (per official GATE rules).
//      - Discards NOT_ANSWERED and MARKED_FOR_REVIEW (unanswered).
//      - Exact negative marking: -1/3 for 1-mark MCQ, -2/3 for 2-mark MCQ.
//      - Zero negative marking for MSQ and NAT questions.
// ==============================================================================

import type { Database as DatabaseType } from 'better-sqlite3';
import type { PaletteStatus } from '../../shared/types';

export interface QuestionGradingSpec {
  questionId: string;
  sectionCategory: 'GENERAL_APTITUDE' | 'TECHNICAL_DA';
  questionType: 'MCQ' | 'MSQ' | 'NAT';
  marks: 1.0 | 2.0;
  negativeMarks: 0.0 | -0.3333333333 | -0.6666666667;
  correctAnswerJson: string;
  natRangeMin?: number | null;
  natRangeMax?: number | null;
}

export interface QuestionUserResponse {
  questionId: string;
  paletteStatus: PaletteStatus;
  selectedAnswerJson?: string | null;
  timeSpentSeconds: number;
}

export interface ExamEvaluationResult {
  attemptId: string;
  totalMarks: number;
  marksGeneralAptitude: number;
  marksTechnicalDa: number;
  negativeMarksDeducted: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  answeredAndMarkedEvaluatedCount: number;
}

export interface ActiveSessionRecoveryInfo {
  hasActiveSession: boolean;
  attemptId?: string;
  paperTitle?: string;
  timeRemainingSeconds?: number;
  answeredCount?: number;
  totalQuestions?: number;
}

export class ExamSessionGuard {
  /**
   * Initializes a new mock exam session in user_profile.db.
   */
  public static startSession(
    db: DatabaseType,
    attemptId: string,
    mockPaperId: string,
    paperTitle: string,
    totalQuestions: number,
    durationSeconds = 10800 // 180 mins
  ): void {
    const tx = db.transaction(() => {
      db.prepare(`
        INSERT INTO mock_attempts (
          id, mock_paper_id, paper_title, status, start_time,
          duration_seconds_allocated, time_remaining_seconds, total_score
        ) VALUES (?, ?, ?, 'IN_PROGRESS', datetime('now'), ?, ?, 0.0)
      `).run(attemptId, mockPaperId, paperTitle, durationSeconds, durationSeconds);

      const insertResp = db.prepare(`
        INSERT INTO mock_question_responses (
          attempt_id, question_id, question_number, palette_status, time_spent_seconds
        ) VALUES (?, ?, ?, 'NOT_VISITED', 0)
      `);

      for (let i = 1; i <= totalQuestions; i++) {
        insertResp.run(attemptId, `q_placeholder_${i}`, i);
      }
    });

    tx();
  }

  /**
   * Sub-50ms write: Records question response and palette state immediately.
   */
  public static recordQuestionResponse(
    db: DatabaseType,
    attemptId: string,
    questionId: string,
    questionNumber: number,
    paletteStatus: PaletteStatus,
    selectedAnswerJson?: string | null,
    timeSpentSeconds = 0
  ): void {
    db.prepare(`
      INSERT INTO mock_question_responses (
        attempt_id, question_id, question_number, palette_status, selected_answer_json, time_spent_seconds, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(attempt_id, question_id) DO UPDATE SET
        palette_status = excluded.palette_status,
        selected_answer_json = excluded.selected_answer_json,
        time_spent_seconds = time_spent_seconds + excluded.time_spent_seconds,
        updated_at = datetime('now')
    `).run(
      attemptId,
      questionId,
      questionNumber,
      paletteStatus,
      selectedAnswerJson || null,
      timeSpentSeconds
    );
  }

  /**
   * Updates remaining timer seconds periodically.
   */
  public static updateTimeRemaining(
    db: DatabaseType,
    attemptId: string,
    timeRemainingSeconds: number
  ): void {
    db.prepare(`
      UPDATE mock_attempts
      SET time_remaining_seconds = ?, updated_at = datetime('now')
      WHERE id = ? AND status = 'IN_PROGRESS'
    `).run(timeRemainingSeconds, attemptId);
  }

  /**
   * Instant Crash Recovery: Checks if there is any unfinished exam session.
   */
  public static getActiveUnfinishedSession(db: DatabaseType): ActiveSessionRecoveryInfo {
    const attempt = db.prepare(`
      SELECT id, paper_title, time_remaining_seconds
      FROM mock_attempts
      WHERE status = 'IN_PROGRESS'
      ORDER BY start_time DESC
      LIMIT 1
    `).get() as { id: string; paper_title: string; time_remaining_seconds: number } | undefined;

    if (!attempt) {
      return { hasActiveSession: false };
    }

    const counts = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN palette_status IN ('ANSWERED', 'ANSWERED_AND_MARKED') THEN 1 ELSE 0 END) as answered
      FROM mock_question_responses
      WHERE attempt_id = ?
    `).get(attempt.id) as { total: number; answered: number };

    return {
      hasActiveSession: true,
      attemptId: attempt.id,
      paperTitle: attempt.paper_title,
      timeRemainingSeconds: attempt.time_remaining_seconds,
      answeredCount: counts.answered || 0,
      totalQuestions: counts.total || 0
    };
  }

  /**
   * Evaluates mock exam submissions according to official GATE marking rules:
   * 1. Evaluates questions in status 'ANSWERED' and 'ANSWERED_AND_MARKED'.
   * 2. Skips questions in 'NOT_VISITED', 'NOT_ANSWERED', and 'MARKED_FOR_REVIEW'.
   * 3. Negative marking:
   *    - 1-mark MCQ: -1/3 (-0.3333333333)
   *    - 2-mark MCQ: -2/3 (-0.6666666667)
   *    - MSQ: Zero negative marking
   *    - NAT: Zero negative marking
   */
  public static evaluateExam(
    attemptId: string,
    specs: QuestionGradingSpec[],
    responses: QuestionUserResponse[]
  ): ExamEvaluationResult {
    let totalMarks = 0;
    let marksGeneralAptitude = 0;
    let marksTechnicalDa = 0;
    let negativeMarksDeducted = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let answeredAndMarkedEvaluatedCount = 0;

    const responseMap = new Map<string, QuestionUserResponse>();
    for (const r of responses) {
      responseMap.set(r.questionId, r);
    }

    for (const spec of specs) {
      const resp = responseMap.get(spec.questionId);

      // Check if question was submitted for evaluation per GATE rules
      const isEligibleForEvaluation =
        resp &&
        (resp.paletteStatus === 'ANSWERED' || resp.paletteStatus === 'ANSWERED_AND_MARKED');

      if (!isEligibleForEvaluation || !resp.selectedAnswerJson) {
        unattemptedCount++;
        continue;
      }

      if (resp.paletteStatus === 'ANSWERED_AND_MARKED') {
        answeredAndMarkedEvaluatedCount++;
      }

      let isCorrect = false;

      try {
        if (spec.questionType === 'MCQ') {
          const expected = JSON.parse(spec.correctAnswerJson);
          const actual = JSON.parse(resp.selectedAnswerJson);
          isCorrect = actual === expected;
        } else if (spec.questionType === 'MSQ') {
          const expected: string[] = JSON.parse(spec.correctAnswerJson);
          const actual: string[] = JSON.parse(resp.selectedAnswerJson);
          // GATE Zero Partial Credit: exact subset match
          isCorrect =
            actual.length === expected.length &&
            actual.every((a) => expected.includes(a));
        } else if (spec.questionType === 'NAT') {
          const actualVal = parseFloat(JSON.parse(resp.selectedAnswerJson));
          const minVal = spec.natRangeMin ?? -Infinity;
          const maxVal = spec.natRangeMax ?? Infinity;
          isCorrect = !isNaN(actualVal) && actualVal >= minVal && actualVal <= maxVal;
        }
      } catch {
        isCorrect = false;
      }

      if (isCorrect) {
        correctCount++;
        totalMarks += spec.marks;
        if (spec.sectionCategory === 'GENERAL_APTITUDE') {
          marksGeneralAptitude += spec.marks;
        } else {
          marksTechnicalDa += spec.marks;
        }
      } else {
        incorrectCount++;
        // Apply negative marks only for MCQ questions
        if (spec.questionType === 'MCQ') {
          const deduction = Math.abs(spec.negativeMarks);
          totalMarks -= deduction;
          negativeMarksDeducted += deduction;
          if (spec.sectionCategory === 'GENERAL_APTITUDE') {
            marksGeneralAptitude -= deduction;
          } else {
            marksTechnicalDa -= deduction;
          }
        }
      }
    }

    return {
      attemptId,
      totalMarks: Math.round(totalMarks * 1000) / 1000,
      marksGeneralAptitude: Math.round(marksGeneralAptitude * 1000) / 1000,
      marksTechnicalDa: Math.round(marksTechnicalDa * 1000) / 1000,
      negativeMarksDeducted: Math.round(negativeMarksDeducted * 1000) / 1000,
      correctCount,
      incorrectCount,
      unattemptedCount,
      answeredAndMarkedEvaluatedCount
    };
  }
}
