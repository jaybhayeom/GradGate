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
  // Sinusoidal path coordinates generator for 1920x1080 desktop layout
  const getNodePosition = (index: number): { x: number; y: number } => {
    const center = 280;
    const amplitude = 145;
    const frequency = 1.05;
    const stepY = 115;
    const startY = 80;

    const x = center + Math.sin(index * frequency) * amplitude;
    const y = startY + index * stepY;
    return { x, y };
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-6 select-none">
      {units.map((unit, unitIdx) => {
        const unitNodes = nodesByUnit[unit.id] || [];
        const totalHeight = Math.max(220, (unitNodes.length || 1) * 115 + 130);

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
          <div key={unit.id} className="w-full flex flex-col items-center mb-14">
            {/* Unit Sticky Header Banner (Duolingo 3D Block Style) */}
            <div className="w-full rounded-3xl bg-[#58CC02] border-b-6 border-[#46A302] p-7 md:p-8 shadow-xl text-slate-950 mb-10">
              <div className="flex items-center justify-between gap-6">
                <div className="flex flex-col gap-1.5 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-black/20 text-white">
                      Unit {unitIdx + 1}
                    </span>
                    <span className="text-xs text-emerald-950 font-black tracking-wide">{unitNodes.length} Lessons</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-white">{unit.title}</h3>
                  <p className="text-xs md:text-sm text-emerald-950 font-bold line-clamp-2 leading-relaxed">{unit.description}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenGuidebook?.(unit)}
                    className="px-5 py-3 rounded-2xl bg-[#46A302] hover:bg-[#3d8f02] border-b-4 border-[#337502] text-white text-xs font-black uppercase tracking-wider transition flex items-center gap-2 shadow-md active:translate-y-1 active:border-b-0"
                  >
                    <BookOpen size={18} weight="bold" />
                    <span>Guidebook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenLectures?.(unit)}
                    className="px-4 py-3 rounded-2xl bg-black/20 hover:bg-black/30 border-b-4 border-black/30 text-white text-xs font-black uppercase tracking-wider transition flex items-center gap-2 shadow-md active:translate-y-1 active:border-b-0"
                  >
                    <VideoCamera size={18} weight="bold" />
                    <span>Lectures</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sinusoidal Path Area (Generous 560px Desktop Canvas) */}
            <div className="relative w-[560px]" style={{ height: totalHeight }}>
              {/* SVG Connecting Paths */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={`0 0 560 ${totalHeight}`}
              >
                {/* Background Tube Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="16"
                  strokeLinecap="round"
                />

                {/* Animated Completed Trail */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#58CC02"
                  strokeWidth="10"
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
                    {/* Bouncing "START" Speech Bubble on Current Active Node */}
                    {isCurrent && (
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                        className="speech-bubble absolute -top-12 px-4 py-1.5 rounded-2xl bg-white text-slate-950 text-xs font-black uppercase tracking-wider shadow-xl flex items-center gap-1.5 z-20 border-2 border-slate-200"
                      >
                        <Sparkle size={15} weight="fill" className="text-amber-500" />
                        <span>START</span>
                        <span className="text-[#58CC02] font-black">+15 XP</span>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-white"></div>
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
                        ${isBoss ? 'w-24 h-24 text-3xl' : 'w-[80px] h-[80px] text-2xl'}
                        ${
                          isCompleted
                            ? 'bg-[#FFC800] border-b-6 border-[#E5A500] text-slate-950 active:border-b-0 active:translate-y-[6px] shadow-lg shadow-amber-500/20'
                            : isCurrent
                            ? 'bg-[#58CC02] border-b-6 border-[#46A302] text-white active:border-b-0 active:translate-y-[6px] shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-500/30'
                            : isLocked
                            ? 'bg-[#2B3D45] border-b-6 border-[#202F36] text-slate-400 cursor-not-allowed opacity-80'
                            : 'bg-[#1CB0F6] border-b-6 border-[#1899D6] text-white active:border-b-0 active:translate-y-[6px]'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check size={32} weight="bold" />
                      ) : isLocked ? (
                        <Lock size={24} weight="fill" />
                      ) : isBoss ? (
                        <Trophy size={32} weight="fill" />
                      ) : (
                        <Star size={28} weight="fill" />
                      )}
                    </button>

                    {/* Node Title Badge */}
                    <span className="mt-2.5 text-xs font-extrabold text-slate-300 max-w-[140px] text-center truncate">
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
