// ==============================================================================
// SHARED TYPES FOR GRADGATE (Main & Renderer Synchronized Types)
// ==============================================================================

export type SectionCode =
  | 'DA_01_PROB_STATS'
  | 'DA_02_LIN_ALG'
  | 'DA_03_CALC_OPT'
  | 'DA_04_PROG_DSA'
  | 'DA_05_DBMS_DW'
  | 'DA_06_ML'
  | 'DA_07_AI'
  | 'DA_08_GEN_APT';

export interface SyllabusSection {
  id: SectionCode;
  code: string;
  title: string;
  short_title: string;
  description: string;
  order_index: number;
  official_weightage: number;
  color_hex: string;
  icon_name: string;
}

export interface Unit {
  id: string;
  section_id: SectionCode;
  title: string;
  description: string;
  order_index: number;
  guidebook_markdown?: string | null;
  created_at: string;
}

export type NodeType = 'CONCEPT_DRILL' | 'PYQ_CHECKPOINT' | 'VISUAL_STUDIO' | 'BOSS_MOCK';

export interface SteppingNode {
  id: string;
  unit_id: string;
  title: string;
  description?: string | null;
  node_type: NodeType;
  order_index: number;
  total_xp: number;
  required_hearts: number;
  prerequisite_node_id?: string | null;
  created_at: string;
}

export type QuestionType =
  | 'MCQ'
  | 'MSQ'
  | 'NAT'
  | 'TOKEN_BUILD'
  | 'MATCH_PAIRS'
  | 'ALGO_TRACE';

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Question {
  id: string;
  stepping_node_id: string;
  question_type: QuestionType;
  prompt_latex: string;
  marks: 1.0 | 2.0;
  negative_marks: 0.0 | -0.3333333333 | -0.6666666667;
  options_json?: string | null;
  correct_answer_json: string;
  nat_range_min?: number | null;
  nat_range_max?: number | null;
  solution_latex: string;
  sandbox_starter_code?: string | null;
  sandbox_language?: 'PYTHON' | 'SQL' | null;
  pyq_metadata_json?: string | null;
  difficulty_level: QuestionDifficulty;
  created_at: string;
}

export type LectureLanguage = 'English' | 'Hindi' | 'Hinglish' | 'Tamil' | 'Telugu';

export type LectureCategory =
  | 'NPTEL_IIT'
  | 'COACHING_PLAYLIST'
  | 'VISUAL_INTUITION'
  | 'PYQ_MARATHON';

export interface YouTubeLecture {
  id: string;
  topic_id: string;
  unit_id?: string | null;
  title: string;
  channel_name: string;
  language: LectureLanguage;
  category: LectureCategory;
  youtube_video_id: string;
  youtube_playlist_id?: string | null;
  duration_sec: number;
  start_timestamp_sec: number;
  verified_at: string;
  created_at: string;
}

export type StudioType =
  | 'MAFS_2D'
  | 'VISX_ML_PLOT'
  | 'REACT_FLOW_GRAPH'
  | 'TWO_HOST_DEEP_DIVE';

export interface VisualStudioConfig {
  id: string;
  unit_id: string;
  title: string;
  studio_type: StudioType;
  config_json: string;
  created_at: string;
}

// User Profile Types
export type LeagueTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'OBSIDIAN' | 'DIAMOND';

export interface UserStats {
  id: string;
  display_name: string;
  avatar_id: string;
  xp: number;
  current_streak: number;
  longest_streak: number;
  streak_freezes: number;
  last_active_date?: string | null;
  hearts: number; // 0..5
  cram_mode_until?: string | null;
  gems: number;
  target_exam_date: string;
  current_league: LeagueTier;
  theme_id: string;
  created_at: string;
  updated_at: string;
}

export type NodeProgressStatus =
  | 'LOCKED'
  | 'ACTIVE_CURRENT'
  | 'COMPLETED_BRONZE'
  | 'COMPLETED_GOLD';

export interface NodeProgress {
  node_id: string;
  status: NodeProgressStatus;
  attempts_count: number;
  best_score_pct: number;
  stars_earned: number;
  first_completed_at?: string | null;
  last_attempted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MistakesVaultItem {
  question_id: string;
  unit_id: string;
  times_failed: number;
  last_incorrect_answer?: string | null;
  resolved: number; // 0 or 1
  last_failed_at: string;
  resolved_at?: string | null;
}

export interface SrsFlashcard {
  card_id: string;
  repetitions: number;
  ease_factor: number;
  interval_days: number;
  next_review_due: string;
  last_reviewed_at?: string | null;
  last_grade?: number | null;
  created_at: string;
}

export type PaletteStatus =
  | 'NOT_VISITED'
  | 'NOT_ANSWERED'
  | 'ANSWERED'
  | 'MARKED_FOR_REVIEW'
  | 'ANSWERED_AND_MARKED';

export interface MockQuestionResponse {
  attempt_id: string;
  question_id: string;
  question_number: number;
  palette_status: PaletteStatus;
  selected_answer_json?: string | null;
  time_spent_seconds: number;
  is_correct?: number | null;
  marks_awarded: number;
  updated_at: string;
}

export interface ContentManifest {
  version: string;
  schema_version: number;
  published_at: string;
  sha256_checksum: string;
  total_questions: number;
  total_nodes: number;
  total_lectures: number;
  notes?: string | null;
}

export interface SyncProgress {
  phase: 'CHECKING' | 'DOWNLOADING' | 'VERIFYING' | 'EXTRACTING' | 'COMPLETE' | 'ERROR';
  bytesDownloaded: number;
  totalBytes: number;
  percent: number;
  message: string;
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  manifest?: ContentManifest | null;
}
