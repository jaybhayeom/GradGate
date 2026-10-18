// ==============================================================================
// CURRICULUM SEED: SECTION 6 - MACHINE LEARNING (DA_06_ML)
// Official GATE Data Science & AI Syllabus Coverage:
//   - Supervised Learning: Linear/Ridge/Logistic Regression, k-NN, Naive Bayes, LDA
//   - Support Vector Machines (SVM), Decision Trees, Bias-Variance Tradeoff, Cross-Validation
//   - Multi-layer Perceptron (MLP), Neural Networks, Activation Functions, Backpropagation
//   - Unsupervised Learning: k-Means, k-Medoids, Hierarchical Clustering (Single/Complete/Average)
//   - Dimensionality Reduction: Principal Component Analysis (PCA)
// ==============================================================================

import type { Database as DatabaseType } from 'better-sqlite3';

export function seedSectionMachineLearning(db: DatabaseType): void {
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

  // --- UNIT 1: Supervised Learning & SVM ---
  insertUnit.run(
    'unit_ml_01',
    'DA_06_ML',
    'Supervised Learning & Support Vector Machines',
    'Linear and logistic regression, maximum margin classifiers, soft-margin SVM, and kernel tricks.',
    1,
    '# Support Vector Machines\nMaximizing margin $\\frac{2}{\\|w\\|}$ is equivalent to solving the quadratic program:\n$$\\min_{w, b} \\frac{1}{2} \\|w\\|^2 \\quad \\text{s.t. } y_i(w^T x_i + b) \\ge 1$$\nSupport vectors are the points satisfying $y_i(w^T x_i + b) = 1$.'
  );

  insertNode.run(
    'node_ml_01_svm',
    'unit_ml_01',
    'SVM & Margin Computation',
    'Calculate exact geometric margins and identify active support vectors.',
    'CONCEPT_DRILL',
    1,
    25,
    1,
    null
  );

  // Question 1: NAT (SVM Margin Width)
  insertQuestion.run(
    'q_ml_01_01',
    'node_ml_01_svm',
    'NAT',
    'A linear SVM classifier in $\\mathbb{R}^2$ finds the optimal separating hyperplane with weight vector $\\mathbf{w} = \\begin{bmatrix} 3 \\\\ 4 \\end{bmatrix}$ and bias $b = -2$. What is the total geometric margin (width between the two supporting hyperplanes)?',
    2.0,
    0.0,
    null,
    '0.4',
    0.39,
    0.41,
    'The total margin width of a linear SVM is given by:\n$$\\text{Margin} = \\frac{2}{\\|\\mathbf{w}\\|}$$\nCalculating the Euclidean norm of $\\mathbf{w}$:\n$$\\|\\mathbf{w}\\| = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$$\n$$\\text{Margin} = \\frac{2}{5} = 0.4.$$',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 26 }),
    'EASY'
  );

  // Question 2: MCQ (Bias-Variance Tradeoff)
  insertQuestion.run(
    'q_ml_01_02',
    'node_ml_01_svm',
    'MCQ',
    'In regularized Ridge Regression with objective function $\\mathcal{L}(w) = \\|y - Xw\\|^2 + \\lambda \\|w\\|^2$, what happens as the regularization parameter $\\lambda \\to \\infty$?',
    1.0,
    -0.3333333333,
    JSON.stringify([
      { id: 'opt_a', label: 'A', textLatex: 'The bias increases and the variance decreases toward zero.' },
      { id: 'opt_b', label: 'B', textLatex: 'The variance increases and the bias decreases toward zero.' },
      { id: 'opt_c', label: 'C', textLatex: 'Both bias and variance increase simultaneously.' },
      { id: 'opt_d', label: 'D', textLatex: 'The model severely overfits the training dataset.' }
    ]),
    JSON.stringify('opt_a'),
    null,
    null,
    'As $\\lambda \\to \\infty$, the penalty on coefficients dominates, forcing all weights $w \\to 0$. The model becomes extremely simple (predicting constant mean), resulting in very high bias and near-zero variance.',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 18 }),
    'MEDIUM'
  );

  // --- UNIT 2: Unsupervised Learning & PCA ---
  insertUnit.run(
    'unit_ml_02',
    'DA_06_ML',
    'Clustering & Principal Component Analysis',
    'k-Means clustering, hierarchical dendrograms, covariance eigendecomposition, and PCA variance retention.',
    2,
    '# Principal Component Analysis\nPrincipal directions $v_1, \\dots, v_k$ are the eigenvectors corresponding to the largest eigenvalues $\\lambda_1 \\ge \\dots \\ge \\lambda_k$ of the sample covariance matrix $\\Sigma = \\frac{1}{n} X^T X$. The proportion of variance explained by the first $k$ components is $\\frac{\\sum_{i=1}^k \\lambda_i}{\\sum_{j=1}^d \\lambda_j}$.'
  );

  insertNode.run(
    'node_ml_02_pca',
    'unit_ml_02',
    'PCA & k-Means Checkpoint',
    'Solve for proportion of variance explained and k-means centroid updates.',
    'PYQ_CHECKPOINT',
    1,
    25,
    1,
    'node_ml_01_svm'
  );

  // Question 3: NAT (PCA Proportion of Variance)
  insertQuestion.run(
    'q_ml_02_01',
    'node_ml_02_pca',
    'NAT',
    'A $4$-dimensional dataset has covariance matrix with eigenvalues $\\lambda_1 = 12$, $\\lambda_2 = 5$, $\\lambda_3 = 2$, and $\\lambda_4 = 1$. What percentage of total variance is explained by the first two principal components?',
    2.0,
    0.0,
    null,
    '85',
    84.5,
    85.5,
    'Total variance is the sum of all eigenvalues:\n$$\\text{Total} = \\sum_{i=1}^4 \\lambda_i = 12 + 5 + 2 + 1 = 20$$\nVariance captured by top two components:\n$$\\text{Captured} = \\lambda_1 + \\lambda_2 = 12 + 5 = 17$$\n$$\\text{Percentage} = \\frac{17}{20} \\times 100\\% = 85\\%.$$',
    JSON.stringify({ year: 2024, paper: 'GATE DA', q_no: 40 }),
    'EASY'
  );

  // YouTube Lecture
  insertLecture.run(
    'lec_ml_01',
    'DA_06_ML',
    'unit_ml_01',
    'Lec-40: Support Vector Machines (SVMs) | Machine Learning',
    'Gate Smashers',
    'Hinglish',
    'COACHING_PLAYLIST',
    'NDqACjz5j8g',
    1140,
    0
  );
}
