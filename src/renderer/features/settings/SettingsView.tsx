// ==============================================================================
// SETTINGS & DATA MANAGEMENT VIEW FOR GRADGATE
// Features:
//   1. Local Curriculum Edition (v1.0.0) & GitHub OTA Delta Sync
//   2. Offline System & Database Integrity Diagnostics
//   3. 1-Click User Profile Export & Restore (.gateda-backup)
//   4. Optional AI Bridge (Gemini API Key & Local Ollama Endpoint)
//   5. Theme & Audio Accessibility Customization
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Gear,
  Database,
  CloudArrowDown,
  ShieldCheck,
  FloppyDisk,
  FileArrowUp,
  Sparkle,
  CheckCircle,
  Warning,
  Eye,
  EyeSlash,
  Palette,
  ArrowClockwise
} from '@phosphor-icons/react';
import { DuoButton } from '../../components/ui/DuoButton';
import type { ContentManifest, SyncProgress, UserStats } from '../../../shared/types';
import type { SystemIntegrityReport, AiConfig } from '../../../shared/backupIpcContracts';
import { THEMES } from '../../styles/themes';

interface SettingsViewProps {
  userStats?: UserStats | null;
  onUpdateTheme?: (themeId: string) => void;
  onRefreshStats?: () => void;
}

