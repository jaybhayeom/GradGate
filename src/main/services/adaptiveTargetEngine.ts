// ==============================================================================
// ADAPTIVE DAILY TARGET ENGINE & GAMIFICATION ECONOMY
// Responsibilities:
//   1. Dynamic Priority Weighting for GATE DA Topics:
//      Priority = (Official_Weightage * 0.4) + ((1 - Accuracy) * 0.35) + (SRS_Decay * 0.25)
//   2. Dynamic Daily Quest Generation based on exam countdown & weakest topics.
//   3. Heart transactions (0..5 limit, Cram Mode infinite bypass, Mistake refill).
//   4. Gem Shop transactions (Streak Freezes, 2x XP Boosts, Theme purchases).
// ==============================================================================

import type { Database as DatabaseType } from 'better-sqlite3';
import type { AdaptiveDailyTarget, UserStats } from '../../shared/types';

export interface TopicWeightInput {
  topicId: string;
  topicTitle: string;
  officialWeightage: number; // e.g. 0.15 for 15%
  accuracy: number; // 0.0 to 1.0 (defaults to 0.5 if unattempted)
  srsDecay: number; // 0.0 to 1.0 (higher if overdue for review)
}

export interface ScoredTopic extends TopicWeightInput {
  priorityScore: number;
}

