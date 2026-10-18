import React, { useEffect, useState } from 'react';
import type { SyllabusSection, UserStats, SyncProgress, UpdateCheckResult } from '../../shared/types';

export default function App(): React.JSX.Element {
  const [sections, setSections] = useState<SyllabusSection[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('Connected to Dual-SQLite Engine');
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);

  useEffect(() => {
    // 1. Fetch official syllabus sections from curriculum.db via IPC bridge
    if (window.api?.getSyllabusSections) {
      window.api.getSyllabusSections().then((data) => {
        setSections(data);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top HUD Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
            G
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              GradGate
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                GATE DA 2027
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Data Science &amp; Artificial Intelligence</p>
          </div>
        </div>

        {/* Gamification Stats HUD */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-amber-400 font-bold">⚡ {userStats?.xp ?? 0}</span>
            <span className="text-xs text-slate-400 font-semibold uppercase">XP</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-orange-500 font-bold">🔥 {userStats?.current_streak ?? 0}</span>
            <span className="text-xs text-slate-400 font-semibold uppercase">Day Streak</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-red-500 font-bold">❤️ {userStats?.hearts ?? 5}/5</span>
            <span className="text-xs text-slate-400 font-semibold uppercase">Hearts</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-cyan-400 font-bold">💎 {userStats?.gems ?? 150}</span>
            <span className="text-xs text-slate-400 font-semibold uppercase">Gems</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 flex flex-col gap-8">
        {/* Architecture & Sync Status Banner */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                Phase 0 Dual-SQLite Architecture Active
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              {syncStatus}
            </p>
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
            <button
              type="button"
              onClick={handleCheckUpdate}
              disabled={isCheckingUpdate}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-2"
            >
              {isCheckingUpdate ? 'Checking GitHub...' : 'Check Curriculum Updates'}
            </button>
            <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 text-slate-400 border border-slate-800">
              Repo: jaybhayeom/GradGate
            </span>
          </div>
        </section>

        {/* Official 8 Syllabus Sections */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">GATE DA Curriculum Modules</h2>
              <p className="text-sm text-slate-400">Official 8 Syllabus Sections loaded from curriculum.db</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
              {sections.length} Sections Loaded
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sections.map((sec) => (
              <div
                key={sec.id}
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition group shadow-sm hover:shadow-md"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {sec.code}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {(sec.official_weightage * 100).toFixed(0)}% Marks
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-100 group-hover:text-emerald-400 transition text-base leading-snug">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {sec.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Order #{sec.order_index}</span>
                  <span className="text-emerald-500 font-semibold group-hover:translate-x-1 transition">
                    Explore Unit &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
