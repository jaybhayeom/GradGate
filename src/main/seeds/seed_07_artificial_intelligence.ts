// ==============================================================================
// CURRICULUM SEED: SECTION 7 - ARTIFICIAL INTELLIGENCE (DA_07_AI)
// Official GATE Data Science & AI Syllabus Coverage:
//   - Search: Informed (Greedy Best-First, A* Search, Admissibility, Consistency)
//   - Uninformed Search: BFS, DFS, Uniform Cost Search (UCS), Iterative Deepening
//   - Adversarial Search: Minimax Algorithm, Alpha-Beta Pruning, Game Trees
//   - Logic: Propositional Logic, Predicate Logic, Resolution, Inference Rules
//   - Reasoning under Uncertainty: Bayesian Networks, D-Separation, Variable Elimination
// ==============================================================================

import type { Database as DatabaseType } from 'better-sqlite3';

export function seedSectionArtificialIntelligence(db: DatabaseType): void {
  const insertUnit = db.prepare(`
    INSERT OR REPLACE INTO units (id, section_id, title, description, order_index, guidebook_markdown)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertNode = db.prepare(`
    INSERT OR REPLACE INTO stepping_nodes (id, unit_id, title, description, node_type, order_index, total_xp, required_hearts, prerequisite_node_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertQuestion = db.prepare(`
    INSERT OR REPLACE INTO questions (
      id, stepping_node_id, question_type, prompt_latex, marks, negative_marks,
      options_json, correct_answer_json, nat_range_min, nat_range_max, solution_latex,
      pyq_metadata_json, difficulty_level
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLecture = db.prepare(`
    INSERT OR REPLACE INTO youtube_lectures (
      id, topic_id, unit_id, title, channel_name, language, category,
      youtube_video_id, duration_sec, start_timestamp_sec, verified_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  // --- UNIT 1: Informed & Adversarial Search ---
  insertUnit.run(
    'unit_ai_01',
    'DA_07_AI',
    'Informed Search & Game Trees',
    'Heuristic functions, A* search admissibility and consistency, Minimax evaluation, and Alpha-Beta pruning bounds.',
    1,
    '# A* Search & Admissibility\n$f(n) = g(n) + h(n)$ where $g(n)$ is the exact cost from start to node $n$, and $h(n)$ is the heuristic estimate to goal. A heuristic is admissible if $0 \\le h(n) \\le h^*(n)$ (never overestimates). Admissibility guarantees optimality for tree search.'
  );

  insertNode.run(
    'node_ai_01_search',
    'unit_ai_01',
    'A* & Alpha-Beta Pruning',
    'Evaluate node expansions, admissibility conditions, and pruned branches in game trees.',
    'CONCEPT_DRILL',
    1,
    25,
    1,
    null
  );

  // Question 1: MCQ (A* Admissibility)
  insertQuestion.run(
    'q_ai_01_01',
    'node_ai_01_search',
    'MCQ',
    'Let $h_1(n)$ and $h_2(n)$ be two admissible heuristics for a search problem with optimal cost $h^*(n)$. Which of the following heuristics is GUARANTEED to be both admissible and dominant over $h_1$ and $h_2$?',
    1.0,
    -0.3333333333,
    JSON.stringify([
      { id: 'opt_a', label: 'A', textLatex: '$h_3(n) = \\max(h_1(n), h_2(n))$' },
      { id: 'opt_b', label: 'B', textLatex: '$h_3(n) = h_1(n) + h_2(n)$' },
      { id: 'opt_c', label: 'C', textLatex: '$h_3(n) = \\min(h_1(n), h_2(n))$' },
      { id: 'opt_d', label: 'D', textLatex: '$h_3(n) = \\frac{h_1(n) + h_2(n)}{2}$' }
    ]),
    JSON.stringify('opt_a'),
    null,
    null,
    'Because both $h_1(n) \\le h^*(n)$ and $h_2(n) \\le h^*(n)$, their maximum $\\max(h_1(n), h_2(n)) \\le h^*(n)$ is guaranteed to be admissible. Furthermore, since $\\max(h_1, h_2) \\ge h_1$ and $\\ge h_2$, it dominates both heuristics, expanding fewer or equal number of nodes in A* search.',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 13 }),
    'EASY'
  );

  // Question 2: MSQ (Alpha-Beta Pruning Properties)
  insertQuestion.run(
    'q_ai_01_02',
    'node_ai_01_search',
    'MSQ',
    'Which of the following statements regarding the Minimax algorithm with Alpha-Beta pruning is/are TRUE?',
    2.0,
    0.0,
    JSON.stringify([
      { id: 'opt_1', label: 'A', textLatex: 'Alpha-Beta pruning never alters the optimal move returned by Minimax.' },
      { id: 'opt_2', label: 'B', textLatex: 'In the best case with optimal move ordering, the time complexity is reduced from $O(b^d)$ to $O(b^{d/2})$.' },
      { id: 'opt_3', label: 'C', textLatex: '$\\alpha$ represents the minimum score that the minimizing player is assured of.' },
      { id: 'opt_4', label: 'D', textLatex: 'A branch is pruned when $\\alpha \\ge \\beta$.' }
    ]),
    JSON.stringify(['opt_1', 'opt_2', 'opt_4']),
    null,
    null,
    'Analysis of Alpha-Beta pruning:\n- A is True: Pruning only cuts off branches that cannot possibly affect the final root value.\n- B is True: With perfect move ordering, effective branching factor becomes $\\sqrt{b}$, cutting depth in half ($O(b^{d/2})$).\n- C is False: $\\alpha$ is the best (highest) value found so far for the maximizing player.\n- D is True: Pruning occurs whenever $\\alpha \\ge \\beta$.',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 29 }),
    'MEDIUM'
  );

  // --- UNIT 2: Bayesian Networks & D-Separation ---
  insertUnit.run(
    'unit_ai_02',
    'DA_07_AI',
    'Bayesian Networks & Uncertainty',
    'Conditional independence in DAGs, Markov blankets, d-separation, and exact inference by variable elimination.',
    2,
    '# D-Separation in Directed Graphical Models\nThree standard 3-node structures:\n1. Causal Chain ($X \\to Z \\to Y$): Blocked when $Z$ is observed.\n2. Common Cause ($X \\leftarrow Z \\to Y$): Blocked when $Z$ is observed.\n3. Common Effect / Collider ($X \\to Z \\leftarrow Y$): Blocked when $Z$ and its descendants are NOT observed.'
  );

  insertNode.run(
    'node_ai_02_bayes_net',
    'unit_ai_02',
    'Bayesian Networks & D-Separation Checkpoint',
    'Determine conditional independence relations in multi-node Bayesian networks.',
    'PYQ_CHECKPOINT',
    1,
    25,
    1,
    'node_ai_01_search'
  );

  // Question 3: MCQ (Collider / D-Separation)
  insertQuestion.run(
    'q_ai_02_01',
    'node_ai_02_bayes_net',
    'MCQ',
    'In a Bayesian network with structure $A \\to C \\leftarrow B$ (where $C$ is a collider), which of the following conditional independence statements is TRUE?',
    2.0,
    -0.6666666667,
    JSON.stringify([
      { id: 'opt_a', label: 'A', textLatex: '$A \\perp B$' },
      { id: 'opt_b', label: 'B', textLatex: '$A \\perp B \\mid C$' },
      { id: 'opt_c', label: 'C', textLatex: '$A$ and $B$ become independent only when $C$ is observed' },
      { id: 'opt_d', label: 'D', textLatex: '$P(A, B) = P(A \\mid C) P(B \\mid C)$' }
    ]),
    JSON.stringify('opt_a'),
    null,
    null,
    'In a v-structure (collider) $A \\to C \\leftarrow B$, $A$ and $B$ are marginally independent ($A \\perp B$) when $C$ is unobserved. Conditioned on $C$ (or any descendant of $C$), $A$ and $B$ become dependent (explaining away effect). Hence, $A \\perp B$ is True.',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 39 }),
    'MEDIUM'
  );

  // YouTube Lecture
  insertLecture.run(
    'lec_ai_01',
    'DA_07_AI',
    'unit_ai_01',
    'Lec-20: A* algorithm in AI (artificial intelligence) in HINDI | A* algorithm with example',
    'Gate Smashers',
    'Hinglish',
    'COACHING_PLAYLIST',
    'tvAh0JZF2YE',
    900,
    0
  );
}
