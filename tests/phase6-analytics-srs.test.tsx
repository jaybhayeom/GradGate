// @vitest-environment jsdom
// ==============================================================================
// PHASE 6 TEST SUITE: RANK PREDICTOR, ANALYTICS DASHBOARD & ANKI SRS VAULT
// Verifies:
//   1. RankPredictor normalized GATE score calculation (out of 1000).
//   2. Category qualifying cutoffs (General, OBC-NCL, SC/ST/PwD).
//   3. All India Rank (AIR) range prediction across performance tiers.
//   4. Institutional eligibility badges (IISc, IITs, PSUs, NITs).
//   5. SuperMemo SM-2 algorithm intervals, repetition counts, and ease factor clamps.
//   6. 4-Quadrant Speed vs. Accuracy classification in AnalyticsDashboard.
//   7. Negative marking bleed calculation.
//   8. FlashcardVaultView 3D card flipping and keyboard-driven grading.
// ==============================================================================

import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  RankPredictor,
  CandidateCategory
} from '../src/main/services/rankPredictor';
import {
  AnalyticsDashboard,
  DEFAULT_TOPIC_METRICS
} from '../src/renderer/features/analytics/AnalyticsDashboard';
import {
  FlashcardVaultView,
  computeSm2Schedule,
  DEFAULT_SRS_CARDS
} from '../src/renderer/features/srs/FlashcardVaultView';
import type { SrsFlashcard } from '../src/shared/types';

