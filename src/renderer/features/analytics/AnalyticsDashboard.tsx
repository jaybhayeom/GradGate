// ==============================================================================
// 4-QUADRANT SPEED VS. ACCURACY DIAGNOSTIC ANALYTICS DASHBOARD
// Key Features:
//   1. 4-Quadrant Matrix classifying syllabus subtopics:
//        - Mastered Zone (High Accuracy, Fast Time)
//        - Time-Sink Zone (High Accuracy, Slow Time - needs shortcut drills)
//        - Careless Mistake Trap (Low Accuracy, Fast Time - losing marks to -0.33/-0.66)
//        - Concept Gap (Low Accuracy, Slow Time - links to Visual Studio & Lectures)
//   2. Negative Marking Bleed Tracker (Marks Gained vs Lost to Guesswork).
//   3. 8-Section GATE DA Performance Breakdown with visual progress indicators.
//   4. Direct action triggers to Visual Concept Studio, YouTube Hub & SRS Vault.
// ==============================================================================

import React, { useState, useMemo } from 'react';
import {
  Lightning,
  Clock,
  WarningCircle,
  CheckCircle,
  TrendUp,
  TrendDown,
  Brain,
  VideoCamera,
  Cards,
  ArrowRight,
  ShieldCheck,
  Target
} from '@phosphor-icons/react';
import type { RankPredictionResult } from '../../../main/services/rankPredictor';

export type MatrixQuadrant =
  | 'MASTERED_ZONE'
  | 'TIME_SINK_ZONE'
  | 'CARELESS_MISTAKE_TRAP'
  | 'CONCEPT_GAP';

export interface TopicMetric {
  topicId: string;
  topicTitle: string;
  sectionCode: string;
  sectionTitle: string;
  totalAttempted: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  avgTimeSeconds: number; // e.g. 85s
  accuracyPct: number; // 0..100
  marksGained: number;
  marksLostNegative: number;
}

export interface AnalyticsDashboardProps {
  topicMetrics?: TopicMetric[];
  prediction?: RankPredictionResult | null;
  onNavigateToStudio?: (topicId: string) => void;
  onNavigateToLectures?: (topicId: string) => void;
  onNavigateToSrs?: (topicId: string) => void;
}

