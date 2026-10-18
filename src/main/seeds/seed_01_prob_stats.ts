// ==============================================================================
// CURRICULUM SEED: SECTION 1 - PROBABILITY AND STATISTICS (DA_01_PROB_STATS)
// Official GATE Data Science & AI Syllabus Coverage:
//   - Counting, Permutations, Combinations, Probability Axioms, Sample Space
//   - Independent & Mutually Exclusive Events, Marginal, Conditional & Joint Probability
//   - Bayes' Theorem, Conditional Expectation & Variance, Covariance & Correlation
//   - Discrete & Continuous Distributions (Uniform, Bernoulli, Binomial, Poisson, Normal, Exponential, t-dist, Chi-sq)
//   - Central Limit Theorem, Confidence Intervals, Hypothesis Testing (z-test, t-test, chi-squared)
// ==============================================================================

import type { Database as DatabaseType } from 'better-sqlite3';

export function seedSectionProbStats(db: DatabaseType): void {
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

  // --- UNIT 1: Combinatorics & Probability Foundations ---
  insertUnit.run(
    'unit_prob_01',
    'DA_01_PROB_STATS',
    'Combinatorics & Probability Foundations',
    'Permutations, combinations, sample spaces, axioms of probability, independent and mutually exclusive events.',
    1,
    '# Foundations of Probability\nProbability is defined over a sample space $\\Omega$ with probability measure $P$ satisfying Kolmogorov axioms: $P(\\Omega)=1$, $P(A) \\ge 0$, and countable additivity for disjoint events.'
  );

  insertNode.run(
    'node_prob_01_drill',
    'unit_prob_01',
    'Axioms & Combinatorial Counting',
    'Master permutations, combinations, and basic probability axioms.',
    'CONCEPT_DRILL',
    1,
    20,
    1,
    null
  );

  // Question 1: MCQ (Axioms of Probability)
  insertQuestion.run(
    'q_prob_01_01',
    'node_prob_01_drill',
    'MCQ',
    'Let $A$ and $B$ be two events such that $P(A) = 0.6$, $P(B) = 0.4$, and $P(A \\cap B) = 0.2$. What is the value of $P(A \\cup B^c)$?',
    1.0,
    -0.3333333333,
    JSON.stringify([
      { id: 'opt_a', label: 'A', textLatex: '0.6' },
      { id: 'opt_b', label: 'B', textLatex: '0.8' },
      { id: 'opt_c', label: 'C', textLatex: '0.4' },
      { id: 'opt_d', label: 'D', textLatex: '0.7' }
    ]),
    JSON.stringify('opt_b'),
    null,
    null,
    'We use $P(A \\cup B^c) = P(A) + P(B^c) - P(A \\cap B^c)$. Since $P(B^c) = 1 - P(B) = 0.6$ and $P(A \\cap B^c) = P(A) - P(A \\cap B) = 0.6 - 0.2 = 0.4$, we have:\n$$P(A \\cup B^c) = 0.6 + 0.6 - 0.4 = 0.8.$$',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 3 }),
    'EASY'
  );

  // Question 2: NAT (Combinatorics)
  insertQuestion.run(
    'q_prob_01_02',
    'node_prob_01_drill',
    'NAT',
    'In a data science team of $8$ engineers, a sub-committee of $4$ members is to be formed containing at least $2$ machine learning specialists. If there are $4$ ML specialists and $4$ data engineers in the team, find the total number of distinct ways to form the committee.',
    2.0,
    0.0,
    null,
    '53',
    53,
    53,
    'Total ways = $\\binom{4}{2}\\binom{4}{2} + \\binom{4}{3}\\binom{4}{1} + \\binom{4}{4}\\binom{4}{0}$:\n$$\\binom{4}{2}\\binom{4}{2} = 6 \\times 6 = 36$$\n$$\\binom{4}{3}\\binom{4}{1} = 4 \\times 4 = 16$$\n$$\\binom{4}{4}\\binom{4}{0} = 1 \\times 1 = 1$$\n$$\\text{Total} = 36 + 16 + 1 = 53.$$',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 28 }),
    'MEDIUM'
  );

  // --- UNIT 2: Conditional Probability & Bayes' Theorem ---
  insertUnit.run(
    'unit_prob_02',
    'DA_01_PROB_STATS',
    'Conditional Probability & Bayes Theorem',
    'Marginal, joint, and conditional probability, law of total probability, and Bayesian updating.',
    2,
    '# Bayes Theorem\n$$P(B_i \\mid A) = \\frac{P(A \\mid B_i)P(B_i)}{\\sum_j P(A \\mid B_j)P(B_j)}$$\nEssential for generative classifiers, Naive Bayes models, and Bayesian inference.'
  );

  insertNode.run(
    'node_prob_02_bayes',
    'unit_prob_02',
    'Bayesian Inference & Total Probability',
    'Calculate posterior probabilities and solve real diagnostic test problems.',
    'CONCEPT_DRILL',
    1,
    25,
    1,
    'node_prob_01_drill'
  );

  // Question 3: MCQ (Bayes Theorem Diagnostic Test)
  insertQuestion.run(
    'q_prob_02_01',
    'node_prob_02_bayes',
    'MCQ',
    'A rare disease affects $1$ in every $1000$ individuals in a population ($P(D) = 0.001$). A diagnostic medical test has a sensitivity of $99\\%$ ($P(T^+ \\mid D) = 0.99$) and a false positive rate of $2\\%$ ($P(T^+ \\mid D^c) = 0.02$). If a randomly chosen person tests positive, what is the posterior probability that they actually have the disease, rounded to three decimal places?',
    2.0,
    -0.6666666667,
    JSON.stringify([
      { id: 'opt_a', label: 'A', textLatex: '0.047' },
      { id: 'opt_b', label: 'B', textLatex: '0.990' },
      { id: 'opt_c', label: 'C', textLatex: '0.020' },
      { id: 'opt_d', label: 'D', textLatex: '0.125' }
    ]),
    JSON.stringify('opt_a'),
    null,
    null,
    'By Bayes Theorem:\n$$P(D \\mid T^+) = \\frac{P(T^+ \\mid D)P(D)}{P(T^+ \\mid D)P(D) + P(T^+ \\mid D^c)P(D^c)}$$\n$$P(D \\mid T^+) = \\frac{0.99 \\times 0.001}{(0.99 \\times 0.001) + (0.02 \\times 0.999)} = \\frac{0.00099}{0.00099 + 0.01998} = \\frac{0.00099}{0.02097} \\approx 0.0472.$$',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 34 }),
    'HARD'
  );

  // Question 4: MSQ (Properties of Independence)
  insertQuestion.run(
    'q_prob_02_02',
    'node_prob_02_bayes',
    'MSQ',
    'Let $A$ and $B$ be two independent events with non-zero probabilities. Which of the following statements is/are always TRUE?',
    2.0,
    0.0,
    JSON.stringify([
      { id: 'opt_1', label: 'A', textLatex: '$P(A \\mid B) = P(A)$' },
      { id: 'opt_2', label: 'B', textLatex: '$A$ and $B^c$ are independent' },
      { id: 'opt_3', label: 'C', textLatex: '$A$ and $B$ are mutually exclusive' },
      { id: 'opt_4', label: 'D', textLatex: '$P(A \\cap B) = P(A)P(B)$' }
    ]),
    JSON.stringify(['opt_1', 'opt_2', 'opt_4']),
    null,
    null,
    'By definition of independence:\n- $P(A \\cap B) = P(A)P(B)$, which implies $P(A \\mid B) = P(A)$.\n- If $A$ and $B$ are independent, then $A$ and $B^c$ are also independent.\n- Mutually exclusive events with positive probabilities cannot be independent since $P(A \\cap B) = 0 \\neq P(A)P(B)$.',
    JSON.stringify({ year: 2025, paper: 'GATE DA Sample', q_no: 14 }),
    'MEDIUM'
  );

  // --- UNIT 3: Probability Distributions & Central Limit Theorem ---
  insertUnit.run(
    'unit_prob_03',
    'DA_01_PROB_STATS',
    'Distributions & Central Limit Theorem',
    'Binomial, Poisson, Uniform, Exponential, Normal distributions, Expectation, Variance, and Central Limit Theorem.',
    3,
    '# Continuous & Discrete Distributions\nStandard Normal: $Z = \\frac{X - \\mu}{\\sigma} \\sim \\mathcal{N}(0, 1)$. Central Limit Theorem establishes that sample means converge to normal distribution as $n \\to \\infty$.'
  );

  insertNode.run(
    'node_prob_03_clt',
    'unit_prob_03',
    'Distributions & CLT Drills',
    'Poisson processes, Normal distribution quantiles, and Central Limit Theorem conversions.',
    'CONCEPT_DRILL',
    1,
    25,
    1,
    'node_prob_02_bayes'
  );

  // Question 5: NAT (Poisson distribution rate)
  insertQuestion.run(
    'q_prob_03_01',
    'node_prob_03_clt',
    'NAT',
    'Requests arrive at a cloud database server following a Poisson process with an average rate of $\\lambda = 2$ requests per second. The probability that exactly $3$ requests arrive in a given $2$-second interval is $k \\cdot e^{-4}$. Find the integer value of $k$ to the nearest whole number.',
    2.0,
    0.0,
    null,
    '11',
    10.5,
    11.5,
    'For a $2$-second interval, the rate parameter is $\\mu = \\lambda \\cdot t = 2 \\times 2 = 4$.\nThe probability of $X = 3$ is:\n$$P(X = 3) = \\frac{e^{-\\mu} \\mu^3}{3!} = \\frac{e^{-4} \\cdot 4^3}{6} = \\frac{64}{6} e^{-4} = \\frac{32}{3} e^{-4} \\approx 10.67 e^{-4}.$$\nRounding to the nearest integer gives $11$.',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 42 }),
    'MEDIUM'
  );

  // Visual Studio Node
  insertNode.run(
    'node_prob_03_studio',
    'unit_prob_03',
    'Normal Distribution Interactive Studio',
    'Explore Gaussian probability density functions, standard deviations, and hypothesis rejection boundaries.',
    'VISUAL_STUDIO',
    2,
    30,
    1,
    'node_prob_03_clt'
  );

  insertStudio.run(
    'studio_prob_01',
    'unit_prob_03',
    'Normal PDF & Hypothesis Rejection Explorer',
    'MAFS_2D',
    JSON.stringify({
      sceneType: 'PROBABILITY_PDF',
      distribution: 'NORMAL',
      defaultMean: 0,
      defaultStd: 1,
      criticalZ: 1.96,
      twoTailed: true
    })
  );

  // YouTube Lectures
  insertLecture.run(
    'lec_prob_01',
    'DA_01_PROB_STATS',
    'unit_prob_02',
    'Bayes theorem, the geometry of changing beliefs',
    '3Blue1Brown',
    'English',
    'VISUAL_INTUITION',
    'HZGCoVF3YvM',
    915,
    0
  );

  insertLecture.run(
    'lec_prob_02',
    'DA_01_PROB_STATS',
    'unit_prob_02',
    "Lec-14: BAYES' Theorem | Probability and Statistics | Most Important Topic",
    'Gate Smashers',
    'Hinglish',
    'COACHING_PLAYLIST',
    'WOYylyjkq_g',
    720,
    0
  );

  insertLecture.run(
    'lec_prob_03',
    'DA_01_PROB_STATS',
    'unit_prob_01',
    'Lec-1: Fundamental Principle Of Counting (Basic Permutation) | Probability and Statistics',
    'Gate Smashers',
    'Hinglish',
    'COACHING_PLAYLIST',
    'Q_u3Lt5AV3c',
    840,
    0
  );
}