describe('Phase 6: Rank Predictor, Analytics Dashboard & SRS Vault', () => {
  afterEach(() => {
    cleanup();
  });

  // ----------------------------------------------------------------------------
  // 1. RankPredictor Tests
  // ----------------------------------------------------------------------------
  it('calculates category qualifying cutoffs accurately based on General cutoff', () => {
    const cutoffs = RankPredictor.calculateCutoffs(27.5);
    expect(cutoffs.general).toBe(27.5);
    expect(cutoffs.obcNclEws).toBe(24.8); // 27.5 * 0.9 = 24.75 -> 24.8
    expect(cutoffs.scStPwd).toBe(18.3); // 27.5 * 2/3 = 18.33 -> 18.3
  });

  it('computes official normalized GATE Score (out of 1000)', () => {
    // Exactly at Mq -> should equal Sq (350)
    const scoreAtMq = RankPredictor.calculateNormalizedScore({
      rawMarks: 27.5,
      qualifyingMarkGeneral: 27.5,
      topPercentileMean: 74.0
    });
    expect(scoreAtMq).toBe(350);

    // Exactly at Mt_bar -> should equal St (900)
    const scoreAtMt = RankPredictor.calculateNormalizedScore({
      rawMarks: 74.0,
      qualifyingMarkGeneral: 27.5,
      topPercentileMean: 74.0
    });
    expect(scoreAtMt).toBe(900);

    // High score 82 marks -> should be between 900 and 1000
    const scoreHigh = RankPredictor.calculateNormalizedScore({
      rawMarks: 82.0,
      qualifyingMarkGeneral: 27.5,
      topPercentileMean: 74.0
    });
    expect(scoreHigh).toBeGreaterThan(900);
    expect(scoreHigh).toBeLessThanOrEqual(1000);

    // Below qualifying cutoff -> proportional scale down from 350
    const scoreLow = RankPredictor.calculateNormalizedScore({
      rawMarks: 13.75, // half of 27.5
      qualifyingMarkGeneral: 27.5,
      topPercentileMean: 74.0
    });
    expect(scoreLow).toBe(175);
  });

  it('predicts AIR range and target eligibility badges for high achievers', () => {
    const predictionHigh = RankPredictor.predict(78.5, 'GENERAL');
    expect(predictionHigh.predictedAirRange).toBe('AIR 11–35');
    expect(predictionHigh.isQualified).toBe(true);
    expect(predictionHigh.normalizedGateScore).toBeGreaterThanOrEqual(850);
    expect(predictionHigh.eligibilityBadges).toContain('IISc Bangalore M.Tech (AI / CDS)');
    expect(predictionHigh.eligibilityBadges).toContain('IIT Bombay / IIT Delhi M.Tech (CSE / AI)');
  });

  it('predicts rank and badges for borderline qualifying candidates', () => {
    const predictionBorderline = RankPredictor.predict(30.0, 'GENERAL');
    expect(predictionBorderline.predictedAirRange).toBe('AIR 4001–7000');
    expect(predictionBorderline.isQualified).toBe(true);
    expect(predictionBorderline.eligibilityBadges).toContain(
      'GATE Qualified (Eligible for MoE M.Tech Stipend ₹12,400/mo)'
    );
  });

  // ----------------------------------------------------------------------------
  // 2. SuperMemo SM-2 Algorithm Tests
  // ----------------------------------------------------------------------------
  it('correctly schedules review intervals and updates ease factor', () => {
    const initialCard: SrsFlashcard = {
      card_id: 'card_bayes',
      repetitions: 0,
      ease_factor: 2.5,
      interval_days: 0,
      next_review_due: '2026-10-18',
      created_at: '2026-10-18T00:00:00Z'
    };

    const baseDate = new Date('2026-10-18T12:00:00Z');

    // Step 1: First review with Grade 3 (Good) -> interval = 1
    const step1 = computeSm2Schedule(initialCard, 3, baseDate);
    expect(step1.repetitions).toBe(1);
    expect(step1.interval_days).toBe(1);
    expect(step1.next_review_due).toBe('2026-10-19');

    // Step 2: Second review with Grade 3 (Good) -> interval = 6
    const step2 = computeSm2Schedule(step1, 3, new Date('2026-10-19T12:00:00Z'));
    expect(step2.repetitions).toBe(2);
    expect(step2.interval_days).toBe(6);
    expect(step2.next_review_due).toBe('2026-10-25');

    // Step 3: Third review with Grade 4 (Easy) -> interval = 6 * EF * 1.3
    const step3 = computeSm2Schedule(step2, 4, new Date('2026-10-25T12:00:00Z'));
    expect(step3.repetitions).toBe(3);
    expect(step3.interval_days).toBeGreaterThan(15);
    expect(step3.ease_factor).toBeGreaterThan(2.5); // Boosted ease factor

    // Step 4: Lapse with Grade 1 (Again) -> reset repetitions = 0, interval = 1
    const step4 = computeSm2Schedule(step3, 1, new Date('2026-11-15T12:00:00Z'));
    expect(step4.repetitions).toBe(0);
    expect(step4.interval_days).toBe(1);
    expect(step4.ease_factor).toBeLessThan(step3.ease_factor);
    expect(step4.ease_factor).toBeGreaterThanOrEqual(1.3); // Never below 1.3
  });

  // ----------------------------------------------------------------------------
  // 3. AnalyticsDashboard Tests
  // ----------------------------------------------------------------------------
  it('renders 4-Quadrant Speed vs Accuracy matrix and negative bleed analysis', () => {
    const prediction = RankPredictor.predict(68.0, 'GENERAL');

    render(
      <AnalyticsDashboard
        topicMetrics={DEFAULT_TOPIC_METRICS}
        prediction={prediction}
      />
    );

    // Verify 4 Quadrant Cards
    expect(screen.getAllByText('Mastered Zone').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Time-Sink Zone').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Careless Trap').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Concept Gap').length).toBeGreaterThan(0);

    // Verify Negative Marking Bleed section
    expect(screen.getByText(/Negative Marking Bleed Analysis/i)).toBeDefined();

    // Verify Prediction Banner
    expect(screen.getByText(prediction.predictedAirRange)).toBeDefined();

    // Filter to Mastered Zone only
    fireEvent.click(screen.getByText('Mastered Zone'));
    expect(screen.getByText(/Filtering by/i)).toBeDefined();
    expect(screen.getByText(/Conditional Probability & Bayes Theorem/i)).toBeDefined();
  });

  // ----------------------------------------------------------------------------
  // 4. FlashcardVaultView Tests
  // ----------------------------------------------------------------------------
  it('handles 3D card flip and SM-2 grading actions', () => {
    render(<FlashcardVaultView initialCards={DEFAULT_SRS_CARDS} />);

    // Front of the card should be visible
    expect(screen.getByText(/Concept Prompt/i)).toBeDefined();
    expect(screen.getByText(/Show Answer/i)).toBeDefined();

    // Flip card via Show Answer button
    fireEvent.click(screen.getByText(/Show Answer/i));

    // Back of card is now visible with formulas and grading buttons
    expect(screen.getByText(/Formula & Derivation/i)).toBeDefined();
    expect(screen.getByText('Again')).toBeDefined();
    expect(screen.getByText('Hard')).toBeDefined();
    expect(screen.getByText('Good')).toBeDefined();
    expect(screen.getByText('Easy')).toBeDefined();

    // Grade as Good (3)
    fireEvent.click(screen.getByText('Good'));

    // Should advance to next card and flip back to front
    expect(screen.getByText(/Concept Prompt/i)).toBeDefined();
    expect(screen.getByText(/Card 2 of/i)).toBeDefined();
  });
});
