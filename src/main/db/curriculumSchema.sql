-- ==============================================================================
-- CURRICULUM DATABASE SCHEMA (Read-Only Application Content, Synced via GitHub)
-- Target: app.getPath('userData')/content/curriculum.db
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Official Syllabus Sections (8 Official Sections for GATE DA)
CREATE TABLE IF NOT EXISTS syllabus_sections (
    id TEXT PRIMARY KEY CHECK (id IN (
        'DA_01_PROB_STATS',
        'DA_02_LIN_ALG',
        'DA_03_CALC_OPT',
        'DA_04_PROG_DSA',
        'DA_05_DBMS_DW',
        'DA_06_ML',
        'DA_07_AI',
        'DA_08_GEN_APT'
    )),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    short_title TEXT NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER NOT NULL UNIQUE,
    official_weightage REAL NOT NULL,
    color_hex TEXT NOT NULL,
    icon_name TEXT NOT NULL
);

-- 2. Curriculum Units (Chapters within each Section)
CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY,
    section_id TEXT NOT NULL REFERENCES syllabus_sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    guidebook_markdown TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(section_id, order_index)
);

-- 3. Stepping Nodes (Duolingo-style progression nodes along the sinusoidal path)
CREATE TABLE IF NOT EXISTS stepping_nodes (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    node_type TEXT NOT NULL CHECK (node_type IN (
        'CONCEPT_DRILL',
        'PYQ_CHECKPOINT',
        'VISUAL_STUDIO',
        'BOSS_MOCK'
    )),
    order_index INTEGER NOT NULL,
    total_xp INTEGER NOT NULL DEFAULT 15,
    required_hearts INTEGER NOT NULL DEFAULT 1,
    prerequisite_node_id TEXT REFERENCES stepping_nodes(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(unit_id, order_index)
);

-- 4. Questions (Comprehensive Support for All Technical Formats)
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    stepping_node_id TEXT NOT NULL REFERENCES stepping_nodes(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL CHECK (question_type IN (
        'MCQ',
        'MSQ',
        'NAT',
        'TOKEN_BUILD',
        'MATCH_PAIRS',
        'ALGO_TRACE'
    )),
    prompt_latex TEXT NOT NULL,
    marks REAL NOT NULL CHECK (marks IN (1.0, 2.0)),
    negative_marks REAL NOT NULL CHECK (negative_marks IN (0.0, -0.3333333333, -0.6666666667)),
    options_json TEXT, -- JSON Array for MCQ/MSQ/TOKEN_BUILD/MATCH_PAIRS
    correct_answer_json TEXT NOT NULL, -- JSON formatted answer representation
    nat_range_min REAL, -- Minimum acceptable value for NAT
    nat_range_max REAL, -- Maximum acceptable value for NAT
    solution_latex TEXT NOT NULL, -- Step-by-step KaTeX derivation
    sandbox_starter_code TEXT, -- Starter code for Python/SQL sandboxes
    sandbox_language TEXT CHECK (sandbox_language IN ('PYTHON', 'SQL', NULL)),
    pyq_metadata_json TEXT, -- e.g. {"year": 2024, "paper": "GATE DA", "q_no": 12}
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('EASY', 'MEDIUM', 'HARD')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. Micro Drills (Quick timed drills / practice exercises)
CREATE TABLE IF NOT EXISTS micro_drills (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    drill_type TEXT NOT NULL CHECK (drill_type IN ('SPEED_BLITZ', 'FORMULA_RECALL', 'CODE_TRACE')),
    time_limit_sec INTEGER NOT NULL DEFAULT 180,
    questions_count INTEGER NOT NULL DEFAULT 5,
    config_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 6. Verified Multi-Language YouTube Lectures
CREATE TABLE IF NOT EXISTS youtube_lectures (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL,
    unit_id TEXT REFERENCES units(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    channel_name TEXT NOT NULL,
    language TEXT NOT NULL CHECK (language IN ('English', 'Hindi', 'Hinglish', 'Tamil', 'Telugu')),
    category TEXT NOT NULL CHECK (category IN ('NPTEL_IIT', 'COACHING_PLAYLIST', 'VISUAL_INTUITION', 'PYQ_MARATHON')),
    youtube_video_id TEXT NOT NULL,
    youtube_playlist_id TEXT,
    duration_sec INTEGER NOT NULL DEFAULT 0,
    start_timestamp_sec INTEGER NOT NULL DEFAULT 0,
    verified_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 7. Visual Concept Studio Configurations (Mafs, Visx, Flow, 2-Host Deep Dives)
CREATE TABLE IF NOT EXISTS visual_studio_configs (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    studio_type TEXT NOT NULL CHECK (studio_type IN (
        'MAFS_2D',
        'VISX_ML_PLOT',
        'REACT_FLOW_GRAPH',
        'TWO_HOST_DEEP_DIVE'
    )),
    config_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 8. Authentic Full-Length and Sectional Mock Papers
CREATE TABLE IF NOT EXISTS mock_papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    paper_type TEXT NOT NULL CHECK (paper_type IN ('FULL_LENGTH_65Q', 'SECTIONAL_DRILL', 'PYQ_OFFICIAL')),
    duration_minutes INTEGER NOT NULL DEFAULT 180,
    total_marks REAL NOT NULL DEFAULT 100.0,
    total_questions INTEGER NOT NULL DEFAULT 65,
    general_aptitude_count INTEGER NOT NULL DEFAULT 10,
    technical_da_count INTEGER NOT NULL DEFAULT 55,
    instructions_markdown TEXT NOT NULL,
    paper_meta_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 9. Mock Paper Questions Mapping
CREATE TABLE IF NOT EXISTS mock_paper_questions (
    mock_paper_id TEXT NOT NULL REFERENCES mock_papers(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    section_category TEXT NOT NULL CHECK (section_category IN ('GENERAL_APTITUDE', 'TECHNICAL_DA')),
    question_number INTEGER NOT NULL,
    PRIMARY KEY (mock_paper_id, question_number)
);

-- 10. Formula Cards for Spaced Repetition Flashcards
CREATE TABLE IF NOT EXISTS formula_cards (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    front_prompt_latex TEXT NOT NULL,
    back_formula_latex TEXT NOT NULL,
    intuition_markdown TEXT NOT NULL,
    tags_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 11. Content Manifest (Tracking Curriculum Version and Checksum)
CREATE TABLE IF NOT EXISTS content_manifest (
    version TEXT PRIMARY KEY,
    schema_version INTEGER NOT NULL,
    published_at TEXT NOT NULL,
    sha256_checksum TEXT NOT NULL,
    total_questions INTEGER NOT NULL,
    total_nodes INTEGER NOT NULL,
    total_lectures INTEGER NOT NULL,
    notes TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_units_section ON units(section_id, order_index);
CREATE INDEX IF NOT EXISTS idx_stepping_nodes_unit ON stepping_nodes(unit_id, order_index);
CREATE INDEX IF NOT EXISTS idx_questions_node ON questions(stepping_node_id);
CREATE INDEX IF NOT EXISTS idx_youtube_unit ON youtube_lectures(unit_id, language);
CREATE INDEX IF NOT EXISTS idx_visual_studio_unit ON visual_studio_configs(unit_id);
CREATE INDEX IF NOT EXISTS idx_formula_cards_unit ON formula_cards(unit_id);
