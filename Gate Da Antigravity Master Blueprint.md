# GATE DA (Data Science & AI) Desktop App — Master Google Antigravity Blueprint & Phase-by-Phase Prompt Suite

## 1. Executive Architecture & Senior Engineering Stack

This blueprint defines a production-grade, offline-first desktop application for **GATE Data Science and Artificial Intelligence (DA)** built with **Electron, React 18, TypeScript 5, Tailwind CSS, and Dual SQLite Databases**, engineered specifically for step-by-step execution inside **Google Antigravity IDE** ([antigravity.google](https://www.google.com/search?q=https%3A%2F%2Fantigravity.google%2F)).

| Architectural Layer | Production Technology / Library | Purpose & Anti-Hallucination Guarantee |
| :--- | :--- | :--- |
| **Desktop Shell & IPC** | `Electron 33+` + `electron-vite` + `zod` IPC contracts | Typed preload bridge, native fullscreen exam kiosk mode, OS `userData` storage isolation |
| **UI System & Tactile Physics** | `React 18` + `Tailwind CSS` + `Framer Motion` + `GSAP` | Duolingo-grade 3D tactile press buttons, spring-physics Python snake path transitions, zero AI-drawn slop |
| **Iconography & Verified Motion** | `@phosphor-icons/react` + `lucide-react` + `lottie-react` | Industry-standard vector icon systems and verified human-crafted Lottie JSON animations |
| **Math & Visual Teaching Studio** | `Mafs` ([mafs.dev](https://www.google.com/search?q=https%3A%2F%2Fmafs.dev%2F)) + `Visx (D3)` + `@xyflow/react` + `KaTeX` | 3Blue1Brown-style interactive coordinate/matrix canvases, ML contour plots, NotebookLM-style interactive mind maps |
| **Offline Code & SQL Sandboxes** | `Pyodide` (WebAssembly Python/NumPy) + `sql.js` in Web Workers | 100% self-contained Python & SQL execution with a strict 2,000ms Web Worker timeout |
| **Dual SQLite Storage Engine** | `better-sqlite3` (`curriculum.db` + `user_profile.db`) | Separates read-only GitHub-synced syllabus data from read-write user streaks, XP, and mock attempts |
| **GitHub OTA Data Sync Engine** | Native Node `https` / `fetch` + `zlib` + `crypto` (SHA-256) | First-launch full curriculum download from GitHub Releases/Raw + 1-click delta updates |
| **Online Multi-Language Video Hub** | YouTube IFrame Player API (`youtube-nocookie.com`) + oEmbed Verifier | Curated topic-wise lectures in English, Hindi, Hinglish, Tamil, and Telugu with live online/offline detection |

## 2. Step 1 — Create `.antigravity/rules.md` (Global Agent Rules & Anti-Hallucination Contract)

Before running any phase prompt in Google Antigravity, create a file named `.antigravity/rules.md` (and copy it to `GEMINI.md` in your project root). Antigravity reads this file on every turn to enforce senior engineering standards, forbid AI-generated visual slop, and mandate human-in-the-loop clarification.

```markdown
# SYSTEM CONTRACT: GATE DA DESKTOP APPLICATION (SENIOR ENGINEERING RULES)

You are acting as a Principal Desktop Systems Architect and Senior Frontend Engineer building a production GATE Data Science & Artificial Intelligence (DA) preparation desktop app in Electron + React + TypeScript + SQLite.

## 1. ZERO AI-GENERATED VISUAL SLOP OR HALLUCINATIONS
- NEVER generate crude procedural SVG drawings, amateur cartoon illustrations, or fake CSS mascot art.
- ONLY use official vector icons from `@phosphor-icons/react` (Duotone/Fill weights) and `lucide-react`, plus verified human-designed Lottie JSON files placed in `src/renderer/assets/lottie/`.
- If a visual component requires a custom illustration or Lottie file that is not yet in `src/renderer/assets/lottie/`, DO NOT fabricate inline SVG paths to fake it. Create a clean, typed `<AssetSlot id="..." fallbackIcon={...} />` component and immediately ask the user to confirm or provide the preferred Lottie/vector reference.
- NEVER invent fake 11-character YouTube video IDs (e.g., `dQw4w9WgXcQ` or random strings). Every single YouTube lecture URL added to the seed files MUST be verified via `node scripts/verify-youtube-links.mjs` against YouTube's public oEmbed API (`https://www.youtube.com/oembed`).

## 2. HUMAN-IN-THE-LOOP CLARIFICATION & REFERENCE PROTOCOL
Whenever you encounter ANY of the following situations, you MUST pause code generation and ask the user with 2–3 concrete reference options:
1. Visual Layout or Animation Ambiguity: Show the user the exact parameters or reference style (e.g., Duolingo Web path curve vs. Duolingo Mobile compact grid, or specific Mafs coordinate plot behavior) and ask for confirmation.
2. Curated YouTube Lecture Selection: Before finalizing a batch of YouTube playlists for a GATE DA subject, present the researched table of real channels, languages (English, Hindi, Hinglish, Regional), and verified URLs to the user for approval.
3. Schema or Locked-File Conflict: If implementing a feature in Phase N appears to require modifying a file locked in `edition-lock.json` from Phase 1..(N-1), STOP and ask the user for explicit unlock approval.

## 3. EDITION LOCK & NON-REGRESSION ENFORCEMENT
- Before starting any phase, run: `npm run verify:edition`
- If `verify:edition` reports any modified SHA-256 hash in locked files from previous phases, revert the unauthorized change immediately.
- Never leave `// TODO`, `// FIXME`, `placeholder`, `Sample Question 1`, or `Lorem ipsum` anywhere in the codebase or SQLite seed scripts. Run `npm run verify:no-placeholders` before marking any task complete.
- Maintain strict separation between `curriculum.db` (read-only content synced from GitHub) and `user_profile.db` (read-write user progress stored in OS `userData`).
```

## 3. Step 2 — Automated Guardrail Scripts (Edition Lock, Placeholder Scanner & YouTube Verifier)

Place these three scripts inside your `scripts/` folder during Phase 0. They provide hard programmatic guarantees that Antigravity cannot modify prior completed editions or insert hallucinated content.

### 3.1 `scripts/edition-lock.mjs` (Non-Regression Version Lock)

```javascript
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const LOCK_FILE = path.resolve(process.cwd(), 'edition-lock.json');
const mode = process.argv[2]; // 'verify' | 'lock'
const phaseName = process.argv[3] || 'unspecified-phase';
const targetDirs = process.argv.slice(4);

function hashFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function walkDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', 'out', '.git'].includes(entry.name)) {
        walkDir(fullPath, fileList);
      }
    } else if (/\.(ts|tsx|sql|json|css)$/.test(entry.name) && entry.name !== 'edition-lock.json') {
      fileList.push(path.relative(process.cwd(), fullPath));
    }
  }
  return fileList;
}

