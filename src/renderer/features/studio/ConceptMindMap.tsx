// ==============================================================================
// CONCEPT MIND MAP (Hierarchical Prerequisite & Downstream Knowledge Graph)
// Powered by @xyflow/react with interactive concept inspection drawer
// ==============================================================================

import React, { useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { X, Lightbulb, Warning, Star } from '@phosphor-icons/react';
import katex from 'katex';

interface ConceptDetail {
  id: string;
  title: string;
  subject: string;
  theoremLatex: string;
  intuition: string;
  commonTraps: string;
  samplePyq: string;
}

const CONCEPTS_CATALOG: Record<string, ConceptDetail> = {
  prob_bayes: {
    id: 'prob_bayes',
    title: "Bayes' Theorem & Conditional Prob",
    subject: 'Probability & Statistics',
    theoremLatex: 'P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)} = \\frac{P(B|A)P(A)}{\\sum_i P(B|A_i)P(A_i)}',
    intuition: 'Inverting cause and effect: updates our prior belief about hypothesis A upon observing evidence B.',
    commonTraps: 'Confusing P(A|B) with P(B|A) (base rate fallacy) or forgetting to normalize by total probability denominator.',
    samplePyq: 'GATE DA 2024: Given disease prevalence 0.01 and 99% test accuracy, find posterior probability of being sick given a positive test.'
  },
  linalg_eigen: {
    id: 'linalg_eigen',
    title: 'Eigenvalues & Eigenvectors',
    subject: 'Linear Algebra',
    theoremLatex: 'A \\vec{v} = \\lambda \\vec{v} \\iff \\det(A - \\lambda I) = 0',
    intuition: 'Directions along which a linear transformation acts as simple scalar stretching without rotation.',
    commonTraps: 'Assuming all matrices have n linearly independent eigenvectors (defective matrices do not diagonalizable).',
    samplePyq: 'GATE DA 2024: A is a 3x3 idempotent matrix with rank 2. Find the trace and eigenvalues.'
  },
  calc_grad: {
    id: 'calc_grad',
    title: 'Gradient & Directional Derivatives',
    subject: 'Calculus & Optimization',
    theoremLatex: '\\nabla f(x) = \\left[ \\frac{\\partial f}{\\partial x_1}, \\dots, \\frac{\\partial f}{\\partial x_n} \\right]^T, \\quad D_{\\vec{u}} f = \\nabla f \\cdot \\vec{u}',
    intuition: 'Vector pointing in the direction of greatest instantaneous increase; magnitude equals the rate of increase.',
    commonTraps: 'Forgetting to normalize the direction vector u into a unit vector before computing directional derivative.',
    samplePyq: 'GATE DA 2025: Find maximum rate of increase of f(x, y) = x^2 y + e^{xy} at point (1, 0).'
  },
  ml_svm: {
    id: 'ml_svm',
    title: 'Support Vector Machines (SVM)',
    subject: 'Machine Learning',
    theoremLatex: '\\min_{\\vec{w}, b} \\frac{1}{2} ||\\vec{w}||^2 + C \\sum_{i} \\xi_i, \\quad \\text{s.t. } y_i(\\vec{w} \\cdot \\vec{x}_i + b) \\ge 1 - \\xi_i',
    intuition: 'Maximizing the margin distance between hyperplane boundary and closest support vector data points.',
    commonTraps: 'Increasing C decreases training error but risks severe overfitting and narrow margin.',
    samplePyq: 'GATE DA 2024: In a linearly separable dataset with 4 support vectors, what happens to margin if C -> infinity?'
  }
};

export const ConceptMindMap: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState<ConceptDetail | null>(null);

  const initialNodes: Node[] = [
    {
      id: 'prob_bayes',
      position: { x: 50, y: 50 },
      data: { label: "Bayes' Theorem" },
      style: { background: '#10B981', color: '#022C22', borderRadius: '14px', fontWeight: 'bold' }
    },
    {
      id: 'linalg_eigen',
      position: { x: 300, y: 50 },
      data: { label: 'Eigenvalues & SVD' },
      style: { background: '#3B82F6', color: '#FFFFFF', borderRadius: '14px', fontWeight: 'bold' }
    },
    {
      id: 'calc_grad',
      position: { x: 550, y: 50 },
      data: { label: 'Gradients & Opt' },
      style: { background: '#8B5CF6', color: '#FFFFFF', borderRadius: '14px', fontWeight: 'bold' }
    },
    {
      id: 'ml_svm',
      position: { x: 300, y: 220 },
      data: { label: 'Support Vector Machines' },
      style: { background: '#F59E0B', color: '#1E1B4B', borderRadius: '14px', fontWeight: 'bold' }
    }
  ];

  const initialEdges: Edge[] = [
    { id: 'e1', source: 'prob_bayes', target: 'ml_svm', label: 'Naive Bayes & Loss', animated: true },
    { id: 'e2', source: 'linalg_eigen', target: 'ml_svm', label: 'Kernel Matrix & PCA', animated: true },
    { id: 'e3', source: 'calc_grad', target: 'ml_svm', label: 'Lagrangian Dual', animated: true }
  ];

  const handleNodeClick = (_: React.MouseEvent, node: Node): void => {
    const detail = CONCEPTS_CATALOG[node.id];
    if (detail) setSelectedConcept(detail);
  };

  const renderLatex = (formula: string): string => {
    try {
      return katex.renderToString(formula, { throwOnError: false, displayMode: true });
    } catch {
      return formula;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">
            NotebookLM Knowledge Graph Mind Map
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any concept node to inspect formal theorems, intuition, pitfalls &amp; linked PYQs.
          </p>
        </div>
      </div>

      {/* Graph Area */}
      <div className="w-full h-80 rounded-2xl bg-slate-950 border border-slate-850 overflow-hidden relative shadow-inner">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          onNodeClick={handleNodeClick}
          fitView
        >
          <Background color="#334155" gap={20} />
          <Controls className="bg-slate-900 border-slate-800 text-slate-300" />
        </ReactFlow>
      </div>

      {/* Side / Bottom Detail Drawer */}
      {selectedConcept && (
        <div className="rounded-2xl bg-slate-950 border border-slate-700 p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                {selectedConcept.subject}
              </span>
              <h4 className="font-black text-white text-base">{selectedConcept.title}</h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedConcept(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          {/* Formula */}
          <div
            className="p-3 rounded-xl bg-slate-900 text-emerald-300 border border-emerald-950 overflow-x-auto text-sm"
            dangerouslySetInnerHTML={{ __html: renderLatex(selectedConcept.theoremLatex) }}
          />

          {/* Intuition & Pitfalls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                <Lightbulb size={14} weight="fill" /> Intuitive Meaning
              </span>
              <p className="text-slate-300 leading-relaxed">{selectedConcept.intuition}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-rose-400 flex items-center gap-1.5 mb-1">
                <Warning size={14} weight="fill" /> Common GATE Trap
              </span>
              <p className="text-slate-300 leading-relaxed">{selectedConcept.commonTraps}</p>
            </div>
          </div>

          {/* Linked PYQ */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Star size={16} weight="fill" className="text-amber-400" />
              <span className="text-slate-300 font-medium">{selectedConcept.samplePyq}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
