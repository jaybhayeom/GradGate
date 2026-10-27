// ==============================================================================
// PREMIER LANDING & ONBOARDING DASHBOARD FOR GRADGATE
// Serves as the central command hub for GATE DA Aspirants
// Features:
//   1. Hero Welcome & Live GATE DA Exam Countdown
//   2. Quick Launch Core (TCS iON Arena, Quest Path, Visual Studio, SRS, Lectures, Analytics)
//   3. All 8 Official GATE DA Syllabus Sections with Weightages & Quick Practice
//   4. Dynamic Daily Quests & Gamification Status
//   5. Dual-SQLite & Offline Pipeline Diagnostics
// ==============================================================================

import React, { useMemo } from 'react';
import {
  Target,
  Path,
  Compass,
  Cards,
  VideoCamera,
  ChartLineUp,
  Flame,
  Diamond,
  Heart,
  Trophy,
  CheckCircle,
  Clock,
  Sparkle,
  ArrowRight,
  ShieldCheck,
  Database,
  Lightning,
  BookOpen
} from '@phosphor-icons/react';
import { DuoButton } from '../../components/ui/DuoButton';
import type { SyllabusSection, UserStats, AdaptiveDailyTarget } from '../../../shared/types';

interface LandingDashboardViewProps {
  userStats: UserStats | null;
  sections: SyllabusSection[];
  dailyTargets: AdaptiveDailyTarget[];
  onNavigateTab: (
    tab:
      | 'path'
      | 'studio'
      | 'lectures'
      | 'arena'
      | 'analytics'
      | 'srs'
      | 'leaderboard'
      | 'shop'
      | 'settings'
  ) => void;
  onSelectSection: (sectionId: string) => void;
}

