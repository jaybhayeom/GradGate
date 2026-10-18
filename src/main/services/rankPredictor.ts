// ==============================================================================
// GATE SCORE NORMALIZATION & ALL INDIA RANK (AIR) PREDICTOR
// Implements the official GATE Score formula and empirical GATE DA rank curve.
// Key Responsibilities:
//   1. Normalization formula: S = Sq + (St - Sq) * ((M - Mq) / (Mt_bar - Mq))
//   2. Qualifying cutoffs (General, OBC-NCL/EWS, SC/ST/PwD).
//   3. Predicted AIR range (e.g. 75+ Marks -> AIR 1-35).
//   4. Target IIT/IISc M.Tech & PSU eligibility badges.
// ==============================================================================

import type { Database as DatabaseType } from 'better-sqlite3';

export type CandidateCategory = 'GENERAL' | 'OBC_NCL_EWS' | 'SC_ST_PWD';

export interface QualifyingCutoffs {
  general: number;
  obcNclEws: number;
  scStPwd: number;
}

export interface GateScoreParams {
  rawMarks: number;
  qualifyingMarkGeneral?: number; // Mq (default ~27.5 for GATE DA)
  topPercentileMean?: number; // Mt_bar (default ~74.0 for top 0.1%)
  scoreQualifying?: number; // Sq = 350
  scoreTopPercentile?: number; // St = 900
}

export interface RankPredictionResult {
  rawMarks: number;
  normalizedGateScore: number; // 0 to 1000
  predictedAirRange: string;
  predictedAirMin: number;
  predictedAirMax: number;
  percentile: number; // e.g. 99.85
  qualifyingCutoffs: QualifyingCutoffs;
  isQualified: boolean;
  category: CandidateCategory;
  categoryCutoff: number;
  eligibilityBadges: string[];
}

export class RankPredictor {
  // Official GATE constants for Data Science & AI (DA)
  public static readonly DEFAULT_MQ_GENERAL = 27.5;
  public static readonly DEFAULT_MT_BAR = 74.0;
  public static readonly SQ = 350;
  public static readonly ST = 900;

  /**
   * Calculates category-wise qualifying cutoffs based on General cutoff Mq:
   * - General: Mq
   * - OBC-NCL / EWS: 0.9 * Mq
   * - SC / ST / PwD: (2/3) * Mq
   */
  public static calculateCutoffs(mqGeneral = RankPredictor.DEFAULT_MQ_GENERAL): QualifyingCutoffs {
    return {
      general: Math.round(mqGeneral * 10) / 10,
      obcNclEws: Math.round(mqGeneral * 0.9 * 10) / 10,
      scStPwd: Math.round((mqGeneral * 2) / 3 * 10) / 10
    };
  }

  /**
   * Computes official normalized GATE Score (out of 1000):
   * S = Sq + (St - Sq) * ((M - Mq) / (Mt_bar - Mq))
   * When M < Mq, scales down proportionally from 350 towards 0.
   */
  public static calculateNormalizedScore(params: GateScoreParams): number {
    const {
      rawMarks,
      qualifyingMarkGeneral = RankPredictor.DEFAULT_MQ_GENERAL,
      topPercentileMean = RankPredictor.DEFAULT_MT_BAR,
      scoreQualifying = RankPredictor.SQ,
      scoreTopPercentile = RankPredictor.ST
    } = params;

    if (rawMarks <= 0) return 0;

    if (rawMarks >= qualifyingMarkGeneral) {
      const denominator = topPercentileMean - qualifyingMarkGeneral;
      if (denominator <= 0) return scoreQualifying;

      const delta = (rawMarks - qualifyingMarkGeneral) / denominator;
      const score = scoreQualifying + (scoreTopPercentile - scoreQualifying) * delta;
      return Math.min(1000, Math.max(scoreQualifying, Math.round(score)));
    } else {
      // Proportional reduction below qualifying mark
      const fraction = rawMarks / qualifyingMarkGeneral;
      return Math.max(0, Math.round(scoreQualifying * fraction));
    }
  }

