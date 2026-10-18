// ==============================================================================
// USER PROFILE BACKUP & RESTORE SERVICE
// Responsibilities:
//   1. Export full user profile to portable .gateda-backup JSON format.
//   2. Validate checksum & schema integrity of backup archives.
//   3. Restore user profile within an atomic SQLite transaction.
//   4. Deep offline system & database integrity diagnostics.
// ==============================================================================

import crypto from 'node:crypto';
import type { Database as DatabaseType } from 'better-sqlite3';
import type {
  GateDaBackupPayload,
  SystemIntegrityReport
} from '../../shared/backupIpcContracts';

export class ProfileBackupService {
  /**
   * Export all tables from user_profile.db into a verified .gateda-backup structure
   */
  public static exportProfileBackup(db: DatabaseType): GateDaBackupPayload {
    const userStats = db.prepare('SELECT * FROM user_stats').all();
    const nodeProgress = db.prepare('SELECT * FROM node_progress').all();
    const mistakesVault = db.prepare('SELECT * FROM mistakes_vault').all();
    const srsFlashcards = db.prepare('SELECT * FROM srs_flashcards').all();
    const mockAttempts = db.prepare('SELECT * FROM mock_attempts').all();
    const mockQuestionResponses = db
      .prepare('SELECT * FROM mock_question_responses')
      .all();
    const lectureWatchHistory = db
      .prepare('SELECT * FROM lecture_watch_history')
      .all();
    const lectureNotes = db.prepare('SELECT * FROM lecture_notes').all();
    const gemTransactions = db.prepare('SELECT * FROM gem_transactions').all();
    const adaptiveDailyTargets = db
      .prepare('SELECT * FROM adaptive_daily_targets')
      .all();

    const tables = {
      user_stats: userStats,
      node_progress: nodeProgress,
      mistakes_vault: mistakesVault,
      srs_flashcards: srsFlashcards,
      mock_attempts: mockAttempts,
      mock_question_responses: mockQuestionResponses,
      lecture_watch_history: lectureWatchHistory,
      lecture_notes: lectureNotes,
      gem_transactions: gemTransactions,
      adaptive_daily_targets: adaptiveDailyTargets
    };

    const tablesString = JSON.stringify(tables);
    const checksum = crypto.createHash('sha256').update(tablesString).digest('hex');

    return {
      magic: 'GATEDA_BACKUP',
      version: '1.0.0',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      checksum,
      tables
    };
  }

  /**
   * Validates a candidate backup payload for magic tag, schema, and SHA-256 checksum
   */
  public static validateProfileBackup(data: unknown): {
    valid: boolean;
    error?: string;
    backup?: GateDaBackupPayload;
  } {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Backup data must be an object' };
    }

    const candidate = data as Partial<GateDaBackupPayload>;

    if (candidate.magic !== 'GATEDA_BACKUP') {
      return { valid: false, error: 'Invalid backup file magic identifier' };
    }

    if (candidate.version !== '1.0.0') {
      return {
        valid: false,
        error: `Unsupported backup version: ${candidate.version}`
      };
    }

    if (!candidate.tables || typeof candidate.tables !== 'object') {
      return { valid: false, error: 'Missing tables payload in backup' };
    }

    const tablesString = JSON.stringify(candidate.tables);
    const actualHash = crypto
      .createHash('sha256')
      .update(tablesString)
      .digest('hex');

    if (candidate.checksum && actualHash !== candidate.checksum) {
      return {
        valid: false,
        error: `Integrity checksum mismatch. Expected ${candidate.checksum}, got ${actualHash}`
      };
    }