export class AdaptiveTargetEngine {
  /**
   * Calculates days remaining between today and target GATE DA exam date.
   */
  public static calculateDaysRemaining(targetDateStr: string, currentDate = new Date()): number {
    const target = new Date(targetDateStr);
    const diffMs = target.getTime() - currentDate.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  /**
   * Computes priority score for a topic using official formula:
   * Priority = (Official_Weightage * 0.4) + ((1 - Accuracy) * 0.35) + (SRS_Decay * 0.25)
   */
  public static computeTopicPriority(input: TopicWeightInput): number {
    const w = Math.max(0, Math.min(1, input.officialWeightage));
    const acc = Math.max(0, Math.min(1, input.accuracy));
    const decay = Math.max(0, Math.min(1, input.srsDecay));

    const score = w * 0.4 + (1 - acc) * 0.35 + decay * 0.25;
    return Math.round(score * 10000) / 10000;
  }

  /**
   * Generates 4 adaptive daily study quests based on days remaining and topic priorities.
   */
  public static generateDailyQuests(
    db: DatabaseType,
    targetDateStr: string,
    currentDate = new Date()
  ): AdaptiveDailyTarget[] {
    const dateStr = currentDate.toISOString().slice(0, 10);
    const daysRemaining = this.calculateDaysRemaining(targetDateStr, currentDate);

    // Check if quests already exist for today
    const existing = db
      .prepare('SELECT * FROM adaptive_daily_targets WHERE target_date = ?')
      .all(dateStr) as AdaptiveDailyTarget[];

    if (existing.length >= 4) {
      return existing;
    }

    // Determine intensity multiplier based on exam countdown
    let nodeTarget = 2;
    let mistakeTarget = 3;
    let blitzTarget = 1;
    let srsTarget = 10;

    if (daysRemaining <= 14) {
      // Final 2 weeks: High-intensity revision
      nodeTarget = 3;
      mistakeTarget = 6;
      blitzTarget = 2;
      srsTarget = 20;
    } else if (daysRemaining <= 45) {
      // 1-2 months out: Balanced acceleration
      nodeTarget = 3;
      mistakeTarget = 4;
      blitzTarget = 1;
      srsTarget = 15;
    }

    const quests: {
      id: string;
      quest_type: AdaptiveDailyTarget['quest_type'];
      title: string;
      description: string;
      target_value: number;
      xp_reward: number;
    }[] = [
      {
        id: `quest_${dateStr}_nodes`,
        quest_type: 'NODE_COMPLETE',
        title: 'Master New Concepts',
        description: `Complete ${nodeTarget} stepping-stone nodes in the learning path.`,
        target_value: nodeTarget,
        xp_reward: 30
      },
      {
        id: `quest_${dateStr}_mistakes`,
        quest_type: 'MISTAKE_REPAIR',
        title: 'Mistakes Vault Repair',
        description: `Successfully repair ${mistakeTarget} previous errors from your mistakes vault.`,
        target_value: mistakeTarget,
        xp_reward: 25
      },
      {
        id: `quest_${dateStr}_blitz`,
        quest_type: 'TIMED_BLITZ',
        title: 'High-Speed Exam Blitz',
        description: `Score 80%+ on ${blitzTarget} timed micro-drill or speed sprint.`,
        target_value: blitzTarget,
        xp_reward: 35
      },
      {
        id: `quest_${dateStr}_srs`,
        quest_type: 'SRS_FLASHCARDS',
        title: 'Spaced Formula Review',
        description: `Review ${srsTarget} due Anki SM-2 formula cards to prevent memory decay.`,
        target_value: srsTarget,
        xp_reward: 20
      }
    ];

    const insert = db.prepare(`
      INSERT OR REPLACE INTO adaptive_daily_targets (
        id, target_date, quest_type, title, description, target_value, current_value, xp_reward, completed
      ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 0)
    `);

    const tx = db.transaction(() => {
      for (const q of quests) {
        insert.run(q.id, dateStr, q.quest_type, q.title, q.description, q.target_value, q.xp_reward);
      }
    });

    tx();

    return db
      .prepare('SELECT * FROM adaptive_daily_targets WHERE target_date = ?')
      .all(dateStr) as AdaptiveDailyTarget[];
  }

  // --- Heart Economy & Gamification Rules ---

  /**
   * Deducts 1 heart for an incorrect answer unless Super Cram Mode (infinite hearts) is active.
   */
  public static deductHeart(
    db: DatabaseType,
    userId = 'default_user'
  ): { heartsRemaining: number; isOutOfHearts: boolean; cramModeActive: boolean } {
    const user = db.prepare('SELECT hearts, cram_mode_until FROM user_stats WHERE id = ?').get(userId) as {
      hearts: number;
      cram_mode_until: string | null;
    } | undefined;

    if (!user) throw new Error('User not found');

    const isCramActive = Boolean(
      user.cram_mode_until && new Date(user.cram_mode_until) > new Date()
    );

    if (isCramActive) {
      return { heartsRemaining: user.hearts, isOutOfHearts: false, cramModeActive: true };
    }

    const nextHearts = Math.max(0, user.hearts - 1);
    db.prepare('UPDATE user_stats SET hearts = ?, updated_at = datetime(\'now\') WHERE id = ?').run(
      nextHearts,
      userId
    );

    return {
      heartsRemaining: nextHearts,
      isOutOfHearts: nextHearts === 0,
      cramModeActive: false
    };
  }

  /**
   * Refills hearts back to 5/5 upon completing a mistake repair drill or purchasing with gems.
   */
  public static refillHearts(db: DatabaseType, userId = 'default_user'): UserStats {
    db.prepare('UPDATE user_stats SET hearts = 5, updated_at = datetime(\'now\') WHERE id = ?').run(
      userId
    );
    return db.prepare('SELECT * FROM user_stats WHERE id = ?').get(userId) as UserStats;
  }

  /**
   * Activates Super Cram Mode (infinite hearts) for given duration (hours).
   */
  public static activateCramMode(
    db: DatabaseType,
    durationHours = 24,
    gemCost = 450,
    userId = 'default_user'
  ): { success: boolean; userStats?: UserStats; message: string } {
    const user = db.prepare('SELECT gems FROM user_stats WHERE id = ?').get(userId) as { gems: number } | undefined;
    if (!user) return { success: false, message: 'User not found' };

    if (user.gems < gemCost) {
      return { success: false, message: `Insufficient gems! Need ${gemCost}, you have ${user.gems}.` };
    }

    const untilDate = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();
    const newGems = user.gems - gemCost;

    const tx = db.transaction(() => {
      db.prepare(
        'UPDATE user_stats SET gems = ?, cram_mode_until = ?, updated_at = datetime(\'now\') WHERE id = ?'
      ).run(newGems, untilDate, userId);

      const txId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      db.prepare(`
        INSERT INTO gem_transactions (id, amount, balance_after, transaction_type, description)
        VALUES (?, ?, ?, 'SPENT', ?)
      `).run(
        txId,
        -gemCost,
        newGems,
        `Purchased Super Cram Mode (${durationHours}h Infinite Hearts)`
      );
    });

    tx();

    const updated = db.prepare('SELECT * FROM user_stats WHERE id = ?').get(userId) as UserStats;
    return { success: true, userStats: updated, message: 'Super Cram Mode activated!' };
  }

  /**
   * Spends gems to purchase a Streak Freeze.
   */
  public static purchaseStreakFreeze(
    db: DatabaseType,
    gemCost = 200,
    userId = 'default_user'
  ): { success: boolean; userStats?: UserStats; message: string } {
    const user = db
      .prepare('SELECT gems, streak_freezes FROM user_stats WHERE id = ?')
      .get(userId) as { gems: number; streak_freezes: number } | undefined;

    if (!user) return { success: false, message: 'User not found' };

    if (user.gems < gemCost) {
      return { success: false, message: `Need ${gemCost} gems (you have ${user.gems}).` };
    }

    const newGems = user.gems - gemCost;
    const newFreezes = user.streak_freezes + 1;

    const tx = db.transaction(() => {
      db.prepare(
        'UPDATE user_stats SET gems = ?, streak_freezes = ?, updated_at = datetime(\'now\') WHERE id = ?'
      ).run(newGems, newFreezes, userId);

      const txId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      db.prepare(`
        INSERT INTO gem_transactions (id, amount, balance_after, transaction_type, description)
        VALUES (?, ?, ?, 'SPENT', ?)
      `).run(txId, -gemCost, newGems, 'Purchased 1x Streak Freeze');
    });

    tx();

    const updated = db.prepare('SELECT * FROM user_stats WHERE id = ?').get(userId) as UserStats;
    return { success: true, userStats: updated, message: 'Streak Freeze equipped!' };
  }
}