  /**
   * Predicts All India Rank (AIR) range, GATE score, and institution eligibility.
   */
  public static predict(
    rawMarks: number,
    category: CandidateCategory = 'GENERAL',
    customMq?: number
  ): RankPredictionResult {
    const mq = customMq ?? RankPredictor.DEFAULT_MQ_GENERAL;
    const cutoffs = RankPredictor.calculateCutoffs(mq);
    const categoryCutoff =
      category === 'GENERAL'
        ? cutoffs.general
        : category === 'OBC_NCL_EWS'
        ? cutoffs.obcNclEws
        : cutoffs.scStPwd;

    const isQualified = rawMarks >= categoryCutoff;
    const normalizedGateScore = RankPredictor.calculateNormalizedScore({ rawMarks, qualifyingMarkGeneral: mq });

    let predictedAirRange = 'Rank > 7000';
    let predictedAirMin = 7001;
    let predictedAirMax = 25000;
    let percentile = 65.0;

    if (rawMarks >= 80) {
      predictedAirRange = 'AIR 1–10';
      predictedAirMin = 1;
      predictedAirMax = 10;
      percentile = 99.98;
    } else if (rawMarks >= 75) {
      predictedAirRange = 'AIR 11–35';
      predictedAirMin = 11;
      predictedAirMax = 35;
      percentile = 99.92;
    } else if (rawMarks >= 70) {
      predictedAirRange = 'AIR 36–100';
      predictedAirMin = 36;
      predictedAirMax = 100;
      percentile = 99.80;
    } else if (rawMarks >= 65) {
      predictedAirRange = 'AIR 101–250';
      predictedAirMin = 101;
      predictedAirMax = 250;
      percentile = 99.50;
    } else if (rawMarks >= 60) {
      predictedAirRange = 'AIR 251–500';
      predictedAirMin = 251;
      predictedAirMax = 500;
      percentile = 99.00;
    } else if (rawMarks >= 55) {
      predictedAirRange = 'AIR 501–900';
      predictedAirMin = 501;
      predictedAirMax = 900;
      percentile = 98.20;
    } else if (rawMarks >= 50) {
      predictedAirRange = 'AIR 901–1500';
      predictedAirMin = 901;
      predictedAirMax = 1500;
      percentile = 97.00;
    } else if (rawMarks >= 45) {
      predictedAirRange = 'AIR 1501–2500';
      predictedAirMin = 1501;
      predictedAirMax = 2500;
      percentile = 95.00;
    } else if (rawMarks >= 40) {
      predictedAirRange = 'AIR 2501–4000';
      predictedAirMin = 2501;
      predictedAirMax = 4000;
      percentile = 92.00;
    } else if (rawMarks >= categoryCutoff) {
      predictedAirRange = 'AIR 4001–7000';
      predictedAirMin = 4001;
      predictedAirMax = 7000;
      percentile = 86.00;
    }

    // Target Eligibility Badges
    const badges: string[] = [];
    if (normalizedGateScore >= 850) {
      badges.push('IISc Bangalore M.Tech (AI / CDS)');
      badges.push('IIT Bombay / IIT Delhi M.Tech (CSE / AI)');
      badges.push('Top PSU Direct Call (ONGC, IOCL, NPCIL)');
    } else if (normalizedGateScore >= 750) {
      badges.push('IIT Madras / IIT Kanpur / IIT Kharagpur M.Tech');
      badges.push('PSU Research Interview (DRDO, ISRO, BARC)');
    } else if (normalizedGateScore >= 650) {
      badges.push('IIT Roorkee / IIT Guwahati / IIT Hyderabad M.Tech');
      badges.push('Top NITs (Trichy, Surathkal, Warangal)');
    } else if (normalizedGateScore >= 550) {
      badges.push('Newer IITs (IIT Mandi, IIT Ropar, IIT Gandhinagar)');
      badges.push('Premier IIITs (IIIT Hyderabad, IIIT Bangalore, IIIT Delhi)');
    } else if (normalizedGateScore >= 450) {
      badges.push('Other Top NITs & Central Universities');
    }

    if (isQualified) {
      badges.push('GATE Qualified (Eligible for MoE M.Tech Stipend ₹12,400/mo)');
    } else {
      badges.push('Below Qualifying Cutoff (Focus on Core Math & Python DSA)');
    }

    return {
      rawMarks: Math.round(rawMarks * 100) / 100,
      normalizedGateScore,
      predictedAirRange,
      predictedAirMin,
      predictedAirMax,
      percentile,
      qualifyingCutoffs: cutoffs,
      isQualified,
      category,
      categoryCutoff,
      eligibilityBadges: badges
    };
  }

  /**
   * Persists predicted rank and score to user_profile.db for a completed mock attempt.
   */
  public static recordAttemptPrediction(
    db: DatabaseType,
    attemptId: string,
    prediction: RankPredictionResult
  ): void {
    db.prepare(`
      UPDATE mock_attempts
      SET
        total_score = ?,
        predicted_air_range = ?,
        normalized_gate_score = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      prediction.rawMarks,
      prediction.predictedAirRange,
      prediction.normalizedGateScore,
      attemptId
    );
  }
}
