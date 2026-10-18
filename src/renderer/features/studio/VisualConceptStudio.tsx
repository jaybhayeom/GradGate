// ==============================================================================
// VISUAL CONCEPT STUDIO
// Unified visual studio hub hosting:
//   1. 3Blue1Brown-style Mafs 2D coordinate/matrix transformations.
//   2. Visx 2D Machine Learning Decision Boundaries.
//   3. Prerequisite Knowledge Mind Map (@xyflow/react).
//   4. 2-Host Deep Dive Audio Podcast Player.
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
    <div className="flex flex-col gap-8 max-w-5xl mx-auto p-8 select-none">
      {/* Studio Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            NotebookLM Visual Teaching Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Intuitive visual mathematics, 2D ML boundary simulation, and synchronized 2-host audio.
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
            <Compass size={16} weight="bold" />
            <span>Mafs 2D Math</span>
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
            <Brain size={16} weight="bold" />
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
            <GitFork size={16} weight="bold" />
            <span>Mind Map</span>
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
            <Broadcast size={16} weight="bold" />
            <span>Deep Dive Podcast</span>
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
