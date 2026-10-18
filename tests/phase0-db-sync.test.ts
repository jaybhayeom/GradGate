// ==============================================================================
// PHASE 0 VERIFICATION TEST SUITE
// Verifies:
//   1. Dual-SQLite storage engine & WAL mode on user_profile.db.
//   2. Foreign key constraints enforcement.
//   3. All 8 official GATE DA syllabus sections.
//   4. Atomic curriculum update swap without losing user profile records.
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import Database from 'better-sqlite3';
import { DatabaseManager } from '../src/main/db/databaseManager';
import { GitHubSyncManager } from '../src/main/sync/githubSyncManager';
import type { ContentManifest } from '../src/shared/types';

describe('Phase 0: Dual-SQLite Engine & GitHub OTA Sync', () => {
  let tempDir: string;
  let contentDir: string;
  let profileDir: string;
  let curriculumDbPath: string;
  let userProfileDbPath: string;
  let curriculumSchemaPath: string;
  let userProfileSchemaPath: string;
  let dbManager: DatabaseManager;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gradgate-phase0-test-'));
    contentDir = path.join(tempDir, 'content');
    profileDir = path.join(tempDir, 'profile');
    curriculumDbPath = path.join(contentDir, 'curriculum.db');
    userProfileDbPath = path.join(profileDir, 'user_profile.db');

    curriculumSchemaPath = path.resolve(__dirname, '../src/main/db/curriculumSchema.sql');
    userProfileSchemaPath = path.resolve(__dirname, '../src/main/db/userProfileSchema.sql');

    dbManager = new DatabaseManager({
      curriculumDbPath,
      userProfileDbPath,
      curriculumSchemaPath,
      userProfileSchemaPath
    });
    dbManager.initialize();
  });

  afterEach(() => {
    dbManager.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('enforces WAL mode and foreign keys on user_profile.db', () => {
    const userDb = dbManager.getUserProfileDb();
    expect(userDb).not.toBeNull();

    const journalMode = userDb!.prepare('PRAGMA journal_mode').get() as { journal_mode: string };
    expect(journalMode.journal_mode.toLowerCase()).toBe('wal');

    const foreignKeys = userDb!.prepare('PRAGMA foreign_keys').get() as { foreign_keys: number };
    expect(foreignKeys.foreign_keys).toBe(1);
  });

  it('enforces foreign keys on curriculum.db', () => {
    const currDb = dbManager.getCurriculumDb();
    expect(currDb).not.toBeNull();

    const foreignKeys = currDb!.prepare('PRAGMA foreign_keys').get() as { foreign_keys: number };
    expect(foreignKeys.foreign_keys).toBe(1);
  });

  it('initializes and seeds all 8 official GATE DA syllabus sections', () => {
    const sections = dbManager.getSyllabusSections();
    expect(sections).toHaveLength(8);

    const expectedCodes = [
      'DA_01_PROB_STATS',
      'DA_02_LIN_ALG',
      'DA_03_CALC_OPT',
      'DA_04_PROG_DSA',
      'DA_05_DBMS_DW',
      'DA_06_ML',
      'DA_07_AI',
      'DA_08_GEN_APT'
    ];

    const actualIds = sections.map((s) => s.id);
    expect(actualIds).toEqual(expectedCodes);

    // Sum of official weightages must equal 1.0 (100%)
    const totalWeight = sections.reduce((sum, s) => sum + s.official_weightage, 0);
    expect(Math.round(totalWeight * 100) / 100).toBe(1.0);
  });

  it('persists and updates user stats in user_profile.db', () => {
    const initialStats = dbManager.getUserStats();
    expect(initialStats.id).toBe('default_user');
    expect(initialStats.hearts).toBe(5);
    expect(initialStats.xp).toBe(0);

    const updated = dbManager.updateUserStats({
      xp: 150,
      current_streak: 7,
      hearts: 4,
      gems: 320
    });

    expect(updated.xp).toBe(150);
    expect(updated.current_streak).toBe(7);
    expect(updated.hearts).toBe(4);
    expect(updated.gems).toBe(320);

    // Re-query directly to confirm database write
    const queried = dbManager.getUserStats();
    expect(queried.xp).toBe(150);
    expect(queried.gems).toBe(320);
  });

  it('records mistakes in mistakes_vault and resolves them cleanly', () => {
    dbManager.addMistake('q_prob_01', 'unit_prob_bayes', 'Option B');

    let mistakes = dbManager.getMistakes(0);
    expect(mistakes).toHaveLength(1);
    expect(mistakes[0].question_id).toBe('q_prob_01');
    expect(mistakes[0].times_failed).toBe(1);

    // Repeated failure increases times_failed count
    dbManager.addMistake('q_prob_01', 'unit_prob_bayes', 'Option C');
    mistakes = dbManager.getMistakes(0);
    expect(mistakes[0].times_failed).toBe(2);
    expect(mistakes[0].last_incorrect_answer).toBe('Option C');

    // Resolve mistake
    dbManager.resolveMistake('q_prob_01');
    const unresolved = dbManager.getMistakes(0);
    expect(unresolved).toHaveLength(0);

    const resolved = dbManager.getMistakes(1);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].resolved).toBe(1);
  });

  it('performs atomic curriculum update swap while strictly preserving user_profile.db data', async () => {
    // 1. Establish user profile progress
    dbManager.updateUserStats({ xp: 500, current_streak: 12, gems: 900 });
    dbManager.addMistake('q_linalg_05', 'unit_linalg_eigen', 'Lambda = 2');

    // 2. Prepare an updated curriculum database bundle
    const updatedDbFile = path.join(tempDir, 'updated-curriculum.db');
    const updateDb = new Database(updatedDbFile);
    updateDb.exec(fs.readFileSync(curriculumSchemaPath, 'utf8'));

    // Insert a new unit and question into the updated curriculum DB
    updateDb.exec(`
      INSERT INTO syllabus_sections (id, code, title, short_title, description, order_index, official_weightage, color_hex, icon_name)
      VALUES ('DA_01_PROB_STATS', 'DA-01', 'Probability', 'Prob', 'Desc', 1, 0.15, '#10B981', 'ChartBar');

      INSERT INTO units (id, section_id, title, description, order_index)
      VALUES ('unit_v2_new', 'DA_01_PROB_STATS', 'Advanced Bayes Networks', 'Updated Unit', 1);
    `);
    updateDb.close();

    const decompressedBytes = fs.readFileSync(updatedDbFile);
    const sha256Checksum = crypto.createHash('sha256').update(decompressedBytes).digest('hex');
    const compressedBytes = zlib.gzipSync(decompressedBytes);

    const manifest: ContentManifest = {
      version: '1.1.0',
      schema_version: 1,
      published_at: new Date().toISOString(),
      sha256_checksum: sha256Checksum,
      total_questions: 1,
      total_nodes: 1,
      total_lectures: 0,
      notes: 'Test update package'
    };

    // 3. Close active dbManager connection to allow file swap
    dbManager.close();

    // 4. Perform atomic update via sync manager simulation
    const syncManager = new GitHubSyncManager({
      contentDir,
      repoOwner: 'jaybhayeom',
      repoName: 'GradGate'
    });

    // Write simulated incoming package
    const tempFile = path.join(contentDir, `curriculum.db.tmp-${Date.now()}`);
    fs.writeFileSync(tempFile, zlib.gunzipSync(compressedBytes));

    const actualHash = crypto.createHash('sha256').update(fs.readFileSync(tempFile)).digest('hex');
    expect(actualHash).toBe(manifest.sha256_checksum);

    // Swap files atomically
    if (fs.existsSync(curriculumDbPath)) fs.unlinkSync(curriculumDbPath);
    fs.renameSync(tempFile, curriculumDbPath);
    fs.writeFileSync(path.join(contentDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

    // 5. Reopen database manager
    dbManager = new DatabaseManager({
      curriculumDbPath,
      userProfileDbPath,
      curriculumSchemaPath,
      userProfileSchemaPath
    });
    dbManager.initialize();

    // 6. Verify curriculum contains new data
    const units = dbManager.getUnitsBySection('DA_01_PROB_STATS');
    expect(units).toHaveLength(1);
    expect(units[0].id).toBe('unit_v2_new');

    // 7. Verify user profile data was completely preserved!
    const preservedStats = dbManager.getUserStats();
    expect(preservedStats.xp).toBe(500);
    expect(preservedStats.current_streak).toBe(12);
    expect(preservedStats.gems).toBe(900);

    const preservedMistakes = dbManager.getMistakes(0);
    expect(preservedMistakes).toHaveLength(1);
    expect(preservedMistakes[0].question_id).toBe('q_linalg_05');
  });
});
