// ==============================================================================
// APP MAIN COMPONENT
// Features: FramelessTitleBar, TopStatHud, Module Navigator, Design System Studio
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { FramelessTitleBar } from '../components/ui/FramelessTitleBar';
import { TopStatHud } from '../components/ui/TopStatHud';
import { DuoButton } from '../components/ui/DuoButton';
import { DesignSystemPreview } from '../features/design-system/DesignSystemPreview';
import type { SyllabusSection, UserStats, SyncProgress, UpdateCheckResult } from '../../shared/types';
import { Books, Palette, Sparkle } from '@phosphor-icons/react';

export default function App(): React.JSX.Element {
  const [sections, setSections] = useState<SyllabusSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('DA_01_PROB_STATS');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('Connected to Dual-SQLite Engine');
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'design_system'>('curriculum');

  useEffect(() => {
    // 1. Fetch official syllabus sections from curriculum.db via IPC bridge
    if (window.api?.getSyllabusSections) {
      window.api.getSyllabusSections().then((data) => {
        setSections(data);
        if (data.length > 0) {
          setSelectedSectionId(data[0].id);
        }
      }).catch((err) => {
        console.error('Failed to load syllabus sections:', err);
      });
    }

    // 2. Fetch user profile stats from user_profile.db via IPC bridge
    if (window.api?.getUserStats) {
      window.api.getUserStats().then((stats) => {
        setUserStats(stats);
      }).catch((err) => {
        console.error('Failed to load user stats:', err);
      });
    }

    // 3. Listen to OTA sync progress events
    if (window.api?.onSyncProgress) {
      const cleanup = window.api.onSyncProgress((progress) => {
        setSyncProgress(progress);
        setSyncStatus(`Sync: ${progress.message} (${progress.percent}%)`);
      });
      return cleanup;
    }
    return undefined;
  }, []);

  const handleCheckUpdate = async (): Promise<void> => {
    if (!window.api?.checkCurriculumUpdate) return;
    setIsCheckingUpdate(true);
    try {
      const res = await window.api.checkCurriculumUpdate();
      setUpdateResult(res);
      setSyncStatus(
        res.updateAvailable
          ? `Update Available: v${res.latestVersion}`
          : `Up to date (Version: ${res.currentVersion})`
      );
    } catch (err) {
      setSyncStatus(`Update check failed: ${(err as Error).message}`);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

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
        onOpenGemShop={() => alert('Gem Shop unlocks in Phase 2!')}
        onOpenHeartsRefill={() => alert('Hearts refill practice opens when hearts are low.')}
      />

      {/* 3. Navigation View Switcher (Curriculum Path vs Design System Studio) */}
      <div className="max-w-7xl w-full mx-auto px-8 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'curriculum'
                ? 'bg-[#58CC02] text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Books size={16} weight="bold" />
            <span>Curriculum Modules</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('design_system')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'design_system'
                ? 'bg-[#1CB0F6] text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette size={16} weight="bold" />
            <span>Design System Studio</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Sparkle size={14} className="text-amber-400" />
          <span>Electron 33+ React 18 Tailwind</span>
        </div>
      </div>

      {/* 4. Active View Content */}
      <main className="flex-1 w-full mx-auto">
        {activeTab === 'design_system' ? (
          <DesignSystemPreview />
        ) : (
          <div className="max-w-7xl mx-auto p-8 flex flex-col gap-8">
            {/* Architecture & Sync Status Banner */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                    Dual-SQLite Architecture Active
                  </h2>
                </div>
                <p className="text-xs text-slate-400">{syncStatus}</p>
                {syncProgress && (
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${syncProgress.percent}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <DuoButton
                  size="sm"
                  variant="ghost"
                  onClick={handleCheckUpdate}
                  disabled={isCheckingUpdate}
                >
                  {isCheckingUpdate ? 'Checking GitHub...' : 'Check Updates'}
                </DuoButton>
                <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-950 text-slate-400 border border-slate-800">
                  Repo: jaybhayeom/GradGate
                </span>
              </div>
            </section>

            {/* Official 8 Syllabus Sections */}
            <section className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">GATE DA Curriculum Modules</h2>
                  <p className="text-sm text-slate-400">Official 8 Syllabus Sections loaded from curriculum.db</p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                  {sections.length} Sections Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between transition group shadow-md hover:shadow-xl"
                  >
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                          {sec.code}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          {(sec.official_weightage * 100).toFixed(0)}% Marks
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-100 group-hover:text-emerald-400 transition text-base leading-snug">
                        {sec.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {sec.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-mono">Module #{sec.order_index}</span>
                      <DuoButton size="sm" variant="primary">
                        Enter Unit &rarr;
                      </DuoButton>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
