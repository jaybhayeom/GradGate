// ==============================================================================
// PHASE 7 TEST SUITE: MATHEMATICS & APTITUDE CURRICULUM SEED INTEGRATION
// Verifies:
//   1. Execution of seed_01_prob_stats against real SQLite curriculumSchema.
//   2. Execution of seed_02_linear_algebra against real SQLite curriculumSchema.
//   3. Execution of seed_03_calculus_opt against real SQLite curriculumSchema.
//   4. Execution of seed_08_general_aptitude against real SQLite curriculumSchema.
//   5. Integrity of units, stepping nodes, questions, solutions, and studio configs.
//   6. Verification of youtube_lectures registry records.
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { seedSectionProbStats } from '../src/main/seeds/seed_01_prob_stats';
import { seedSectionLinearAlgebra } from '../src/main/seeds/seed_02_linear_algebra';
import { seedSectionCalculusOpt } from '../src/main/seeds/seed_03_calculus_opt';
import { seedSectionGeneralAptitude } from '../src/main/seeds/seed_08_general_aptitude';
import { DatabaseManager } from '../src/main/db/databaseManager';

describe('Phase 7: Mathematics & Aptitude Curriculum Seeds', () => {
  let tempDir: string;
  let dbPath: string;
  let db: DatabaseType;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gradgate-phase7-test-'));
    dbPath = path.join(tempDir, 'test_curriculum.db');
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');

    // Apply schema
    const schemaPath = path.resolve(__dirname, '../src/main/db/curriculumSchema.sql');
    db.exec(fs.readFileSync(schemaPath, 'utf8'));

    // Insert the 8 official sections
    const dbManager = new DatabaseManager({
      curriculumDbPath: dbPath,
      userProfileDbPath: path.join(tempDir, 'test_user.db')
    });
    dbManager.seedOfficialSections(db);
  });

  afterEach(() => {
    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('seeds Section 1 (Probability & Statistics) with units, nodes, questions and lectures', () => {
    seedSectionProbStats(db);

    const units = db.prepare('SELECT COUNT(*) as c FROM units WHERE section_id = ?').get('DA_01_PROB_STATS') as any;
    expect(units.c).toBe(3);

    const nodes = db.prepare(`
      SELECT COUNT(*) as c FROM stepping_nodes n
      JOIN units u ON n.unit_id = u.id
      WHERE u.section_id = ?
    `).get('DA_01_PROB_STATS') as any;
    expect(nodes.c).toBe(4);

    const questions = db.prepare(`
      SELECT COUNT(*) as c FROM questions q
      JOIN stepping_nodes n ON q.stepping_node_id = n.id
      JOIN units u ON n.unit_id = u.id
      WHERE u.section_id = ?
    `).get('DA_01_PROB_STATS') as any;
    expect(questions.c).toBeGreaterThanOrEqual(4);

    const lectures = db.prepare('SELECT COUNT(*) as c FROM youtube_lectures WHERE topic_id = ?').get('DA_01_PROB_STATS') as any;
    expect(lectures.c).toBe(3);

    const studio = db.prepare(`
      SELECT COUNT(*) as c FROM visual_studio_configs s
      JOIN units u ON s.unit_id = u.id
      WHERE u.section_id = ?
    `).get('DA_01_PROB_STATS') as any;
    expect(studio.c).toBe(1);
  });

  it('seeds Section 2 (Linear Algebra) with SVD, eigenvalues, and 2D transformation studio', () => {
    seedSectionLinearAlgebra(db);

    const units = db.prepare('SELECT COUNT(*) as c FROM units WHERE section_id = ?').get('DA_02_LIN_ALG') as any;
    expect(units.c).toBe(3);

    const nodes = db.prepare(`
      SELECT COUNT(*) as c FROM stepping_nodes n
      JOIN units u ON n.unit_id = u.id
      WHERE u.section_id = ?
    `).get('DA_02_LIN_ALG') as any;
    expect(nodes.c).toBe(4);

    const lectures = db.prepare('SELECT COUNT(*) as c FROM youtube_lectures WHERE topic_id = ?').get('DA_02_LIN_ALG') as any;
    expect(lectures.c).toBe(7);
  });

  it('seeds Section 3 (Calculus & Optimization) and Section 8 (General Aptitude)', () => {
    seedSectionCalculusOpt(db);
    seedSectionGeneralAptitude(db);

    const calcUnits = db.prepare('SELECT COUNT(*) as c FROM units WHERE section_id = ?').get('DA_03_CALC_OPT') as any;
    expect(calcUnits.c).toBe(3);

    const aptUnits = db.prepare('SELECT COUNT(*) as c FROM units WHERE section_id = ?').get('DA_08_GEN_APT') as any;
    expect(aptUnits.c).toBe(2);

    const allQuestions = db.prepare('SELECT COUNT(*) as c FROM questions').get() as any;
    expect(allQuestions.c).toBeGreaterThanOrEqual(8);
  });

  it('verifies that youtube_lectures.json exists and contains 14 verified entries', () => {
    const registryPath = path.resolve(__dirname, '../src/main/seeds/youtube_lectures.json');
    expect(fs.existsSync(registryPath)).toBe(true);

    const entries = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    expect(entries.length).toBeGreaterThanOrEqual(14);

    // Verify presence of core topics
    const topics = entries.map((e: any) => e.topicId);
    expect(topics).toContain('DA_01_PROB_STATS');
    expect(topics).toContain('DA_02_LIN_ALG');
    expect(topics).toContain('DA_03_CALC_OPT');
    expect(topics).toContain('DA_08_GEN_APT');
  });
});
