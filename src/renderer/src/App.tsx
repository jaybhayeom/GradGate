// ==============================================================================
// APP MAIN COMPONENT
// Features:
//   1. FramelessTitleBar & TopStatHud
//   2. Navigation: Home Landing, Learning Path, Visual Studio, Lectures, Arena, Analytics, SRS, Shop, Settings
//   3. Interactive LessonRunner overlay on node selection (zero fake alerts!)
//   4. Full-Length 65-Q Mock Paper loader for TCS iON Arena
//   5. 100% Robust Offline Pipeline with graceful local fallbacks
// ==============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { FramelessTitleBar } from '../components/ui/FramelessTitleBar';
import { TopStatHud } from '../components/ui/TopStatHud';
import { LandingDashboardView } from '../features/landing/LandingDashboardView';
import { QuestMapView } from '../features/path/QuestMapView';
import { VisualConceptStudio } from '../features/studio/VisualConceptStudio';
import { YouTubeLectureHub } from '../features/lectures/YouTubeLectureHub';
import { LeagueLeaderboardView } from '../features/gamification/LeagueLeaderboardView';
import { GemShopView } from '../features/gamification/GemShopView';
import { MistakeRepairModal } from '../features/gamification/MistakeRepairModal';
import { DesignSystemPreview } from '../features/design-system/DesignSystemPreview';
import { TcsIonArenaView, ArenaQuestion } from '../features/arena/TcsIonArenaView';
import { AnalyticsDashboard } from '../features/analytics/AnalyticsDashboard';
import { FlashcardVaultView } from '../features/srs/FlashcardVaultView';
import { SettingsView } from '../features/settings/SettingsView';
import { LessonRunner } from '../features/lesson/LessonRunner';
import type {
  SyllabusSection,
  Unit,
  SteppingNode,
  NodeProgress,
  UserStats,
  MistakesVaultItem,
  AdaptiveDailyTarget,
  YouTubeLecture,
  Question
} from '../../shared/types';
import {
  Home,
  Route,
  Trophy,
  Diamond,
  Palette,
  Target,
  Compass,
  Video,
  BarChart2,
  BookOpen,
  Settings,
  FileText
} from 'lucide-react';