const lockData = fs.existsSync(LOCK_FILE)
  ? JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'))
  : { edition: 1, lockedPhases: [], files: {} };

if (mode === 'verify') {
  const violations = [];
  for (const [relPath, meta] of Object.entries(lockData.files)) {
    const absPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(absPath)) {
      violations.push(`MISSING LOCKED FILE: ${relPath} (locked in ${meta.phase})`);
    } else {
      const currentHash = hashFile(absPath);
      if (currentHash !== meta.sha256) {
        violations.push(`MODIFIED LOCKED FILE: ${relPath} (locked in ${meta.phase})`);
      }
    }
  }
  if (violations.length > 0) {
    console.error('\n[EDITION-LOCK FAILURE] Unauthorized changes detected in previous phase files:');
    violations.forEach((v) => console.error(`  - ${v}`));
    process.exit(1);
  }
  console.log(`[EDITION-LOCK PASS] All ${Object.keys(lockData.files).length} locked files match last edition checksums.`);
} else if (mode === 'lock') {
  const filesToLock = targetDirs.flatMap((d) => walkDir(path.resolve(process.cwd(), d)));
  for (const relPath of filesToLock) {
    if (!lockData.files[relPath]) {
      lockData.files[relPath] = {
        sha256: hashFile(path.resolve(process.cwd(), relPath)),
        phase: phaseName,
        lockedAt: new Date().toISOString()
      };
    }
  }
  if (!lockData.lockedPhases.includes(phaseName)) {
    lockData.lockedPhases.push(phaseName);
    lockData.edition += 1;
  }
  fs.writeFileSync(LOCK_FILE, JSON.stringify(lockData, null, 2));
  console.log(`[EDITION-LOCK UPDATED] Locked ${filesToLock.length} files for ${phaseName} (Edition v${lockData.edition}).`);
} else {
  console.error('Usage: node scripts/edition-lock.mjs <verify|lock> [phaseName] [dirs...]');
  process.exit(1);
}
```

### 3.2 `scripts/verify-youtube-links.mjs` (Anti-Hallucination YouTube oEmbed Validator)

```javascript
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const REGISTRY_PATH = path.resolve(process.cwd(), 'src/main/seeds/youtube_lectures.json');

