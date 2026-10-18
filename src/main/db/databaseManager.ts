// ==============================================================================
// DUAL-DATABASE MANAGER FOR GRADGATE
// Manages:
//   1. curriculum.db (Read-only curriculum content, synced from GitHub)
//   2. user_profile.db (Read-write user progress in SQLite WAL mode)
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import type {
  SyllabusSection,
  Unit,
  SteppingNode,
  Question,
  YouTubeLecture,
  VisualStudioConfig,
  ContentManifest,
  UserStats,
  NodeProgress,
  MistakesVaultItem,
  AdaptiveDailyTarget
} from '../../shared/types';

export interface DatabaseManagerOptions {
  curriculumDbPath: string;
  userProfileDbPath: string;
  curriculumSchemaPath?: string;
  userProfileSchemaPath?: string;
  isCurriculumReadOnly?: boolean;
}

export class DatabaseManager {
  private curriculumDb: DatabaseType | null = null;
  private userProfileDb: DatabaseType | null = null;
  private options: DatabaseManagerOptions;

  constructor(options: DatabaseManagerOptions) {
    this.options = options;
  }

  public initialize(): void {
    // 1. Ensure target directories exist
    const currDir = path.dirname(this.options.curriculumDbPath);
    const profDir = path.dirname(this.options.userProfileDbPath);
    if (!fs.existsSync(currDir)) fs.mkdirSync(currDir, { recursive: true });
    if (!fs.existsSync(profDir)) fs.mkdirSync(profDir, { recursive: true });

    // 2. Open User Profile DB (Always Read-Write, WAL Mode)
    this.userProfileDb = new Database(this.options.userProfileDbPath);
    this.userProfileDb.pragma('journal_mode = WAL');
    this.userProfileDb.pragma('foreign_keys = ON');

    // Run User Profile Schema
    const userSchemaPath =
      this.options.userProfileSchemaPath ||
      path.resolve(__dirname, 'userProfileSchema.sql');
    if (fs.existsSync(userSchemaPath)) {
      const userSql = fs.readFileSync(userSchemaPath, 'utf8');
      this.userProfileDb.exec(userSql);
    }

    // Ensure default user stats row exists
    this.ensureDefaultUserStats();

    // 3. Open Curriculum DB
    const currSchemaPath =
      this.options.curriculumSchemaPath ||
      path.resolve(__dirname, 'curriculumSchema.sql');

    const currExists = fs.existsSync(this.options.curriculumDbPath);
    if (!currExists && fs.existsSync(currSchemaPath)) {
      // Create fresh writable database to apply schema and initial seed
      const initDb = new Database(this.options.curriculumDbPath);
      initDb.pragma('foreign_keys = ON');
      const currSql = fs.readFileSync(currSchemaPath, 'utf8');
      initDb.exec(currSql);
      this.seedOfficialSections(initDb);
      initDb.close();
    }

    // Open curriculum DB according to read-only setting
    this.curriculumDb = new Database(this.options.curriculumDbPath, {
      readonly: this.options.isCurriculumReadOnly ?? false
    });
    this.curriculumDb.pragma('foreign_keys = ON');
  }

