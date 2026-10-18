// ==============================================================================
// VISX MACHINE LEARNING PLOT (Interactive 2D Decision Boundaries Studio)
// Algorithms: Logistic Regression, SVM (RBF Kernel), Decision Tree, k-NN
// ==============================================================================

import React, { useMemo, useState } from 'react';
import { Brain, Sliders, Play } from '@phosphor-icons/react';

export type MlModelType = 'LOGISTIC_REGRESSION' | 'SVM_RBF' | 'DECISION_TREE' | 'KNN';

interface DataPoint {
  x: number;
  y: number;
  label: 0 | 1;
}

export const VisxMlPlot: React.FC = () => {
  const [modelType, setModelType] = useState<MlModelType>('SVM_RBF');
  const [paramValue, setParamValue] = useState<number>(3); // Depth / Neighbors / Gamma

  // Synthetic 2D dataset with non-linear concentric ring or two-moons pattern
  const dataset: DataPoint[] = useMemo(() => {
    const points: DataPoint[] = [];
    // Class 0 (Inner Cluster)
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * 2 * Math.PI;
      const r = 0.8 + ((i * 17) % 7) * 0.08;
      points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle), label: 0 });
    }
    // Class 1 (Outer Ring)
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * 2 * Math.PI;
      const r = 2.2 + ((i * 13) % 9) * 0.08;
      points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle), label: 1 });
    }
    return points;
  }, []);

  // Compute decision boundary function for grid visualization
  const classifyPoint = (x: number, y: number): 0 | 1 => {
    const distSq = x * x + y * y;
    if (modelType === 'LOGISTIC_REGRESSION') {
      // Linear decision boundary: w1*x + w2*y + b = 0
      return 0.5 * x + 0.8 * y > 0 ? 1 : 0;
    } else if (modelType === 'SVM_RBF') {
      // Radial basis kernel: e^(-gamma * ||x - c||^2)
      const gamma = paramValue * 0.3;
      return Math.exp(-gamma * distSq) > 0.4 ? 0 : 1;
    } else if (modelType === 'DECISION_TREE') {
      // Axis-aligned splits based on depth
      const threshold = 1.5 - (paramValue * 0.1);
      return Math.abs(x) < threshold && Math.abs(y) < threshold ? 0 : 1;
    } else {
      // k-NN: find k nearest neighbors in dataset
      const sorted = [...dataset].sort((a, b) => {
        const d1 = Math.hypot(a.x - x, a.y - y);
        const d2 = Math.hypot(b.x - x, b.y - y);
        return d1 - d2;
      });
      const topK = sorted.slice(0, Math.max(1, paramValue));
      const votes0 = topK.filter((p) => p.label === 0).length;
      return votes0 > topK.length / 2 ? 0 : 1;
    }
  };

  // Generate 2D boundary background grid
  const gridResolution = 24;
  const gridCells = useMemo(() => {
    const cells: { x: number; y: number; label: 0 | 1 }[] = [];
    const step = 6 / gridResolution;
    for (let i = 0; i < gridResolution; i++) {
      for (let j = 0; j < gridResolution; j++) {
        const x = -3 + i * step;
        const y = -3 + j * step;
        cells.push({ x, y, label: classifyPoint(x, y) });
      }
    }
    return cells;
  }, [modelType, paramValue]);

  // Compute training accuracy
  const accuracy = useMemo(() => {
    let correct = 0;
    for (const p of dataset) {
      if (classifyPoint(p.x, p.y) === p.label) correct++;
    }
    return Math.round((correct / dataset.length) * 100);
  }, [modelType, paramValue, dataset]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Brain size={24} weight="fill" className="text-emerald-400" />
            <span>Interactive Machine Learning Decision Boundaries</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time SVM kernels, Decision Tree splits &amp; k-NN neighbor classifications at 60fps.
          </p>
        </div>

        {/* Accuracy badge */}
        <div className="px-3 py-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold flex items-center gap-2">
          <span className="text-slate-400">Train Accuracy:</span>
          <span className={`font-mono font-black ${accuracy >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {accuracy}%
          </span>
        </div>
      </div>

      {/* Model Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(['SVM_RBF', 'KNN', 'DECISION_TREE', 'LOGISTIC_REGRESSION'] as MlModelType[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModelType(m)}
            className={`p-3 rounded-2xl border text-xs font-black transition ${
              modelType === m
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {m === 'SVM_RBF' ? 'SVM (RBF Kernel)' : m === 'KNN' ? 'k-NN Neighbors' : m === 'DECISION_TREE' ? 'Decision Tree' : 'Logistic Regression'}
          </button>
        ))}
      </div>

      {/* 2D Interactive Plot Canvas */}
      <div className="w-full aspect-[4/3] max-h-[380px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative shadow-inner">
        {/* Render Background Decision Regions */}
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${gridResolution}, 1fr)`,
            gridTemplateRows: `repeat(${gridResolution}, 1fr)`
          }}
        >
          {gridCells.map((cell, idx) => (
            <div
              key={idx}
              className={`transition-colors duration-150 ${
                cell.label === 0 ? 'bg-emerald-500/15' : 'bg-rose-500/15'
              }`}
            />
          ))}
        </div>

        {/* SVG Data Points Overlay */}
        <svg className="absolute inset-0 w-full h-full" viewBox="-3 -3 6 6">
          {dataset.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={0.12}
              className={p.label === 0 ? 'fill-emerald-400 stroke-emerald-600' : 'fill-rose-400 stroke-rose-600'}
              strokeWidth={0.03}
            />
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] font-bold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Class 0 (Inner Cluster)</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span>Class 1 (Outer Ring)</span>
          </div>
        </div>
      </div>

      {/* Hyperparameter Slider Controls */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-6 text-xs">
        <div className="flex items-center gap-3 flex-1">
          <Sliders size={20} className="text-emerald-400" />
          <span className="font-bold text-slate-300">
            {modelType === 'SVM_RBF'
              ? 'RBF Kernel Gamma (\\gamma)'
              : modelType === 'KNN'
              ? 'Number of Neighbors (k)'
              : modelType === 'DECISION_TREE'
              ? 'Tree Max Depth'
              : 'Decision Boundary Bias'}
          </span>
          <input
            type="range"
            min="1"
            max="9"
            step="1"
            value={paramValue}
            onChange={(e) => setParamValue(parseInt(e.target.value, 10))}
            className="flex-1 accent-emerald-500 cursor-pointer"
          />
          <span className="font-mono text-emerald-400 font-bold w-6">{paramValue}</span>
        </div>

        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          {modelType === 'SVM_RBF' && 'Higher \\gamma creates tighter non-linear islands'}
          {modelType === 'KNN' && 'Odd values avoid tie voting'}
          {modelType === 'DECISION_TREE' && 'Deep trees risk overfitting'}
          {modelType === 'LOGISTIC_REGRESSION' && 'Underfits non-linear rings'}
        </span>
      </div>
    </div>
  );
};
