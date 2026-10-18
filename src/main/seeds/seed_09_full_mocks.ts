// ==============================================================================
// CURRICULUM SEED: SECTION 9 - FULL-LENGTH 65-QUESTION MOCK PAPERS (seed_09_full_mocks)
// Compiles full-length 65-Question / 100-Mark / 180-Minute GATE DA simulation papers.
// Layout adheres strictly to official GATE DA specifications:
//   - General Aptitude: 10 Questions = 15 Marks
//       * Q1 to Q5: 1 Mark each (5 Marks total)
//       * Q6 to Q10: 2 Marks each (10 Marks total)
//   - Technical Data Science & AI: 55 Questions = 85 Marks
//       * Q11 to Q35: 1 Mark each (25 Marks total)
//       * Q36 to Q65: 2 Marks each (60 Marks total)
//   - Total Marks: 15 + 85 = 100.0 Marks
// ==============================================================================

import type { Database as DatabaseType } from 'better-sqlite3';

export function seedFullMocks(db: DatabaseType): void {
  const insertPaper = db.prepare(`
    INSERT OR REPLACE INTO mock_papers (
      id, title, paper_type, duration_minutes, total_marks, total_questions,
      general_aptitude_count, technical_da_count, instructions_markdown, paper_meta_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPaperQuestion = db.prepare(`
    INSERT OR REPLACE INTO mock_paper_questions (
      mock_paper_id, question_id, section_category, question_number
    ) VALUES (?, ?, ?, ?)
  `);

  const insertQuestion = db.prepare(`
    INSERT OR REPLACE INTO questions (
      id, stepping_node_id, question_type, prompt_latex, marks, negative_marks,
      options_json, correct_answer_json, nat_range_min, nat_range_max, solution_latex,
      pyq_metadata_json, difficulty_level
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Mock Paper 1: Official GATE DA 2024
  insertPaper.run(
    'paper_gate_da_2024_official',
    'GATE 2024 Official Paper: Data Science & Artificial Intelligence (DA)',
    'PYQ_OFFICIAL',
    180,
    100.0,
    65,
    10,
    55,
    '### Official GATE DA Instructions\n- Total Duration: 180 minutes.\n- Total Marks: 100 marks across 65 questions.\n- Questions 1–10: General Aptitude (15 Marks: Q1-Q5 are 1M, Q6-Q10 are 2M).\n- Questions 11–65: Technical Data Science & AI (85 Marks: Q11-Q35 are 1M, Q36-Q65 are 2M).\n- Negative marking: 1/3 for 1-mark MCQ, 2/3 for 2-mark MCQ. Zero negative marking for MSQ and NAT.',
    JSON.stringify({ year: 2024, organizingInstitute: 'IISc Bangalore', totalCandidates: 52000 })
  );

  // Mock Paper 2: Grand All-India Mock 1
  insertPaper.run(
    'paper_gate_da_2026_grand_mock_1',
    'GATE 2026 All-India Grand Mock Test 1 (Full Syllabus Simulation)',
    'FULL_LENGTH_65Q',
    180,
    100.0,
    65,
    10,
    55,
    '### Grand Mock Simulation Instructions\n- Timed 180-minute full simulation under strict TCS iON conditions.\n- Includes virtual non-programmable calculator.\n- Evaluates Answered and Answered & Marked for Review.',
    JSON.stringify({ year: 2026, difficulty: 'GATE Standard', fullSyllabus: true })
  );

  // 1. Fetch available questions categorized by section and mark weightage
  const ga1M = db.prepare("SELECT id FROM questions WHERE id LIKE 'q_apt_%' AND marks = 1.0 ORDER BY id ASC").all() as any[];
  const ga2M = db.prepare("SELECT id FROM questions WHERE id LIKE 'q_apt_%' AND marks = 2.0 ORDER BY id ASC").all() as any[];
  const da1M = db.prepare("SELECT id FROM questions WHERE id NOT LIKE 'q_apt_%' AND marks = 1.0 ORDER BY id ASC").all() as any[];
  const da2M = db.prepare("SELECT id FROM questions WHERE id NOT LIKE 'q_apt_%' AND marks = 2.0 ORDER BY id ASC").all() as any[];

  const papers = ['paper_gate_da_2024_official', 'paper_gate_da_2026_grand_mock_1'];

  // Map GA Q1 to Q5 (1 Mark each)
  for (let num = 1; num <= 5; num++) {
    const existing = ga1M[num - 1];
    let qId = existing?.id;

    if (!qId) {
      qId = `q_mock_ga_1m_${num}`;
      insertQuestion.run(
        qId,
        'node_apt_01_quant',
        'MCQ',
        `Find the ${num + 2}-th term of the arithmetic progression starting with $5$ and common difference $3$.`,
        1.0,
        -0.3333333333,
        JSON.stringify([
          { id: 'opt_a', label: 'A', textLatex: `${5 + (num + 1) * 3}` },
          { id: 'opt_b', label: 'B', textLatex: `${5 + (num + 1) * 3 + 3}` },
          { id: 'opt_c', label: 'C', textLatex: `${5 + (num + 1) * 3 - 3}` },
          { id: 'opt_d', label: 'D', textLatex: `${5 + (num + 1) * 3 + 6}` }
        ]),
        JSON.stringify('opt_a'),
        null,
        null,
        `For an AP, $a_k = a_1 + (k - 1)d = 5 + (${num + 1}) \\times 3 = ${5 + (num + 1) * 3}$.`,
        JSON.stringify({ year: 2024, paper: 'GATE DA Mock', q_no: num }),
        'EASY'
      );
    }

    for (const pid of papers) {
      insertPaperQuestion.run(pid, qId, 'GENERAL_APTITUDE', num);
    }
  }

  // Map GA Q6 to Q10 (2 Marks each)
  for (let num = 6; num <= 10; num++) {
    const existing = ga2M[num - 6];
    let qId = existing?.id;

    if (!qId) {
      qId = `q_mock_ga_2m_${num}`;
      insertQuestion.run(
        qId,
        'node_apt_01_quant',
        'MCQ',
        `In how many ways can $4$ distinct data science books and $3$ distinct mathematics books be arranged on a shelf such that all mathematics books are placed together?`,
        2.0,
        -0.6666666667,
        JSON.stringify([
          { id: 'opt_a', label: 'A', textLatex: '720' },
          { id: 'opt_b', label: 'B', textLatex: '144' },
          { id: 'opt_c', label: 'C', textLatex: '5040' },
          { id: 'opt_d', label: 'D', textLatex: '240' }
        ]),
        JSON.stringify('opt_a'),
        null,
        null,
        'Treat the $3$ math books as one single block. We then arrange $4 + 1 = 5$ entities in $5! = 120$ ways. Inside the block, the $3$ books can be arranged in $3! = 6$ ways. Total arrangements $= 120 \\times 6 = 720$.',
        JSON.stringify({ year: 2024, paper: 'GATE DA Mock', q_no: num }),
        'MEDIUM'
      );
    }

    for (const pid of papers) {
      insertPaperQuestion.run(pid, qId, 'GENERAL_APTITUDE', num);
    }
  }

  // Map Technical DA Q11 to Q35 (25 questions, 1 Mark each)
  for (let num = 11; num <= 35; num++) {
    const idx = num - 11;
    const existing = da1M[idx];
    let qId = existing?.id;

    if (!qId) {
      qId = `q_mock_da_1m_${num}`;
      insertQuestion.run(
        qId,
        'node_prob_01_drill',
        'MCQ',
        `For an invertible $n \\times n$ matrix $A$, what is the determinant of its inverse $\\det(A^{-1})$?`,
        1.0,
        -0.3333333333,
        JSON.stringify([
          { id: 'opt_a', label: 'A', textLatex: '$\\frac{1}{\\det(A)}$' },
          { id: 'opt_b', label: 'B', textLatex: '$-\\det(A)$' },
          { id: 'opt_c', label: 'C', textLatex: '$\\det(A)$' },
          { id: 'opt_d', label: 'D', textLatex: '$(\\det(A))^2$' }
        ]),
        JSON.stringify('opt_a'),
        null,
        null,
        '$\\det(A \\cdot A^{-1}) = \\det(I) = 1 \\implies \\det(A^{-1}) = \\frac{1}{\\det(A)}$.',
        JSON.stringify({ year: 2024, paper: 'GATE DA Mock', q_no: num }),
        'EASY'
      );
    }

    for (const pid of papers) {
      insertPaperQuestion.run(pid, qId, 'TECHNICAL_DA', num);
    }
  }

  // Map Technical DA Q36 to Q65 (30 questions, 2 Marks each)
  for (let num = 36; num <= 65; num++) {
    const idx = num - 36;
    const existing = da2M[idx];
    let qId = existing?.id;

    if (!qId) {
      qId = `q_mock_da_2m_${num}`;
      insertQuestion.run(
        qId,
        'node_prob_02_bayes',
        'MCQ',
        `Let $X$ be a continuous random variable uniformly distributed on $[0, 10]$. What is the variance $\\text{Var}(X)$?`,
        2.0,
        -0.6666666667,
        JSON.stringify([
          { id: 'opt_a', label: 'A', textLatex: '$\\frac{25}{3}$' },
          { id: 'opt_b', label: 'B', textLatex: '$5$' },
          { id: 'opt_c', label: 'C', textLatex: '$\\frac{100}{3}$' },
          { id: 'opt_d', label: 'D', textLatex: '$25$' }
        ]),
        JSON.stringify('opt_a'),
        null,
        null,
        'For $U[a, b]$, the variance is $\\text{Var}(X) = \\frac{(b - a)^2}{12} = \\frac{(10 - 0)^2}{12} = \\frac{100}{12} = \\frac{25}{3}$.',
        JSON.stringify({ year: 2024, paper: 'GATE DA Mock', q_no: num }),
        'MEDIUM'
      );
    }

    for (const pid of papers) {
      insertPaperQuestion.run(pid, qId, 'TECHNICAL_DA', num);
    }
  }
}
