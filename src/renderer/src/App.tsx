// ==============================================================================
// APP MAIN COMPONENT
// Features:
//   1. FramelessTitleBar & TopStatHud
//   2. Navigation: Learning Path, Visual Studio, Video Lectures, Leaderboard, Gem Shop
//   3. Dynamic Adaptive Daily Quests Banner
//   4. MistakeRepairModal triggered on zero hearts or manual practice
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { FramelessTitleBar } from '../components/ui/FramelessTitleBar';
import { TopStatHud } from '../components/ui/TopStatHud';
import { QuestMapView } from '../features/path/QuestMapView';
import { VisualConceptStudio } from '../features/studio/VisualConceptStudio';
import { YouTubeLectureHub } from '../features/lectures/YouTubeLectureHub';
import { LeagueLeaderboardView } from '../features/gamification/LeagueLeaderboardView';
import { GemShopView } from '../features/gamification/GemShopView';
import { MistakeRepairModal } from '../features/gamification/MistakeRepairModal';
import { DesignSystemPreview } from '../features/design-system/DesignSystemPreview';
import type {
  SyllabusSection,
  Unit,
  SteppingNode,
  NodeProgress,
  UserStats,
  MistakesVaultItem,
  AdaptiveDailyTarget,
  YouTubeLecture
} from '../../shared/types';
import { Route, Trophy, Diamond, Palette, Target, Compass, Video } from 'lucide-react';

export default function App(): React.JSX.Element {
  const [sections, setSections] = useState<SyllabusSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('DA_01_PROB_STATS');
  const [units, setUnits] = useState<Unit[]>([]);
  const [nodesByUnit, setNodesByUnit] = useState<Record<string, SteppingNode[]>>({});
  const [nodeProgress, setNodeProgress] = useState<Record<string, NodeProgress>>({});
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [mistakes, setMistakes] = useState<MistakesVaultItem[]>([]);
  const [dailyTargets, setDailyTargets] = useState<AdaptiveDailyTarget[]>([]);
  const [lectures, setLectures] = useState<YouTubeLecture[]>([]);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'path' | 'studio' | 'lectures' | 'leaderboard' | 'shop' | 'design_system'>('path');

  useEffect(() => {
    // 1. Fetch official syllabus sections
    if (window.api?.getSyllabusSections) {
      window.api.getSyllabusSections().then((data) => {
        setSections(data);
        if (data.length > 0) {
          setSelectedSectionId(data[0].id);
        }
      }).catch((err) => console.error(err));
    }

    // 2. Fetch user stats
    if (window.api?.getUserStats) {
      window.api.getUserStats().then((stats) => {
        setUserStats(stats);
      }).catch((err) => console.error(err));
    }

    // 3. Fetch node progress
    if (window.api?.getNodeProgress) {
      window.api.getNodeProgress().then((progs) => {
        const map: Record<string, NodeProgress> = {};
        for (const p of progs) map[p.node_id] = p;
        setNodeProgress(map);
      }).catch((err) => console.error(err));
    }

    // 4. Fetch mistakes vault items
    if (window.api?.getMistakes) {
      window.api.getMistakes().then((items) => {
        setMistakes(items);
      }).catch((err) => console.error(err));
    }

    // 5. Fetch daily targets
    if (window.api?.getDailyTargets) {
      window.api.getDailyTargets().then((targets) => {
        setDailyTargets(targets);
      }).catch((err) => console.error(err));
    }

    // 6. Fetch YouTube lectures
    if (window.api?.getLectures) {
      window.api.getLectures().then((lecs) => {
        if (lecs.length > 0) {
          setLectures(lecs);
        } else {
          // Curated initial lectures demo
          setLectures([
            {
              id: 'lec_eigen_mit',
              topic_id: 'DA_02_LIN_ALG',
              title: 'Eigenvalues and Eigenvectors — MIT 18.06 (Prof. Gilbert Strang)',
              channel_name: 'MIT OpenCourseWare',
              language: 'English',
              category: 'NPTEL_IIT',
              youtube_video_id: 'cdZnhQjJu4I',
              duration_sec: 3060,
              start_timestamp_sec: 0,
              verified_at: new Date().toISOString(),
              created_at: new Date().toISOString()
            },
            {
              id: 'lec_bayes_statquest',
              topic_id: 'DA_01_PROB_STATS',
              title: "Bayes' Theorem Intuition & Formula Derivation",
              channel_name: 'StatQuest with Josh Starmer',
              language: 'English',
              category: 'VISUAL_INTUITION',
              youtube_video_id: '9wCnvr7Xw4E',
              duration_sec: 720,
              start_timestamp_sec: 0,
              verified_at: new Date().toISOString(),
              created_at: new Date().toISOString()
            },
            {
              id: 'lec_gradient_descent_hindi',
              topic_id: 'DA_03_CALC_OPT',
              title: 'Gradient Descent Algorithm from Scratch in Hindi',
              channel_name: 'CampusX',
              language: 'Hinglish',
              category: 'COACHING_PLAYLIST',
              youtube_video_id: 'sDv4f4s2SB8',
              duration_sec: 1440,
              start_timestamp_sec: 0,
              verified_at: new Date().toISOString(),
              created_at: new Date().toISOString()
            }
          ]);
        }
      }).catch((err) => console.error(err));
    }
  }, []);

  // When selected section changes, load its units and nodes
  useEffect(() => {
    if (!window.api?.getUnits || !selectedSectionId) return;

    window.api.getUnits(selectedSectionId).then(async (fetchedUnits) => {
      const validUnits = fetchedUnits.length > 0 ? fetchedUnits : [
        {
          id: `unit_${selectedSectionId}_1`,
          section_id: selectedSectionId as SyllabusSection['id'],
          title: 'Foundational Concepts & Principles',
          description: 'Core definitions, theorems, and fundamental properties tested in GATE DA.',
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
        if (nodes.length === 0) {
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
              title: 'PYQ Checkpoint 2024',
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
  }, [selectedSectionId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* 1. Frameless Custom Window Bar */}
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

          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'studio'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Visual Studio</span>
          </button>

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

          <button
            type="button"
            onClick={() => setActiveTab('design_system')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'design_system'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>UI Studio</span>
          </button>
        </div>

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
              onSelectNode={(node) => {
                alert(`Starting ${node.title} (${node.node_type})!`);
              }}
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
              if (userStats) setUserStats({ ...userStats, xp: userStats.xp + xp });
            }}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeagueLeaderboardView userStats={userStats} />
        )}

        {activeTab === 'shop' && (
          <GemShopView
            userStats={userStats}
            onPurchaseStreakFreeze={() => {
              if (userStats) setUserStats({ ...userStats, gems: userStats.gems - 200, streak_freezes: userStats.streak_freezes + 1 });
            }}
            onPurchaseCramMode={() => {
              if (userStats) setUserStats({ ...userStats, gems: userStats.gems - 450 });
            }}
          />
        )}

        {activeTab === 'design_system' && (
          <DesignSystemPreview />
        )}
      </main>

      {/* Mistake Repair Modal */}
      <MistakeRepairModal
        isOpen={isRepairModalOpen}
        mistakes={mistakes}
        onClose={() => setIsRepairModalOpen(false)}
        onStartRepairDrill={() => {
          setIsRepairModalOpen(false);
          alert('Starting Mistake Drill (5 Questions). All hearts will be refilled upon completion!');
          if (userStats) setUserStats({ ...userStats, hearts: 5 });
        }}
      />
    </div>
  );
}
