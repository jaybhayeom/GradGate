# 🎓 GradGate — GATE Data Science & AI (DA) Desktop Application

[![Tests](https://img.shields.io/badge/tests-53%20passed%20%2F%2010%20suites-brightgreen.svg)](https://github.com/jaybhayeom/GradGate)
[![Edition Lock](https://img.shields.io/badge/edition--lock-v11%20locked-blue.svg)](https://github.com/jaybhayeom/GradGate)
[![YouTube oEmbed](https://img.shields.io/badge/youtube--oembed-18%2F18%20live-red.svg)](https://github.com/jaybhayeom/GradGate)
[![Electron](https://img.shields.io/badge/Electron-33+-47848F.svg)](https://electronjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)](https://www.typescriptlang.org)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20Dual--DB-003B57.svg)](https://sqlite.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**GradGate** is an authentic, offline-first desktop application designed for serious aspirants preparing for the **GATE Data Science and Artificial Intelligence (DA)** examination. 

Combining the pedagogical engagement of **Duolingo's tactile learning paths**, the visual intuition of **3Blue1Brown/NotebookLM**, and the pixel-accurate fidelity of official **TCS iON Computer-Based Testing (CBT)**, GradGate provides an all-in-one preparation environment engineered for zero-latency desktop performance.

---

## 🌟 Key Architecture & Pillars

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GRADGATE DESKTOP CORE                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│     TCS iON ARENA     │ │  LEARNING & GAMIFIED  │ │  VISUAL & SANDBOXES   │
│  - 65-Q / 100-M CBT   │ │  - Sinusoidal Path    │ │  - Mafs 2D Canvases   │
│  - Sub-50ms WAL Auto  │ │  - Bronze/Gold Nodes  │ │  - Visx ML Contours   │
│  - Virtual Calculator │ │  - Hearts & Streaks   │ │  - WebAssembly Wasm   │
│  - Power-Cut Resilient│ │  - Dynamic Quests     │ │  - 2-Host Deep Dives  │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────────────┐
│        DUAL-SQLITE STORAGE ENGINE     │ │      OTA SYNC & PROFILE BACKUP        │
│  - Read-Only: `curriculum.db`         │ │  - GitHub Release Gzip Sync           │
│  - Read-Write: `user_profile.db` (WAL)│ │  - 1-Click `.gateda-backup` Export    │
│  - Zero Data Bleed Across Updates     │ │  - SHA-256 Cryptographic Verification │
└───────────────────────────────────────┘ └───────────────────────────────────────┘
```

---

## 🚀 Key Feature Modules

### 1. 🏛️ Authentic TCS iON Exam Arena & Virtual Scientific Calculator
- **Pixel-Accurate Interface**: Faithful recreation of the official GATE computer-based test interface with section split (**General Aptitude**: 10 Qs, 15 Marks; **Technical DA**: 55 Qs, 85 Marks).
- **5-State Question Palette**:
  - `NOT_VISITED` (Grey rectangular border)
  - `NOT_ANSWERED` (Red downward-pointing shield)
  - `ANSWERED` (Green upward-pointing shield)
  - `MARKED_FOR_REVIEW` (Purple circle — *Not evaluated*)
  - `ANSWERED_AND_MARKED` (Purple circle with green check badge — *Evaluated per GATE rules*)
- **Power-Cut Resilient Engine**: Sub-50ms atomic state saves with auto-recovery banner.
- **GATE Scientific Calculator**: Floating modal featuring `Deg`/`Rad`, trigonometric, hyperbolic, logarithmic, power, root, factorials ($n!$), and memory registers (`MC`, `MR`, `MS`, `M+`, `M-`).
- **NAT Virtual Keypad**: Physical keyboard disabled in Numerical Answer Type fields to mirror real exam center security and interface behavior.

### 2. 🗺️ Duolingo-Grade Winding Path & Gamification
- **Sinusoidal Stepping Path**: Smooth SVG spline path across syllabus units with interactive stepping nodes (`CONCEPT_DRILL`, `PYQ_CHECKPOINT`, `VISUAL_STUDIO`, `BOSS_MOCK`).
- **Adaptive Daily Target Engine**: Calculates daily review and question volume dynamically based on countdown days to the exam date and topic accuracy.
- **Heart & Streak Economy**: 5 refillable hearts, Mistake Repair Drills, streak freezes, cram mode (infinite hearts), and gem shop transactions.
- **Competitive Leagues**: Bronze, Silver, Gold, Obsidian, and Diamond tier promotions.

### 3. 🧪 6 Interactive Exercise Types & Sandboxes
- **Multiple Choice Questions (MCQ)** with authentic negative marking deductions ($-0.33$ for 1M, $-0.66$ for 2M).
- **Multiple Select Questions (MSQ)** with zero negative marking and exact subset match evaluation.
- **Numerical Answer Type (NAT)** with real-time numeric validation and floating tolerance windows.
- **Token Builder Exercise**: Interactive syntax reconstruction for Python algorithmic blocks and SQL queries.
- **Match Madness**: Fast-paced pair matching drills (theorems, complexities, and distributions).
- **Algo Tracer**: Step-by-step visual graph and array traversal simulations.
- **Isolated Sandboxes**: Web Worker sandboxed execution for Python and SQL with 2,000ms timeout guards.
- **Transparent Scratchpad (`Ctrl+D`)**: In-app digital rough sheet with high-contrast brush tools.

### 4. 🎨 NotebookLM Visual Concept Studio
- **Mafs 2D Canvases**: 3Blue1Brown-style interactive 2D coordinate vector transformations and calculus tangent lines.
- **Visx ML Plotting**: Support Vector Machine margin widths, Ridge regression regularizer curves, and decision boundaries.
- **Interactive Mind Maps**: Conceptual dependency trees powered by `@xyflow/react`.
- **Two-Host Deep Dive Studio**: Audio podcast study script generator simulating conversational breakdown of mathematical derivations.

### 5. 📊 AIR Rank Predictor & 4-Quadrant Diagnostic Analytics
- **Official GATE Normalization Formula**:
  $$S = S_q + (S_t - S_q) \times \frac{M - M_q}{\bar{M}_t - M_q}$$
- **AIR Rank Prediction**: Calculates projected All India Rank brackets and qualifying cutoffs (General, OBC-NCL, SC/ST/PwD).
- **4-Quadrant Diagnostic Matrix**:
  1. *Mastered Zone* (High Accuracy, Fast Time)
  2. *Time-Sink Zone* (High Accuracy, Slow Time — shortcut drills needed)
  3. *Careless Mistake Trap* (Low Accuracy, Fast Time — losing marks to negative penalties)
  4. *Concept Gap* (Low Accuracy, Slow Time — direct routing to Visual Studio & Lectures)
- **Negative Marking Bleed Tracker**: Measures net marks surrendered to guesswork vs. marks gained.

### 6. 🧠 Anki SM-2 Spaced Repetition Formula Deck
- Interactive 3D flip cards rendering KaTeX mathematics.
- Official SuperMemo SM-2 spaced repetition scheduling algorithm.
- Keyboard shortcuts: `Space` to flip, `1` (Again), `2` (Hard), `3` (Good), `4` (Easy).

### 7. 🔄 Dual-SQLite & GitHub OTA Delta Sync Engine
- **`curriculum.db`**: Read-only syllabus database populated with PYQs, questions, configs, and mock papers. Updated atomically via GitHub OTA sync without touching user progress.
- **`user_profile.db`**: Read-write user database operating in SQLite Write-Ahead Logging (`WAL`) mode.
- **Release Bundler**: Compiles and gzips `release-bundle/curriculum-v1.0.0.db.gz` and verifies SHA-256 hashes against `manifest.json`.
- **1-Click Profile Backup**: Export and restore complete user progress in `.gateda-backup` format with cryptographic verification.

---

## 📚 Complete GATE DA Syllabus Coverage

GradGate provides 100% complete syllabus coverage across all 8 official GATE DA sections:

| Code | Section Title | Official Weightage | Core Topics Included |
| :--- | :--- | :---: | :--- |
| **`DA_01`** | **Probability and Statistics** | **15%** | Permutations & Combinations, Axioms, Bayes' Theorem, Conditional Expectation, Random Variables, Distributions (Binomial, Poisson, Normal, t-distribution, Chi-squared), CLT, Hypothesis Testing (z-test, t-test). |
| **`DA_02`** | **Linear Algebra** | **15%** | Vector spaces, subspaces, linear independence, projection matrices, eigenvalues & eigenvectors, determinant, rank, nullity, LU decomposition, Singular Value Decomposition (SVD). |
| **`DA_03`** | **Calculus and Optimization** | **10%** | Single-variable calculus, limits, continuity, differentiability, Taylor series, maxima and minima, gradient descent. |
| **`DA_04`** | **Programming, DSA & Python** | **15%** | Python data structures (lists, dicts, sets, tuples), recursion, linear/binary search, sorting (merge, quick, bubble), stacks, queues, linked lists, trees, graphs (BFS, DFS, Dijkstra). |
| **`DA_05`** | **DBMS and Data Warehousing** | **10%** | ER-model, relational algebra, tuple calculus, SQL, normal forms (1NF, 2NF, 3NF, BCNF), indexing (B and B+ trees), data warehousing schemas (Star, Snowflake). |
| **`DA_06`** | **Machine Learning** | **15%** | Supervised learning (linear regression, ridge, logistic, k-NN, Naive Bayes, LDA, SVM, Decision Trees, MLP), unsupervised learning (k-means, k-medoids, hierarchical clustering, PCA), bias-variance trade-off. |
| **`DA_07`** | **Artificial Intelligence** | **5%** | Informed search (A*, Greedy), uninformed search (BFS, DFS), adversarial search (Minimax, Alpha-Beta pruning), propositional/predicate logic, Bayesian Networks. |
| **`DA_08`** | **General Aptitude** | **15%** | Verbal Aptitude, Quantitative Aptitude (data interpretation, ratios, logarithms), Analytical Aptitude, Spatial Aptitude (paper folding, transformations). |

---

## 🛠️ Verification & Guardrail Suite

GradGate enforces strict automated software engineering guardrails:

```bash
# 1. Run all 10 Vitest test suites (53 tests)
npm test

# 2. Verify zero TODO, FIXME, or dummy placeholder stubs in src/
npm run verify:no-placeholders

# 3. Verify all 18 YouTube lecture links live against YouTube oEmbed API
npm run verify:youtube

# 4. Verify SHA-256 integrity lock across all locked edition files
npm run verify:edition

# 5. Build production Electron + Vite bundles
npm run build

# 6. Generate compiled GitHub release bundle (curriculum.db.gz + manifest.json)
npm run build:bundle
```

---

## 💻 Development & Getting Started

### Prerequisites
- **Node.js**: v20+ or v24+
- **npm**: v10+

### Setup
```bash
# Clone the repository
git clone https://github.com/jaybhayeom/GradGate.git
cd GradGate

# Install dependencies
npm install

# Start development application with Hot Module Replacement
npm run dev

# Run test suite
npm test
```

### Packaging Desktop Installers
Packaging configurations for Windows (`.exe` NSIS), macOS (`.dmg`), and Linux (`.AppImage`) are specified in [`electron-builder.yml`](./electron-builder.yml).

```bash
# Build desktop packages
npm run build
```

---

## 📄 License & Attribution

- **License**: MIT
- **Author**: GradGate Engineering Team ([jaybhayeom/GradGate](https://github.com/jaybhayeom/GradGate))
- **Built for**: Aspirants preparing for GATE Data Science & AI.
