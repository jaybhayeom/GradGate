// ==============================================================================
// CURRICULUM SEED: SECTION 3 - CALCULUS AND OPTIMIZATION (DA_03_CALC_OPT)
// Official GATE Data Science & AI Syllabus Coverage:
//   - Functions of a single variable, Limits, Continuity, Differentiability
//   - Mean Value Theorems, L'Hopital's Rule, Derivatives of Composite/Inverse Functions
//   - Taylor Series, Maclaurin Expansions, Error Estimations
//   - Maxima, Minima, Critical Points, Convexity, Optimization of Single Variable Functions
// ==============================================================================

import type { Database as DatabaseType } from 'better-sqlite3';

export function seedSectionCalculusOpt(db: DatabaseType): void {
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

  const insertStudio = db.prepare(`
    INSERT OR REPLACE INTO visual_studio_configs (id, unit_id, title, studio_type, config_json)
    VALUES (?, ?, ?, ?, ?)
  `);

  // --- UNIT 1: Limits, Continuity & Differentiability ---
  insertUnit.run(
    'unit_calc_01',
    'DA_03_CALC_OPT',
    'Limits, Continuity & Differentiability',
    'Indeterminate forms, L\'Hopital\'s rule, piecewise continuity, and differentiability conditions.',
    1,
    '# Limits & Differentiability\nA function $f(x)$ is differentiable at $x_0$ if:\n$$f\'(x_0) = \\lim_{h \\to 0} \\frac{f(x_0 + h) - f(x_0)}{h}$$\nexists and is finite. Differentiability strictly implies continuity, but continuity does not imply differentiability.'
  );

  insertNode.run(
    'node_calc_01_limits',
    'unit_calc_01',
    'Limits & Indeterminate Forms Drill',
    'Solve limits involving trigonometric, logarithmic, and polynomial functions using L\'Hopital\'s rule.',
    'CONCEPT_DRILL',
    1,
    20,
    1,
    null
  );

  // Question 1: NAT (Limit evaluation)
  insertQuestion.run(
    'q_calc_01_01',
    'node_calc_01_limits',
    'NAT',
    'Evaluate the limit:\n$$L = \\lim_{x \\to 0} \\frac{\\ln(1 + 3x) - 3x}{x^2}$$',
    1.0,
    0.0,
    null,
    '-4.5',
    -4.51,
    -4.49,
    'Using the Taylor expansion $\\ln(1 + u) = u - \\frac{u^2}{2} + \\mathcal{O}(u^3)$ with $u = 3x$:\n$$\\ln(1 + 3x) = 3x - \\frac{9x^2}{2} + \\mathcal{O}(x^3)$$\nSubstituting into the limit:\n$$L = \\lim_{x \\to 0} \\frac{3x - \\frac{9}{2}x^2 - 3x}{x^2} = \\lim_{x \\to 0} \\frac{-\\frac{9}{2}x^2}{x^2} = -4.5.$$',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 5 }),
    'EASY'
  );

  // Question 2: MCQ (Continuity vs Differentiability)
  insertQuestion.run(
    'q_calc_01_02',
    'node_calc_01_limits',
    'MCQ',
    'Consider the function $f(x) = |x| \\cdot x$ for all $x \\in \\mathbb{R}$. At $x = 0$, the function $f(x)$ is:',
    1.0,
    -0.3333333333,
    JSON.stringify([
      { id: 'opt_a', label: 'A', textLatex: 'Continuous and differentiable with $f\'(0) = 0$' },
      { id: 'opt_b', label: 'B', textLatex: 'Continuous but not differentiable' },
      { id: 'opt_c', label: 'C', textLatex: 'Neither continuous nor differentiable' },
      { id: 'opt_d', label: 'D', textLatex: 'Differentiable with $f\'(0) = 1$' }
    ]),
    JSON.stringify('opt_a'),
    null,
    null,
    'We write $f(x)$ piecewise:\n$$f(x) = \\begin{cases} x^2 & x \\ge 0 \\\\ -x^2 & x < 0 \\end{cases}$$\nChecking the derivative at $x = 0$:\n$$\\lim_{h \\to 0^+} \\frac{h^2 - 0}{h} = 0, \\quad \\lim_{h \\to 0^-} \\frac{-h^2 - 0}{h} = 0$$\nBoth left-hand and right-hand derivatives exist and equal $0$, so $f(x)$ is continuous and differentiable with $f\'(0) = 0$.',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 11 }),
    'MEDIUM'
  );

  // --- UNIT 2: Taylor Series & Approximations ---
  insertUnit.run(
    'unit_calc_02',
    'DA_03_CALC_OPT',
    'Taylor Series & Polynomial Expansions',
    'Maclaurin series, local polynomial approximations, and remainder theorems.',
    2,
    '# Taylor Series Expansion\n$$f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x - a)^n$$\nFundamental in numerical machine learning algorithms, gradient approximations, and Hessian curvature models.'
  );

  insertNode.run(
    'node_calc_02_taylor',
    'unit_calc_02',
    'Taylor Series Expansions',
    'Calculate coefficients and higher-order derivatives using series expansions.',
    'CONCEPT_DRILL',
    1,
    20,
    1,
    'node_calc_01_limits'
  );

  // Question 3: NAT (Taylor Series Coefficient)
  insertQuestion.run(
    'q_calc_02_01',
    'node_calc_02_taylor',
    'NAT',
    'In the Taylor series expansion of $f(x) = e^{2x} \\cos(x)$ about $x = 0$, what is the coefficient of $x^2$?',
    2.0,
    0.0,
    null,
    '1.5',
    1.49,
    1.51,
    'Expanding both series around $x = 0$:\n$$e^{2x} = 1 + 2x + \\frac{(2x)^2}{2!} + \\mathcal{O}(x^3) = 1 + 2x + 2x^2 + \\mathcal{O}(x^3)$$\n$$\\cos(x) = 1 - \\frac{x^2}{2} + \\mathcal{O}(x^4)$$\nMultiplying to find the coefficient of $x^2$:\n$$(1) \\left(-\\frac{1}{2}x^2\\right) + (2x^2)(1) = \\left(2 - \\frac{1}{2}\\right) x^2 = \\frac{3}{2} x^2 = 1.5 x^2.$$',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 25 }),
    'MEDIUM'
  );

  // --- UNIT 3: Maxima, Minima & Optimization ---
  insertUnit.run(
    'unit_calc_03',
    'DA_03_CALC_OPT',
    'Optimization & Critical Points',
    'First and second derivative tests, convexity, global and local extrema, and gradient descent fundamentals.',
    3,
    '# Single-Variable Optimization\n- Critical points occur where $f\'(x) = 0$ or $f\'(x)$ is undefined.\n- Second derivative test: $f\'\'(x) > 0 \\implies$ local minimum (convex); $f\'\'(x) < 0 \\implies$ local maximum (concave).'
  );

  insertNode.run(
    'node_calc_03_opt',
    'unit_calc_03',
    'Extrema & Convexity Checkpoint',
    'Solve for optimal parameters and global minima of objective loss functions.',
    'PYQ_CHECKPOINT',
    1,
    25,
    1,
    'node_calc_02_taylor'
  );

  // Question 4: MCQ (Global Minima of Loss Function)
  insertQuestion.run(
    'q_calc_03_01',
    'node_calc_03_opt',
    'MCQ',
    'Let $f(x) = x^4 - 4x^3 + 4x^2 + 10$ for $x \\in \\mathbb{R}$. What is the global minimum value of $f(x)$?',
    2.0,
    -0.6666666667,
    JSON.stringify([
      { id: 'opt_a', label: 'A', textLatex: '10' },
      { id: 'opt_b', label: 'B', textLatex: '11' },
      { id: 'opt_c', label: 'C', textLatex: '0' },
      { id: 'opt_d', label: 'D', textLatex: '14' }
    ]),
    JSON.stringify('opt_a'),
    null,
    null,
    'We factor the polynomial:\n$$f(x) = x^2(x^2 - 4x + 4) + 10 = x^2(x - 2)^2 + 10$$\nNotice that $x^2(x - 2)^2 \\ge 0$ for all real $x$, with equality holding when $x = 0$ or $x = 2$.\nTherefore, the minimum value is $0 + 10 = 10$, achieved at both $x = 0$ and $x = 2$.',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 37 }),
    'EASY'
  );

  // Visual Studio Node: Derivative & Taylor Visualizer
  insertNode.run(
    'node_calc_03_studio',
    'unit_calc_03',
    'Derivative & Gradient Descent Visualizer',
    'Interact with dynamic function plots, rolling gradient descent balls, and adjustable learning rates.',
    'VISUAL_STUDIO',
    2,
    30,
    1,
    'node_calc_03_opt'
  );

  insertStudio.run(
    'studio_calc_01',
    'unit_calc_03',
    'Interactive Gradient Descent & Taylor Polynomial Explorer',
    'MAFS_2D',
    JSON.stringify({
      sceneType: 'CALCULUS_GRADIENT',
      functionExpression: 'x^4 - 4*x^3 + 4*x^2 + 1',
      defaultLearningRate: 0.1,
      showTangent: true,
      showBallAnimation: true
    })
  );

  // YouTube Lectures
  insertLecture.run(
    'lec_calc_01',
    'DA_03_CALC_OPT',
    'unit_calc_01',
    'The essence of calculus',
    '3Blue1Brown',
    'English',
    'VISUAL_INTUITION',
    'WUvTyaaNkzM',
    1020,
    0
  );

  insertLecture.run(
    'lec_calc_02',
    'DA_03_CALC_OPT',
    'unit_calc_02',
    "What's so special about Euler's number e? | Chapter 5, Essence of calculus",
    '3Blue1Brown',
    'English',
    'VISUAL_INTUITION',
    'm2MIpDrF7Es',
    880,
    0
  );

  insertLecture.run(
    'lec_calc_03',
    'DA_03_CALC_OPT',
    'unit_calc_03',
    'One Shot Series - Maxima & Minima For CSIR-NET / IIT-JAM / GATE Exams |Concepts & Examples By Gp Sir',
    'Dr.Gajendra Purohit - GATE / IIT JAM / CSIR NET',
    'Hinglish',
    'COACHING_PLAYLIST',
    'xjAPwFjJLCQ',
    2800,
    0
  );
}