  private ensureDefaultUserStats(): void {
    if (!this.userProfileDb) return;
    const existing = this.userProfileDb
      .prepare('SELECT id FROM user_stats WHERE id = ?')
      .get('default_user');

    if (!existing) {
      this.userProfileDb
        .prepare(
          `INSERT INTO user_stats (
            id, display_name, avatar_id, xp, current_streak, longest_streak,
            streak_freezes, hearts, gems, target_exam_date, current_league, theme_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          'default_user',
          'GATE DA Aspirant',
          'avatar_default',
          0,
          0,
          0,
          2,
          5,
          150,
          '2027-02-07',
          'BRONZE',
          'theme_python_emerald'
        );
    }
  }

  public seedOfficialSections(db: DatabaseType): void {
    const check = db.prepare('SELECT COUNT(*) as count FROM syllabus_sections').get() as { count: number };
    if (check.count > 0) return;

    const insert = db.prepare(`
      INSERT INTO syllabus_sections (
        id, code, title, short_title, description, order_index, official_weightage, color_hex, icon_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sections: SyllabusSection[] = [
      {
        id: 'DA_01_PROB_STATS',
        code: 'DA-01',
        title: 'Probability and Statistics',
        short_title: 'Prob & Stats',
        description: 'Counting, probability axioms, random variables, distributions, sampling distributions, hypothesis testing.',
        order_index: 1,
        official_weightage: 0.15,
        color_hex: '#10B981',
        icon_name: 'ChartBar'
      },
      {
        id: 'DA_02_LIN_ALG',
        code: 'DA-02',
        title: 'Linear Algebra',
        short_title: 'Linear Algebra',
        description: 'Vector spaces, matrices, determinants, eigenvalues & eigenvectors, SVD, LU decomposition.',
        order_index: 2,
        official_weightage: 0.12,
        color_hex: '#3B82F6',
        icon_name: 'GridFour'
      },
      {
        id: 'DA_03_CALC_OPT',
        code: 'DA-03',
        title: 'Calculus and Optimization',
        short_title: 'Calculus & Opt',
        description: 'Functions of single variable, limits, continuity, differentiability, Taylor series, maxima/minima.',
        order_index: 3,
        official_weightage: 0.10,
        color_hex: '#8B5CF6',
        icon_name: 'TrendUp'
      },
      {
        id: 'DA_04_PROG_DSA',
        code: 'DA-04',
        title: 'Programming, Data Structures and Algorithms',
        short_title: 'Python & DSA',
        description: 'Python programming, stacks, queues, trees, graphs, sorting, searching, divide and conquer.',
        order_index: 4,
        official_weightage: 0.18,
        color_hex: '#F59E0B',
        icon_name: 'Code'
      },
      {
        id: 'DA_05_DBMS_DW',
        code: 'DA-05',
        title: 'Database Management and Warehousing',
        short_title: 'DBMS & DW',
        description: 'ER-model, relational algebra, SQL, normal forms, indexing (B/B+ trees), multidimensional schemas.',
        order_index: 5,
        official_weightage: 0.10,
        color_hex: '#EC4899',
        icon_name: 'Database'
      },
      {
        id: 'DA_06_ML',
        code: 'DA-06',
        title: 'Machine Learning',
        short_title: 'Machine Learning',
        description: 'Supervised (Regression, SVM, Trees, MLP) and Unsupervised (Clustering, PCA, dimensionality reduction).',
        order_index: 6,
        official_weightage: 0.15,
        color_hex: '#6366F1',
        icon_name: 'Brain'
      },
      {
        id: 'DA_07_AI',
        code: 'DA-07',
        title: 'Artificial Intelligence',
        short_title: 'AI & Search',
        description: 'Informed/uninformed search, adversarial search, propositional and predicate logic, reasoning under uncertainty.',
        order_index: 7,
        official_weightage: 0.05,
        color_hex: '#14B8A6',
        icon_name: 'Robot'
      },
      {
        id: 'DA_08_GEN_APT',
        code: 'DA-08',
        title: 'General Aptitude',
        short_title: 'General Aptitude',
        description: 'Verbal, quantitative, analytical, and spatial reasoning aptitude per official GATE standards.',
        order_index: 8,
        official_weightage: 0.15,
        color_hex: '#F97316',
        icon_name: 'Sparkle'
      }
    ];

    const insertTx = db.transaction((rows: SyllabusSection[]) => {
      for (const row of rows) {
        insert.run(
          row.id,
          row.code,
          row.title,
          row.short_title,
          row.description,
          row.order_index,
          row.official_weightage,
          row.color_hex,
          row.icon_name
        );
      }
    });

    insertTx(sections);
  }

  // --- Curriculum Query Methods ---
  public getSyllabusSections(): SyllabusSection[] {
    if (!this.curriculumDb) throw new Error('Curriculum DB not initialized');
    return this.curriculumDb
      .prepare('SELECT * FROM syllabus_sections ORDER BY order_index ASC')
      .all() as SyllabusSection[];
  }

  public getUnitsBySection(sectionId: string): Unit[] {
    if (!this.curriculumDb) throw new Error('Curriculum DB not initialized');
    return this.curriculumDb
      .prepare('SELECT * FROM units WHERE section_id = ? ORDER BY order_index ASC')
      .all(sectionId) as Unit[];
  }

  public getSteppingNodesByUnit(unitId: string): SteppingNode[] {
    if (!this.curriculumDb) throw new Error('Curriculum DB not initialized');
    return this.curriculumDb
      .prepare('SELECT * FROM stepping_nodes WHERE unit_id = ? ORDER BY order_index ASC')
      .all(unitId) as SteppingNode[];
  }

  public getQuestionsByNode(nodeId: string): Question[] {
    if (!this.curriculumDb) throw new Error('Curriculum DB not initialized');
    return this.curriculumDb
      .prepare('SELECT * FROM questions WHERE stepping_node_id = ? ORDER BY id ASC')
      .all(nodeId) as Question[];
  }

  public getYouTubeLectures(unitId?: string, language?: string): YouTubeLecture[] {
    if (!this.curriculumDb) throw new Error('Curriculum DB not initialized');
    let query = 'SELECT * FROM youtube_lectures WHERE 1=1';
    const params: unknown[] = [];
    if (unitId) {
      query += ' AND unit_id = ?';
      params.push(unitId);
    }
    if (language && language !== 'All') {
      query += ' AND language = ?';
      params.push(language);
    }
    query += ' ORDER BY created_at ASC';
    return this.curriculumDb.prepare(query).all(...params) as YouTubeLecture[];
  }

  public getVisualStudioConfig(unitId: string): VisualStudioConfig | null {
    if (!this.curriculumDb) throw new Error('Curriculum DB not initialized');
    return (
      (this.curriculumDb
        .prepare('SELECT * FROM visual_studio_configs WHERE unit_id = ? LIMIT 1')
        .get(unitId) as VisualStudioConfig) || null
    );
  }

  public getContentManifest(): ContentManifest | null {
    if (!this.curriculumDb) throw new Error('Curriculum DB not initialized');
    return (
      (this.curriculumDb
        .prepare('SELECT * FROM content_manifest ORDER BY published_at DESC LIMIT 1')
        .get() as ContentManifest) || null
    );
  }

  // --- User Profile Query Methods ---
  public getUserStats(): UserStats {
    if (!this.userProfileDb) throw new Error('UserProfile DB not initialized');
    return this.userProfileDb
      .prepare('SELECT * FROM user_stats WHERE id = ?')
      .get('default_user') as UserStats;
  }

  public updateUserStats(updates: Partial<UserStats>): UserStats {
    if (!this.userProfileDb) throw new Error('UserProfile DB not initialized');
    const fields: string[] = [];
    const values: unknown[] = [];

    const allowedKeys: (keyof UserStats)[] = [
      'display_name',
      'avatar_id',
      'xp',
      'current_streak',
      'longest_streak',
      'streak_freezes',
      'last_active_date',
      'hearts',
      'cram_mode_until',
      'gems',
      'target_exam_date',
      'current_league',
      'theme_id'
    ];

    for (const key of allowedKeys) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }

    if (fields.length > 0) {
      fields.push(`updated_at = datetime('now')`);
      values.push('default_user');
      const sql = `UPDATE user_stats SET ${fields.join(', ')} WHERE id = ?`;
      this.userProfileDb.prepare(sql).run(...values);
    }

    return this.getUserStats();
  }

  public getNodeProgress(nodeId?: string): NodeProgress[] {
    if (!this.userProfileDb) throw new Error('UserProfile DB not initialized');
    if (nodeId) {
      const res = this.userProfileDb
        .prepare('SELECT * FROM node_progress WHERE node_id = ?')
        .get(nodeId) as NodeProgress | undefined;
      return res ? [res] : [];
    }
    return this.userProfileDb.prepare('SELECT * FROM node_progress').all() as NodeProgress[];
  }

  public saveNodeProgress(progress: {
    nodeId: string;
    status: 'LOCKED' | 'ACTIVE_CURRENT' | 'COMPLETED_BRONZE' | 'COMPLETED_GOLD';
    score: number;
    stars: number;
  }): void {
    if (!this.userProfileDb) throw new Error('UserProfile DB not initialized');
    const existing = this.userProfileDb
      .prepare('SELECT * FROM node_progress WHERE node_id = ?')
      .get(progress.nodeId) as NodeProgress | undefined;

    if (existing) {
      const bestScore = Math.max(existing.best_score_pct, progress.score);
      const bestStars = Math.max(existing.stars_earned, progress.stars);
      this.userProfileDb
        .prepare(`
          UPDATE node_progress SET
            status = ?,
            attempts_count = attempts_count + 1,
            best_score_pct = ?,
            stars_earned = ?,
            last_attempted_at = datetime('now'),
            updated_at = datetime('now')
          WHERE node_id = ?
        `)
        .run(progress.status, bestScore, bestStars, progress.nodeId);
    } else {
      this.userProfileDb
        .prepare(`
          INSERT INTO node_progress (
            node_id, status, attempts_count, best_score_pct, stars_earned,
            first_completed_at, last_attempted_at
          ) VALUES (?, ?, 1, ?, ?, datetime('now'), datetime('now'))
        `)
        .run(progress.nodeId, progress.status, progress.score, progress.stars);
    }
  }

  public getMistakes(resolved = 0): MistakesVaultItem[] {
    if (!this.userProfileDb) throw new Error('UserProfile DB not initialized');
    return this.userProfileDb
      .prepare('SELECT * FROM mistakes_vault WHERE resolved = ? ORDER BY last_failed_at DESC')
      .all(resolved) as MistakesVaultItem[];
  }

  public addMistake(questionId: string, unitId: string, lastAnswer?: string): void {
    if (!this.userProfileDb) throw new Error('UserProfile DB not initialized');
    const existing = this.userProfileDb
      .prepare('SELECT * FROM mistakes_vault WHERE question_id = ?')
      .get(questionId);

    if (existing) {
      this.userProfileDb
        .prepare(`
          UPDATE mistakes_vault SET
            times_failed = times_failed + 1,
            last_incorrect_answer = ?,
            resolved = 0,
            last_failed_at = datetime('now')
          WHERE question_id = ?
        `)
        .run(lastAnswer || null, questionId);
    } else {
      this.userProfileDb
        .prepare(`
          INSERT INTO mistakes_vault (
            question_id, unit_id, times_failed, last_incorrect_answer, resolved, last_failed_at
          ) VALUES (?, ?, 1, ?, 0, datetime('now'))
        `)
        .run(questionId, unitId, lastAnswer || null);
    }
  }

  public resolveMistake(questionId: string): void {
    if (!this.userProfileDb) throw new Error('UserProfile DB not initialized');
    this.userProfileDb
      .prepare(`
        UPDATE mistakes_vault SET
          resolved = 1,
          resolved_at = datetime('now')
        WHERE question_id = ?
      `)
      .run(questionId);
  }

  public getDailyTargets(dateStr?: string): AdaptiveDailyTarget[] {
    if (!this.userProfileDb) throw new Error('UserProfile DB not initialized');
    const targetDate = dateStr || new Date().toISOString().slice(0, 10);
    return this.userProfileDb
      .prepare('SELECT * FROM adaptive_daily_targets WHERE target_date = ?')
      .all(targetDate) as AdaptiveDailyTarget[];
  }

  public close(): void {
    if (this.curriculumDb) {
      this.curriculumDb.close();
      this.curriculumDb = null;
    }
    if (this.userProfileDb) {
      this.userProfileDb.close();
      this.userProfileDb = null;
    }
  }

  public getCurriculumDb(): DatabaseType | null {
    return this.curriculumDb;
  }

  public getUserProfileDb(): DatabaseType | null {
    return this.userProfileDb;
  }
}
