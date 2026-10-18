// ==============================================================================
// CURRICULUM SEED: SECTION 8 - GENERAL APTITUDE (DA_08_GEN_APT)
// Official GATE Data Science & AI Syllabus Coverage:
//   - Verbal Aptitude (Basic English grammar, vocabulary, reading comprehension)
//   - Quantitative Aptitude (Data interpretation, percentages, ratios, powers, logarithms)
//   - Analytical Aptitude (Logic deduction, induction, number relations, syllogisms)
//   - Spatial Aptitude (Transformations, rotation, mirroring, folding, 2D/3D patterns)
// ==============================================================================

import type { Database as DatabaseType } from 'better-sqlite3';

export function seedSectionGeneralAptitude(db: DatabaseType): void {
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

  // --- UNIT 1: Quantitative & Analytical Reasoning ---
  insertUnit.run(
    'unit_apt_01',
    'DA_08_GEN_APT',
    'Quantitative & Analytical Reasoning',
    'Arithmetic logic, percentages, ratios, permutations, syllogisms, and sequence deduction.',
    1,
    '# General Aptitude: 15 Marks Strategy\nQuestions 1–5 carry 1 mark each (-0.33 deduction for wrong MCQ), while Questions 6–10 carry 2 marks each (-0.67 deduction). Scoring 12+ marks in GA is crucial for securing a top 100 AIR in GATE DA.'
  );

  insertNode.run(
    'node_apt_01_quant',
    'unit_apt_01',
    'Quantitative Aptitude Drills',
    'Master ratio proportions, clock angles, speed-distance-time, and logarithmic relations.',
    'CONCEPT_DRILL',
    1,
    20,
    1,
    null
  );

  // Question 1: MCQ (Ratios & Percentages)
  insertQuestion.run(
    'q_apt_01_01',
    'node_apt_01_quant',
    'MCQ',
    'If the price of a cloud computing instance is increased by $25\\%$, by what percentage must an engineer reduce the instance runtime so that the total monthly expenditure remains unchanged?',
    1.0,
    -0.3333333333,
    JSON.stringify([
      { id: 'opt_a', label: 'A', textLatex: '20\\%' },
      { id: 'opt_b', label: 'B', textLatex: '25\\%' },
      { id: 'opt_c', label: 'C', textLatex: '16.67\\%' },
      { id: 'opt_d', label: 'D', textLatex: '33.33\\%' }
    ]),
    JSON.stringify('opt_a'),
    null,
    null,
    'Let initial price be $P$ and runtime be $T$. Total cost is $E = P \\times T$.\nNew price $P\' = 1.25 P = \\frac{5}{4} P$.\nTo keep expenditure constant:\n$$P\' \\times T\' = P \\times T \\implies \\frac{5}{4} P \\times T\' = P \\times T \\implies T\' = \\frac{4}{5} T = 0.8 T.$$\nTherefore, runtime reduction is $(1 - 0.8) \\times 100\\% = 20\\%$.',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 1 }),
    'EASY'
  );

  // Question 2: NAT (Quantitative Logic)
  insertQuestion.run(
    'q_apt_01_02',
    'node_apt_01_quant',
    'NAT',
    'A train running at $72\\text{ km/h}$ takes $25\\text{ seconds}$ to completely pass through a tunnel of length $320\\text{ meters}$. Find the length of the train in meters.',
    1.0,
    0.0,
    null,
    '180',
    180,
    180,
    'First convert speed to $\\text{m/s}$:\n$$\\text{Speed} = 72 \\times \\frac{5}{18} = 20\\text{ m/s}$$\nTotal distance covered in $25\\text{ seconds}$:\n$$\\text{Distance} = 20 \\times 25 = 500\\text{ meters}$$\nSince $\\text{Distance} = \\text{Length of train} + \\text{Length of tunnel}$:\n$$\\text{Length of train} = 500 - 320 = 180\\text{ meters}.$$',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 2 }),
    'EASY'
  );

  // --- UNIT 2: Spatial & Verbal Aptitude ---
  insertUnit.run(
    'unit_apt_02',
    'DA_08_GEN_APT',
    'Spatial & Verbal Reasoning',
    '2D/3D geometric transformations, paper folding, mirror reflections, vocabulary, and grammar.',
    2,
    '# Spatial Aptitude in GATE\nSpatial reasoning questions evaluate your ability to rotate 2D projections in 3D space, identify mirroring symmetries, and count isometric faces.'
  );

  insertNode.run(
    'node_apt_02_spatial',
    'unit_apt_02',
    'Spatial & Verbal PYQ Checkpoint',
    'Solve spatial folding, rotation problems, and precise grammar sentence corrections.',
    'PYQ_CHECKPOINT',
    1,
    25,
    1,
    'node_apt_01_quant'
  );

  // Question 3: MCQ (Grammar & Sentence Correction)
  insertQuestion.run(
    'q_apt_02_01',
    'node_apt_02_spatial',
    'MCQ',
    'Choose the grammatically CORRECT sentence among the four options:',
    1.0,
    -0.3333333333,
    JSON.stringify([
      { id: 'opt_a', label: 'A', textLatex: 'Neither the principal nor the teachers was present at the conference.' },
      { id: 'opt_b', label: 'B', textLatex: 'Neither the principal nor the teachers were present at the conference.' },
      { id: 'opt_c', label: 'C', textLatex: 'Neither the principal nor the teachers is present at the conference.' },
      { id: 'opt_d', label: 'D', textLatex: 'Neither the principal or the teachers were present at the conference.' }
    ]),
    JSON.stringify('opt_b'),
    null,
    null,
    'According to the Rule of Proximity for correlative conjunctions like "neither... nor", the verb agrees with the subject closest to it. Here, the closer subject is plural ("the teachers"), so the plural verb "were" is grammatically correct.',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 4 }),
    'EASY'
  );

  // Question 4: MCQ (Spatial Rotation)
  insertQuestion.run(
    'q_apt_02_02',
    'node_apt_02_spatial',
    'MCQ',
    'A solid cube has its $6$ faces painted with distinct colors: Red, Blue, Green, Yellow, White, and Orange. The Red face is opposite to the Blue face, and the Green face is opposite to the White face. Which of the following faces CANNOT be adjacent to the Yellow face?',
    2.0,
    -0.6666666667,
    JSON.stringify([
      { id: 'opt_a', label: 'A', textLatex: 'Orange' },
      { id: 'opt_b', label: 'B', textLatex: 'Red' },
      { id: 'opt_c', label: 'C', textLatex: 'Blue' },
      { id: 'opt_d', label: 'D', textLatex: 'Green' }
    ]),
    JSON.stringify('opt_a'),
    null,
    null,
    'Since Red is opposite to Blue, and Green is opposite to White, the remaining two faces must be opposite to each other. Hence, Yellow is opposite to Orange. Two opposite faces can never be adjacent, so Orange cannot be adjacent to Yellow.',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 7 }),
    'MEDIUM'
  );

  // YouTube Lecture
  insertLecture.run(
    'lec_apt_01',
    'DA_08_GEN_APT',
    'unit_apt_01',
    'Lec-1: Fundamental Principle Of Counting (Basic Permutation) | Probability and Statistics',
    'Gate Smashers',
    'Hinglish',
    'COACHING_PLAYLIST',
    'Q_u3Lt5AV3c',
    840,
    0
  );
}
