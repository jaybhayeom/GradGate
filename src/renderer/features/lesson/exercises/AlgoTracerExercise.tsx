// ==============================================================================
// ALGO TRACER EXERCISE (Interactive Graph/Tree Step-Through Sequence Clicker)
// Uses @xyflow/react to render search trees & graph traversals (BFS, DFS, Dijkstra, A*)
// ==============================================================================

import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import katex from 'katex';
import { soundEngine } from '../../../audio/soundEngine';
import { ArrowCounterClockwise } from '@phosphor-icons/react';

export interface AlgoGraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface AlgoGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface AlgoTracerExerciseProps {
  promptLatex: string;
  graphNodes: AlgoGraphNode[];
  graphEdges: AlgoGraphEdge[];
  clickedSequence: string[];
  onSequenceChange: (seq: string[]) => void;
  disabled?: boolean;
}

export const AlgoTracerExercise: React.FC<AlgoTracerExerciseProps> = ({
  promptLatex,
  graphNodes,
  graphEdges,
  clickedSequence,
  onSequenceChange,
  disabled = false
}) => {
  const handleNodeClick = (_: React.MouseEvent, node: Node): void => {
    if (disabled || clickedSequence.includes(node.id)) return;
    soundEngine.playClick();
    onSequenceChange([...clickedSequence, node.id]);
  };

  const handleUndo = (): void => {
    if (disabled || clickedSequence.length === 0) return;
    soundEngine.playClick();
    onSequenceChange(clickedSequence.slice(0, -1));
  };

  const renderLatex = (content: string): string => {
    try {
      return katex.renderToString(content, { throwOnError: false, displayMode: false });
    } catch {
      return content;
    }
  };

  // Convert to ReactFlow Nodes
  const flowNodes: Node[] = graphNodes.map((n) => {
    const seqIndex = clickedSequence.indexOf(n.id);
    const isVisited = seqIndex !== -1;

    return {
      id: n.id,
      position: { x: n.x, y: n.y },
      data: {
        label: (
          <div className="flex flex-col items-center justify-center p-2">
            <span className="font-mono font-bold text-sm">{n.label}</span>
            {isVisited && (
              <span className="mt-1 px-1.5 py-0.2 rounded-full bg-slate-950 text-emerald-400 font-mono font-black text-[10px] border border-emerald-400">
                Step #{seqIndex + 1}
              </span>
            )}
          </div>
        )
      },
      style: {
        background: isVisited ? '#10B981' : '#1E293B',
        color: isVisited ? '#022C22' : '#F8FAFC',
        border: isVisited ? '2px solid #34D399' : '2px solid #475569',
        borderRadius: '16px',
        width: 80,
        height: 60,
        boxShadow: isVisited ? '0 0 16px rgba(16, 185, 129, 0.4)' : 'none',
        cursor: isVisited ? 'default' : 'pointer'
      }
    };
  });

  const flowEdges: Edge[] = graphEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: true,
    style: { stroke: '#64748B', strokeWidth: 2 }
  }));

  return (
    <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto select-none">
      {/* Prompt */}
      <div
        className="text-base text-slate-100 font-medium leading-relaxed overflow-x-auto p-4 rounded-2xl bg-slate-900 border border-slate-800"
        dangerouslySetInnerHTML={{ __html: renderLatex(promptLatex) }}
      />

      {/* Sequence Bar & Undo */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Visited Path:</span>
          {clickedSequence.length === 0 ? (
            <span className="text-slate-500 italic">Click nodes in traversal order...</span>
          ) : (
            clickedSequence.map((nodeId, idx) => (
              <span
                key={nodeId}
                className="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-400 font-mono font-bold border border-emerald-800 flex items-center gap-1"
              >
                <span>{nodeId}</span>
                {idx < clickedSequence.length - 1 && <span className="text-slate-500">&rarr;</span>}
              </span>
            ))
          )}
        </div>

        <button
          type="button"
          disabled={disabled || clickedSequence.length === 0}
          onClick={handleUndo}
          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold flex items-center gap-1 transition"
        >
          <ArrowCounterClockwise size={14} weight="bold" />
          <span>Undo</span>
        </button>
      </div>

      {/* ReactFlow Interactive Canvas Container */}
      <div className="w-full h-80 rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner relative">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodeClick={handleNodeClick}
          nodesDraggable={false}
          panOnDrag={true}
          zoomOnScroll={false}
          fitView
        >
          <Background color="#334155" gap={16} />
          <Controls showInteractive={false} className="bg-slate-900 border-slate-800 text-slate-300" />
        </ReactFlow>
      </div>
    </div>
  );
};
