// ==============================================================================
// ZOD IPC CONTRACTS FOR GRADGATE (Typed Inter-Process Communication)
// ==============================================================================

import { z } from 'zod';

export const SyllabusSectionSchema = z.object({
  id: z.enum([
    'DA_01_PROB_STATS',
    'DA_02_LIN_ALG',
    'DA_03_CALC_OPT',
    'DA_04_PROG_DSA',
    'DA_05_DBMS_DW',
    'DA_06_ML',
    'DA_07_AI',
    'DA_08_GEN_APT'
  ]),
  code: z.string(),
  title: z.string(),
  short_title: z.string(),
  description: z.string(),
  order_index: z.number().int(),
  official_weightage: z.number(),
  color_hex: z.string(),
  icon_name: z.string()
});

export const UserStatsUpdateSchema = z.object({
  display_name: z.string().optional(),
  avatar_id: z.string().optional(),
  xp: z.number().int().optional(),
  current_streak: z.number().int().optional(),
  longest_streak: z.number().int().optional(),
  streak_freezes: z.number().int().optional(),
  hearts: z.number().int().min(0).max(5).optional(),
  cram_mode_until: z.string().nullable().optional(),
  gems: z.number().int().optional(),
  target_exam_date: z.string().optional(),
  current_league: z.enum(['BRONZE', 'SILVER', 'GOLD', 'OBSIDIAN', 'DIAMOND']).optional(),
  theme_id: z.string().optional()
});

export const NodeProgressUpdateSchema = z.object({
  nodeId: z.string(),
  status: z.enum(['LOCKED', 'ACTIVE_CURRENT', 'COMPLETED_BRONZE', 'COMPLETED_GOLD']),
  score: z.number().min(0).max(100),
  stars: z.number().int().min(0).max(3)
});

export const MistakeRecordSchema = z.object({
  questionId: z.string(),
  unitId: z.string(),
  lastAnswer: z.string().optional()
});

export const SyncProgressSchema = z.object({
  phase: z.enum(['CHECKING', 'DOWNLOADING', 'VERIFYING', 'EXTRACTING', 'COMPLETE', 'ERROR']),
  bytesDownloaded: z.number().int(),
  totalBytes: z.number().int(),
  percent: z.number().min(0).max(100),
  message: z.string()
});

export const IPC_CHANNELS = {
  // Curriculum Channels (Read-Only)
  CURRICULUM_GET_SECTIONS: 'curriculum:get-sections',
  CURRICULUM_GET_UNITS: 'curriculum:get-units',
  CURRICULUM_GET_NODES: 'curriculum:get-nodes',
  CURRICULUM_GET_QUESTIONS: 'curriculum:get-questions',
  CURRICULUM_GET_LECTURES: 'curriculum:get-lectures',
  CURRICULUM_GET_STUDIO_CONFIG: 'curriculum:get-studio-config',
  CURRICULUM_GET_MANIFEST: 'curriculum:get-manifest',

  // User Profile Channels (Read-Write)
  USER_GET_STATS: 'user:get-stats',
  USER_UPDATE_STATS: 'user:update-stats',
  USER_GET_NODE_PROGRESS: 'user:get-node-progress',
  USER_SAVE_NODE_PROGRESS: 'user:save-node-progress',
  USER_GET_MISTAKES: 'user:get-mistakes',
  USER_ADD_MISTAKE: 'user:add-mistake',
  USER_RESOLVE_MISTAKE: 'user:resolve-mistake',
  USER_GET_DAILY_TARGETS: 'user:get-daily-targets',

  // GitHub OTA Sync Channels
  SYNC_CHECK_UPDATES: 'sync:check-updates',
  SYNC_APPLY_UPDATE: 'sync:apply-update',
  SYNC_PROGRESS_EVENT: 'sync:progress-event'
} as const;