async function verifyYouTubeUrl(videoUrl) {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
  const res = await fetch(oembedUrl);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${videoUrl}`);
  }
  return await res.json();
}

async function main() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error(`[YOUTUBE-VERIFY] Missing file: ${REGISTRY_PATH}`);
    process.exit(1);
  }
  const lectures = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  let failed = 0;
  for (const item of lectures) {
    try {
      const meta = await verifyYouTubeUrl(item.youtubeUrl);
      console.log(`[OK] [${item.language}] ${item.topicId} -> "${meta.title}" by ${meta.author_name}`);
    } catch (err) {
      console.error(`[BROKEN/HALLUCINATED YOUTUBE LINK] ${item.topicId}: ${item.youtubeUrl} (${err.message})`);
      failed++;
    }
  }
  if (failed > 0) {
    console.error(`\n[YOUTUBE-VERIFY FAILED] ${failed} invalid or hallucinated YouTube URLs found.`);
    process.exit(1);
  }
  console.log(`\n[YOUTUBE-VERIFY PASS] All ${lectures.length} YouTube lectures verified live.`);
}

main();
```

### 3.3 `scripts/verify-no-placeholders.mjs` (Zero Dummy Content Scanner)

```javascript
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const FORBIDDEN_PATTERNS = [
  /\bTODO\b/,
  /\bFIXME\b/,
  /Sample Question \d+/i,
  /Placeholder explanation/i,
  /Lorem ipsum/i,
  /YOUR_VIDEO_ID_HERE/i,
  /dQw4w9WgXcQ/
];

function scanDir(dir, errors = []) {
  if (!fs.existsSync(dir)) return errors;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', 'dist', 'out', '.git'].includes(entry.name)) {
      scanDir(fullPath, errors);
    } else if (/\.(ts|tsx|sql|json)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const regex of FORBIDDEN_PATTERNS) {
        if (regex.test(content)) {
          errors.push(`${path.relative(process.cwd(), fullPath)} matched forbidden pattern: ${regex}`);
        }
      }
    }
  }
  return errors;
}

const issues = scanDir(path.resolve(process.cwd(), 'src'));
if (issues.length > 0) {
  console.error('[PLACEHOLDER SCAN FAILED]:');
  issues.forEach((i) => console.error(`  - ${i}`));
  process.exit(1);
}
console.log('[PLACEHOLDER SCAN PASS] Zero placeholders or dummy stubs found in src/.');
```

## 4. Dual-Database & GitHub OTA Sync Specification

To ensure first-time download + 100% offline execution + non-destructive in-app updates from GitHub, the application uses two distinct SQLite databases:

| Database File | Location on Disk | Mutability | Tables Included |
| :--- | :--- | :--- | :--- |
| **`curriculum.db`** | `app.getPath('userData')/content/curriculum.db` (downloaded on first launch & updated via GitHub Release/Raw sync) | Read-Only by App UI; Updated atomically by GitHub Sync Manager | `syllabus_sections`, `units`, `stepping_nodes`, `questions`, `micro_drills`, `visual_studio_configs`, `youtube_lectures`, `mock_papers`, `formula_cards`, `content_manifest` |
| **`user_profile.db`** | `app.getPath('userData')/profile/user_profile.db` (never overwritten by GitHub content updates) | Read-Write (SQLite WAL mode with `<50ms` auto-commit) | `user_stats`, `daily_streaks`, `node_progress`, `mistakes_vault`, `srs_flashcards`, `mock_attempts`, `mock_question_responses`, `lecture_watch_history`, `lecture_notes`, `gem_transactions`, `adaptive_daily_targets` |

## 5. Master Phase-by-Phase Prompts for Google Antigravity

Copy and paste **one phase at a time** into Google Antigravity. Wait for Antigravity to pass all verification scripts and lock the phase before pasting the next phase prompt.

### Phase 0 Prompt: Repository Scaffolding, Dual-SQLite Engine & GitHub First-Run Sync Manager

```text
@rules.md Execute PHASE 0: Project Architecture, Dual-SQLite Storage & GitHub OTA Sync Engine.

1. OBJECTIVE:
Initialize the Electron + React 18 + TypeScript 5 + Tailwind CSS project (`electron-vite`) with strict process isolation, Dual SQLite Databases (`curriculum.db` and `user_profile.db` via `better-sqlite3`), and the GitHub Repository First-Time Bootstrap & One-Click Delta Update Manager.

2. EXACT IMPLEMENTATION REQUIREMENTS:
- Create `scripts/edition-lock.mjs`, `scripts/verify-no-placeholders.mjs`, and `scripts/verify-youtube-links.mjs` and register `verify:edition`, `verify:no-placeholders`, and `verify:youtube` in `package.json`.
- In `src/main/db/curriculumSchema.sql`, define the complete read-only curriculum tables:
  * `syllabus_sections` (8 official sections: `DA_01_PROB_STATS`, `DA_02_LIN_ALG`, `DA_03_CALC_OPT`, `DA_04_PROG_DSA`, `DA_05_DBMS_DW`, `DA_06_ML`, `DA_07_AI`, `DA_08_GEN_APT`).
  * `units` and `stepping_nodes` (ordered Duolingo-style path nodes with prerequisites, node type: `CONCEPT_DRILL`, `PYQ_CHECKPOINT`, `VISUAL_STUDIO`, `BOSS_MOCK`).
  * `questions` (supporting `MCQ`, `MSQ`, `NAT`, `TOKEN_BUILD`, `MATCH_PAIRS`, `ALGO_TRACE` with exact marks `1` or `2`, negative marks `0`, `-0.3333333333`, or `-0.6666666667`, NAT `[min_val, max_val]`, step-by-step KaTeX derivation, and Python/SQL sandbox starter code).
  * `youtube_lectures` (`id`, `topic_id`, `title`, `channel_name`, `language` ENUM('English','Hindi','Hinglish','Tamil','Telugu'), `youtube_video_id`, `youtube_playlist_id`, `duration_sec`, `start_timestamp_sec`, `verified_at`).
  * `visual_studio_configs` (JSON config for Mafs 2D math scenes, Visx plots, React Flow mind maps, and 2-host Deep Dive transcript arrays).
- In `src/main/db/userProfileSchema.sql`, define the read-write user tables in WAL mode (`PRAGMA journal_mode = WAL;`):
  * `user_stats` (XP, current streak, longest streak, streak freezes, hearts `0..5`, cram_mode_until, gems, target_exam_date, current_league).
  * `node_progress`, `mistakes_vault`, `srs_flashcards`, `mock_attempts`, `mock_question_responses`, `lecture_watch_history`, `lecture_notes`, and `adaptive_daily_targets`.
- Build `src/main/sync/githubSyncManager.ts`:
  * Checks if `curriculum.db` exists in `app.getPath('userData')/content/`.
  * On first launch, downloads `manifest.json` and `curriculum.db.gz` from the configured GitHub repository URL (with a local bundled fallback seed so development/offline testing works immediately), verifies SHA-256 checksum, decompresses atomically, and emits download progress % over IPC.
  * Provides `checkForCurriculumUpdates()` and `applyCurriculumUpdate()` for 1-click in-app updating without touching `user_profile.db`.

3. HUMAN-IN-THE-LOOP CHECK:
If you need the user's specific GitHub repository owner/name URL or want to use a configurable default with local fallback, ask the user clearly before hardcoding.

4. VERIFICATION & LOCK:
- Write and run Vitest unit tests in `tests/phase0-db-sync.test.ts` verifying WAL mode, foreign keys, and atomic GitHub update swap without losing `user_profile.db` records.
- Run `npm run verify:no-placeholders` and lock Phase 0 via:
  `node scripts/edition-lock.mjs lock phase-0 src/main/db src/main/sync src/shared`
```

### Phase 1 Prompt: Professional Duolingo UI System, Tactile 3D Components & Web Audio Synthesizer

```text
@rules.md Execute PHASE 1: Senior Design System, Tactile 3D UI Primitives & Web Audio API Sound Engine.

1. PRE-FLIGHT CHECK:
Run `npm run verify:edition` to confirm Phase 0 files are untouched.

2. OBJECTIVE:
Build the complete Duolingo-inspired Design System adapted for a professional Python/Data Science desktop aesthetic. Zero amateur AI-generated drawings—use `@phosphor-icons/react`, `lucide-react`, `Framer Motion` spring physics, and verified Lottie animation slots.

3. EXACT IMPLEMENTATION REQUIREMENTS:
- **Theme Tokens (`src/renderer/styles/themes.ts`):**
  * `Python Emerald` (Default Duolingo-style crisp light mode with `#58CC02` primary action, `#46A302` 3D lip border, `#1CB0F6` electric blue, `#FFC800` gold scale accent, `#FF4B4B` error coral).
  * `Dark OLED Matrix`, `Cyberpunk AI`, and `Retro Terminal` (unlockable via Gem Shop).
- **Tactile 3D Primitives (`src/renderer/components/ui/`):**
  * `DuoButton.tsx`: 3D raised button (`border-b-4 active:border-b-0 active:translate-y-[4px] transition-all duration-75`) in 6 variants (`primary`, `secondary`, `danger`, `gold`, `locked`, `ghost`) with keyboard shortcut badge (`[1]`, `[Enter]`).
  * `SnakeProgressBar.tsx`: Animated progress bar with glossy top highlight, sinusoidal wave fill edge, and combo streak pulse when answering 3+ in a row.
  * `FeedbackDrawer.tsx`: Bottom slide-up feedback sheet (Green celebratory state with XP/Combo badge vs. Red diagnostic state with collapsible step-by-step KaTeX derivation and "Add to Mistakes Vault" toggle).
  * `TopStatHud.tsx`: Persistent header bar showing Subject Selector, Streak Flame counter, Gems count, Hearts meter (`5/5` or `∞ Cram Mode`), and Online/Offline GitHub Sync status pill.
  * `FramelessTitleBar.tsx`: Native custom Electron window bar with keyboard shortcut cheat-sheet trigger (`Ctrl+?`).
- **Programmatic Web Audio Synthesizer (`src/renderer/audio/soundEngine.ts`):**
  * Pure Web Audio API polyphonic synthesizer (zero external `.mp3` dependencies that can fail to load):
    - `playClick()` (crisp mechanical pop)
    - `playCorrect()` (Duolingo-style major third rising chime: `C5 -> E5`)
    - `playWrong()` (low muted sawtooth interval: `F3 -> E3`)
    - `playCombo()` (harmonic arpeggio scaling with streak count)
    - `playLevelComplete()` (full brass/bell victory fanfare)

4. VERIFICATION & LOCK:
- Create an interactive `/design-system` preview route and run component tests (`tests/phase1-ui.test.tsx`).
- Run `npm run verify:edition` and `npm run verify:no-placeholders`.
- Lock Phase 1: `node scripts/edition-lock.mjs lock phase-1 src/renderer/components/ui src/renderer/audio src/renderer/styles`
```

### Phase 2 Prompt: Winding Snake Learning Path, Gamification Engine & Adaptive Daily Target Planner

```text
@rules.md Execute PHASE 2: Winding Snake Learning Path, Gamification Engine & Adaptive Daily Target Planner.

1. PRE-FLIGHT CHECK:
Run `npm run verify:edition` to confirm Phase 0 and Phase 1 files are unmodified.

2. OBJECTIVE:
Build the main Duolingo-style scrollable Winding Path (`QuestMapView.tsx`), the Hearts/Mistakes/Leagues gamification engine, and the **Adaptive Daily Target Engine** that dynamically recalculates daily study quests based on the user's GATE exam countdown and topic accuracy.

3. EXACT IMPLEMENTATION REQUIREMENTS:
- **Winding Snake Path (`src/renderer/features/path/QuestMapView.tsx`):**
  * Render each GATE DA Subject split into Units. Each Unit displays a bold sticky header banner with a **"Unit Guidebook & Visual Studio"** button and **"Video Lectures"** button.
  * Stepping-stone circular 3D nodes arranged along a mathematically smooth sinusoidal cubic-bezier SVG path (`x = center + amplitude * Math.sin(index * freq)`), with an animated glowing trail connecting completed nodes.
  * Node states: `LOCKED`, `ACTIVE_CURRENT` (with bouncing "START" tooltip), `COMPLETED_GOLD`, and `BOSS_CHECKPOINT`.
- **Adaptive Daily Target Engine (`src/main/services/adaptiveTargetEngine.ts`):**
  * Calculates days remaining until the user's target GATE DA exam date (defaulting to first/second weekend of February).
  * Computes a weighted priority score for every topic using:
    `Priority = (Official_GATE_Weightage * 0.4) + ((1 - Topic_Accuracy) * 0.35) + (Spaced_Repetition_Decay * 0.25)`
  * Generates 4 dynamic Daily Quests every morning (e.g., *"Complete 2 Linear Algebra Nodes"*, *"Repair 5 Mistakes in Probability"*, *"Score 80%+ on a 15-min ML Blitz"*, *"Review 10 SRS Formula Cards"*).
- **Hearts, Leagues & Gem Shop (`src/renderer/features/gamification/`):**
  * `MistakeRepairModal.tsx`: Triggered when Hearts hit `0/5`—generates a 5-question drill pulled strictly from the user's `mistakes_vault` table to restore hearts.
  * `LeagueLeaderboardView.tsx`: 30-slot leaderboard across Bronze, Silver, Gold, Obsidian, and Diamond tiers with realistic offline simulated IIT/IISc aspirants whose XP advances deterministically each day, plus an optional Supabase cloud sync hook when online.
  * `GemShopView.tsx`: Spend Gems on Streak Freezes, 15-min 2x XP Boosts, Super Cram Mode (24h Infinite Hearts), and UI Themes.

4. VERIFICATION & LOCK:
- Write unit tests for `adaptiveTargetEngine.ts` covering exam countdown edge cases (90 days, 30 days, 7 days out) and heart deduction/refill transactions.
- Run `npm run verify:edition` and `npm run verify:no-placeholders`, then lock Phase 2:
  `node scripts/edition-lock.mjs lock phase-2 src/main/services/adaptiveTargetEngine.ts src/renderer/features/path src/renderer/features/gamification`
```

### Phase 3 Prompt: Interactive Technical Micro-Drills, Offline Python/SQL Runners & Scratchpad Overlay

```text
@rules.md Execute PHASE 3: Interactive Lesson Runner, Technical Micro-Drills, WebAssembly Python/SQL Sandboxes & Scratchpad.

1. PRE-FLIGHT CHECK:
Run `npm run verify:edition` before writing any code.

2. OBJECTIVE:
Build the Duolingo Lesson Runner supporting all 6 technical exercise formats, an isolated Web Worker execution engine for Python (`Pyodide`) and SQL (`sql.js`), and the transparent on-screen math scratchpad (`Ctrl+D`).

3. EXACT IMPLEMENTATION REQUIREMENTS:
- **6 Specialized Exercise Renderers (`src/renderer/features/lesson/exercises/`):**
  1. `McqExercise.tsx`: Single choice (`1..4` hotkeys) with instant option elimination (right-click to strike out wrong options).
  2. `MsqExercise.tsx`: Multi-select checkboxes enforcing official GATE zero-partial-credit grading.
  3. `NatKeypadExercise.tsx`: Virtual numeric keypad (`0-9`, `.`, `-`, `Backspace`, `Clear`) graded against `[min_val, max_val]`.
  4. `TokenBuilderExercise.tsx`: Duolingo-style tap-to-assemble token bank for constructing Python algorithms, SQL queries, or mathematical derivations in exact syntactic order.
  5. `MatchMadnessExercise.tsx`: Two-column timed matching (e.g., pairing Probability Distributions with their Mean/Variance in KaTeX, or Sorting Algorithms with Time/Space Complexity) with combo multiplier animations.
  6. `AlgoTracerExercise.tsx`: Interactive step-through graph/tree node clicker (using `@xyflow/react`) where the student clicks the exact node sequence visited by BFS, DFS, Dijkstra, A*, or Minimax Alpha-Beta pruning.
- **Error Boundary & Isolated Web Worker Sandbox (`src/renderer/workers/codeSandbox.worker.ts`):**
  * Wrap every exercise renderer in `<ExerciseErrorBoundary>` so malformed JSON or LaTeX never crashes the app.
  * Execute interactive Python code and SQL queries inside a dedicated Web Worker with a hard `2000ms` timeout (terminating and respawning the worker if a student writes `while True: pass`).
- **Transparent Math Scratchpad Overlay (`src/renderer/components/tools/ScratchpadOverlay.tsx`):**
  * Toggleable anytime via `Ctrl+D` or header pen button. Supports pressure-sensitive stylus/mouse drawing, grid background toggle, multi-color pen, eraser, undo/redo, and clear canvas.

4. VERIFICATION & LOCK:
- Write Vitest tests for all 6 grading functions (especially MSQ exact-subset matching, NAT floating-point tolerances, and Web Worker infinite-loop termination).
- Run `npm run verify:edition` and `npm run verify:no-placeholders`, then lock Phase 3:
  `node scripts/edition-lock.mjs lock phase-3 src/renderer/features/lesson src/renderer/workers src/renderer/components/tools`
```

### Phase 4 Prompt: NotebookLM Visual Concept Studio & Multi-Language Online YouTube Lecture Hub

```text
@rules.md Execute PHASE 4: NotebookLM-Style Visual Teaching Studio & Online Multi-Language YouTube Lecture Hub.

1. PRE-FLIGHT CHECK:
Run `npm run verify:edition` to verify Phases 0–3 are intact.

2. OBJECTIVE:
Build the professional Visual Concept Studio (powered by `Mafs`, `Visx`, and `@xyflow/react`) and the Online-Aware Multi-Language YouTube Lecture Hub with in-app playback, timestamped notes, and strict oEmbed verification.

3. EXACT IMPLEMENTATION REQUIREMENTS:
- **NotebookLM-Style Visual Concept Studio (`src/renderer/features/studio/`):**
  * **Interactive Math & ML Visualizer (`MafsVisualizer.tsx` & `VisxMlPlot.tsx`):**
    - *Linear Algebra Scene:* Interactive 2x2 transformation matrix where dragging basis vectors $\hat{i}, \hat{j}$ warps the 2D coordinate grid in real time and highlights real Eigenvectors and Eigenvalues $\lambda_1, \lambda_2$, determinant area scaling, and SVD ellipses.
    - *Calculus & Optimization Scene:* Interactive function plot $f(x)$ with draggable point showing tangent line derivative, Taylor polynomial approximation order slider ($n=1..7$), and live Gradient Descent ball rolling down non-convex surfaces with adjustable learning rate $\alpha$.
    - *Probability & Statistics Scene:* Interactive PDF/CDF curves (Normal, Binomial, Poisson, Exponential, Beta) with draggable $z$-score/p-value hypothesis test rejection regions.
    - *Machine Learning Scene:* Interactive 2D dataset where students adjust SVM $C$/RBF $\gamma$, Decision Tree max-depth, $k$-NN neighbors, or K-Means centroids and watch decision boundaries update at 60fps.
  * **Interactive Concept Mind Map (`ConceptMindMap.tsx` via `@xyflow/react`):**
    - Hierarchical expandable node graph showing prerequisite and downstream links for every GATE DA unit. Clicking any concept node opens a side drawer with its formal theorem, intuition, common GATE traps, and linked PYQs.
  * **Synchronized 2-Host "Deep Dive" Audio & Slide Player (`DeepDivePlayer.tsx`):**
    - Plays structured two-host conversational transcripts (Host A: Concept Questioner; Host B: GATE Professor) using offline Web Speech API neural voices (or imported NotebookLM `.wav`/`.mp3` files) synchronized with live animated slide cards and highlighted KaTeX equations.
- **Online Multi-Language YouTube Lecture Hub (`src/renderer/features/lectures/YouTubeLectureHub.tsx`):**
  * Real-time connectivity detector (`navigator.onLine` + periodic lightweight heartbeat).
  * Filter bar by **Comfortable Language** (`All`, `English`, `Hindi`, `Hinglish`, `Tamil`, `Telugu`) and **Source Category** (`NPTEL / IIT Official`, `GATE Coaching Playlist`, `Visual Intuition`, `PYQ Marathon`).
  * **In-App Distraction-Free Player:** When online, embeds `https://www.youtube-nocookie.com/embed/{videoId}?rel=0&modestbranding=1&start={startSec}` inside a clean dark theater frame with custom chapter jump buttons, timestamped Markdown + KaTeX note-taking (`Click to insert current timestamp [14:22]`), and "+25 XP on Lecture Completion".
  * **Offline Fallback State:** When offline, replaces the video iframe with a clean card showing the lecture syllabus summary, saved timestamp notes, and a "Queued for Online Viewing" bookmark toggle.

4. HUMAN-IN-THE-LOOP CHECK:
Before seeding the YouTube lecture table in Phase 7/8, present the researched list of verified YouTube channels and playlists per subject/language to the user and run `npm run verify:youtube`.

5. VERIFICATION & LOCK:
- Test online/offline state switching and Mafs/Visx interactive parameter updates.
- Run `npm run verify:edition` and `npm run verify:no-placeholders`, then lock Phase 4:
  `node scripts/edition-lock.mjs lock phase-4 src/renderer/features/studio src/renderer/features/lectures`
```

### Phase 5 Prompt: Official TCS iON Exam Arena, Exact GATE Virtual Calculator & Power-Cut Recovery

```text
@rules.md Execute PHASE 5: Authentic TCS iON Mock Exam Arena, Official GATE Scientific Calculator & Instant Crash Recovery.

1. PRE-FLIGHT CHECK:
Run `npm run verify:edition` to verify Phases 0–4 are unmodified.

2. OBJECTIVE:
Build the separate, pixel-accurate **TCS iON GATE Exam Simulation Arena** so students can switch from the daily Duolingo path into the exact sterile testing interface used on GATE exam day.

3. EXACT IMPLEMENTATION REQUIREMENTS:
- **Authentic TCS iON Layout (`src/renderer/features/arena/TcsIonArenaView.tsx`):**
  * Top section tabs (`General Aptitude` [10 Qs, 15 Marks] and `Data Science & AI` [55 Qs, 85 Marks]) with hover summary tooltips showing counts per status.
  * Right-hand collapsible Question Palette with the exact 5 official TCS iON shapes and colors:
    1. `NOT_VISITED` (Grey square border)
    2. `NOT_ANSWERED` (Red inverted shield)
    3. `ANSWERED` (Green shield)
    4. `MARKED_FOR_REVIEW` (Purple circle — NOT evaluated for marks)
    5. `ANSWERED_AND_MARKED` (Purple circle with green check badge — **EVALUATED for marks** per official GATE rules)
  * Bottom action bar matching TCS iON button placement: `Mark for Review & Next`, `Clear Response`, and `Save & Next`, plus `Submit` and `Question Paper` full-list modal.
  * Physical keyboard input disabled inside NAT answer fields (only clicks on the on-screen virtual numeric pad allowed).
- **Exact GATE Virtual Scientific Calculator (`src/renderer/components/tools/GateScientificCalculator.tsx`):**
  * Floating draggable non-programmable calculator matching the official TCS iON web calculator (`Deg`/`Rad` toggle, hyperbolic functions, `sinh`, `cosh`, `tanh`, $\ln$, $\log_{10}$, $\log_y x$, $e^x$, $10^x$, $x^y$, $\sqrt[y]{x}$, $n!$, $|x|$, `Mod`, memory registers `MC`, `MR`, `MS`, `M+`, `M-`, and dual expression/input display boxes).
- **Exam Kiosk Guard & `<50ms` Power-Cut Recovery (`src/main/services/examSessionGuard.ts`):**
  * Enters fullscreen kiosk mode during active mock tests and blocks `Ctrl+R`, `F5`, and `Alt+Left`.
  * Writes every palette state transition, selected option, and per-question time-spent counter to `user_profile.db` immediately so if the PC shuts down mid-exam, reopening the app displays a *"Resume Unfinished Mock Exam at 114:22 Remaining"* banner.

4. VERIFICATION & LOCK:
- Write comprehensive unit tests (`tests/phase5-tcs-arena.test.ts`) verifying the 65-question / 100-mark grading engine, exact `-1/3` and `-2/3` floating-point deductions, `ANSWERED_AND_MARKED` evaluation inclusion, and crash-resume state restoration.
- Run `npm run verify:edition` and `npm run verify:no-placeholders`, then lock Phase 5:
  `node scripts/edition-lock.mjs lock phase-5 src/renderer/features/arena src/main/services/examSessionGuard.ts`
```

### Phase 6 Prompt: GATE Score & AIR Predictor, Speed-vs-Accuracy Matrix & Spaced Repetition Vault

```text
@rules.md Execute PHASE 6: GATE Score (out of 1000) & AIR Rank Predictor, Diagnostic Analytics & Anki SRS Flashcard Vault.

1. PRE-FLIGHT CHECK:
Run `npm run verify:edition` to confirm Phases 0–5 are unmodified.

2. OBJECTIVE:
Build the post-test and career-wide diagnostic analytics dashboard, historical GATE DA Score/Rank estimator, and SM-2 Spaced Repetition Flashcard & Formula Vault.

3. EXACT IMPLEMENTATION REQUIREMENTS:
- **Normalized GATE Score & All India Rank (AIR) Estimator (`src/main/services/rankPredictor.ts`):**
  * Computes raw marks out of 100, qualifying cutoff projections (General, OBC-NCL/EWS, SC/ST/PwD), normalized GATE Score (out of 1000 using official GATE normalization formula parameters), and predicted AIR range (e.g., `75+ Marks -> AIR 1–35`, `65–74 Marks -> AIR 36–150`, `55–64 Marks -> AIR 151–500`) with target IIT/IISc M.Tech & PSU eligibility badges.
- **4-Quadrant Speed vs. Accuracy Matrix & Radar Chart (`src/renderer/features/analytics/AnalyticsDashboard.tsx`):**
  * Classify every syllabus subtopic into 4 actionable quadrants based on average time-per-question vs. accuracy:
    1. *Mastered Zone* (High Accuracy, Fast Time)
    2. *Time-Sink Zone* (High Accuracy, Slow Time — needs shortcut/formula drills)
    3. *Careless Mistake Trap* (Low Accuracy, Fast Time — losing marks to `-0.33`/`-0.66` negative marking)
    4. *Concept Gap* (Low Accuracy, Slow Time — links directly to the topic's NotebookLM Visual Studio & YouTube Lecture)
  * Display Negative Marking Bleed Tracker showing exact marks lost to guesswork vs. marks gained.
- **SM-2 Spaced Repetition Formula & Concept Deck (`src/renderer/features/srs/FlashcardVaultView.tsx`):**
  * Interactive 3D flip cards with KaTeX formulas, `Space` to flip, and `1` (Again), `2` (Hard), `3` (Good), `4` (Easy) scheduling via the SuperMemo SM-2 algorithm.

4. VERIFICATION & LOCK:
- Write unit tests for `rankPredictor.ts` and SM-2 interval calculation (`tests/phase6-analytics-srs.test.ts`).
- Run `npm run verify:edition` and `npm run verify:no-placeholders`, then lock Phase 6:
  `node scripts/edition-lock.mjs lock phase-6 src/main/services/rankPredictor.ts src/renderer/features/analytics src/renderer/features/srs`
```

### Phase 7 Prompt: Pre-Bundled Curriculum Seed Part 1 (Math Core: Sections 1, 2, 3 & General Aptitude)

```text
@rules.md Execute PHASE 7: Complete Curriculum Seed & Verified Multi-Language YouTube Lectures for Mathematics & General Aptitude.

1. PRE-FLIGHT CHECK:
Run `npm run verify:edition` to confirm Phases 0–6 are untouched.

2. OBJECTIVE:
Populate the complete, production-ready curriculum seed scripts (`seed_01_prob_stats.ts`, `seed_02_linear_algebra.ts`, `seed_03_calculus_opt.ts`, `seed_08_general_aptitude.ts`) and verified multi-language YouTube lecture registry entries for the Mathematical Foundations of GATE DA.

3. EXACT SYLLABUS COVERAGE REQUIRED (ZERO PLACEHOLDERS):
- **Section 1: Probability and Statistics (`DA_01_PROB_STATS`):**
  * Counting (permutations & combinations), probability axioms, sample space, independent/mutually exclusive events, marginal/conditional/joint probability, Bayes' Theorem, conditional expectation & variance, mean/median/mode/standard deviation, correlation & covariance, random variables, discrete distributions (Uniform, Bernoulli, Binomial, Poisson), continuous distributions (Uniform, Exponential, Normal, Standard Normal, t-distribution, Chi-squared), cumulative distribution functions, Central Limit Theorem, confidence intervals, z-test, t-test, chi-squared test.
- **Section 2: Linear Algebra (`DA_02_LIN_ALG`):**
  * Vector space, subspaces, linear dependence & independence of vectors, matrices (projection, orthogonal, idempotent, partition matrices and properties), quadratic forms, systems of linear equations & Gaussian elimination, eigenvalues & eigenvectors, determinant, rank, nullity, projections, LU decomposition, Singular Value Decomposition (SVD).
- **Section 3: Calculus and Optimization (`DA_03_CALC_OPT`):**
  * Functions of a single variable, limit, continuity & differentiability, Taylor series, maxima & minima, optimization involving a single variable.
- **Section 8: General Aptitude (`DA_08_GEN_APT`):**
  * Verbal Aptitude, Quantitative Aptitude (data interpretation, ratios, percentages, powers, exponents, logarithms, permutations, geometry, elementary statistics), Analytical Aptitude (deduction, induction, numerical relations), Spatial Aptitude (transformation of shapes: translation, rotation, scaling, mirroring, assembling, paper folding/cutting).
- For every unit, include:
  1. Complete stepping-stone nodes (`CONCEPT_DRILL`, `VISUAL_STUDIO`, `PYQ_CHECKPOINT`).
  2. Authentic GATE DA 2024–2026 Previous Year Questions + GATE CSE/MA overlapping mathematical PYQs with complete step-by-step KaTeX solutions.
  3. Interactive `Mafs`/`Visx` configuration presets and formula flashcards.
  4. Verified multi-language YouTube lecture links (English, Hindi, Hinglish) verified live via `npm run verify:youtube`.

4. HUMAN-IN-THE-LOOP CHECK:
Present the summary table of researched YouTube lecture links for Sections 1, 2, 3, and 8 and run `npm run verify:youtube` to prove 100% live validity.

5. VERIFICATION & LOCK:
- Run `npm run verify:no-placeholders`, `npm run verify:youtube`, and `npm run verify:edition`.
- Lock Phase 7:
  `node scripts/edition-lock.mjs lock phase-7 src/main/seeds/seed_01_prob_stats.ts src/main/seeds/seed_02_linear_algebra.ts src/main/seeds/seed_03_calculus_opt.ts src/main/seeds/seed_08_general_aptitude.ts`
```

### Phase 8 Prompt: Pre-Bundled Curriculum Seed Part 2 (Core CS/AI: Sections 4, 5, 6, 7 & Full-Length Mock Papers)

```text
@rules.md Execute PHASE 8: Complete Curriculum Seed for Programming/DSA, DBMS/Warehousing, Machine Learning, AI & Full-Length 65-Question Mock Papers.

1. PRE-FLIGHT CHECK:
Run `npm run verify:edition` to confirm Phases 0–7 are untouched.

2. OBJECTIVE:
Populate the remaining 4 core technical GATE DA subjects (`seed_04_dsa_python.ts`, `seed_05_dbms_dw.ts`, `seed_06_machine_learning.ts`, `seed_07_artificial_intelligence.ts`) plus full-length 65-question / 100-mark GATE DA Mock Papers (`seed_09_full_mocks.ts`).

3. EXACT SYLLABUS COVERAGE REQUIRED (ZERO PLACEHOLDERS):
- **Section 4: Programming, Data Structures and Algorithms (`DA_04_PROG_DSA`):**
  * Programming in Python, basic data structures (stacks, queues, linked lists, trees, hash tables), search algorithms (linear search, binary search), basic sorting algorithms (selection sort, bubble sort, insertion sort), divide and conquer (mergesort, quicksort), introduction to graph theory, basic graph algorithms (traversals and shortest path).
  * Include interactive Python `Pyodide` code sandboxes and `AlgoTracer` graph/tree exercises.
- **Section 5: Database Management and Warehousing (`DA_05_DBMS_DW`):**
  * ER-model, relational model (relational algebra, tuple calculus, SQL), integrity constraints, normal form (1NF, 2NF, 3NF, BCNF), file organization, indexing (B and B+ trees), data types, data transformation (normalization, discretization, sampling, compression), data warehouse modelling (schema for multidimensional data models: star, snowflake, fact constellation, concept hierarchies, measures: categorization and computations).
  * Include interactive `sql.js` table sandboxes and Token Builder SQL drills.
- **Section 6: Machine Learning (`DA_06_ML`):**
  * Supervised Learning: regression and classification problems, simple linear regression, multiple linear regression, ridge regression, logistic regression, $k$-nearestighbour, naive Bayes classifier, linear discriminant analysis, support vector machine, decision trees, bias-variance trade-off, cross-validation methods (leave-one-out, $k$-fold), multi-layer perceptron, feed-forward neural network.
  * Unsupervised Learning: clustering algorithms ($k$-means, $k$-medoids, hierarchical clustering: top-down, bottom-up, single-linkage, multiple-linkage), dimensionality reduction, Principal Component Analysis (PCA).
- **Section 7: Artificial Intelligence (`DA_07_AI`):**
  * Search: informed (greedy best-first, A*), uninformed (BFS, DFS, UCS, IDS), adversarial (Minimax, Alpha-Beta pruning).
  * Logic: propositional logic, predicate logic.
  * Reasoning under Uncertainty: conditional independence representation, exact inference through variable elimination, approximate inference through sampling (Bayesian Networks).
- **Full-Length GATE DA Mock Papers (`seed_09_full_mocks.ts`):**
  * Compile complete 65-question (10 GA + 55 DA, 100 Marks, 180 Minutes) papers matching exact official GATE DA topic weightage, plus build the compiled `curriculum.db.gz` and `manifest.json` bundle ready for GitHub hosting.

4. VERIFICATION & LOCK:
- Run `npm run verify:no-placeholders`, `npm run verify:youtube`, and `npm run verify:edition`.
- Lock Phase 8:
  `node scripts/edition-lock.mjs lock phase-8 src/main/seeds`
```

### Phase 9 Prompt: GitHub Repository Release Generator, Local Backup Utility & Desktop Packaging

```text
@rules.md Execute PHASE 9: GitHub Release Bundle Generator, User Backup/Restore Utility & Final Desktop Build.

1. PRE-FLIGHT CHECK:
Run `npm run verify:edition` to verify Phases 0–8 match their locked SHA-256 hashes.

2. OBJECTIVE:
Build the automated CLI tool (`scripts/build-github-release-bundle.mjs`) that compiles `curriculum.db` into a versioned GitHub sync package (`curriculum-vX.Y.Z.db.gz` + `manifest.json`), add 1-click User Profile Backup/Restore (`.gateda-backup`), and configure `electron-builder` for Windows (`.exe` NSIS), macOS (`.dmg`), and Linux (`.AppImage`).

3. EXACT IMPLEMENTATION REQUIREMENTS:
- **GitHub Sync Publisher (`scripts/build-github-release-bundle.mjs`):**
  * Compiles all seed files into `curriculum.db`, compresses it with Gzip, computes SHA-256 hashes, and outputs `release-bundle/manifest.json` and `release-bundle/curriculum.db.gz` ready to push to your GitHub data repository.
- **Settings & Data Management (`src/renderer/features/settings/SettingsView.tsx`):**
  * Display current local Curriculum Edition (`v1.0.0`), GitHub Repository Sync URL, **"Check & Download Updates Now"** button, and **"Verify Offline Integrity"** button.
  * Provide 1-click **"Export Progress Backup (`.gateda-backup`)"** and **"Restore Progress Backup"** so students can transfer their streaks, notes, and mock test history across laptops.
  * Optional AI Bridge settings (Gemini API Key / Local Ollama endpoint) for generating custom NotebookLM study guides from user PDFs.

4. FINAL SYSTEM AUDIT:
- Run full test suite (`npm test`), `npm run verify:edition`, `npm run verify:no-placeholders`, and `npm run verify:youtube`.
- Lock Phase 9:
  `node scripts/edition-lock.mjs lock phase-9 src scripts`
```
