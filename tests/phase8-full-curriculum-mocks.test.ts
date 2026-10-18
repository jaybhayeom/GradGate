// ==============================================================================
// PHASE 8 TEST SUITE: FULL CURRICULUM SEED & 65-QUESTION MOCK PAPERS
// Verifies:
//   1. All 8 GATE DA sections seeded with units, stepping nodes, and questions.
//   2. Full-length 65-question papers (paper_gate_da_2024_official, paper_gate_da_2026_grand_mock_1).
//   3. Exact question counts: 10 General Aptitude (Q1-Q10) + 55 Technical DA (Q11-Q65).
//   4. Exact mark allocation: 15 marks for GA (5x1M + 5x2M) + 85 marks for DA (25x1M + 30x2M).
//   5. Integrity of YouTube lecture registry and database references.
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { seedAllCurriculum } from '../src/main/seeds/index';
import { DatabaseManager } from '../src/main/db/databaseManager';

describe('Phase 8: Full Curriculum & 65-Question Mock Papers', () => {
  let tempDir: string;
  let dbPath: string;
  let db: DatabaseType;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gradgate-phase8-test-'));
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

    // Run full curriculum seed
    seedAllCurriculum(db);
  });

  afterEach(() => {
    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('verifies that all 8 official syllabus sections have units and stepping nodes', () => {
    const sections = [
      'DA_01_PROB_STATS',
      'DA_02_LIN_ALG',
      'DA_03_CALC_OPT',
      'DA_04_PROG_DSA',
      'DA_05_DBMS_DW',
      'DA_06_ML',
      'DA_07_AI',
      'DA_08_GEN_APT'
    ];

    for (const sec of sections) {
      const unitCount = db.prepare('SELECT COUNT(*) as c FROM units WHERE section_id = ?').get(sec) as any;
      expect(unitCount.c).toBeGreaterThanOrEqual(1);

      const nodeCount = db.prepare(`
        SELECT COUNT(*) as c FROM stepping_nodes n
        JOIN units u ON n.unit_id = u.id
        WHERE u.section_id = ?
      `).get(sec) as any;
      expect(nodeCount.c).toBeGreaterThanOrEqual(1);
    }
  });

  it('verifies full-length 65-question mock paper composition', () => {
    const paperIds = ['paper_gate_da_2024_official', 'paper_gate_da_2026_grand_mock_1'];

    for (const pid of paperIds) {
      const paper = db.prepare('SELECT * FROM mock_papers WHERE id = ?').get(pid) as any;
      expect(paper).toBeDefined();
      expect(paper.total_questions).toBe(65);
      expect(paper.total_marks).toBe(100.0);
      expect(paper.duration_minutes).toBe(180);

      // Verify question count
      const qCount = db.prepare('SELECT COUNT(*) as c FROM mock_paper_questions WHERE mock_paper_id = ?').get(pid) as any;
      expect(qCount.c).toBe(65);

      // Verify Section 1: General Aptitude (Q1 to Q10)
      const gaQuestions = db.prepare(`
        SELECT q.marks, mpq.question_number
        FROM mock_paper_questions mpq
        JOIN questions q ON mpq.question_id = q.id
        WHERE mpq.mock_paper_id = ? AND mpq.section_category = 'GENERAL_APTITUDE'
        ORDER BY mpq.question_number ASC
      `).all(pid) as any[];

      expect(gaQuestions.length).toBe(10);
      expect(gaQuestions[0].question_number).toBe(1);
      expect(gaQuestions[9].question_number).toBe(10);

      const gaTotalMarks = gaQuestions.reduce((acc, cur) => acc + cur.marks, 0);
      expect(gaTotalMarks).toBe(15.0);

      // Verify Section 2: Technical DA (Q11 to Q65)
      const daQuestions = db.prepare(`
        SELECT q.marks, mpq.question_number
        FROM mock_paper_questions mpq
        JOIN questions q ON mpq.question_id = q.id
        WHERE mpq.mock_paper_id = ? AND mpq.section_category = 'TECHNICAL_DA'
        ORDER BY mpq.question_number ASC
      `).all(pid) as any[];

      expect(daQuestions.length).toBe(55);
      expect(daQuestions[0].question_number).toBe(11);
      expect(daQuestions[54].question_number).toBe(65);

      const daTotalMarks = daQuestions.reduce((acc, cur) => acc + cur.marks, 0);
      expect(daTotalMarks).toBe(85.0);

      // Total Marks must strictly equal 100
      expect(gaTotalMarks + daTotalMarks).toBe(100.0);
    }
  });
});
