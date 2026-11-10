// ==============================================================================
// VISUAL CONCEPT STUDIO
// Unified visual workstation hosting:
//   1. Mafs 2D coordinate/matrix transformations & calculus.
//   2. Visx 2D Machine Learning Decision Boundaries.
//   3. Prerequisite Knowledge Mind Map (@xyflow/react).
//   4. Conceptual Audio Seminar with step-by-step derivations.
// ==============================================================================

import React, { useState } from 'react';
import { MafsVisualizer } from './MafsVisualizer';
import { VisxMlPlot } from './VisxMlPlot';
import { ConceptMindMap } from './ConceptMindMap';
import { DeepDivePlayer } from './DeepDivePlayer';
import { Compass, Brain, GitFork, Broadcast } from '@phosphor-icons/react';

export type StudioTab = 'MAFS' | 'ML_BOUNDARIES' | 'MIND_MAP' | 'PODCAST';

export const VisualConceptStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudioTab>('MAFS');

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4 md:p-6 select-none">
      {/* Studio Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Visual Math &amp; Concept Studio
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Coordinate geometry transformations, 2D machine learning decision boundaries, prerequisite concept trees, and audio seminars.
          </p>
        </div>

        {/* Studio Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('MAFS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'MAFS'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass size={15} weight="bold" />
            <span>Coordinate Geometry</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ML_BOUNDARIES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'ML_BOUNDARIES'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain size={15} weight="bold" />
            <span>ML Boundaries</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MIND_MAP')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'MIND_MAP'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitFork size={15} weight="bold" />
            <span>Concept Map</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PODCAST')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'PODCAST'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Broadcast size={15} weight="bold" />
            <span>Audio Seminar</span>
          </button>
        </div>
      </div>

      {/* Render Active Studio Scene */}
      <div className="w-full">
        {activeTab === 'MAFS' && <MafsVisualizer />}
        {activeTab === 'ML_BOUNDARIES' && <VisxMlPlot />}
        {activeTab === 'MIND_MAP' && <ConceptMindMap />}
        {activeTab === 'PODCAST' && <DeepDivePlayer />}
      </div>
    </div>
  );
};
