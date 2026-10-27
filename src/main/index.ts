import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { DatabaseManager } from './db/databaseManager';
import { GitHubSyncManager } from './sync/githubSyncManager';
import { ProfileBackupService } from './services/profileBackupService';
import {
  IPC_CHANNELS,
  UserStatsUpdateSchema,
  NodeProgressUpdateSchema,
  MistakeRecordSchema
} from '../shared/ipcContracts';
import {
  BACKUP_IPC_CHANNELS,
  AiConfigSchema
} from '../shared/backupIpcContracts';
import type { SyncProgress } from '../shared/types';

let mainWindow: BrowserWindow | null = null;
let dbManager: DatabaseManager | null = null;
let syncManager: GitHubSyncManager | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0F172A',
      symbolColor: '#F8FAFC',
      height: 36
    },
    webPreferences: {
      preload: fs.existsSync(path.join(__dirname, '../preload/index.js'))
        ? path.join(__dirname, '../preload/index.js')
        : path.join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote url for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

function registerIpcHandlers(): void {
  if (!dbManager || !syncManager) return;

  // --- Curriculum IPC Handlers ---
  ipcMain.handle(IPC_CHANNELS.CURRICULUM_GET_SECTIONS, async () => {
    return dbManager?.getSyllabusSections() || [];
  });

  ipcMain.handle(IPC_CHANNELS.CURRICULUM_GET_UNITS, async (_event, sectionId: string) => {
    return dbManager?.getUnitsBySection(sectionId) || [];
  });

  ipcMain.handle(IPC_CHANNELS.CURRICULUM_GET_NODES, async (_event, unitId: string) => {
    return dbManager?.getSteppingNodesByUnit(unitId) || [];
  });

  ipcMain.handle(IPC_CHANNELS.CURRICULUM_GET_QUESTIONS, async (_event, nodeId: string) => {
    return dbManager?.getQuestionsByNode(nodeId) || [];
  });

  ipcMain.handle(
    IPC_CHANNELS.CURRICULUM_GET_LECTURES,
    async (_event, unitId?: string, language?: string) => {
      return dbManager?.getYouTubeLectures(unitId, language) || [];
    }
  );

  ipcMain.handle(IPC_CHANNELS.CURRICULUM_GET_STUDIO_CONFIG, async (_event, unitId: string) => {
    return dbManager?.getVisualStudioConfig(unitId) || null;
  });

  ipcMain.handle(IPC_CHANNELS.CURRICULUM_GET_MANIFEST, async () => {
    return dbManager?.getContentManifest() || null;
  });

  // --- User Profile IPC Handlers ---
  ipcMain.handle(IPC_CHANNELS.USER_GET_STATS, async () => {
    return dbManager?.getUserStats() || null;
  });

  ipcMain.handle(IPC_CHANNELS.USER_UPDATE_STATS, async (_event, rawUpdates: unknown) => {
    const validated = UserStatsUpdateSchema.parse(rawUpdates);
    return dbManager?.updateUserStats(validated) || null;
  });

  ipcMain.handle(IPC_CHANNELS.USER_GET_NODE_PROGRESS, async (_event, nodeId?: string) => {
    return dbManager?.getNodeProgress(nodeId) || [];
  });

  ipcMain.handle(IPC_CHANNELS.USER_SAVE_NODE_PROGRESS, async (_event, rawProgress: unknown) => {
    const validated = NodeProgressUpdateSchema.parse(rawProgress);
    dbManager?.saveNodeProgress(validated);
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.USER_GET_MISTAKES, async () => {
    return dbManager?.getMistakes() || [];
  });

  ipcMain.handle(IPC_CHANNELS.USER_ADD_MISTAKE, async (_event, rawMistake: unknown) => {
    const validated = MistakeRecordSchema.parse(rawMistake);
    dbManager?.addMistake(validated.questionId, validated.unitId, validated.lastAnswer);
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.USER_RESOLVE_MISTAKE, async (_event, questionId: string) => {
    dbManager?.resolveMistake(questionId);
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.USER_GET_DAILY_TARGETS, async (_event, targetDate?: string) => {
    return dbManager?.getDailyTargets(targetDate) || [];
  });

  // --- GitHub OTA Sync Handlers ---
  ipcMain.handle(IPC_CHANNELS.SYNC_CHECK_UPDATES, async () => {
    return (await syncManager?.checkForCurriculumUpdates()) || null;
  });

  ipcMain.handle(IPC_CHANNELS.SYNC_APPLY_UPDATE, async () => {
    return (await syncManager?.applyCurriculumUpdate()) || { success: false, message: 'Sync unavailable' };
  });

  // Forward sync events to Renderer
  syncManager.on('progress', (progress: SyncProgress) => {
    mainWindow?.webContents.send(IPC_CHANNELS.SYNC_PROGRESS_EVENT, progress);
  });

  // --- Profile Backup & Restore Handlers ---
  ipcMain.handle(BACKUP_IPC_CHANNELS.PROFILE_BACKUP_EXPORT, async () => {
    const userProfileDb = dbManager?.getUserProfileDb();
    if (!userProfileDb) throw new Error('UserProfile database not initialized');
    return ProfileBackupService.exportProfileBackup(userProfileDb);
  });

  ipcMain.handle(
    BACKUP_IPC_CHANNELS.PROFILE_BACKUP_RESTORE,
    async (_event, rawBackup: unknown) => {
      const userProfileDb = dbManager?.getUserProfileDb();
      if (!userProfileDb) throw new Error('UserProfile database not initialized');
      const validation = ProfileBackupService.validateProfileBackup(rawBackup);
      if (!validation.valid || !validation.backup) {
        return {
          success: false,
          rowsRestored: 0,
          message: validation.error || 'Invalid backup payload'
        };
      }
      return ProfileBackupService.restoreProfileBackup(userProfileDb, validation.backup);
    }
  );

  // --- Offline System Integrity Handler ---
  ipcMain.handle(BACKUP_IPC_CHANNELS.SYSTEM_VERIFY_INTEGRITY, async () => {
    return ProfileBackupService.verifySystemIntegrity(
      dbManager?.getCurriculumDb(),
      dbManager?.getUserProfileDb(),
      'v1.0.0'
    );
  });

  // --- Optional AI Bridge Settings Handlers ---
  ipcMain.handle(BACKUP_IPC_CHANNELS.SETTINGS_GET_AI_CONFIG, async () => {
    const configPath = path.join(app.getPath('userData'), 'ai-config.json');
    if (!fs.existsSync(configPath)) {
      return {
        geminiApiKey: '',
        ollamaEndpoint: 'http://localhost:11434',
        ollamaModel: 'llama3',
        notebookLmMode: true
      };
    }
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
      return {
        geminiApiKey: '',
        ollamaEndpoint: 'http://localhost:11434',
        ollamaModel: 'llama3',
        notebookLmMode: true
      };
    }
  });

  ipcMain.handle(
    BACKUP_IPC_CHANNELS.SETTINGS_SAVE_AI_CONFIG,
    async (_event, rawConfig: unknown) => {
      const validated = AiConfigSchema.parse(rawConfig);
      const configPath = path.join(app.getPath('userData'), 'ai-config.json');
      fs.writeFileSync(configPath, JSON.stringify(validated, null, 2), 'utf8');
      return { success: true };
    }
  );

  // --- Mock Papers & Full Arena Questions ---
  ipcMain.handle(BACKUP_IPC_CHANNELS.MOCK_GET_PAPERS, async () => {
    const currDb = dbManager?.getCurriculumDb();
    if (!currDb) return [];
    try {
      return currDb.prepare('SELECT * FROM mock_papers ORDER BY total_questions DESC').all();
    } catch {
      return [];
    }
  });

  ipcMain.handle(
    BACKUP_IPC_CHANNELS.MOCK_GET_PAPER_QUESTIONS,
    async (_event, paperId: string) => {
      const currDb = dbManager?.getCurriculumDb();
      if (!currDb) return [];
      try {
        const rows = currDb
          .prepare(`
            SELECT 
              q.id,
              mpq.question_number as questionNumber,
              mpq.section_category as section,
              q.question_type as type,
              q.marks,
              q.negative_marks as negativeMarks,
              q.prompt_latex as promptLatex,
              q.options_json,
              q.correct_answer_json as correctAnswerJson,
              q.nat_range_min as natRangeMin,
              q.nat_range_max as natRangeMax,
              q.solution_latex as solutionLatex
            FROM mock_paper_questions mpq
            JOIN questions q ON mpq.question_id = q.id
            WHERE mpq.mock_paper_id = ?
            ORDER BY mpq.question_number ASC
          `)
          .all(paperId) as Record<string, unknown>[];

        return rows.map((r) => ({
          ...r,
          options: r.options_json ? JSON.parse(r.options_json as string) : undefined
        }));
      } catch {
        return [];
      }
    }
  );
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.gradgate.app');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // 1. Initialize Paths
  const userData = app.getPath('userData');
  const contentDir = path.join(userData, 'content');
  const profileDir = path.join(userData, 'profile');
  if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });
  if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });

  const bundledSeedCandidates = [
    path.resolve(__dirname, '../../release-bundle/curriculum.db'),
    path.resolve(process.cwd(), 'release-bundle/curriculum.db'),
    path.join(__dirname, 'release-bundle/curriculum.db')
  ];
  let localSeedPath: string | undefined;
  for (const p of bundledSeedCandidates) {
    if (fs.existsSync(p)) {
      localSeedPath = p;
      break;
    }
  }

  // Pre-seed curriculum.db if not yet in userData
  const targetCurriculumDb = path.join(contentDir, 'curriculum.db');
  if (!fs.existsSync(targetCurriculumDb) && localSeedPath) {
    try {
      fs.copyFileSync(localSeedPath, targetCurriculumDb);
    } catch (seedErr) {
      console.warn('[GRADGATE-MAIN] Initial seed copy error:', seedErr);
    }
  }

  // 2. Setup GitHub Sync Manager
  syncManager = new GitHubSyncManager({
    contentDir,
    repoOwner: 'jaybhayeom',
    repoName: 'GradGate',
    branch: 'main',
    bundledSeedPath: localSeedPath
  });

  // 3. Resolve schemas across environments
  const resolveSchema = (filename: string): string => {
    const candidates = [
      path.join(__dirname, 'db', filename),
      path.resolve(__dirname, '../../src/main/db', filename),
      path.resolve(process.cwd(), 'src/main/db', filename)
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return path.join(__dirname, 'db', filename);
  };

  dbManager = new DatabaseManager({
    curriculumDbPath: targetCurriculumDb,
    userProfileDbPath: path.join(profileDir, 'user_profile.db'),
    curriculumSchemaPath: resolveSchema('curriculumSchema.sql'),
    userProfileSchemaPath: resolveSchema('userProfileSchema.sql')
  });

  // Bootstrap first launch (checks online, falls back to local schema seed)
  await syncManager.bootstrapFirstLaunch();
  dbManager.initialize();

  // 4. Register IPC Handlers and Create Window
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  if (dbManager) {
    dbManager.close();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