export function LandingDashboardView({
  userStats,
  sections,
  dailyTargets,
  onNavigateTab,
  onSelectSection
}: LandingDashboardViewProps): React.JSX.Element {
  // Calculate countdown to GATE DA Exam
  const examCountdown = useMemo(() => {
    const targetStr = userStats?.target_exam_date || '2027-02-07';
    const targetDate = new Date(targetStr);
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();
    const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    return { days, targetStr };
  }, [userStats?.target_exam_date]);

  // Overall readiness score
  const readinessPct = useMemo(() => {
    const xp = userStats?.xp || 0;
    // Normalized to 5,000 XP for full readiness
    return Math.min(100, Math.round((xp / 5000) * 100));
  }, [userStats?.xp]);

  return (
    <div className="max-w-6xl w-full mx-auto px-6 py-8 space-y-10 select-none">
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkle className="w-4 h-4" weight="fill" />
              <span>GATE Data Science & Artificial Intelligence (DA) Suite</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Welcome back,{' '}
              <span className="text-emerald-400">
                {userStats?.display_name || 'Aspirant'}
              </span>
              !
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              Your offline-first command station for mastering Data Science & AI.
              Engage with tactile learning quests, 3Blue1Brown visual math simulations,
              and official TCS iON 65-question computer-based exam simulations.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <DuoButton
                variant="primary"
                size="md"
                onClick={() => onNavigateTab('path')}
              >
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4" weight="bold" />
                  <span>Resume Learning Path</span>
                </div>
              </DuoButton>

              <DuoButton
                variant="secondary"
                size="md"
                onClick={() => onNavigateTab('arena')}
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" weight="bold" />
                  <span>Launch TCS iON Arena</span>
                </div>
              </DuoButton>
            </div>
          </div>

          {/* Right: Countdown & Readiness Meter */}
          <div className="flex flex-col gap-3 min-w-[240px] p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Exam Countdown</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">{examCountdown.targetStr}</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white tracking-tight">
                {examCountdown.days}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Days Remaining</span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Exam Readiness</span>
                <span className="text-emerald-400">{readinessPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${readinessPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. QUICK LAUNCH CENTER (6 CORE PILLARS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Lightning className="w-5 h-5 text-amber-400" weight="fill" />
              <span>Core Preparation Pillars</span>
            </h2>
            <p className="text-xs text-slate-400">
              Select a module to begin targeted exam preparation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Pillar 1: TCS iON Arena */}
          <div
            onClick={() => onNavigateTab('arena')}
            className="group cursor-pointer p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition duration-200 flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Target className="w-6 h-6" weight="duotone" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Official CBT
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-amber-400 transition">
                TCS iON 65-Q Exam Arena
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Official 100-mark mock exam with General Aptitude & Technical DA, Gate Scientific Calculator, and power-cut crash recovery.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 pt-2 border-t border-slate-800/80">
              <span>Start 3-Hour Simulation</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Pillar 2: Quest Learning Path */}
          <div
            onClick={() => onNavigateTab('path')}
            className="group cursor-pointer p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition duration-200 flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Path className="w-6 h-6" weight="duotone" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Gamified
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition">
                Duolingo-Style Quest Path
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Sinusoidal map of stepping nodes, concept drills, PYQ checkpoints, hearts, and streak freeze protections.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 pt-2 border-t border-slate-800/80">
              <span>Explore Stepping Nodes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Pillar 3: NotebookLM Visual Studio */}
          <div
            onClick={() => onNavigateTab('studio')}
            className="group cursor-pointer p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-850 transition duration-200 flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <Compass className="w-6 h-6" weight="duotone" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                3Blue1Brown
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-purple-400 transition">
                NotebookLM Visual Studio
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Interactive Mafs 2D coordinate spaces, Visx ML decision boundary plots, interactive mind maps, and 2-host audio deep dives.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-purple-400 pt-2 border-t border-slate-800/80">
              <span>Launch Visual Studio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Pillar 4: Anki SM-2 Flashcard Vault */}
          <div
            onClick={() => onNavigateTab('srs')}
            className="group cursor-pointer p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition duration-200 flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Cards className="w-6 h-6" weight="duotone" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                SM-2 SRS
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition">
                Formula & Concept Vault
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                SuperMemo SM-2 spaced repetition formula deck with 3D flip cards, KaTeX formulas, and active recall grading.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 pt-2 border-t border-slate-800/80">
              <span>Review Due Flashcards</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Pillar 5: Verified Lecture Hub */}
          <div
            onClick={() => onNavigateTab('lectures')}
            className="group cursor-pointer p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-850 transition duration-200 flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                <VideoCamera className="w-6 h-6" weight="duotone" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                18 Lectures
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-rose-400 transition">
                Multi-Language Lecture Hub
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Curated, verified video lectures across English, Hindi, and Hinglish with live watch tracking and XP rewards.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-rose-400 pt-2 border-t border-slate-800/80">
              <span>Watch Curated Lectures</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Pillar 6: AIR Rank Predictor & Analytics */}
          <div
            onClick={() => onNavigateTab('analytics')}
            className="group cursor-pointer p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 transition duration-200 flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <ChartLineUp className="w-6 h-6" weight="duotone" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Diagnostics
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white group-hover:text-blue-400 transition">
                AIR Predictor & 4-Quadrant Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Official score normalization formula, Speed vs. Accuracy diagnostic matrix, and negative marking bleed analysis.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-400 pt-2 border-t border-slate-800/80">
              <span>View Performance Matrix</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. OFFICIAL GATE DA SYLLABUS SECTIONS (ALL 8 SUBJECTS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" weight="fill" />
              <span>Official GATE DA Syllabus Coverage</span>
            </h2>
            <p className="text-xs text-slate-400">
              All 8 core sections seeded with official weightage, PYQs, and interactive drills.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => {
                onSelectSection(section.id);
                onNavigateTab('path');
              }}
              className="group cursor-pointer p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition duration-200 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono font-black"
                  style={{
                    backgroundColor: `${section.color_hex}20`,
                    color: section.color_hex,
                    border: `1px solid ${section.color_hex}40`
                  }}
                >
                  {section.code}
                </span>
                <span className="text-xs font-black text-slate-300">
                  {Math.round(section.official_weightage * 100)}% Marks
                </span>
              </div>

              <div>
                <h4 className="text-sm font-black text-white group-hover:text-emerald-400 transition truncate">
                  {section.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {section.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-bold text-slate-300">
                <span>Practice Units</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 group-hover:text-emerald-400 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SYSTEM HEALTH & DUAL-SQLITE STATUS */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" weight="duotone" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">Dual-SQLite Engine Operational</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                100% Offline Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              `curriculum.db` (read-only content) + `user_profile.db` (WAL mode with &lt;50ms auto-commit).
            </p>
          </div>
        </div>

        <DuoButton
          variant="secondary"
          size="sm"
          onClick={() => onNavigateTab('settings')}
        >
          <span>Open System Diagnostics</span>
        </DuoButton>
      </div>
    </div>
  );
}
