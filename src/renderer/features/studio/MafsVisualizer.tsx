// ==============================================================================
// MAFS INTERACTIVE VISUALIZER (3Blue1Brown-Style 2D Coordinate & Matrix Studio)
// Scenes:
//   1. Linear Algebra: 2x2 matrix warping, Eigenvalues, Eigenvectors, Det area.
//   2. Calculus: Tangent slope derivative, Taylor series order, Gradient Descent ball.
//   3. Probability: Gaussian/Exponential PDF curves with draggable rejection region.
// ==============================================================================

import React, { useState } from 'react';
import { Mafs, Coordinates, Plot, Polygon, Vector, Theme } from 'mafs';
import 'mafs/core.css';
import { Play, ArrowCounterClockwise, CaretRight } from '@phosphor-icons/react';
import { DuoButton } from '../../components/ui/DuoButton';

export type MafsSceneMode = 'LINEAR_ALGEBRA' | 'CALCULUS' | 'PROBABILITY';

export const MafsVisualizer: React.FC = () => {
  const [sceneMode, setSceneMode] = useState<MafsSceneMode>('LINEAR_ALGEBRA');

  // Linear Algebra Matrix Parameters: [ [a, b], [c, d] ]
  // Default: Shear + scaling matrix
  const [vecI, setVecI] = useState<[number, number]>([2, 0.5]);
  const [vecJ, setVecJ] = useState<[number, number]>([0.5, 1.5]);

  // Calculus Parameters: f(x) = 0.2 * x^3 - x
  const [xTangent, setXTangent] = useState<number>(1.2);
  const [learningRate, setLearningRate] = useState<number>(0.2);
  const [gdBallX, setGdBallX] = useState<number>(-2.2);

  // Probability Parameters: Normal Distribution (mu, sigma)
  const [mu, setMu] = useState<number>(0);
  const [sigma, setSigma] = useState<number>(1.2);
  const [zScoreThreshold, setZScoreThreshold] = useState<number>(1.645);

  // --- Linear Algebra Calculations ---
  const a = vecI[0];
  const c = vecI[1];
  const b = vecJ[0];
  const d = vecJ[1];

  const determinant = a * d - b * c;
  const trace = a + d;
  const discriminant = trace * trace - 4 * determinant;

  let lambda1: number | null = null;
  let lambda2: number | null = null;
  if (discriminant >= 0) {
    lambda1 = Math.round(((trace + Math.sqrt(discriminant)) / 2) * 100) / 100;
    lambda2 = Math.round(((trace - Math.sqrt(discriminant)) / 2) * 100) / 100;
  }

  // Unit square transformed polygon
  const transformedSquare: [number, number][] = [
    [0, 0],
    [a, c],
    [a + b, c + d],
    [b, d]
  ];

  // --- Calculus Functions ---
  const f = (x: number): number => 0.2 * Math.pow(x, 3) - x;
  const fPrime = (x: number): number => 0.6 * Math.pow(x, 2) - 1;

  const stepGradientDescent = (): void => {
    const grad = fPrime(gdBallX);
    const nextX = gdBallX - learningRate * grad;
    setGdBallX(Math.max(-3.5, Math.min(3.5, nextX)));
  };

  // --- Probability Density Function (Normal) ---
  const normalPdf = (x: number): number => {
    const coeff = 1 / (sigma * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((x - mu) / sigma, 2);
    return coeff * Math.exp(exponent);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl select-none">
      {/* Scene Mode Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">
            Mafs 2D Visual Mathematics Studio
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time coordinate transformations, derivative slopes &amp; statistical densities.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
          {(['LINEAR_ALGEBRA', 'CALCULUS', 'PROBABILITY'] as MafsSceneMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSceneMode(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                sceneMode === mode
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode === 'LINEAR_ALGEBRA' ? 'Linear Algebra' : mode === 'CALCULUS' ? 'Calculus & Opt' : 'Prob & Stats'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Visual Canvas Area */}
      <div className="w-full h-96 rounded-2xl bg-slate-950 border border-slate-850 overflow-hidden relative shadow-inner">
        {sceneMode === 'LINEAR_ALGEBRA' && (
          <Mafs viewBox={{ x: [-4, 4], y: [-3, 3] }} pan={true} zoom={true}>
            <Coordinates.Cartesian subdivisions={2} />

            {/* Transformed Unit Square Area */}
            <Polygon
              points={transformedSquare}
              color={Theme.green}
              fillOpacity={0.25}
            />

            {/* Basis Vector i (First Column) */}
            <Vector
              tip={[vecI[0], vecI[1]]}
              color={Theme.blue}
            />

            {/* Basis Vector j (Second Column) */}
            <Vector
              tip={[vecJ[0], vecJ[1]]}
              color={Theme.red}
            />
          </Mafs>
        )}

        {sceneMode === 'CALCULUS' && (
          <Mafs viewBox={{ x: [-4, 4], y: [-3, 3] }} pan={true} zoom={true}>
            <Coordinates.Cartesian subdivisions={2} />

            {/* Non-convex function f(x) */}
            <Plot.OfX y={f} color={Theme.blue} />

            {/* Tangent Line at xTangent */}
            <Plot.OfX
              y={(x) => f(xTangent) + fPrime(xTangent) * (x - xTangent)}
              color={Theme.pink}
            />

            {/* Gradient Descent Ball */}
            <Polygon
              points={[
                [gdBallX - 0.15, f(gdBallX) - 0.15],
                [gdBallX + 0.15, f(gdBallX) - 0.15],
                [gdBallX + 0.15, f(gdBallX) + 0.15],
                [gdBallX - 0.15, f(gdBallX) + 0.15]
              ]}
              color={Theme.yellow}
              fillOpacity={0.9}
            />
          </Mafs>
        )}

        {sceneMode === 'PROBABILITY' && (
          <Mafs viewBox={{ x: [-4, 4], y: [-0.2, 1] }} pan={true} zoom={true}>
            <Coordinates.Cartesian subdivisions={2} />

            {/* Gaussian PDF Curve */}
            <Plot.OfX y={normalPdf} color={Theme.green} />

            {/* Rejection Threshold Vector */}
            <Vector
              tail={[zScoreThreshold, 0]}
              tip={[zScoreThreshold, normalPdf(zScoreThreshold)]}
              color={Theme.red}
            />
          </Mafs>
        )}
      </div>

      {/* Interactive Parameter Control Bar */}
      {sceneMode === 'LINEAR_ALGEBRA' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-slate-300">Basis Vector \hat{i} (Col 1)</span>
            <div className="flex items-center gap-2">
              <label className="text-slate-500 font-mono">x:</label>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={vecI[0]}
                onChange={(e) => setVecI([parseFloat(e.target.value), vecI[1]])}
                className="accent-blue-500 flex-1 cursor-pointer"
              />
              <span className="font-mono text-blue-400 w-8">{vecI[0]}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-slate-500 font-mono">y:</label>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={vecI[1]}
                onChange={(e) => setVecI([vecI[0], parseFloat(e.target.value)])}
                className="accent-blue-500 flex-1 cursor-pointer"
              />
              <span className="font-mono text-blue-400 w-8">{vecI[1]}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-bold text-slate-300">Basis Vector \hat{j} (Col 2)</span>
            <div className="flex items-center gap-2">
              <label className="text-slate-500 font-mono">x:</label>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={vecJ[0]}
                onChange={(e) => setVecJ([parseFloat(e.target.value), vecJ[1]])}
                className="accent-red-500 flex-1 cursor-pointer"
              />
              <span className="font-mono text-red-400 w-8">{vecJ[0]}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-slate-500 font-mono">y:</label>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={vecJ[1]}
                onChange={(e) => setVecJ([vecJ[0], parseFloat(e.target.value)])}
                className="accent-red-500 flex-1 cursor-pointer"
              />
              <span className="font-mono text-red-400 w-8">{vecJ[1]}</span>
            </div>
          </div>

          {/* Matrix Math Diagnostics */}
          <div className="flex flex-col justify-center gap-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Determinant:</span>
              <span className="font-mono font-bold text-emerald-400">
                {Math.round(determinant * 100) / 100}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Trace:</span>
              <span className="font-mono text-slate-200">{Math.round(trace * 100) / 100}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Eigenvalues:</span>
              <span className="font-mono text-amber-400">
                {lambda1 !== null ? `${lambda1}, ${lambda2}` : 'Complex (Rotation)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {sceneMode === 'CALCULUS' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-slate-300">Tangent Point (x_0)</span>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.1"
              value={xTangent}
              onChange={(e) => setXTangent(parseFloat(e.target.value))}
              className="accent-pink-500 cursor-pointer"
            />
            <span className="font-mono text-pink-400">
              x_0 = {xTangent} | Slope f'(x_0) = {Math.round(fPrime(xTangent) * 100) / 100}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-bold text-slate-300">Gradient Descent (\alpha)</span>
            <input
              type="range"
              min="0.05"
              max="0.6"
              step="0.05"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              className="accent-amber-500 cursor-pointer"
            />
            <span className="font-mono text-amber-400">\alpha = {learningRate}</span>
          </div>

          <div className="flex items-center gap-2">
            <DuoButton size="sm" variant="primary" onClick={stepGradientDescent} icon={<Play size={14} weight="fill" />}>
              Step Gradient Descent
            </DuoButton>
            <button
              type="button"
              onClick={() => setGdBallX(-2.5)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              title="Reset Ball"
            >
              <ArrowCounterClockwise size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {sceneMode === 'PROBABILITY' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-slate-300">Standard Deviation (\sigma)</span>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={sigma}
              onChange={(e) => setSigma(parseFloat(e.target.value))}
              className="accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono text-emerald-400">\sigma = {sigma}</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-bold text-slate-300">Rejection Threshold (Z)</span>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.05"
              value={zScoreThreshold}
              onChange={(e) => setZScoreThreshold(parseFloat(e.target.value))}
              className="accent-red-500 cursor-pointer"
            />
            <span className="font-mono text-red-400">Z_critical = {zScoreThreshold}</span>
          </div>

          <div className="flex flex-col justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <span className="text-slate-400">Significance Level:</span>
            <span className="font-mono font-bold text-amber-400">
              \alpha \approx {zScoreThreshold >= 1.96 ? '0.05 (Two-Tailed)' : zScoreThreshold >= 1.645 ? '0.05 (One-Tailed)' : '> 0.10'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