// Sample default metrics covering the 8 official GATE DA sections
export const DEFAULT_TOPIC_METRICS: TopicMetric[] = [
  {
    topicId: 'DA_01_PROB_STATS',
    topicTitle: 'Conditional Probability & Bayes Theorem',
    sectionCode: 'DA_01_PROB_STATS',
    sectionTitle: 'Probability & Statistics',
    totalAttempted: 18,
    correctCount: 15,
    incorrectCount: 3,
    unattemptedCount: 2,
    avgTimeSeconds: 85,
    accuracyPct: 83.3,
    marksGained: 24.0,
    marksLostNegative: 1.0
  },
  {
    topicId: 'DA_02_LIN_ALG',
    topicTitle: 'Eigenvalues & SVD Decomposition',
    sectionCode: 'DA_02_LIN_ALG',
    sectionTitle: 'Linear Algebra',
    totalAttempted: 14,
    correctCount: 11,
    incorrectCount: 3,
    unattemptedCount: 1,
    avgTimeSeconds: 155, // Slow Time -> Time Sink Zone
    accuracyPct: 78.5,
    marksGained: 18.0,
    marksLostNegative: 1.0
  },
  {
    topicId: 'DA_03_CALC_OPT',
    topicTitle: 'Multivariable Maxima & Minima',
    sectionCode: 'DA_03_CALC_OPT',
    sectionTitle: 'Calculus & Optimization',
    totalAttempted: 12,
    correctCount: 5,
    incorrectCount: 7,
    unattemptedCount: 3,
    avgTimeSeconds: 65, // Fast Time, Low Accuracy -> Careless Mistake Trap
    accuracyPct: 41.6,
    marksGained: 7.0,
    marksLostNegative: 2.66
  },
  {
    topicId: 'DA_04_PROG_DSA',
    topicTitle: 'Graph Algorithms & Shortest Paths',
    sectionCode: 'DA_04_PROG_DSA',
    sectionTitle: 'Programming & DSA',
    totalAttempted: 15,
    correctCount: 4,
    incorrectCount: 11,
    unattemptedCount: 5,
    avgTimeSeconds: 160, // Slow Time, Low Accuracy -> Concept Gap
    accuracyPct: 26.6,
    marksGained: 6.0,
    marksLostNegative: 3.66
  },
  {
    topicId: 'DA_05_DBMS_DW',
    topicTitle: 'Relational Normal Forms & SQL Aggregates',
    sectionCode: 'DA_05_DBMS_DW',
    sectionTitle: 'DBMS & Warehousing',
    totalAttempted: 16,
    correctCount: 13,
    incorrectCount: 3,
    unattemptedCount: 0,
    avgTimeSeconds: 90,
    accuracyPct: 81.25,
    marksGained: 20.0,
    marksLostNegative: 1.0
  },
  {
    topicId: 'DA_06_ML',
    topicTitle: 'SVM Margins & Decision Trees',
    sectionCode: 'DA_06_ML',
    sectionTitle: 'Machine Learning',
    totalAttempted: 20,
    correctCount: 14,
    incorrectCount: 6,
    unattemptedCount: 2,
    avgTimeSeconds: 135,
    accuracyPct: 70.0,
    marksGained: 22.0,
    marksLostNegative: 2.0
  },
  {
    topicId: 'DA_07_AI',
    topicTitle: 'A* Search & Adversarial Alpha-Beta',
    sectionCode: 'DA_07_AI',
    sectionTitle: 'Artificial Intelligence',
    totalAttempted: 10,
    correctCount: 3,
    incorrectCount: 7,
    unattemptedCount: 4,
    avgTimeSeconds: 175,
    accuracyPct: 30.0,
    marksGained: 4.0,
    marksLostNegative: 2.33
  },
  {
    topicId: 'DA_08_GEN_APT',
    topicTitle: 'Quantitative & Spatial Reasoning',
    sectionCode: 'DA_08_GEN_APT',
    sectionTitle: 'General Aptitude',
    totalAttempted: 15,
    correctCount: 14,
    incorrectCount: 1,
    unattemptedCount: 0,
    avgTimeSeconds: 70,
    accuracyPct: 93.3,
    marksGained: 14.0,
    marksLostNegative: 0.33
  }
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  topicMetrics = DEFAULT_TOPIC_METRICS,
  prediction = null,
  onNavigateToStudio,
  onNavigateToLectures,
  onNavigateToSrs
}) => {
  const [selectedQuadrantFilter, setSelectedQuadrantFilter] = useState<MatrixQuadrant | 'ALL'>('ALL');

  // Classification threshold constants
  const SPEED_THRESHOLD_SEC = 120; // 2 minutes average
  const ACCURACY_THRESHOLD_PCT = 65; // 65% accuracy

  // Assign each topic to its 4-Quadrant Zone
  const categorizedTopics = useMemo(() => {
    return topicMetrics.map((topic) => {
      const isFast = topic.avgTimeSeconds <= SPEED_THRESHOLD_SEC;
      const isAccurate = topic.accuracyPct >= ACCURACY_THRESHOLD_PCT;

      let quadrant: MatrixQuadrant;
      if (isFast && isAccurate) {
        quadrant = 'MASTERED_ZONE';
      } else if (!isFast && isAccurate) {
        quadrant = 'TIME_SINK_ZONE';
      } else if (isFast && !isAccurate) {
        quadrant = 'CARELESS_MISTAKE_TRAP';
      } else {
        quadrant = 'CONCEPT_GAP';
      }

      return { ...topic, quadrant };
    });
  }, [topicMetrics]);

  // Quadrant Counts
  const quadrantCounts = useMemo(() => {
    const counts: Record<MatrixQuadrant, number> = {
      MASTERED_ZONE: 0,
      TIME_SINK_ZONE: 0,
      CARELESS_MISTAKE_TRAP: 0,
      CONCEPT_GAP: 0
    };
    categorizedTopics.forEach((t) => {
      counts[t.quadrant]++;
    });
    return counts;
  }, [categorizedTopics]);

  // Filtered topics based on user selection
  const displayedTopics = useMemo(() => {
    if (selectedQuadrantFilter === 'ALL') return categorizedTopics;
    return categorizedTopics.filter((t) => t.quadrant === selectedQuadrantFilter);
  }, [categorizedTopics, selectedQuadrantFilter]);

  // Overall Negative Marking Bleed Metrics
  const bleedStats = useMemo(() => {
    let totalGained = 0;
    let totalBleed = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;

    topicMetrics.forEach((t) => {
      totalGained += t.marksGained;
      totalBleed += t.marksLostNegative;
      totalCorrect += t.correctCount;
      totalIncorrect += t.incorrectCount;
    });

    const netScore = totalGained - totalBleed;
    const bleedRatioPct = totalGained > 0 ? (totalBleed / totalGained) * 100 : 0;

    return {
      totalGained: Math.round(totalGained * 100) / 100,
      totalBleed: Math.round(totalBleed * 100) / 100,
      netScore: Math.round(netScore * 100) / 100,
      bleedRatioPct: Math.round(bleedRatioPct * 10) / 10,
      totalCorrect,
      totalIncorrect
    };
  }, [topicMetrics]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-8 space-y-8 font-sans">
      {/* Top Banner: Rank & Prediction Highlight if available */}
      {prediction && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
              GATE DA 2026 Prediction Model
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {prediction.predictedAirRange}
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono font-bold text-sm rounded-lg border border-emerald-500/30">
                Score: {prediction.normalizedGateScore} / 1000
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              Based on Raw Marks: <strong>{prediction.rawMarks} / 100</strong> (Top {100 - prediction.percentile}%)
            </p>
          </div>

          <div className="flex flex-wrap gap-2 max-w-md justify-end">
            {prediction.eligibilityBadges.map((badge, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs bg-slate-800/90 text-slate-200 border border-slate-700 rounded-md font-medium"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Target size={28} className="text-emerald-400" />
            <span>4-Quadrant Speed vs. Accuracy Diagnostic Matrix</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Empirical efficiency mapping across all 8 GATE Data Science & AI syllabus sections.
          </p>
        </div>

        {/* Global Bleed Score Pill */}
        <div className="flex items-center space-x-3 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Net Marks Efficiency
            </span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              +{bleedStats.netScore} M
            </span>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-rose-400 tracking-wider">
              Negative Bleed
            </span>
            <span className="text-lg font-bold font-mono text-rose-400">
              -{bleedStats.totalBleed} M
            </span>
          </div>
        </div>
      </div>

      {/* Negative Marking Bleed Tracker Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={20} className="text-indigo-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Negative Marking Bleed Analysis (MCQ Guesswork Penalty)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {bleedStats.bleedRatioPct}% of positive marks surrendered to incorrect guesses
          </span>
        </div>

        {/* Multi-Segment Bleed Bar */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${Math.max(10, 100 - bleedStats.bleedRatioPct)}%` }}
              className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950"
              title="Positive Marks Gained"
            >
              Gained: +{bleedStats.totalGained}
            </div>
            <div
              style={{ width: `${Math.min(90, bleedStats.bleedRatioPct)}%` }}
              className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-bold text-white"
              title="Marks Bleed to Negative Marking"
            >
              Bleed: -{bleedStats.totalBleed}
            </div>
          </div>

          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>Total Correct Answers: {bleedStats.totalCorrect}</span>
            <span className="text-rose-400">Total Incorrect Penalized: {bleedStats.totalIncorrect}</span>
            <span>Ratio: {(bleedStats.totalGained / Math.max(1, bleedStats.totalBleed)).toFixed(1)}x Gains/Loss</span>
          </div>
        </div>
      </div>

      {/* 4 Quadrants Interactive Grid Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Quadrant 1: Mastered Zone */}
        <div
          onClick={() =>
            setSelectedQuadrantFilter(
              selectedQuadrantFilter === 'MASTERED_ZONE' ? 'ALL' : 'MASTERED_ZONE'
            )
          }
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            selectedQuadrantFilter === 'MASTERED_ZONE'
              ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/50 shadow-xl'
              : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
              Zone 1
            </span>
            <Lightning size={18} className="text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-white">Mastered Zone</h3>
          <p className="text-slate-400 text-xs mt-1">High Accuracy (≥65%) + Fast Speed (≤120s)</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {quadrantCounts.MASTERED_ZONE}
            </span>
            <span className="text-[11px] text-emerald-300 font-medium">Keep sharp with SRS →</span>
          </div>
        </div>

        {/* Quadrant 2: Time-Sink Zone */}
        <div
          onClick={() =>
            setSelectedQuadrantFilter(
              selectedQuadrantFilter === 'TIME_SINK_ZONE' ? 'ALL' : 'TIME_SINK_ZONE'
            )
          }
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            selectedQuadrantFilter === 'TIME_SINK_ZONE'
              ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/50 shadow-xl'
              : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/50 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400 uppercase tracking-wider">
              Zone 2
            </span>
            <Clock size={18} className="text-amber-400" />
          </div>
          <h3 className="text-base font-bold text-white">Time-Sink Zone</h3>
          <p className="text-slate-400 text-xs mt-1">High Accuracy (≥65%) + Slow Speed (&gt;120s)</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-2xl font-extrabold text-amber-400 font-mono">
              {quadrantCounts.TIME_SINK_ZONE}
            </span>
            <span className="text-[11px] text-amber-300 font-medium">Formula shortcuts needed →</span>
          </div>
        </div>

        {/* Quadrant 3: Careless Mistake Trap */}
        <div
          onClick={() =>
            setSelectedQuadrantFilter(
              selectedQuadrantFilter === 'CARELESS_MISTAKE_TRAP' ? 'ALL' : 'CARELESS_MISTAKE_TRAP'
            )
          }
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            selectedQuadrantFilter === 'CARELESS_MISTAKE_TRAP'
              ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/50 shadow-xl'
              : 'bg-slate-900/90 border-slate-800 hover:border-rose-500/50 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-400 uppercase tracking-wider">
              Zone 3
            </span>
            <WarningCircle size={18} className="text-rose-400" />
          </div>
          <h3 className="text-base font-bold text-white">Careless Trap</h3>
          <p className="text-slate-400 text-xs mt-1">Low Accuracy (&lt;65%) + Fast Speed (≤120s)</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-2xl font-extrabold text-rose-400 font-mono">
              {quadrantCounts.CARELESS_MISTAKE_TRAP}
            </span>
            <span className="text-[11px] text-rose-300 font-medium">Hemorrhaging -0.33/-0.66 →</span>
          </div>
        </div>

        {/* Quadrant 4: Concept Gap */}
        <div
          onClick={() =>
            setSelectedQuadrantFilter(
              selectedQuadrantFilter === 'CONCEPT_GAP' ? 'ALL' : 'CONCEPT_GAP'
            )
          }
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            selectedQuadrantFilter === 'CONCEPT_GAP'
              ? 'bg-red-950/60 border-red-600 ring-2 ring-red-600/50 shadow-xl'
              : 'bg-slate-900/90 border-slate-800 hover:border-red-600/50 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600/20 text-red-400 uppercase tracking-wider">
              Zone 4
            </span>
            <Brain size={18} className="text-red-400" />
          </div>
          <h3 className="text-base font-bold text-white">Concept Gap</h3>
          <p className="text-slate-400 text-xs mt-1">Low Accuracy (&lt;65%) + Slow Speed (&gt;120s)</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-2xl font-extrabold text-red-500 font-mono">
              {quadrantCounts.CONCEPT_GAP}
            </span>
            <span className="text-[11px] text-red-300 font-medium">Watch Visual Studio →</span>
          </div>
        </div>
      </div>

      {/* Filter indicator */}
      {selectedQuadrantFilter !== 'ALL' && (
        <div className="flex items-center justify-between bg-slate-800/60 px-4 py-2 rounded-lg border border-slate-700 text-xs">
          <span>
            Filtering by <strong>{selectedQuadrantFilter.replace(/_/g, ' ')}</strong> (
            {displayedTopics.length} topics)
          </span>
          <button
            onClick={() => setSelectedQuadrantFilter('ALL')}
            className="text-emerald-400 hover:underline font-bold"
          >
            Show All 8 Topics
          </button>
        </div>
      )}

      {/* Topic Breakdown List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Syllabus Subtopic Detailed Diagnostics
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {displayedTopics.length} Subtopics Analyzed
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {displayedTopics.map((topic) => (
            <div
              key={topic.topicId}
              className="p-5 flex items-center justify-between hover:bg-slate-800/40 transition"
            >
              {/* Topic Information & Section */}
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    {topic.sectionTitle}
                  </span>
                  <span className="text-slate-600">•</span>
                  {topic.quadrant === 'MASTERED_ZONE' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Mastered
                    </span>
                  )}
                  {topic.quadrant === 'TIME_SINK_ZONE' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Time-Sink
                    </span>
                  )}
                  {topic.quadrant === 'CARELESS_MISTAKE_TRAP' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Careless Trap
                    </span>
                  )}
                  {topic.quadrant === 'CONCEPT_GAP' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-600/30">
                      Concept Gap
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-white">{topic.topicTitle}</h4>

                <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono">
                  <span>Avg Time: {topic.avgTimeSeconds}s / question</span>
                  <span>Accuracy: {topic.accuracyPct}%</span>
                  <span className="text-rose-400">Neg Bleed: -{topic.marksLostNegative} M</span>
                </div>
              </div>

              {/* Action Buttons to Studio, Lectures, SRS */}
              <div className="flex items-center space-x-2">
                {onNavigateToStudio && (
                  <button
                    onClick={() => onNavigateToStudio(topic.topicId)}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-200 rounded-lg text-xs font-semibold transition"
                    title="Open NotebookLM Visual Concept Studio"
                  >
                    <Brain size={14} />
                    <span>Visual Studio</span>
                  </button>
                )}

                {onNavigateToLectures && (
                  <button
                    onClick={() => onNavigateToLectures(topic.topicId)}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-rose-950/70 hover:bg-rose-900 border border-rose-700/50 text-rose-200 rounded-lg text-xs font-semibold transition"
                    title="Watch Verified YouTube Lecture"
                  >
                    <VideoCamera size={14} />
                    <span>Lectures</span>
                  </button>
                )}

                {onNavigateToSrs && (
                  <button
                    onClick={() => onNavigateToSrs(topic.topicId)}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-200 rounded-lg text-xs font-semibold transition"
                    title="Review Formulas in Anki SRS Flashcard Vault"
                  >
                    <Cards size={14} />
                    <span>Formulas</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
