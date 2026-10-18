// ==============================================================================
// CURRICULUM SEED: SECTION 5 - DATABASE MANAGEMENT & WAREHOUSING (DA_05_DBMS_DW)
// Official GATE Data Science & AI Syllabus Coverage:
//   - ER-model, Relational Model, Relational Algebra, Tuple Relational Calculus, SQL
//   - Integrity Constraints, Functional Dependencies, Normal Forms (1NF, 2NF, 3NF, BCNF)
//   - Indexing, B-Trees, B+ Trees, Hashing, File Organization
//   - Data Transformation & Warehousing (Star, Snowflake, Fact Constellation, Measures)
// ==============================================================================

import type { Database as DatabaseType } from 'better-sqlite3';

export function seedSectionDbmsDw(db: DatabaseType): void {
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

  // --- UNIT 1: Relational Algebra & Normalization ---
  insertUnit.run(
    'unit_db_01',
    'DA_05_DBMS_DW',
    'Relational Algebra & Normal Forms',
    'Relational model, functional dependencies, candidate keys, 1NF, 2NF, 3NF, and BCNF decomposition.',
    1,
    '# Normal Forms Summary\n- 1NF: Atomic attribute values.\n- 2NF: 1NF + No partial dependency (non-prime attributes depend on full candidate key).\n- 3NF: 2NF + No transitive dependency ($X \\to A$, either $X$ is superkey or $A$ is prime).\n- BCNF: For every non-trivial $X \\to A$, $X$ must be a superkey.'
  );

  insertNode.run(
    'node_db_01_norm',
    'unit_db_01',
    'Functional Dependencies & Normal Forms',
    'Find candidate keys and identify the highest normal form of a given schema.',
    'CONCEPT_DRILL',
    1,
    25,
    1,
    null
  );

  // Question 1: MCQ (Candidate Keys)
  insertQuestion.run(
    'q_db_01_01',
    'node_db_01_norm',
    'MCQ',
    'Given relation schema $R(A, B, C, D, E)$ with functional dependencies:\n$$F = \\{ AB \\to C, \\; C \\to D, \\; D \\to E, \\; E \\to A \\}$$\nHow many candidate keys does relation $R$ possess?',
    2.0,
    -0.6666666667,
    JSON.stringify([
      { id: 'opt_a', label: 'A', textLatex: '1' },
      { id: 'opt_b', label: 'B', textLatex: '4' },
      { id: 'opt_c', label: 'C', textLatex: '2' },
      { id: 'opt_d', label: 'D', textLatex: '3' }
    ]),
    JSON.stringify('opt_b'),
    null,
    null,
    'Notice that attribute $B$ does not appear on the right side of any dependency, so $B$ must be in every candidate key.\n- Check $(AB)^+$: $AB \\to C \\to D \\to E \\to A$, so $(AB)^+ = \\{A, B, C, D, E\\}$. Thus, $AB$ is a candidate key.\n- Since $E \\to A$, $(EB)^+ = \\{E, B, A, C, D\\} = R$. Thus, $EB$ is a candidate key.\n- Since $D \\to E$, $(DB)^+ = \\{D, B, E, A, C\\} = R$. Thus, $DB$ is a candidate key.\n- Since $C \\to D$, $(CB)^+ = \\{C, B, D, E, A\\} = R$. Thus, $CB$ is a candidate key.\nHence, there are exactly $4$ candidate keys: $\\{AB, EB, DB, CB\\}$.',
    null,
    null,
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 32 }),
    'MEDIUM'
  );

  // Question 2: NAT (B+ Tree Order)
  insertQuestion.run(
    'q_db_01_02',
    'node_db_01_norm',
    'NAT',
    'A B+ tree index is constructed on a disk where block size is $4096\\text{ bytes}$. The search key is $12\\text{ bytes}$ and block pointers are $8\\text{ bytes}$. What is the maximum order $p$ (maximum number of block pointers per internal node) of the B+ tree?',
    2.0,
    0.0,
    null,
    '205',
    204.5,
    205.5,
    'An internal node with $p$ block pointers contains $p - 1$ search keys.\nThe total node size must fit within one disk block:\n$$p \\cdot (\\text{pointer size}) + (p - 1) \\cdot (\\text{key size}) \\le \\text{Block size}$$\n$$8p + 12(p - 1) \\le 4096$$\n$$20p - 12 \\le 4096 \\implies 20p \\le 4108 \\implies p \\le 205.4$$\nSince order must be an integer, the maximum order $p = 205$.',
    null,
    null,
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 48 }),
    'HARD'
  );

  // --- UNIT 2: Data Warehousing & Multidimensional Models ---
  insertUnit.run(
    'unit_db_02',
    'DA_05_DBMS_DW',
    'Data Warehousing & Star Schemas',
    'Multidimensional data models, Star schema, Snowflake schema, Fact constellation, and OLAP operations (Roll-up, Drill-down, Slice, Dice).',
    2,
    '# Data Warehouse Schemas\n- Star Schema: Central fact table connected directly to non-normalized dimension tables.\n- Snowflake Schema: Dimension tables are normalized into sub-dimension tables.\n- Fact Constellation: Multiple fact tables sharing dimension tables.'
  );

  insertNode.run(
    'node_db_02_dw',
    'unit_db_02',
    'Data Warehousing & OLAP Drills',
    'Analyze schemas and distinguish between measure computations in multidimensional warehouses.',
    'PYQ_CHECKPOINT',
    1,
    20,
    1,
    'node_db_01_norm'
  );

  // Question 3: MCQ (Star vs Snowflake)
  insertQuestion.run(
    'q_db_02_01',
    'node_db_02_dw',
    'MCQ',
    'Which of the following is a key distinguishing characteristic of a Snowflake Schema compared to a Star Schema in data warehousing?',
    1.0,
    -0.3333333333,
    JSON.stringify([
      { id: 'opt_a', label: 'A', textLatex: 'The dimension tables in a snowflake schema are completely normalized.' },
      { id: 'opt_b', label: 'B', textLatex: 'A snowflake schema has multiple central fact tables.' },
      { id: 'opt_c', label: 'C', textLatex: 'Query response time in a snowflake schema is always faster due to fewer joins.' },
      { id: 'opt_d', label: 'D', textLatex: 'The fact table in a snowflake schema contains no numeric measures.' }
    ]),
    JSON.stringify('opt_a'),
    null,
    null,
    'In a Star Schema, dimension tables are deliberately denormalized to optimize query performance by reducing joins. In a Snowflake Schema, dimension tables are normalized to remove redundancy, leading to a structure resembling a snowflake.',
    null,
    null,
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 15 }),
    'EASY'
  );

  // YouTube Lecture
  insertLecture.run(
    'lec_db_01',
    'DA_05_DBMS_DW',
    'unit_db_01',
    'Lec-33: All Normal Forms with Real life examples | 1NF 2NF 3NF BCNF 4NF 5NF | All in One',
    'Gate Smashers',
    'Hinglish',
    'COACHING_PLAYLIST',
    'EGEwkad_llA',
    1380,
    0
  );
}
