-- ==============================================================================
-- USER PROFILE DATABASE SCHEMA (Read-Write User Progress, Preserved Across Updates)
-- Target: app.getPath('userData')/profile/user_profile.db
-- ==============================================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- 1. User Global Stats & Gamification Metrics
CREATE TABLE IF NOT EXISTS user_stats (
    id TEXT PRIMARY KEY DEFAULT 'default_user',
    display_name TEXT NOT NULL DEFAULT 'Aspirant',
    avatar_id TEXT NOT NULL DEFAULT 'avatar_default',
    xp INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    streak_freezes INTEGER NOT NULL DEFAULT 2,
    last_active_date TEXT,
    hearts INTEGER NOT NULL DEFAULT 5 CHECK (hearts >= 0 AND hearts <= 5),
    cram_mode_until TEXT, -- ISO Timestamp if infinite hearts active
    gems INTEGER NOT NULL DEFAULT 150,
    target_exam_date TEXT NOT NULL DEFAULT '2027-02-07', -- Defaulting to GATE DA exam window
    current_league TEXT NOT NULL DEFAULT 'BRONZE' CHECK (current_league IN (
        'BRONZE', 'SILVER', 'GOLD', 'OBSIDIAN', 'DIAMOND'
    )),
    theme_id TEXT NOT NULL DEFAULT 'theme_python_emerald',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Stepping Node Progression (Duolingo-style Path Progress)
CREATE TABLE IF NOT EXISTS node_progress (
    node_id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'LOCKED' CHECK (status IN (
        'LOCKED', 'ACTIVE_CURRENT', 'COMPLETED_BRONZE', 'COMPLETED_GOLD'
    )),
    attempts_count INTEGER NOT NULL DEFAULT 0,
    best_score_pct REAL NOT NULL DEFAULT 0.0,
    stars_earned INTEGER NOT NULL DEFAULT 0 CHECK (stars_earned >= 0 AND stars_earned <= 3),
    first_completed_at TEXT,
    last_attempted_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Mistakes Vault (Questions failed by the user, for targeted drills)
CREATE TABLE IF NOT EXISTS mistakes_vault (
    question_id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL,
    times_failed INTEGER NOT NULL DEFAULT 1,
    last_incorrect_answer TEXT,
    resolved INTEGER NOT NULL DEFAULT 0 CHECK (resolved IN (0, 1)),
    last_failed_at TEXT NOT NULL DEFAULT (datetime('now')),
    resolved_at TEXT
);

-- 4. Anki SM-2 Spaced Repetition Flashcards Deck
CREATE TABLE IF NOT EXISTS srs_flashcards (
    card_id TEXT PRIMARY KEY,
    repetitions INTEGER NOT NULL DEFAULT 0,
    ease_factor REAL NOT NULL DEFAULT 2.50, -- Standard SM-2 starting ease factor
    interval_days INTEGER NOT NULL DEFAULT 0,
    next_review_due TEXT NOT NULL DEFAULT (date('now')),
    last_reviewed_at TEXT,
    last_grade INTEGER CHECK (last_grade BETWEEN 1 AND 4), -- 1: Again, 2: Hard, 3: Good, 4: Easy
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. Full & Sectional Mock Exam Attempts
CREATE TABLE IF NOT EXISTS mock_attempts (
    id TEXT PRIMARY KEY,
    mock_paper_id TEXT NOT NULL,
    paper_title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN (
        'IN_PROGRESS', 'SUBMITTED', 'ABANDONED'
    )),
    start_time TEXT NOT NULL DEFAULT (datetime('now')),
    end_time TEXT,
    duration_seconds_allocated INTEGER NOT NULL DEFAULT 10800, -- 180 minutes default
    time_remaining_seconds INTEGER NOT NULL DEFAULT 10800,
    total_score REAL DEFAULT 0.0,
    marks_general_aptitude REAL DEFAULT 0.0,
    marks_technical_da REAL DEFAULT 0.0,
    negative_marks_deducted REAL DEFAULT 0.0,
    predicted_air_range TEXT,
    normalized_gate_score REAL,
    raw_response_backup_json TEXT, -- Full snapshot for instant recovery
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 6. TCS iON Real-Time Question Responses (Power-Cut Resilient with sub-50ms writes)
CREATE TABLE IF NOT EXISTS mock_question_responses (
    attempt_id TEXT NOT NULL REFERENCES mock_attempts(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    question_number INTEGER NOT NULL,
    palette_status TEXT NOT NULL DEFAULT 'NOT_VISITED' CHECK (palette_status IN (
        'NOT_VISITED',
        'NOT_ANSWERED',
        'ANSWERED',
        'MARKED_FOR_REVIEW',
        'ANSWERED_AND_MARKED'
    )),
    selected_answer_json TEXT,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    is_correct INTEGER CHECK (is_correct IN (0, 1, NULL)),
    marks_awarded REAL DEFAULT 0.0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (attempt_id, question_id)
);

-- 7. YouTube Video Lecture Watch History
CREATE TABLE IF NOT EXISTS lecture_watch_history (
    lecture_id TEXT PRIMARY KEY,
    watched_seconds INTEGER NOT NULL DEFAULT 0,
    duration_total_seconds INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
    last_watched_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 8. Timestamped Lecture Notes with Markdown & KaTeX
CREATE TABLE IF NOT EXISTS lecture_notes (
    id TEXT PRIMARY KEY,
    lecture_id TEXT NOT NULL,
    timestamp_sec INTEGER NOT NULL DEFAULT 0,
    note_markdown TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 9. Gem Shop Economy Transactions
CREATE TABLE IF NOT EXISTS gem_transactions (
    id TEXT PRIMARY KEY,
    amount INTEGER NOT NULL, -- Positive for earned, negative for spent
    balance_after INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('EARNED', 'SPENT')),
    description TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 10. Dynamic Adaptive Daily Targets (Calculated per Exam Countdown & Accuracy)
CREATE TABLE IF NOT EXISTS adaptive_daily_targets (
    id TEXT PRIMARY KEY,
    target_date TEXT NOT NULL, -- YYYY-MM-DD
    quest_type TEXT NOT NULL CHECK (quest_type IN (
        'NODE_COMPLETE',
        'MISTAKE_REPAIR',
        'TIMED_BLITZ',
        'SRS_FLASHCARDS',
        'LECTURE_WATCH'
    )),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    current_value INTEGER NOT NULL DEFAULT 0,
    xp_reward INTEGER NOT NULL DEFAULT 20,
    completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_node_progress_status ON node_progress(status);
CREATE INDEX IF NOT EXISTS idx_mistakes_vault_resolved ON mistakes_vault(resolved, unit_id);
CREATE INDEX IF NOT EXISTS idx_srs_due ON srs_flashcards(next_review_due);
CREATE INDEX IF NOT EXISTS idx_mock_responses_attempt ON mock_question_responses(attempt_id, palette_status);
CREATE INDEX IF NOT EXISTS idx_adaptive_targets_date ON adaptive_daily_targets(target_date);
CREATE INDEX IF NOT EXISTS idx_lecture_notes_lecture ON lecture_notes(lecture_id);
