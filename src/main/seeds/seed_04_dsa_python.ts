// ==============================================================================
// CURRICULUM SEED: SECTION 4 - PROGRAMMING, DATA STRUCTURES & ALGORITHMS (DA_04_PROG_DSA)
// Official GATE Data Science & AI Syllabus Coverage:
//   - Programming in Python (Syntax, control flow, functions, list comprehensions, recursion)
//   - Data Structures (Stacks, Queues, Linked Lists, Binary Trees, BSTs, Hash Tables)
//   - Algorithms (Linear/Binary Search, Selection/Insertion/Bubble/Merge/Quick Sort)
//   - Graph Algorithms (BFS, DFS, Dijkstra's Shortest Path, Topological Sort)
// ==============================================================================

import type { Database as DatabaseType } from 'better-sqlite3';

export function seedSectionProgDsa(db: DatabaseType): void {
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
      sandbox_starter_code, sandbox_language, pyq_metadata_json, difficulty_level
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLecture = db.prepare(`
    INSERT OR REPLACE INTO youtube_lectures (
      id, topic_id, unit_id, title, channel_name, language, category,
      youtube_video_id, duration_sec, start_timestamp_sec, verified_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  // --- UNIT 1: Python Programming & Recursion ---
  insertUnit.run(
    'unit_dsa_01',
    'DA_04_PROG_DSA',
    'Python Programming & Complexity Analysis',
    'Python data structures, recursion, scope resolution, time and space complexity asymptotic analysis.',
    1,
    '# Python & Big-O Complexity\nPython built-in operations: dict lookup is $O(1)$ average, list append is amortized $O(1)$, list insertion at index 0 is $O(n)$.'
  );

  insertNode.run(
    'node_dsa_01_py',
    'unit_dsa_01',
    'Python Scope & Asymptotics',
    'Analyze Python recursion trees and predict exact output of Python code snippets.',
    'CONCEPT_DRILL',
    1,
    20,
    1,
    null
  );

  // Question 1: MCQ (Python recursion & scope)
  insertQuestion.run(
    'q_dsa_01_01',
    'node_dsa_01_py',
    'MCQ',
    'Consider the following Python code snippet:\n```python\ndef solve(arr, n):\n    if n <= 0:\n        return 0\n    if arr[n-1] % 2 == 0:\n        return arr[n-1] + solve(arr, n-2)\n    return solve(arr, n-1)\n\nvals = [2, 4, 6, 8, 10]\nprint(solve(vals, len(vals)))\n```\nWhat is the printed output?',
    1.0,
    -0.3333333333,
    JSON.stringify([
      { id: 'opt_a', label: 'A', textLatex: '30' },
      { id: 'opt_b', label: 'B', textLatex: '18' },
      { id: 'opt_c', label: 'C', textLatex: '24' },
      { id: 'opt_d', label: 'D', textLatex: '16' }
    ]),
    JSON.stringify('opt_b'),
    null,
    null,
    'Trace execution for `vals = [2, 4, 6, 8, 10]` with `n = 5`:\n- `solve(vals, 5)`: `vals[4] = 10` is even $\\to 10 + \\text{solve}(vals, 3)$\n- `solve(vals, 3)`: `vals[2] = 6` is even $\\to 6 + \\text{solve}(vals, 1)$\n- `solve(vals, 1)`: `vals[0] = 2` is even $\\to 2 + \\text{solve}(vals, -1)$\n- `solve(vals, -1)`: `n <= 0` returns $0$.\n$$\\text{Total} = 10 + 6 + 2 + 0 = 18.$$',
    'def solve(arr, n):\n    if n <= 0:\n        return 0\n    if arr[n-1] % 2 == 0:\n        return arr[n-1] + solve(arr, n-2)\n    return solve(arr, n-1)\n\nvals = [2, 4, 6, 8, 10]\nprint(solve(vals, len(vals)))',
    'PYTHON',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 6 }),
    'EASY'
  );

  // Question 2: NAT (Binary Search Comparisons)
  insertQuestion.run(
    'q_dsa_01_02',
    'node_dsa_01_py',
    'NAT',
    'In a sorted array of $1024$ unique integers, what is the maximum number of key comparisons performed by standard iterative binary search in the worst case?',
    1.0,
    0.0,
    null,
    '11',
    10.5,
    11.5,
    'For binary search on an array of size $n$, the worst-case number of comparisons is $\\lfloor \\log_2(n) \\rfloor + 1$.\nHere $n = 1024 = 2^{10}$.\n$$\\text{Worst case comparisons} = 10 + 1 = 11.$$',
    null,
    null,
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 9 }),
    'EASY'
  );

  // --- UNIT 2: Trees & Graph Algorithms ---
  insertUnit.run(
    'unit_dsa_02',
    'DA_04_PROG_DSA',
    'Trees, Graphs & Shortest Paths',
    'Binary search trees, traversals, BFS, DFS, and Dijkstra\'s single-source shortest path algorithm.',
    2,
    '# Graph Traversal & Dijkstra\n- BFS uses a FIFO Queue (finds shortest paths on unweighted graphs in $O(V + E)$).\n- Dijkstra uses a Min-Heap / Priority Queue (finds shortest paths with non-negative weights in $O((V + E) \\log V)$).'
  );

  insertNode.run(
    'node_dsa_02_graph',
    'unit_dsa_02',
    'Graph Traversals & Dijkstra',
    'Solve problems on BFS traversal orders, queue states, and shortest path updates.',
    'PYQ_CHECKPOINT',
    1,
    25,
    1,
    'node_dsa_01_py'
  );

  // Question 3: MSQ (Graph Properties & Traversals)
  insertQuestion.run(
    'q_dsa_02_01',
    'node_dsa_02_graph',
    'MSQ',
    'Which of the following statements about graph algorithms is/are TRUE?',
    2.0,
    0.0,
    JSON.stringify([
      { id: 'opt_1', label: 'A', textLatex: 'Breadth-First Search (BFS) computes shortest paths in unweighted graphs.' },
      { id: 'opt_2', label: 'B', textLatex: 'Dijkstra\'s algorithm is guaranteed to be correct on graphs with negative edge weights.' },
      { id: 'opt_3', label: 'C', textLatex: 'A topological ordering exists if and only if the directed graph is acyclic (DAG).' },
      { id: 'opt_4', label: 'D', textLatex: 'Depth-First Search (DFS) can detect cycles in a directed graph using back edges.' }
    ]),
    JSON.stringify(['opt_1', 'opt_3', 'opt_4']),
    null,
    null,
    'Analysis of options:\n- A is True: BFS visits level by level, ensuring shortest path in unweighted graphs.\n- B is False: Dijkstra greedy choice fails with negative edge weights (Bellman-Ford is needed).\n- C is True: Topological sort requires a Directed Acyclic Graph (DAG).\n- D is True: In DFS of a directed graph, a cycle exists if and only if a back edge is encountered during traversal.',
    null,
    null,
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 36 }),
    'MEDIUM'
  );

  // YouTube Lecture
  insertLecture.run(
    'lec_dsa_01',
    'DA_04_PROG_DSA',
    'unit_dsa_02',
    'Lec-7: Breadth First Search (BFS) with example | Uninformed Search | Artificial Intelligence',
    'Gate Smashers',
    'Hinglish',
    'COACHING_PLAYLIST',
    'qul0f79gxGs',
    630,
    0
  );
}
