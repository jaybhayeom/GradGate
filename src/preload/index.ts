import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipcContracts';
import { BACKUP_IPC_CHANNELS } from '../shared/backupIpcContracts';
import type { SyncProgress } from '../shared/types';
import type {
  GateDaBackupPayload,
  SystemIntegrityReport,
  AiConfig
} from '../shared/backupIpcContracts';

const api = {
  // Curriculum Methods
  getSyllabusSections: () => ipcRenderer.invoke(IPC_CHANNELS.CURRICULUM_GET_SECTIONS),
  getUnits: (sectionId: string) => ipcRenderer.invoke(IPC_CHANNELS.CURRICULUM_GET_UNITS, sectionId),
  getNodes: (unitId: string) => ipcRenderer.invoke(IPC_CHANNELS.CURRICULUM_GET_NODES, unitId),
  getQuestions: (nodeId: string) => ipcRenderer.invoke(IPC_CHANNELS.CURRICULUM_GET_QUESTIONS, nodeId),
  getLectures: (unitId?: string, language?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.CURRICULUM_GET_LECTURES, unitId, language),
  getStudioConfig: (unitId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.CURRICULUM_GET_STUDIO_CONFIG, unitId),
  getManifest: () => ipcRenderer.invoke(IPC_CHANNELS.CURRICULUM_GET_MANIFEST),

  // User Profile Methods
  getUserStats: () => ipcRenderer.invoke(IPC_CHANNELS.USER_GET_STATS),
  updateUserStats: (updates: unknown) =>
    ipcRenderer.invoke(IPC_CHANNELS.USER_UPDATE_STATS, updates),
  getNodeProgress: (nodeId?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.USER_GET_NODE_PROGRESS, nodeId),
  saveNodeProgress: (progress: unknown) =>
    ipcRenderer.invoke(IPC_CHANNELS.USER_SAVE_NODE_PROGRESS, progress),
  getMistakes: () => ipcRenderer.invoke(IPC_CHANNELS.USER_GET_MISTAKES),
  addMistake: (mistake: unknown) => ipcRenderer.invoke(IPC_CHANNELS.USER_ADD_MISTAKE, mistake),
  resolveMistake: (questionId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.USER_RESOLVE_MISTAKE, questionId),
  getDailyTargets: (date?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.USER_GET_DAILY_TARGETS, date),

  // GitHub OTA Sync Methods
  checkCurriculumUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.SYNC_CHECK_UPDATES),
  applyCurriculumUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.SYNC_APPLY_UPDATE),
  onSyncProgress: (callback: (progress: SyncProgress) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, progress: SyncProgress) => callback(progress);
    ipcRenderer.on(IPC_CHANNELS.SYNC_PROGRESS_EVENT, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SYNC_PROGRESS_EVENT, handler);
  },

  // Profile Backup & System Integrity Methods
  exportProfileBackup: (): Promise<GateDaBackupPayload> =>
    ipcRenderer.invoke(BACKUP_IPC_CHANNELS.PROFILE_BACKUP_EXPORT),
  restoreProfileBackup: (
    backup: unknown
  ): Promise<{ success: boolean; rowsRestored: number; message: string }> =>
    ipcRenderer.invoke(BACKUP_IPC_CHANNELS.PROFILE_BACKUP_RESTORE, backup),
  verifySystemIntegrity: (): Promise<SystemIntegrityReport> =>
    ipcRenderer.invoke(BACKUP_IPC_CHANNELS.SYSTEM_VERIFY_INTEGRITY),
  getAiConfig: (): Promise<AiConfig> =>
    ipcRenderer.invoke(BACKUP_IPC_CHANNELS.SETTINGS_GET_AI_CONFIG),
  saveAiConfig: (config: AiConfig): Promise<{ success: boolean }> =>
    ipcRenderer.invoke(BACKUP_IPC_CHANNELS.SETTINGS_SAVE_AI_CONFIG, config),

  // Mock Papers & Questions
  getMockPapers: () =>
    ipcRenderer.invoke(BACKUP_IPC_CHANNELS.MOCK_GET_PAPERS),
  getMockPaperQuestions: (paperId: string) =>
    ipcRenderer.invoke(BACKUP_IPC_CHANNELS.MOCK_GET_PAPER_QUESTIONS, paperId)
};

contextBridge.exposeInMainWorld('api', api);

export type ApiType = typeof api;
