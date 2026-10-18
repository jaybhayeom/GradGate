// ==============================================================================
// PHASE 9 TEST SUITE: RELEASE BUNDLE, BACKUP/RESTORE & SYSTEM INTEGRITY
// Verifies:
//   1. GitHub release bundle generation and Gzip / SHA-256 integrity.
//   2. ProfileBackupService export with cryptographic checksum sealing.
//   3. ProfileBackupService tamper detection and validation.
//   4. Atomic profile restore roundtrip with zero data corruption.
//   5. Deep offline SQLite database integrity diagnostics.
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { ProfileBackupService } from '../src/main/services/profileBackupService';
import type { GateDaBackupPayload } from '../src/shared/backupIpcContracts';

describe('Phase 9: Release Bundle, Profile Backup & Diagnostics', () => {
  let tempDir: string;
  let testProfileDb: DatabaseType;
  let testCurriculumDb: DatabaseType;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gradgate-phase9-test-'));
    const profileDbPath = path.join(tempDir, 'test_user_profile.db');
    const curriculumDbPath = path.join(tempDir, 'test_curriculum.db');

    testProfileDb = new Database(profileDbPath);
    testProfileDb.pragma('journal_mode = WAL');
    testProfileDb.pragma('foreign_keys = ON');

    const profileSchemaPath = path.resolve(__dirname, '../src/main/db/userProfileSchema.sql');
    testProfileDb.exec(fs.readFileSync(profileSchemaPath, 'utf8'));

    testCurriculumDb = new Database(curriculumDbPath);
    testCurriculumDb.pragma('foreign_keys = ON');

    const curriculumSchemaPath = path.resolve(__dirname, '../src/main/db/curriculumSchema.sql');
    testCurriculumDb.exec(fs.readFileSync(curriculumSchemaPath, 'utf8'));
  });

  afterEach(() => {
    testProfileDb.close();
    testCurriculumDb.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // ----------------------------------------------------------------------------
  // 1. GitHub Release Bundle & Manifest Verification
  // ----------------------------------------------------------------------------
  it('validates pre-compiled release-bundle artifacts and SHA-256 matching', () => {
    const bundleDir = path.resolve(__dirname, '../release-bundle');
    const dbPath = path.join(bundleDir, 'curriculum.db');
    const gzPath = path.join(bundleDir, 'curriculum.db.gz');
    const manifestPath = path.join(bundleDir, 'manifest.json');

    expect(fs.existsSync(dbPath)).toBe(true);
    expect(fs.existsSync(gzPath)).toBe(true);
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestRaw);

    expect(manifest.version).toBe('1.0.0');
    expect(manifest.schema_version).toBe(1);
    expect(manifest.total_questions).toBeGreaterThanOrEqual(60);
    expect(manifest.total_nodes).toBeGreaterThanOrEqual(20);
    expect(manifest.total_lectures).toBe(18);
    expect(manifest.sha256_checksum).toMatch(/^[a-f0-9]{64}$/);

    // Verify uncompressed DB SQLite validity
    const db = new Database(dbPath, { readonly: true });
    const integrity = db.prepare('PRAGMA integrity_check').get() as { integrity_check: string };
    expect(integrity.integrity_check).toBe('ok');

    const sections = db.prepare('SELECT COUNT(*) as c FROM syllabus_sections').get() as { c: number };
    expect(sections.c).toBe(8);

    const lectures = db.prepare('SELECT COUNT(*) as c FROM youtube_lectures').get() as { c: number };
    expect(lectures.c).toBe(18);

    const papers = db.prepare('SELECT COUNT(*) as c FROM mock_papers').get() as { c: number };
    expect(papers.c).toBe(2);

    db.close();

    // Verify Gzip decompress matches SHA-256 from manifest
    const gzBuffer = fs.readFileSync(gzPath);
    const decompressed = zlib.gunzipSync(gzBuffer);
    const actualHash = crypto.createHash('sha256').update(decompressed).digest('hex');

    expect(actualHash).toBe(manifest.sha256_checksum);
  });

  // ----------------------------------------------------------------------------
  // 2. Profile Backup Export & Cryptographic Sealing
  // ----------------------------------------------------------------------------
  it('exports user profile data with valid cryptographic checksum sealing', () => {
    // Populate user stats
    testProfileDb
      .prepare(`
        INSERT INTO user_stats (
          id, display_name, xp, current_streak, longest_streak, gems, hearts, current_league
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run('default_user', 'GATE DA Topper', 1250, 14, 21, 580, 5, 'GOLD');

    // Populate node progress
    testProfileDb
      .prepare(`
        INSERT INTO node_progress (node_id, status, attempts_count, best_score_pct, stars_earned)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run('node_prob_1', 'COMPLETED_GOLD', 2, 95.0, 3);

    // Populate mistakes vault
    testProfileDb
      .prepare(`
        INSERT INTO mistakes_vault (question_id, unit_id, times_failed, resolved)
        VALUES (?, ?, ?, ?)
      `)
      .run('q_bayes_trap', 'unit_prob_1', 3, 0);

    // Populate SRS flashcards
    testProfileDb
      .prepare(`
        INSERT INTO srs_flashcards (card_id, repetitions, ease_factor, interval_days)
        VALUES (?, ?, ?, ?)
      `)
      .run('fc_eigen_def', 4, 2.6, 12);

    const backup = ProfileBackupService.exportProfileBackup(testProfileDb);

    expect(backup.magic).toBe('GATEDA_BACKUP');
    expect(backup.version).toBe('1.0.0');
    expect(backup.schemaVersion).toBe(1);
    expect(backup.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(backup.tables.user_stats.length).toBe(1);
    expect(backup.tables.node_progress.length).toBe(1);
    expect(backup.tables.mistakes_vault.length).toBe(1);
    expect(backup.tables.srs_flashcards.length).toBe(1);

    const statsRow = backup.tables.user_stats[0] as { display_name: string; xp: number };
    expect(statsRow.display_name).toBe('GATE DA Topper');
    expect(statsRow.xp).toBe(1250);
  });

  // ----------------------------------------------------------------------------
  // 3. Backup Validation & Tamper Rejection
  // ----------------------------------------------------------------------------
  it('validates intact backups and rejects tampered archives or wrong versions', () => {
    testProfileDb
      .prepare('INSERT INTO user_stats (id, xp) VALUES (?, ?)')
      .run('default_user', 300);

    const backup = ProfileBackupService.exportProfileBackup(testProfileDb);
    const validResult = ProfileBackupService.validateProfileBackup(backup);
    expect(validResult.valid).toBe(true);

    // 1. Tamper table data (modifying XP without re-hashing)
    const tampered = JSON.parse(JSON.stringify(backup)) as GateDaBackupPayload;
    (tampered.tables.user_stats[0] as { xp: number }).xp = 999999;
    const tamperedResult = ProfileBackupService.validateProfileBackup(tampered);
    expect(tamperedResult.valid).toBe(false);
    expect(tamperedResult.error).toContain('Integrity checksum mismatch');

    // 2. Invalid magic identifier
    const badMagic = JSON.parse(JSON.stringify(backup));
    badMagic.magic = 'CORRUPTED_MAGIC';
    const badMagicResult = ProfileBackupService.validateProfileBackup(badMagic);
    expect(badMagicResult.valid).toBe(false);
    expect(badMagicResult.error).toContain('Invalid backup file magic identifier');

    // 3. Unsupported version
    const badVersion = JSON.parse(JSON.stringify(backup));
    badVersion.version = '99.0.0';
    const badVerResult = ProfileBackupService.validateProfileBackup(badVersion);
    expect(badVerResult.valid).toBe(false);
    expect(badVerResult.error).toContain('Unsupported backup version');
  });

  // ----------------------------------------------------------------------------
  // 4. Atomic Profile Restore Roundtrip
  // ----------------------------------------------------------------------------
  it('restores all user profile records atomically without orphan foreign keys', () => {
    // 1. Insert rich source records
    testProfileDb
      .prepare(`
        INSERT INTO user_stats (
          id, display_name, xp, current_streak, longest_streak, streak_freezes, gems, hearts, current_league
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run('default_user', 'Aspirant Master', 4500, 30, 45, 3, 920, 4, 'OBSIDIAN');

    testProfileDb
      .prepare('INSERT INTO node_progress (node_id, status) VALUES (?, ?)')
      .run('node_eigen_1', 'COMPLETED_GOLD');

    testProfileDb
      .prepare(`
        INSERT INTO mock_attempts (
          id, mock_paper_id, paper_title, status, total_score, marks_general_aptitude, marks_technical_da
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run('att_001', 'paper_gate_da_2024', 'GATE DA 2024 Official Paper', 'SUBMITTED', 78.5, 13.0, 65.5);

    testProfileDb
      .prepare(`
        INSERT INTO mock_question_responses (
          attempt_id, question_id, question_number, palette_status, marks_awarded
        ) VALUES (?, ?, ?, ?, ?)
      `)
      .run('att_001', 'q_gate_01', 1, 'ANSWERED', 1.0);

    testProfileDb
      .prepare(`
        INSERT INTO lecture_watch_history (lecture_id, watched_seconds, duration_total_seconds, completed)
        VALUES (?, ?, ?, ?)
      `)
      .run('lec_eigen_mit', 2500, 3060, 1);

    // 2. Export backup snapshot
    const backup = ProfileBackupService.exportProfileBackup(testProfileDb);

    // 3. Simulate database wipe or partial corruption
    testProfileDb.prepare('DELETE FROM mock_question_responses').run();
    testProfileDb.prepare('DELETE FROM mock_attempts').run();
    testProfileDb.prepare('DELETE FROM node_progress').run();
    testProfileDb.prepare("UPDATE user_stats SET xp = 0, current_streak = 0, gems = 0 WHERE id = 'default_user'").run();

    // Verify database was indeed emptied
    const clearedStats = testProfileDb.prepare('SELECT xp FROM user_stats WHERE id = ?').get('default_user') as { xp: number };
    expect(clearedStats.xp).toBe(0);

    // 4. Restore from backup
    const restoreResult = ProfileBackupService.restoreProfileBackup(testProfileDb, backup);
    expect(restoreResult.success).toBe(true);
    expect(restoreResult.rowsRestored).toBeGreaterThanOrEqual(4);

    // 5. Verify restored state
    const restoredStats = testProfileDb.prepare('SELECT * FROM user_stats WHERE id = ?').get('default_user') as {
      display_name: string;
      xp: number;
      current_streak: number;
      gems: number;
      current_league: string;
    };
    expect(restoredStats.display_name).toBe('Aspirant Master');
    expect(restoredStats.xp).toBe(4500);
    expect(restoredStats.current_streak).toBe(30);
    expect(restoredStats.gems).toBe(920);
    expect(restoredStats.current_league).toBe('OBSIDIAN');

    const restoredAttempts = testProfileDb.prepare('SELECT * FROM mock_attempts WHERE id = ?').get('att_001') as {
      total_score: number;
    };
    expect(restoredAttempts.total_score).toBe(78.5);

    const restoredResponses = testProfileDb.prepare('SELECT * FROM mock_question_responses WHERE attempt_id = ?').all('att_001');
    expect(restoredResponses.length).toBe(1);
  });

  // ----------------------------------------------------------------------------
  // 5. System Integrity & Diagnostic Auditing
  // ----------------------------------------------------------------------------
  it('performs diagnostic system integrity check on curriculum and profile databases', () => {
    // Seed test curriculum sections
    testCurriculumDb
      .prepare(`
        INSERT INTO syllabus_sections (
          id, code, title, short_title, description, order_index, official_weightage, color_hex, icon_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        'DA_01_PROB_STATS',
        'DA-01',
        'Probability and Statistics',
        'Prob & Stats',
        'Sample description',
        1,
        0.15,
        '#10B981',
        'Dice'
      );

    testProfileDb
      .prepare('INSERT INTO user_stats (id, xp, current_streak, gems) VALUES (?, ?, ?, ?)')
      .run('default_user', 650, 5, 200);

    const report = ProfileBackupService.verifySystemIntegrity(testCurriculumDb, testProfileDb, 'v1.0.0');

    expect(report.curriculumOk).toBe(true);
    expect(report.userProfileOk).toBe(true);
    expect(report.curriculumVersion).toBe('v1.0.0');
    expect(report.counts.sections).toBe(1);
    expect(report.userStats.xp).toBe(650);
    expect(report.userStats.streak).toBe(5);
    expect(report.userStats.gems).toBe(200);
  });
});