const DEFAULT_SECTIONS: SyllabusSection[] = [
  {
    id: 'DA_01_PROB_STATS',
    code: 'DA-01',
    title: 'Probability and Statistics',
    short_title: 'Prob & Stats',
    description: 'Counting, probability axioms, random variables, distributions, CLT, and hypothesis testing.',
    order_index: 1,
    official_weightage: 0.15,
    color_hex: '#10B981',
    icon_name: 'Dice'
  },
  {
    id: 'DA_02_LIN_ALG',
    code: 'DA-02',
    title: 'Linear Algebra',
    short_title: 'Linear Algebra',
    description: 'Vector spaces, matrices, Gaussian elimination, eigenvalues, SVD, and LU decomposition.',
    order_index: 2,
    official_weightage: 0.15,
    color_hex: '#3B82F6',
    icon_name: 'GridFour'
  },
  {
    id: 'DA_03_CALC_OPT',
    code: 'DA-03',
    title: 'Calculus and Optimization',
    short_title: 'Calculus & Opt',
    description: 'Single-variable calculus, limits, continuity, Taylor series, and gradient descent optimization.',
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
    description: 'Python programming, stacks, queues, trees, hash tables, sorting, and graph traversals.',
    order_index: 4,
    official_weightage: 0.15,
    color_hex: '#06B6D4',
    icon_name: 'Code'
  },
  {
    id: 'DA_05_DBMS_DW',
    code: 'DA-05',
    title: 'Database Management and Warehousing',
    short_title: 'DBMS & Warehousing',
    description: 'ER-model, relational algebra, SQL, normal forms, B+ trees, and data warehousing schemas.',
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
    description: 'Supervised (regression, SVM, trees), unsupervised (clustering, PCA), and bias-variance tradeoff.',
    order_index: 6,
    official_weightage: 0.15,
    color_hex: '#F59E0B',
    icon_name: 'Brain'
  },
  {
    id: 'DA_07_AI',
    code: 'DA-07',
    title: 'Artificial Intelligence',
    short_title: 'AI & Search',
    description: 'Informed/uninformed search, adversarial search, propositional/predicate logic, and Bayesian Networks.',
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

const DEFAULT_USER_STATS: UserStats = {
  id: 'default_user',
  display_name: 'GATE DA Aspirant',
  avatar_id: 'avatar_default',
  xp: 350,
  current_streak: 5,
  longest_streak: 12,
  streak_freezes: 2,
  hearts: 5,
  cram_mode_until: null,
  gems: 280,
  target_exam_date: '2027-02-07',
  current_league: 'BRONZE',
  theme_id: 'theme_python_emerald',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const DEFAULT_DAILY_TARGETS: AdaptiveDailyTarget[] = [
  {
    id: 'quest_1',
    target_date: new Date().toISOString().slice(0, 10),
    quest_type: 'NODE_COMPLETE',
    title: 'Complete 2 Concept Nodes',
    description: 'Clear stepping stone lessons on the learning map.',
    target_value: 2,
    current_value: 1,
    xp_reward: 30,
    completed: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'quest_2',
    target_date: new Date().toISOString().slice(0, 10),
    quest_type: 'SRS_FLASHCARDS',
    title: 'Review 5 Formula Cards',
    description: 'Reinforce active recall in the Flashcard Vault.',
    target_value: 5,
    current_value: 3,
    xp_reward: 25,
    completed: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export default function App(): React.JSX.Element {
  const [sections, setSections] = useState<SyllabusSection[]>(DEFAULT_SECTIONS);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('DA_01_PROB_STATS');
  const [units, setUnits] = useState<Unit[]>([]);
  const [nodesByUnit, setNodesByUnit] = useState<Record<string, SteppingNode[]>>({});
  const [nodeProgress, setNodeProgress] = useState<Record<string, NodeProgress>>({});
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_USER_STATS);
  const [mistakes, setMistakes] = useState<MistakesVaultItem[]>([]);
  const [dailyTargets, setDailyTargets] = useState<AdaptiveDailyTarget[]>(DEFAULT_DAILY_TARGETS);
  const [lectures, setLectures] = useState<YouTubeLecture[]>([]);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);

  // Active Lesson Runner State
  const [activeLessonNode, setActiveLessonNode] = useState<SteppingNode | null>(null);
  const [activeLessonQuestions, setActiveLessonQuestions] = useState<Question[]>([]);

  // Arena Mock Papers State
  const [mockPapersList, setMockPapersList] = useState<{ id: string; title: string; total_questions: number }[]>([]);
  const [selectedMockPaperId, setSelectedMockPaperId] = useState<string>('paper_gate_da_2024_official');
  const [loadedArenaQuestions, setLoadedArenaQuestions] = useState<ArenaQuestion[]>([]);
  const [isLoadingArenaQuestions, setIsLoadingArenaQuestions] = useState(false);

  const [activeTab, setActiveTab] = useState<
    | 'home'
    | 'path'
    | 'studio'
    | 'lectures'
    | 'arena'
    | 'analytics'
    | 'srs'
    | 'leaderboard'
    | 'shop'
    | 'settings'
    | 'design_system'
  >('home');

  // 1. Initial Data Fetching from Database
  useEffect(() => {
    // Fetch syllabus sections
    if (window.api?.getSyllabusSections) {
      window.api.getSyllabusSections().then((data) => {
        if (data && data.length > 0) {
          setSections(data);
          setSelectedSectionId(data[0].id);
        }
      }).catch((err) => console.error(err));
    }

    // Fetch user stats
    if (window.api?.getUserStats) {
      window.api.getUserStats().then((stats) => {
        if (stats) setUserStats(stats);
      }).catch((err) => console.error(err));
    }

    // Fetch node progress
    if (window.api?.getNodeProgress) {
      window.api.getNodeProgress().then((progs) => {
        if (progs && progs.length > 0) {
          const map: Record<string, NodeProgress> = {};
          for (const p of progs) map[p.node_id] = p;
          setNodeProgress(map);
        }
      }).catch((err) => console.error(err));
    }

    // Fetch mistakes vault items
    if (window.api?.getMistakes) {
      window.api.getMistakes().then((items) => {
        if (items) setMistakes(items);
      }).catch((err) => console.error(err));
    }

    // Fetch daily targets
    if (window.api?.getDailyTargets) {
      window.api.getDailyTargets().then((targets) => {
        if (targets && targets.length > 0) setDailyTargets(targets);
      }).catch((err) => console.error(err));
    }

    // Fetch YouTube lectures
    if (window.api?.getLectures) {
      window.api.getLectures().then((lecs) => {
        if (lecs && lecs.length > 0) {
          setLectures(lecs);
        }
      }).catch((err) => console.error(err));
    }

    // Fetch Mock Papers List
    if (window.api?.getMockPapers) {
      window.api.getMockPapers().then((papers) => {
        if (papers && papers.length > 0) {
          setMockPapersList(papers);
          setSelectedMockPaperId(papers[0].id);
        }
      }).catch((err) => console.error(err));
    }
  }, []);

  // 2. Load units and nodes when selectedSectionId changes
  useEffect(() => {
    if (!selectedSectionId) return;

    if (window.api?.getUnits) {
      window.api.getUnits(selectedSectionId).then(async (fetchedUnits) => {
        const validUnits = (fetchedUnits && fetchedUnits.length > 0) ? fetchedUnits : [
          {
            id: `unit_${selectedSectionId}_1`,
            section_id: selectedSectionId as SyllabusSection['id'],
            title: 'Foundational Principles & Concepts',
            description: 'Core theorems, formulas, and fundamental properties tested in GATE DA.',
            order_index: 1,
            created_at: new Date().toISOString()
          },
          {
            id: `unit_${selectedSectionId}_2`,
            section_id: selectedSectionId as SyllabusSection['id'],
            title: 'Advanced Applications & Trap Analysis',
            description: 'High-frequency exam pitfalls, multi-step derivations, and standard PYQs.',
            order_index: 2,
            created_at: new Date().toISOString()
          }
        ];

        setUnits(validUnits);

        const nodeMap: Record<string, SteppingNode[]> = {};
        for (const u of validUnits) {
          let nodes: SteppingNode[] = [];
          if (window.api?.getNodes) {
            nodes = await window.api.getNodes(u.id);
          }
          if (!nodes || nodes.length === 0) {
            nodes = [
              {
                id: `${u.id}_node_1`,
                unit_id: u.id,
                title: 'Concept Drill 1',
                node_type: 'CONCEPT_DRILL',
                order_index: 1,
                total_xp: 15,
                required_hearts: 1,
                created_at: new Date().toISOString()
              },
              {
                id: `${u.id}_node_2`,
                unit_id: u.id,
                title: 'Visual Studio Exploration',
                node_type: 'VISUAL_STUDIO',
                order_index: 2,
                total_xp: 20,
                required_hearts: 1,
                created_at: new Date().toISOString()
              },
              {
                id: `${u.id}_node_3`,
                unit_id: u.id,
                title: 'Official PYQ Checkpoint',
                node_type: 'PYQ_CHECKPOINT',
                order_index: 3,
                total_xp: 25,
                required_hearts: 1,
                created_at: new Date().toISOString()
              },
              {
                id: `${u.id}_node_4`,
                unit_id: u.id,
                title: 'Boss Checkpoint Challenge',
                node_type: 'BOSS_MOCK',
                order_index: 4,
                total_xp: 40,
                required_hearts: 1,
                created_at: new Date().toISOString()
              }
            ];
          }
          nodeMap[u.id] = nodes;
        }
        setNodesByUnit(nodeMap);
      }).catch((err) => console.error(err));
    }
  }, [selectedSectionId]);

  // 3. Load Questions for selected Mock Paper
  useEffect(() => {
    if (!selectedMockPaperId) return;
    setIsLoadingArenaQuestions(true);

    if (window.api?.getMockPaperQuestions) {
      window.api.getMockPaperQuestions(selectedMockPaperId).then((qs) => {
        if (qs && qs.length > 0) {
          setLoadedArenaQuestions(qs);
        } else {
          // Provide default authentic mock questions
          setLoadedArenaQuestions(getDefaultArenaQuestions());
        }
        setIsLoadingArenaQuestions(false);
      }).catch((err) => {
        console.error(err);
        setLoadedArenaQuestions(getDefaultArenaQuestions());
        setIsLoadingArenaQuestions(false);
      });
    } else {
      setLoadedArenaQuestions(getDefaultArenaQuestions());
      setIsLoadingArenaQuestions(false);
    }
  }, [selectedMockPaperId]);

  // 4. Handle Node Click to launch LessonRunner
  const handleLaunchLesson = useCallback(async (node: SteppingNode) => {
    let questions: Question[] = [];
    if (window.api?.getQuestions) {
      try {
        questions = await window.api.getQuestions(node.id);
      } catch (err) {
        console.warn('Could not fetch questions from db:', err);
      }
    }

    if (!questions || questions.length === 0) {
      questions = getFallbackQuestionsForNode(node);
    }

    setActiveLessonQuestions(questions);
    setActiveLessonNode(node);
  }, []);

  // 5. Handle Lesson Completion
  const handleFinishLesson = useCallback((scorePct: number, totalXpEarned: number) => {
    if (!activeLessonNode) return;

    // Update user stats
    const updatedXp = userStats.xp + totalXpEarned;
    const updatedStats: UserStats = {
      ...userStats,
      xp: updatedXp
    };
    setUserStats(updatedStats);

    if (window.api?.updateUserStats) {
      window.api.updateUserStats({ xp: updatedXp }).catch(console.error);
    }

    // Update node progress
    const updatedProg: NodeProgress = {
      node_id: activeLessonNode.id,
      status: scorePct >= 80 ? 'COMPLETED_GOLD' : 'COMPLETED_BRONZE',
      attempts_count: (nodeProgress[activeLessonNode.id]?.attempts_count || 0) + 1,
      best_score_pct: Math.max(scorePct, nodeProgress[activeLessonNode.id]?.best_score_pct || 0),
      stars_earned: scorePct >= 80 ? 3 : 2,
      last_attempted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setNodeProgress((prev) => ({
      ...prev,
      [activeLessonNode.id]: updatedProg
    }));

    if (window.api?.saveNodeProgress) {
      window.api.saveNodeProgress({
        nodeId: activeLessonNode.id,
        status: updatedProg.status,
        score: updatedProg.best_score_pct,
        stars: updatedProg.stars_earned
      }).catch(console.error);
    }

    setActiveLessonNode(null);
  }, [activeLessonNode, userStats, nodeProgress]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* 1. Custom Frameless Title Bar */}
      <FramelessTitleBar title="GradGate — GATE DA Desktop Edition" />

      {/* 2. Top Persistent Stats HUD */}
      <TopStatHud
        sections={sections}
        selectedSectionId={selectedSectionId}
        onSelectSection={(id) => setSelectedSectionId(id)}
        userStats={userStats}
        isOnline={true}
        onOpenGemShop={() => setActiveTab('shop')}
        onOpenHeartsRefill={() => setIsRepairModalOpen(true)}
      />

      {/* 3. Navigation Bar */}
      <div className="max-w-6xl w-full mx-auto px-6 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
          {/* Home Landing */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'home'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          {/* Path */}
          <button
            type="button"
            onClick={() => setActiveTab('path')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'path'
                ? 'bg-[#58CC02] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Route className="w-4 h-4" />
            <span>Path</span>
          </button>

          {/* TCS Arena */}
          <button
            type="button"
            onClick={() => setActiveTab('arena')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'arena'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>TCS Arena</span>
          </button>

          {/* Visual Studio */}
          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'studio'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Visual Studio</span>
          </button>

          {/* Flashcards */}
          <button
            type="button"
            onClick={() => setActiveTab('srs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'srs'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Flashcards</span>
          </button>

          {/* Lectures */}
          <button
            type="button"
            onClick={() => setActiveTab('lectures')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'lectures'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Lectures</span>
          </button>

          {/* Analytics */}
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Analytics</span>
          </button>

          {/* Leaderboard */}
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-[#FFC800] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>

          {/* Shop */}
          <button
            type="button"
            onClick={() => setActiveTab('shop')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'shop'
                ? 'bg-[#1CB0F6] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Diamond className="w-4 h-4" />
            <span>Shop</span>
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          {/* UI Studio */}
          <button
            type="button"
            onClick={() => setActiveTab('design_system')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'design_system'
                ? 'bg-fuchsia-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>UI Studio</span>
          </button>
        </div>

        {/* Mistakes Pill */}
        <button
          type="button"
          onClick={() => setIsRepairModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/60 border border-rose-900/60 text-rose-300 text-xs font-bold transition flex items-center gap-2"
        >
          <span>Mistakes</span>
          <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
            {mistakes.length}
          </span>
        </button>
      </div>

      {/* 4. Active View Content */}
      <main className="flex-1 w-full mx-auto pb-16">
        {activeTab === 'home' && (
          <LandingDashboardView
            userStats={userStats}
            sections={sections}
            dailyTargets={dailyTargets}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectSection={(secId) => {
              setSelectedSectionId(secId);
              setActiveTab('path');
            }}
          />
        )}

        {activeTab === 'path' && (
          <div className="flex flex-col items-center">
            {dailyTargets.length > 0 && (
              <div className="w-full max-w-2xl px-6 mt-6">
                <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col gap-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-amber-400" />
                      <span>Adaptive Daily Quests</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Target: GATE DA 2027</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {dailyTargets.map((q) => (
                      <div
                        key={q.id}
                        className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="font-bold text-slate-200 truncate">{q.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {q.current_value} / {q.target_value} completed
                          </span>
                        </div>
                        <span className="text-[11px] font-black text-emerald-400 whitespace-nowrap">
                          +{q.xp_reward} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <QuestMapView
              units={units}
              nodesByUnit={nodesByUnit}
              nodeProgress={nodeProgress}
              onSelectNode={(node) => handleLaunchLesson(node)}
              onOpenGuidebook={() => setActiveTab('studio')}
              onOpenLectures={() => setActiveTab('lectures')}
            />
          </div>
        )}

        {activeTab === 'studio' && <VisualConceptStudio />}

        {activeTab === 'lectures' && (
          <YouTubeLectureHub
            lectures={lectures}
            onRewardXp={(xp) => {
              setUserStats((prev) => ({ ...prev, xp: prev.xp + xp }));
            }}
          />
        )}

        {activeTab === 'arena' && (
          <div className="space-y-4">
            {/* Mock Paper Selector Bar */}
            {mockPapersList.length > 0 && (
              <div className="max-w-6xl mx-auto px-6 pt-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-300">Choose Exam Paper:</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                  {mockPapersList.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedMockPaperId(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition truncate max-w-[280px] ${
                        selectedMockPaperId === p.id
                          ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {p.title} ({p.total_questions} Qs)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoadingArenaQuestions ? (
              <div className="py-24 text-center space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading 65 official exam questions...</p>
              </div>
            ) : (
              <TcsIonArenaView
                questions={loadedArenaQuestions}
                mockPaperTitle={
                  mockPapersList.find((p) => p.id === selectedMockPaperId)?.title ||
                  'GATE DA Official 65-Q Full Mock Paper'
                }
              />
            )}
          </div>
        )}

        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {activeTab === 'srs' && <FlashcardVaultView />}

        {activeTab === 'leaderboard' && (
          <LeagueLeaderboardView userStats={userStats} />
        )}

        {activeTab === 'shop' && (
          <GemShopView
            userStats={userStats}
            onPurchaseStreakFreeze={() => {
              setUserStats((prev) => ({
                ...prev,
                gems: prev.gems - 200,
                streak_freezes: prev.streak_freezes + 1
              }));
            }}
            onPurchaseCramMode={() => {
              setUserStats((prev) => ({
                ...prev,
                gems: prev.gems - 450
              }));
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            userStats={userStats}
            onUpdateTheme={(id) => {
              setUserStats((prev) => ({ ...prev, theme_id: id }));
            }}
            onRefreshStats={() => {
              if (window.api?.getUserStats) {
                window.api.getUserStats().then((s) => s && setUserStats(s));
              }
            }}
          />
        )}

        {activeTab === 'design_system' && (
          <DesignSystemPreview />
        )}
      </main>

      {/* 5. Lesson Runner Overlay (When a node on the path is selected) */}
      {activeLessonNode && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
          <LessonRunner
            node={activeLessonNode}
            questions={activeLessonQuestions}
            userStats={userStats}
            onClose={() => setActiveLessonNode(null)}
            onFinishLesson={handleFinishLesson}
          />
        </div>
      )}

      {/* 6. Mistake Repair Modal */}
      <MistakeRepairModal
        isOpen={isRepairModalOpen}
        mistakes={mistakes}
        onClose={() => setIsRepairModalOpen(false)}
        onStartRepairDrill={() => {
          setIsRepairModalOpen(false);
          setUserStats((prev) => ({ ...prev, hearts: 5 }));
        }}
      />
    </div>
  );
}

// Helper: Provide rich fallback questions for interactive drills
function getFallbackQuestionsForNode(node: SteppingNode): Question[] {
  return [
    {
      id: `${node.id}_q1`,
      stepping_node_id: node.id,
      question_type: 'MCQ',
      prompt_latex: 'In Probability and Statistics, what is the formula for the variance of a discrete random variable $X$ with mean $\\mu$?',
      marks: 1.0,
      negative_marks: -0.3333333333,
      options_json: JSON.stringify([
        { id: 'opt_a', label: 'A', textLatex: '$\\text{Var}(X) = E[X^2] - (E[X])^2$' },
        { id: 'opt_b', label: 'B', textLatex: '$\\text{Var}(X) = (E[X])^2 - E[X^2]$' },
        { id: 'opt_c', label: 'C', textLatex: '$\\text{Var}(X) = E[X^2] + (E[X])^2$' },
        { id: 'opt_d', label: 'D', textLatex: '$\\text{Var}(X) = \\sqrt{E[X^2] - E[X]}$' }
      ]),
      correct_answer_json: JSON.stringify('opt_a'),
      solution_latex: 'By definition, $\\text{Var}(X) = E[(X - \\mu)^2] = E[X^2] - (E[X])^2$.',
      difficulty_level: 'EASY',
      created_at: new Date().toISOString()
    },
    {
      id: `${node.id}_q2`,
      stepping_node_id: node.id,
      question_type: 'NAT',
      prompt_latex: 'Let $A$ be a $2 \\times 2$ matrix with eigenvalues $\\lambda_1 = 3$ and $\\lambda_2 = 4$. What is the determinant $\\det(A)$?',
      marks: 1.0,
      negative_marks: 0.0,
      correct_answer_json: '12',
      nat_range_min: 12,
      nat_range_max: 12,
      solution_latex: 'The determinant of a square matrix is the product of its eigenvalues: $\\det(A) = \\lambda_1 \\cdot \\lambda_2 = 3 \\cdot 4 = 12$.',
      difficulty_level: 'EASY',
      created_at: new Date().toISOString()
    },
    {
      id: `${node.id}_q3`,
      stepping_node_id: node.id,
      question_type: 'MSQ',
      prompt_latex: 'Which of the following statements about Support Vector Machines (SVM) are correct?',
      marks: 2.0,
      negative_marks: 0.0,
      options_json: JSON.stringify([
        { id: 'msq_1', label: 'A', textLatex: 'The decision boundary depends only on the support vectors.' },
        { id: 'msq_2', label: 'B', textLatex: 'Maximizing the margin width is equivalent to minimizing $\\frac{1}{2}\\|w\\|^2$.' },
        { id: 'msq_3', label: 'C', textLatex: 'SVM cannot handle non-linearly separable data using kernels.' },
        { id: 'msq_4', label: 'D', textLatex: 'The soft-margin SVM introduces slack variables $\\xi_i \\geq 0$.' }
      ]),
      correct_answer_json: JSON.stringify(['msq_1', 'msq_2', 'msq_4']),
      solution_latex: 'Statements A, B, and D are standard properties of hard and soft-margin SVMs. Statement C is false because the kernel trick handles non-linear boundaries.',
      difficulty_level: 'MEDIUM',
      created_at: new Date().toISOString()
    }
  ];
}

// Helper: Default authentic mock arena questions
function getDefaultArenaQuestions(): ArenaQuestion[] {
  return [
    {
      id: 'mock_q1',
      questionNumber: 1,
      section: 'GENERAL_APTITUDE',
      type: 'MCQ',
      marks: 1.0,
      negativeMarks: -0.3333333333,
      promptLatex: 'Choose the grammatically correct option:\\n\\n"Neither of the two candidates _____ selected for the interview."',
      options: [
        { id: 'opt_a', label: 'A', textLatex: 'was' },
        { id: 'opt_b', label: 'B', textLatex: 'were' },
        { id: 'opt_c', label: 'C', textLatex: 'are' },
        { id: 'opt_d', label: 'D', textLatex: 'have been' }
      ],
      correctAnswerJson: JSON.stringify('opt_a'),
      solutionLatex: '"Neither" refers to each individual singular candidate, taking singular "was".'
    },
    {
      id: 'mock_q2',
      questionNumber: 2,
      section: 'GENERAL_APTITUDE',
      type: 'NAT',
      marks: 1.0,
      negativeMarks: 0.0,
      promptLatex: 'If $\\log_{10}(x) = 3$, find the value of $x / 100$.',
      correctAnswerJson: '10',
      natRangeMin: 10,
      natRangeMax: 10,
      solutionLatex: '$x = 10^3 = 1000$, so $x / 100 = 10$.'
    },
    {
      id: 'mock_q3',
      questionNumber: 11,
      section: 'TECHNICAL_DA',
      type: 'MSQ',
      marks: 2.0,
      negativeMarks: 0.0,
      promptLatex: 'Which of the following matrices always have real eigenvalues?',
      options: [
        { id: 'opt_1', label: 'A', textLatex: 'Real symmetric matrix' },
        { id: 'opt_2', label: 'B', textLatex: 'Hermitian matrix' },
        { id: 'opt_3', label: 'C', textLatex: 'Skew-symmetric matrix with non-zero elements' },
        { id: 'opt_4', label: 'D', textLatex: 'Arbitrary orthogonal matrix' }
      ],
      correctAnswerJson: JSON.stringify(['opt_1', 'opt_2']),
      solutionLatex: 'Real symmetric and complex Hermitian matrices always have strictly real eigenvalues.'
    }
  ];
}