    return {
      valid: true,
      backup: candidate as GateDaBackupPayload
    };
  }

  /**
   * Atomically restores user profile data from a validated backup payload.
   * If any step fails, changes are fully rolled back.
   */
  public static restoreProfileBackup(
    db: DatabaseType,
    backup: GateDaBackupPayload
  ): { success: boolean; rowsRestored: number; message: string } {
    let rowsCount = 0;

    const restoreTransaction = db.transaction(() => {
      // 1. Clear existing rows in reverse dependency order
      db.prepare('DELETE FROM mock_question_responses').run();
      db.prepare('DELETE FROM mock_attempts').run();
      db.prepare('DELETE FROM lecture_notes').run();
      db.prepare('DELETE FROM lecture_watch_history').run();
      db.prepare('DELETE FROM gem_transactions').run();
      db.prepare('DELETE FROM adaptive_daily_targets').run();
      db.prepare('DELETE FROM srs_flashcards').run();
      db.prepare('DELETE FROM mistakes_vault').run();
      db.prepare('DELETE FROM node_progress').run();
      db.prepare('DELETE FROM user_stats').run();

      // 2. Restore user_stats
      if (backup.tables.user_stats && backup.tables.user_stats.length > 0) {
        const stmt = db.prepare(`
          INSERT INTO user_stats (
            id, display_name, avatar_id, xp, current_streak, longest_streak,
            streak_freezes, last_active_date, hearts, cram_mode_until, gems,
            target_exam_date, current_league, theme_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const row of backup.tables.user_stats as Record<string, unknown>[]) {
          stmt.run(
            row.id,
            row.display_name,
            row.avatar_id,
            row.xp,
            row.current_streak,
            row.longest_streak,
            row.streak_freezes,
            row.last_active_date,
            row.hearts,
            row.cram_mode_until,
            row.gems,
            row.target_exam_date,
            row.current_league,
            row.theme_id,
            row.created_at,
            row.updated_at
          );
          rowsCount++;
        }
      }

      // 3. Restore node_progress
      if (backup.tables.node_progress && backup.tables.node_progress.length > 0) {
        const stmt = db.prepare(`
          INSERT INTO node_progress (
            node_id, status, attempts_count, best_score_pct, stars_earned,
            first_completed_at, last_attempted_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const row of backup.tables.node_progress as Record<string, unknown>[]) {
          stmt.run(
            row.node_id,
            row.status,
            row.attempts_count,
            row.best_score_pct,
            row.stars_earned,
            row.first_completed_at,
            row.last_attempted_at,
            row.created_at,
            row.updated_at
          );
          rowsCount++;
        }
      }

      // 4. Restore mistakes_vault
      if (backup.tables.mistakes_vault && backup.tables.mistakes_vault.length > 0) {
        const stmt = db.prepare(`
          INSERT INTO mistakes_vault (
            question_id, unit_id, times_failed, last_incorrect_answer,
            resolved, last_failed_at, resolved_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        for (const row of backup.tables.mistakes_vault as Record<string, unknown>[]) {
          stmt.run(
            row.question_id,
            row.unit_id,
            row.times_failed,
            row.last_incorrect_answer,
            row.resolved,
            row.last_failed_at,
            row.resolved_at
          );
          rowsCount++;
        }
      }

      // 5. Restore srs_flashcards
      if (backup.tables.srs_flashcards && backup.tables.srs_flashcards.length > 0) {
        const stmt = db.prepare(`
          INSERT INTO srs_flashcards (
            card_id, repetitions, ease_factor, interval_days,
            next_review_due, last_reviewed_at, last_grade, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const row of backup.tables.srs_flashcards as Record<string, unknown>[]) {
          stmt.run(
            row.card_id,
            row.repetitions,
            row.ease_factor,
            row.interval_days,
            row.next_review_due,
            row.last_reviewed_at,
            row.last_grade,
            row.created_at
          );
          rowsCount++;
        }
      }

      // 6. Restore mock_attempts
      if (backup.tables.mock_attempts && backup.tables.mock_attempts.length > 0) {
        const stmt = db.prepare(`
          INSERT INTO mock_attempts (
            id, mock_paper_id, paper_title, status, start_time, end_time,
            duration_seconds_allocated, time_remaining_seconds, total_score,
            marks_general_aptitude, marks_technical_da, negative_marks_deducted,
            predicted_air_range, normalized_gate_score, raw_response_backup_json,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const row of backup.tables.mock_attempts as Record<string, unknown>[]) {
          stmt.run(
            row.id,
            row.mock_paper_id,
            row.paper_title,
            row.status,
            row.start_time,
            row.end_time,
            row.duration_seconds_allocated,
            row.time_remaining_seconds,
            row.total_score,
            row.marks_general_aptitude,
            row.marks_technical_da,
            row.negative_marks_deducted,
            row.predicted_air_range,
            row.normalized_gate_score,
            row.raw_response_backup_json,
            row.created_at,
            row.updated_at
          );
          rowsCount++;
        }
      }

      // 7. Restore mock_question_responses
      if (
        backup.tables.mock_question_responses &&
        backup.tables.mock_question_responses.length > 0
      ) {
        const stmt = db.prepare(`
          INSERT INTO mock_question_responses (
            attempt_id, question_id, question_number, palette_status,
            selected_answer_json, time_spent_seconds, is_correct,
            marks_awarded, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const row of backup.tables
          .mock_question_responses as Record<string, unknown>[]) {
          stmt.run(
            row.attempt_id,
            row.question_id,
            row.question_number,
            row.palette_status,
            row.selected_answer_json,
            row.time_spent_seconds,
            row.is_correct,
            row.marks_awarded,
            row.updated_at
          );
          rowsCount++;
        }
      }

      // 8. Restore lecture_watch_history
      if (
        backup.tables.lecture_watch_history &&
        backup.tables.lecture_watch_history.length > 0
      ) {
        const stmt = db.prepare(`
          INSERT INTO lecture_watch_history (
            lecture_id, watched_seconds, duration_total_seconds, completed, last_watched_at
          ) VALUES (?, ?, ?, ?, ?)
        `);
        for (const row of backup.tables
          .lecture_watch_history as Record<string, unknown>[]) {
          stmt.run(
            row.lecture_id,
            row.watched_seconds,
            row.duration_total_seconds,
            row.completed,
            row.last_watched_at
          );
          rowsCount++;
        }
      }

      // 9. Restore lecture_notes
      if (backup.tables.lecture_notes && backup.tables.lecture_notes.length > 0) {
        const stmt = db.prepare(`
          INSERT INTO lecture_notes (
            id, lecture_id, timestamp_sec, note_markdown, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?)
        `);
        for (const row of backup.tables.lecture_notes as Record<string, unknown>[]) {
          stmt.run(
            row.id,
            row.lecture_id,
            row.timestamp_sec,
            row.note_markdown,
            row.created_at,
            row.updated_at
          );
          rowsCount++;
        }
      }

      // 10. Restore gem_transactions
      if (
        backup.tables.gem_transactions &&
        backup.tables.gem_transactions.length > 0
      ) {
        const stmt = db.prepare(`
          INSERT INTO gem_transactions (
            id, amount, balance_after, transaction_type, description, created_at
          ) VALUES (?, ?, ?, ?, ?, ?)
        `);
        for (const row of backup.tables
          .gem_transactions as Record<string, unknown>[]) {
          stmt.run(
            row.id,
            row.amount,
            row.balance_after,
            row.transaction_type,
            row.description,
            row.created_at
          );
          rowsCount++;
        }
      }

      // 11. Restore adaptive_daily_targets
      if (
        backup.tables.adaptive_daily_targets &&
        backup.tables.adaptive_daily_targets.length > 0
      ) {
        const stmt = db.prepare(`
          INSERT INTO adaptive_daily_targets (
            id, target_date, quest_type, title, description,
            target_value, current_value, xp_reward, completed, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const row of backup.tables
          .adaptive_daily_targets as Record<string, unknown>[]) {
          stmt.run(
            row.id,
            row.target_date,
            row.quest_type,
            row.title,
            row.description,
            row.target_value,
            row.current_value,
            row.xp_reward,
            row.completed,
            row.created_at,
            row.updated_at
          );
          rowsCount++;
        }
      }
    });

    restoreTransaction();

    return {
      success: true,
      rowsRestored: rowsCount,
      message: `Successfully restored ${rowsCount} records from backup archive.`
    };
  }

  /**
   * Runs PRAGMA integrity_check on both databases and collects diagnostic counts
   */
  public static verifySystemIntegrity(
    curriculumDb?: DatabaseType | null,
    userProfileDb?: DatabaseType | null,
    curriculumVersion = 'v1.0.0'
  ): SystemIntegrityReport {
    let curriculumOk = false;
    let curriculumMessage = 'Curriculum database unavailable';
    let userProfileOk = false;
    let userProfileMessage = 'User profile database unavailable';

    const counts = {
      sections: 0,
      units: 0,
      nodes: 0,
      questions: 0,
      lectures: 0,
      mockPapers: 0,
      formulaCards: 0
    };

    const userStats = {
      xp: 0,
      streak: 0,
      hearts: 5,
      gems: 0,
      currentLeague: 'BRONZE',
      mistakesRecorded: 0,
      mistakesResolved: 0,
      flashcardsCount: 0,
      mockAttemptsCount: 0
    };

    // 1. Audit Curriculum DB
    if (curriculumDb) {
      try {
        const check = curriculumDb.prepare('PRAGMA integrity_check').get() as {
          integrity_check?: string;
        };
        curriculumOk = check.integrity_check === 'ok';
        curriculumMessage = curriculumOk
          ? 'Curriculum SQLite integrity verified OK'
          : `Integrity check error: ${JSON.stringify(check)}`;

        const secRow = curriculumDb
          .prepare('SELECT COUNT(*) as c FROM syllabus_sections')
          .get() as { c: number };
        const unitRow = curriculumDb
          .prepare('SELECT COUNT(*) as c FROM units')
          .get() as { c: number };
        const nodeRow = curriculumDb
          .prepare('SELECT COUNT(*) as c FROM stepping_nodes')
          .get() as { c: number };
        const qRow = curriculumDb
          .prepare('SELECT COUNT(*) as c FROM questions')
          .get() as { c: number };
        const lecRow = curriculumDb
          .prepare('SELECT COUNT(*) as c FROM youtube_lectures')
          .get() as { c: number };
        const papRow = curriculumDb
          .prepare('SELECT COUNT(*) as c FROM mock_papers')
          .get() as { c: number };
        const fcRow = curriculumDb
          .prepare('SELECT COUNT(*) as c FROM formula_cards')
          .get() as { c: number };

        counts.sections = secRow.c;
        counts.units = unitRow.c;
        counts.nodes = nodeRow.c;
        counts.questions = qRow.c;
        counts.lectures = lecRow.c;
        counts.mockPapers = papRow.c;
        counts.formulaCards = fcRow.c;
      } catch (err) {
        curriculumOk = false;
        curriculumMessage = (err as Error).message;
      }
    }

    // 2. Audit User Profile DB
    if (userProfileDb) {
      try {
        const check = userProfileDb.prepare('PRAGMA integrity_check').get() as {
          integrity_check?: string;
        };
        userProfileOk = check.integrity_check === 'ok';
        userProfileMessage = userProfileOk
          ? 'User Profile SQLite WAL integrity verified OK'
          : `Integrity check error: ${JSON.stringify(check)}`;

        const statsRow = userProfileDb
          .prepare('SELECT xp, current_streak, hearts, gems, current_league FROM user_stats WHERE id = ?')
          .get('default_user') as {
            xp: number;
            current_streak: number;
            hearts: number;
            gems: number;
            current_league: string;
          } | undefined;

        if (statsRow) {
          userStats.xp = statsRow.xp;
          userStats.streak = statsRow.current_streak;
          userStats.hearts = statsRow.hearts;
          userStats.gems = statsRow.gems;
          userStats.currentLeague = statsRow.current_league;
        }

        const mistRec = userProfileDb
          .prepare('SELECT COUNT(*) as c FROM mistakes_vault')
          .get() as { c: number };
        const mistRes = userProfileDb
          .prepare('SELECT COUNT(*) as c FROM mistakes_vault WHERE resolved = 1')
          .get() as { c: number };
        const fcCount = userProfileDb
          .prepare('SELECT COUNT(*) as c FROM srs_flashcards')
          .get() as { c: number };
        const mockCount = userProfileDb
          .prepare('SELECT COUNT(*) as c FROM mock_attempts')
          .get() as { c: number };

        userStats.mistakesRecorded = mistRec.c;
        userStats.mistakesResolved = mistRes.c;
        userStats.flashcardsCount = fcCount.c;
        userStats.mockAttemptsCount = mockCount.c;
      } catch (err) {
        userProfileOk = false;
        userProfileMessage = (err as Error).message;
      }
    }

    return {
      curriculumOk,
      curriculumMessage,
      userProfileOk,
      userProfileMessage,
      curriculumVersion,
      counts,
      userStats
    };
  }
}
