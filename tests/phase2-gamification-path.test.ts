// ==============================================================================
// PHASE 2 TEST SUITE: GAMIFICATION & ADAPTIVE TARGET ENGINE
// Verifies:
//   1. Days remaining calculation across countdown milestones (90d, 30d, 7d).
//   2. Topic priority score calculation: (W*0.4) + ((1-Acc)*0.35) + (Decay*0.25).
//   3. Daily quests generation and countdown-based intensity scaling.
//   4. Heart deduction, out-of-hearts detection, and Cram Mode bypass.
//   5. Heart refill and Gem Shop economy transactions.
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { AdaptiveTargetEngine } from '../src/main/services/adaptiveTargetEngine';

describe('Phase 2: Adaptive Target Engine & Gamification', () => {
  let tempDir: string;
  let dbPath: string;
  let db: DatabaseType;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gradgate-phase2-test-'));
    dbPath = path.join(tempDir, 'test_profile.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    const schemaPath = path.resolve(__dirname, '../src/main/db/userProfileSchema.sql');
    db.exec(fs.readFileSync(schemaPath, 'utf8'));

    // Insert default user
    db.prepare(`
      INSERT INTO user_stats (
        id, display_name, avatar_id, xp, current_streak, longest_streak,
        streak_freezes, hearts, gems, target_exam_date, current_league, theme_id
      ) VALUES ('default_user', 'GATE DA Aspirant', 'avatar_default', 120, 5, 10, 2, 5, 600, '2027-02-07', 'BRONZE', 'theme_python_emerald')
    `).run();
  });

  afterEach(() => {
    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('calculates days remaining accurately across exam countdown milestones', () => {
    const today = new Date('2026-11-09T00:00:00Z');

    // 90 days out
    const date90 = '2027-02-07T00:00:00Z';
    expect(AdaptiveTargetEngine.calculateDaysRemaining(date90, today)).toBe(90);

    // 30 days out
    const date30 = '2026-12-09T00:00:00Z';
    expect(AdaptiveTargetEngine.calculateDaysRemaining(date30, today)).toBe(30);

    // 7 days out
    const date7 = '2026-11-16T00:00:00Z';
    expect(AdaptiveTargetEngine.calculateDaysRemaining(date7, today)).toBe(7);

    // Past date (0 days remaining)
    const datePast = '2026-10-01T00:00:00Z';
    expect(AdaptiveTargetEngine.calculateDaysRemaining(datePast, today)).toBe(0);
  });

  it('computes exact topic priority score matching official formula', () => {
    // Formula: Priority = (Official_Weightage * 0.4) + ((1 - Accuracy) * 0.35) + (SRS_Decay * 0.25)
    const highUrgency = {
      topicId: 'DA_04_PROG_DSA',
      topicTitle: 'Algorithms',
      officialWeightage: 0.18, // 0.18 * 0.4 = 0.072
      accuracy: 0.3, // (1 - 0.3) * 0.35 = 0.245
      srsDecay: 0.8 // 0.8 * 0.25 = 0.2
      // Total = 0.072 + 0.245 + 0.2 = 0.517
    };

    const priority1 = AdaptiveTargetEngine.computeTopicPriority(highUrgency);
    expect(priority1).toBe(0.517);

    const lowUrgency = {
      topicId: 'DA_07_AI',
      topicTitle: 'AI Logic',
      officialWeightage: 0.05, // 0.05 * 0.4 = 0.02
      accuracy: 0.9, // (1 - 0.9) * 0.35 = 0.035
      srsDecay: 0.1 // 0.1 * 0.25 = 0.025
      // Total = 0.02 + 0.035 + 0.025 = 0.08
    };

    const priority2 = AdaptiveTargetEngine.computeTopicPriority(lowUrgency);
    expect(priority2).toBe(0.08);

    expect(priority1).toBeGreaterThan(priority2);
  });

  it('generates 4 dynamic daily quests and scales intensity close to exam', () => {
    const normalDay = new Date('2026-11-01T00:00:00Z');
    const examDate = '2027-02-07T00:00:00Z'; // > 90 days out

    const normalQuests = AdaptiveTargetEngine.generateDailyQuests(db, examDate, normalDay);
    expect(normalQuests).toHaveLength(4);

    const nodeQuest = normalQuests.find((q) => q.quest_type === 'NODE_COMPLETE');
    expect(nodeQuest).toBeDefined();
    expect(nodeQuest?.target_value).toBe(2);

    // Test final 2-week sprint intensity (<= 14 days out)
    const sprintDay = new Date('2027-01-30T00:00:00Z');
    const sprintQuests = AdaptiveTargetEngine.generateDailyQuests(db, examDate, sprintDay);
    expect(sprintQuests).toHaveLength(4);

    const sprintNodeQuest = sprintQuests.find((q) => q.quest_type === 'NODE_COMPLETE');
    expect(sprintNodeQuest?.target_value).toBe(3);

    const sprintMistakeQuest = sprintQuests.find((q) => q.quest_type === 'MISTAKE_REPAIR');
    expect(sprintMistakeQuest?.target_value).toBe(6);
  });

  it('manages hearts deduction, out-of-hearts detection and refills', () => {
    // Start at 5 hearts
    let result = AdaptiveTargetEngine.deductHeart(db, 'default_user');
    expect(result.heartsRemaining).toBe(4);
    expect(result.isOutOfHearts).toBe(false);

    // Deduct down to 0
    AdaptiveTargetEngine.deductHeart(db, 'default_user');
    AdaptiveTargetEngine.deductHeart(db, 'default_user');
    AdaptiveTargetEngine.deductHeart(db, 'default_user');
    result = AdaptiveTargetEngine.deductHeart(db, 'default_user');
    expect(result.heartsRemaining).toBe(0);
    expect(result.isOutOfHearts).toBe(true);

    // Further deductions stay at 0
    result = AdaptiveTargetEngine.deductHeart(db, 'default_user');
    expect(result.heartsRemaining).toBe(0);

    // Refill hearts back to 5
    const refilled = AdaptiveTargetEngine.refillHearts(db, 'default_user');
    expect(refilled.hearts).toBe(5);
  });

  it('handles Gem Shop transactions for Super Cram Mode and Streak Freezes', () => {
    // 1. Purchase Streak Freeze (200 Gems)
    const freezeRes = AdaptiveTargetEngine.purchaseStreakFreeze(db, 200, 'default_user');
    expect(freezeRes.success).toBe(true);
    expect(freezeRes.userStats?.gems).toBe(400); // 600 - 200
    expect(freezeRes.userStats?.streak_freezes).toBe(3); // 2 + 1

    // 2. Activate Super Cram Mode (450 Gems) - user currently has 400 gems -> should fail
    const failCram = AdaptiveTargetEngine.activateCramMode(db, 24, 450, 'default_user');
    expect(failCram.success).toBe(false);

    // Add gems and retry
    db.prepare('UPDATE user_stats SET gems = 1000 WHERE id = ?').run('default_user');
    const successCram = AdaptiveTargetEngine.activateCramMode(db, 24, 450, 'default_user');
    expect(successCram.success).toBe(true);
    expect(successCram.userStats?.gems).toBe(550); // 1000 - 450
    expect(successCram.userStats?.cram_mode_until).not.toBeNull();

    // Verify Cram Mode bypasses heart deductions
    const cramDeduct = AdaptiveTargetEngine.deductHeart(db, 'default_user');
    expect(cramDeduct.cramModeActive).toBe(true);
    expect(cramDeduct.heartsRemaining).toBe(5); // Not deducted!

    // Check gem_transactions table
    const txs = db.prepare('SELECT * FROM gem_transactions').all();
    expect(txs).toHaveLength(2);
  });
});
