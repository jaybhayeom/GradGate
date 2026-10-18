import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipcContracts';
import type { SyncProgress } from '../shared/types';

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
  }
};

contextBridge.exposeInMainWorld('api', api);

export type ApiType = typeof api;