export function SettingsView({
  userStats,
  onUpdateTheme,
  onRefreshStats
}: SettingsViewProps): React.JSX.Element {
  // Sync state
  const [manifest, setManifest] = useState<ContentManifest | null>(null);
  const [isCheckingSync, setIsCheckingSync] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

  // Integrity report state
  const [integrityReport, setIntegrityReport] = useState<SystemIntegrityReport | null>(null);
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);

  // Backup & restore state
  const [backupStatusMessage, setBackupStatusMessage] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // AI Bridge state
  const [geminiKey, setGeminiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3');
  const [notebookLmMode, setNotebookLmMode] = useState(true);
  const [aiSavedSuccess, setAiSavedSuccess] = useState(false);

  // Theme state
  const currentThemeId = userStats?.theme_id || 'theme_python_emerald';

  useEffect(() => {
    // 1. Fetch current manifest
    if (window.api?.getManifest) {
      window.api.getManifest().then((m) => {
        if (m) setManifest(m);
      }).catch((err) => console.error(err));
    }

    // 2. Load AI configs
    if (window.api?.getAiConfig) {
      window.api.getAiConfig().then((cfg) => {
        if (cfg) {
          if (cfg.geminiApiKey) setGeminiKey(cfg.geminiApiKey);
          if (cfg.ollamaEndpoint) setOllamaEndpoint(cfg.ollamaEndpoint);
          if (cfg.ollamaModel) setOllamaModel(cfg.ollamaModel);
          if (cfg.notebookLmMode !== undefined) setNotebookLmMode(cfg.notebookLmMode);
        }
      }).catch((err) => console.error(err));
    }

    // 3. Listen to sync progress
    if (window.api?.onSyncProgress) {
      const unsub = window.api.onSyncProgress((prog) => {
        setSyncProgress(prog);
      });
      return () => unsub();
    }
  }, []);

  // --- Handlers ---

  const handleCheckSync = async () => {
    setIsCheckingSync(true);
    setSyncStatusText('Checking GitHub repository for curriculum updates...');
    try {
      if (window.api?.checkCurriculumUpdate) {
        const result = await window.api.checkCurriculumUpdate();
        if (result && result.updateAvailable) {
          setUpdateAvailable(true);
          setSyncStatusText(`New update found! Version: ${result.latestVersion}`);
        } else {
          setUpdateAvailable(false);
          setSyncStatusText('Curriculum database is already up to date (v1.0.0).');
        }
      } else {
        setSyncStatusText('Online sync requires desktop Electron runtime.');
      }
    } catch (err) {
      setSyncStatusText(`Sync check error: ${(err as Error).message}`);
    } finally {
      setIsCheckingSync(false);
    }
  };

  const handleApplyUpdate = async () => {
    setIsSyncing(true);
    try {
      if (window.api?.applyCurriculumUpdate) {
        const res = await window.api.applyCurriculumUpdate();
        if (res.success) {
          setSyncStatusText('Update installed successfully! Re-opening database...');
          setUpdateAvailable(false);
          if (window.api.getManifest) {
            const m = await window.api.getManifest();
            if (m) setManifest(m);
          }
        } else {
          setSyncStatusText(`Update error: ${res.message}`);
        }
      }
    } catch (err) {
      setSyncStatusText(`Update failed: ${(err as Error).message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleVerifyIntegrity = async () => {
    setIsVerifyingIntegrity(true);
    try {
      if (window.api?.verifySystemIntegrity) {
        const report = await window.api.verifySystemIntegrity();
        setIntegrityReport(report);
      } else {
        // Fallback simulation in pure browser preview
        setIntegrityReport({
          curriculumOk: true,
          curriculumMessage: 'Verified offline SQLite storage structure',
          userProfileOk: true,
          userProfileMessage: 'User profile database WAL mode operational',
          curriculumVersion: 'v1.0.0',
          counts: {
            sections: 8,
            units: 19,
            nodes: 22,
            questions: 65,
            lectures: 18,
            mockPapers: 2,
            formulaCards: 0
          },
          userStats: {
            xp: userStats?.xp || 0,
            streak: userStats?.current_streak || 0,
            hearts: userStats?.hearts || 5,
            gems: userStats?.gems || 0,
            currentLeague: userStats?.current_league || 'BRONZE',
            mistakesRecorded: 0,
            mistakesResolved: 0,
            flashcardsCount: 0,
            mockAttemptsCount: 0
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifyingIntegrity(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      setBackupStatusMessage('Generating profile backup...');
      let backupPayload;
      if (window.api?.exportProfileBackup) {
        backupPayload = await window.api.exportProfileBackup();
      } else {
        backupPayload = {
          magic: 'GATEDA_BACKUP',
          version: '1.0.0',
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          checksum: 'preview-checksum',
          tables: {
            user_stats: userStats ? [userStats] : [],
            node_progress: [],
            mistakes_vault: [],
            srs_flashcards: [],
            mock_attempts: [],
            mock_question_responses: [],
            lecture_watch_history: [],
            lecture_notes: [],
            gem_transactions: [],
            adaptive_daily_targets: []
          }
        };
      }

      const jsonStr = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `gradgate-profile-${dateStr}.gateda-backup`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupStatusMessage('Backup downloaded successfully (.gateda-backup)!');
    } catch (err) {
      setBackupStatusMessage(`Backup error: ${(err as Error).message}`);
    }
  };

  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmRestore = window.confirm(
      'Are you sure you want to restore this backup? This will safely update your progress records to match the backup file.'
    );
    if (!confirmRestore) {
      e.target.value = '';
      return;
    }

    setIsRestoring(true);
    setBackupStatusMessage('Validating and restoring backup...');

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (window.api?.restoreProfileBackup) {
        const result = await window.api.restoreProfileBackup(parsed);
        if (result.success) {
          setBackupStatusMessage(`Restore Complete: ${result.message}`);
          if (onRefreshStats) onRefreshStats();
        } else {
          setBackupStatusMessage(`Restore Rejected: ${result.message}`);
        }
      } else {
        setBackupStatusMessage('Restore preview simulated successfully.');
      }
    } catch (err) {
      setBackupStatusMessage(`Restore failed: ${(err as Error).message}`);
    } finally {
      setIsRestoring(false);
      e.target.value = '';
    }
  };

  const handleSaveAiConfig = async () => {
    const cfg: AiConfig = {
      geminiApiKey: geminiKey.trim(),
      ollamaEndpoint: ollamaEndpoint.trim(),
      ollamaModel: ollamaModel.trim(),
      notebookLmMode
    };

    if (window.api?.saveAiConfig) {
      await window.api.saveAiConfig(cfg);
    }
    setAiSavedSuccess(true);
    setTimeout(() => setAiSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8 select-text">
      {/* Hidden File Input for Restore */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".gateda-backup,.json"
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
          <Gear className="w-6 h-6" weight="duotone" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Settings & Data Management
          </h1>
          <p className="text-xs text-slate-400">
            OTA Curriculum Sync, Dual-SQLite Diagnostics, and Profile Backup / Restore.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: GitHub OTA Sync Engine */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CloudArrowDown className="w-5 h-5" weight="duotone" />
              <span>Curriculum Edition & OTA Sync</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-bold">
              Edition {manifest?.version || 'v1.0.0'}
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Target Source:</span>
              <span className="font-mono text-slate-300">jaybhayeom/GradGate (main)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Database Engine:</span>
              <span className="text-slate-300 font-medium">SQLite Read-Only (`curriculum.db`)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Published Timestamp:</span>
              <span className="text-slate-300 font-mono">
                {manifest?.published_at ? manifest.published_at.slice(0, 19).replace('T', ' ') : 'Bundled Seed'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Integrity Checksum:</span>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">
                {manifest?.sha256_checksum || 'Verified Seed'}
              </span>
            </div>
          </div>

          {syncStatusText && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <ArrowClockwise className={`w-4 h-4 text-emerald-400 ${isCheckingSync || isSyncing ? 'animate-spin' : ''}`} />
              <span>{syncStatusText}</span>
            </div>
          )}

          {/* Progress bar during download/extraction */}
          {syncProgress && syncProgress.percent < 100 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Phase: {syncProgress.phase}</span>
                <span>{syncProgress.percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${syncProgress.percent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 truncate">{syncProgress.message}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {!updateAvailable ? (
              <DuoButton
                variant="primary"
                size="sm"
                onClick={handleCheckSync}
                disabled={isCheckingSync}
                className="flex-1"
              >
                <div className="flex items-center justify-center gap-2">
                  <CloudArrowDown className="w-4 h-4" />
                  <span>{isCheckingSync ? 'Checking...' : 'Check For Updates'}</span>
                </div>
              </DuoButton>
            ) : (
              <DuoButton
                variant="warning"
                size="sm"
                onClick={handleApplyUpdate}
                disabled={isSyncing}
                className="flex-1"
              >
                <div className="flex items-center justify-center gap-2">
                  <CloudArrowDown className="w-4 h-4" />
                  <span>{isSyncing ? 'Installing...' : 'Download & Apply Update'}</span>
                </div>
              </DuoButton>
            )}
          </div>
        </div>

        {/* Card 2: Offline System & Database Diagnostics */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" weight="duotone" />
              <span>System & Database Diagnostics</span>
            </div>
            <DuoButton
              variant="secondary"
              size="sm"
              onClick={handleVerifyIntegrity}
              disabled={isVerifyingIntegrity}
            >
              <span>{isVerifyingIntegrity ? 'Auditing...' : 'Run Diagnostics'}</span>
            </DuoButton>
          </div>

          {integrityReport ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                  {integrityReport.curriculumOk ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" weight="fill" />
                  ) : (
                    <Warning className="w-4 h-4 text-rose-400 shrink-0" weight="fill" />
                  )}
                  <div className="truncate">
                    <span className="font-bold text-white block">Curriculum DB</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {integrityReport.curriculumOk ? 'Integrity OK' : 'Check Failed'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                  {integrityReport.userProfileOk ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" weight="fill" />
                  ) : (
                    <Warning className="w-4 h-4 text-rose-400 shrink-0" weight="fill" />
                  )}
                  <div className="truncate">
                    <span className="font-bold text-white block">User Profile WAL</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {integrityReport.userProfileOk ? 'Integrity OK' : 'Check Failed'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Questions in SQLite:</span>
                  <span className="font-bold text-white">{integrityReport.counts.questions} Qs</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Stepping Nodes & Checkpoints:</span>
                  <span className="font-bold text-white">{integrityReport.counts.nodes} Nodes</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Live-Verified YouTube Lectures:</span>
                  <span className="font-bold text-white">{integrityReport.counts.lectures} Lectures</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Full-Length 65-Q Mock Papers:</span>
                  <span className="font-bold text-white">{integrityReport.counts.mockPapers} Papers (100M)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Current User XP / Gems:</span>
                  <span className="font-bold text-emerald-400">
                    {integrityReport.userStats.xp} XP / {integrityReport.userStats.gems} Gems
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-400 space-y-1">
              <Database className="w-6 h-6 mx-auto text-slate-500 mb-1" />
              <p>Click "Run Diagnostics" to check SQLite integrity and row counts across all GATE DA modules.</p>
            </div>
          )}
        </div>

        {/* Card 3: User Profile Backup & Restore */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <FloppyDisk className="w-5 h-5" weight="duotone" />
            <span>Profile Backup & Cross-Device Transfer</span>
          </div>

          <p className="text-xs text-slate-400">
            Save your streaks, XP, custom notes, mistake vaults, and test attempt history into a portable
            <span className="text-amber-300 font-mono font-bold"> .gateda-backup </span>
            file. Never lose progress when moving between laptops.
          </p>

          {backupStatusMessage && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" weight="fill" />
              <span>{backupStatusMessage}</span>
            </div>
          )}

          <div className="flex gap-3">
            <DuoButton
              variant="warning"
              size="sm"
              onClick={handleExportBackup}
              className="flex-1"
            >
              <div className="flex items-center justify-center gap-2">
                <FloppyDisk className="w-4 h-4" />
                <span>Export (.gateda-backup)</span>
              </div>
            </DuoButton>

            <DuoButton
              variant="secondary"
              size="sm"
              onClick={handleTriggerFileSelect}
              disabled={isRestoring}
              className="flex-1"
            >
              <div className="flex items-center justify-center gap-2">
                <FileArrowUp className="w-4 h-4" />
                <span>{isRestoring ? 'Restoring...' : 'Restore Backup'}</span>
              </div>
            </DuoButton>
          </div>
        </div>

        {/* Card 4: Optional AI Bridge Settings */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Sparkle className="w-5 h-5" weight="duotone" />
              <span>Optional AI Bridge (NotebookLM / Ollama)</span>
            </div>
            {aiSavedSuccess && (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                Saved!
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            {/* Gemini API Key */}
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold block">Google Gemini API Key (Optional)</label>
              <div className="relative">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showGeminiKey ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Local Ollama Endpoint */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Local Ollama Endpoint</label>
                <input
                  type="text"
                  value={ollamaEndpoint}
                  onChange={(e) => setOllamaEndpoint(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Ollama Model</label>
                <select
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500 text-xs"
                >
                  <option value="llama3">llama3 (8B)</option>
                  <option value="qwen2.5-coder">qwen2.5-coder (7B)</option>
                  <option value="deepseek-r1">deepseek-r1 (8B)</option>
                  <option value="mistral">mistral (7B)</option>
                </select>
              </div>
            </div>

            {/* NotebookLM Mode Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-300">Generate NotebookLM Deep Dive Guides</span>
              <input
                type="checkbox"
                checked={notebookLmMode}
                onChange={(e) => setNotebookLmMode(e.target.checked)}
                className="w-4 h-4 accent-purple-500 cursor-pointer"
              />
            </div>

            <DuoButton
              variant="secondary"
              size="sm"
              onClick={handleSaveAiConfig}
              className="w-full"
            >
              <span>Save AI Preferences</span>
            </DuoButton>
          </div>
        </div>

        {/* Card 5: Visual Theme Switcher */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <Palette className="w-5 h-5" weight="duotone" />
            <span>Theme & Visual Styling</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(THEMES).map(([id, t]) => {
              const isSelected = currentThemeId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    if (onUpdateTheme) onUpdateTheme(id);
                    if (window.api?.updateUserStats) {
                      window.api.updateUserStats({ theme_id: id });
                    }
                  }}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{t.name}</span>
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: t.colors.primary }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block">{t.tagline}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
