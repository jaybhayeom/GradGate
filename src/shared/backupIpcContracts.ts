// ==============================================================================
// BACKUP & SETTINGS IPC CONTRACTS FOR GRADGATE
// Non-destructive extension of IPC channels for Phase 9
// ==============================================================================

import { z } from 'zod';

export const BACKUP_IPC_CHANNELS = {
  PROFILE_BACKUP_EXPORT: 'profile:backup-export',
  PROFILE_BACKUP_RESTORE: 'profile:backup-restore',
  SYSTEM_VERIFY_INTEGRITY: 'system:verify-integrity',
  SETTINGS_GET_AI_CONFIG: 'settings:get-ai-config',
  SETTINGS_SAVE_AI_CONFIG: 'settings:save-ai-config',
  MOCK_GET_PAPERS: 'mock:get-papers',
  MOCK_GET_PAPER_QUESTIONS: 'mock:get-paper-questions'
} as const;

export const AiConfigSchema = z.object({
  geminiApiKey: z.string().optional(),
  ollamaEndpoint: z.string().url().or(z.literal('')).optional(),
  ollamaModel: z.string().optional(),
  notebookLmMode: z.boolean().optional()
});

export type AiConfig = z.infer<typeof AiConfigSchema>;

export interface GateDaBackupPayload {
  magic: 'GATEDA_BACKUP';
  version: '1.0.0';
  schemaVersion: number;
  exportedAt: string;
  checksum: string;
  tables: {
    user_stats: unknown[];
    node_progress: unknown[];
    mistakes_vault: unknown[];
    srs_flashcards: unknown[];
    mock_attempts: unknown[];
    mock_question_responses: unknown[];
    lecture_watch_history: unknown[];
    lecture_notes: unknown[];
    gem_transactions: unknown[];
    adaptive_daily_targets: unknown[];
  };
}

export interface SystemIntegrityReport {
  curriculumOk: boolean;
  curriculumMessage: string;
  userProfileOk: boolean;
  userProfileMessage: string;
  curriculumVersion: string;
  counts: {
    sections: number;
    units: number;
    nodes: number;
    questions: number;
    lectures: number;
    mockPapers: number;
    formulaCards: number;
  };
  userStats: {
    xp: number;
    streak: number;
    hearts: number;
    gems: number;
    currentLeague: string;
    mistakesRecorded: number;
    mistakesResolved: number;
    flashcardsCount: number;
    mockAttemptsCount: number;
  };
}
