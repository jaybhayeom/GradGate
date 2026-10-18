// ==============================================================================
// WINDING SNAKE PATH (Duolingo-style Sinusoidal Learning Path Map)
// Features:
//   1. Mathematically smooth sinusoidal layout: x = center + amplitude * sin(index * freq)
//   2. Unit sticky header banners with Guidebook/Visual Studio & Lecture buttons.
//   3. 4 Node states: LOCKED, ACTIVE_CURRENT, COMPLETED_GOLD, BOSS_CHECKPOINT.
//   4. Glowing animated trail connecting completed nodes.
// ==============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, Star, Trophy, BookOpen, VideoCamera, Sparkle } from '@phosphor-icons/react';
import { soundEngine } from '../../audio/soundEngine';
import type { Unit, SteppingNode, NodeProgress } from '../../../shared/types';

export interface QuestMapViewProps {
  units: Unit[];
  nodesByUnit: Record<string, SteppingNode[]>;
  nodeProgress: Record<string, NodeProgress>;
  activeNodeId?: string;
  onSelectNode: (node: SteppingNode) => void;
  onOpenGuidebook?: (unit: Unit) => void;
  onOpenLectures?: (unit: Unit) => void;
}

export const QuestMapView: React.FC<QuestMapViewProps> = ({
  units,
  nodesByUnit,
  nodeProgress,
  activeNodeId,
  onSelectNode,
  onOpenGuidebook,
  onOpenLectures
}) => {
  // Sinusoidal path coordinates generator
  const getNodePosition = (index: number): { x: number; y: number } => {
    const center = 180;
    const amplitude = 85;
    const frequency = 1.05;
    const stepY = 100;
    const startY = 70;

    const x = center + Math.sin(index * frequency) * amplitude;
    const y = startY + index * stepY;
    return { x, y };
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto py-8 select-none">
      {units.map((unit, unitIdx) => {
        const unitNodes = nodesByUnit[unit.id] || [];
        const totalHeight = Math.max(180, (unitNodes.length || 1) * 100 + 100);

        // Build SVG path data for connecting nodes
        const points = unitNodes.map((_, i) => getNodePosition(i));
        let pathD = '';
        if (points.length > 0) {
          pathD = `M ${points[0].x} ${points[0].y}`;
          for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const midY = (p1.y + p2.y) / 2;
            pathD += ` C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;
          }
        }

        return (
          <div key={unit.id} className="w-full flex flex-col items-center mb-12">
            {/* Unit Sticky Header Banner */}
            <div className="w-full rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 shadow-2xl border border-emerald-400/40 text-white mb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/25 border border-white/20">
                      Unit {unitIdx + 1}
                    </span>
                    <span className="text-xs text-emerald-100 font-semibold">{unitNodes.length} Lessons</span>
                  </div>
                  <h3 className="text-xl font-black tracking-tight">{unit.title}</h3>
                  <p className="text-xs text-emerald-100/90 line-clamp-2 leading-relaxed">{unit.description}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenGuidebook?.(unit)}
                    className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/10 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 shadow-sm"
                  >
                    <BookOpen size={16} weight="bold" />
                    <span>Guidebook &amp; Studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenLectures?.(unit)}
                    className="px-3.5 py-2 rounded-xl bg-black/30 hover:bg-black/40 active:bg-black/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10 shadow-sm"
                  >
                    <VideoCamera size={16} weight="bold" />
                    <span>Lectures</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sinusoidal Path Area */}
            <div className="relative w-[360px]" style={{ height: totalHeight }}>
              {/* SVG Connecting Paths */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={`0 0 360 ${totalHeight}`}
              >
                {/* Background Tube Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="14"
                  strokeLinecap="round"
                />

                {/* Animated Completed Trail */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#58CC02"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="opacity-70"
                />
              </svg>

              {/* Stepping Nodes */}
              {unitNodes.map((node, nodeIdx) => {
                const pos = getNodePosition(nodeIdx);
                const progress = nodeProgress[node.id];
                const isCurrent = activeNodeId ? node.id === activeNodeId : nodeIdx === 0 && !progress;
                const isCompleted = progress?.status === 'COMPLETED_GOLD' || progress?.status === 'COMPLETED_BRONZE';
                const isBoss = node.node_type === 'BOSS_MOCK' || nodeIdx === unitNodes.length - 1;
                const isLocked = !isCurrent && !isCompleted && nodeIdx > 0 && !nodeProgress[unitNodes[nodeIdx - 1]?.id];

                return (
                  <div
                    key={node.id}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {/* Bouncing "START" Banner on Current Active Node */}
                    {isCurrent && (
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                        className="absolute -top-10 px-3 py-1 rounded-xl bg-white text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1 z-20 border-2 border-[#58CC02]"
                      >
                        <Sparkle size={14} weight="fill" className="text-amber-500" />
                        <span>START</span>
                      </motion.div>
                    )}

                    {/* 3D Stepping Stone Button */}
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => {
                        if (!isLocked) {
                          soundEngine.playClick();
                          onSelectNode(node);
                        }
                      }}
                      className={`
                        relative flex items-center justify-center rounded-full transition-all duration-75
                        focus:outline-none select-none z-10
                        ${isBoss ? 'w-20 h-20 text-2xl' : 'w-16 h-16 text-xl'}
                        ${
                          isCompleted
                            ? 'bg-[#FFC800] border-b-4 border-[#E5A500] text-slate-950 active:border-b-0 active:translate-y-[4px] shadow-lg shadow-amber-500/20'
                            : isCurrent
                            ? 'bg-[#58CC02] border-b-4 border-[#46A302] text-white active:border-b-0 active:translate-y-[4px] shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/30'
                            : isLocked
                            ? 'bg-slate-800 border-b-4 border-slate-900 text-slate-500 cursor-not-allowed opacity-75'
                            : 'bg-[#1CB0F6] border-b-4 border-[#1899D6] text-white active:border-b-0 active:translate-y-[4px]'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check size={28} weight="bold" />
                      ) : isLocked ? (
                        <Lock size={22} weight="fill" />
                      ) : isBoss ? (
                        <Trophy size={28} weight="fill" />
                      ) : (
                        <Star size={24} weight="fill" />
                      )}
                    </button>

                    {/* Node Title Badge */}
                    <span className="mt-2 text-[11px] font-bold text-slate-300 max-w-[120px] text-center truncate">
                      {node.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
