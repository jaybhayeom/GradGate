// ==============================================================================
// TOP STAT HUD (Persistent Status & Gamification Header Bar)
// Features: Subject Selector, Streak Flame, Gems, Hearts meter, Audio Mute, OTA Status Pill
// ==============================================================================

import React, { useState } from 'react';
import {
  Flame,
  Diamond,
  Heart,
  CloudCheck,
  CloudSlash,
  SpeakerHigh,
  SpeakerSimpleSlash,
  CaretDown
} from '@phosphor-icons/react';
import { soundEngine } from '../../audio/soundEngine';
import type { SyllabusSection, UserStats } from '../../../shared/types';

export interface TopStatHudProps {
  sections: SyllabusSection[];
  selectedSectionId?: string;
  onSelectSection?: (sectionId: string) => void;
  userStats: UserStats | null;
  isOnline?: boolean;
  onOpenGemShop?: () => void;
  onOpenHeartsRefill?: () => void;
}

export const TopStatHud: React.FC<TopStatHudProps> = ({
  sections,
  selectedSectionId,
  onSelectSection,
  userStats,
  isOnline = true,
  onOpenGemShop,
  onOpenHeartsRefill
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || sections[0];

  const toggleMute = (): void => {
    const nextMuted = !isMuted;
    soundEngine.setMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  const isInfiniteHearts = Boolean(
    userStats?.cram_mode_until && new Date(userStats.cram_mode_until) > new Date()
  );

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left: App Logo & Subject Dropdown */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#58CC02] border-b-2 border-[#46A302] flex items-center justify-center font-black text-slate-950 text-lg shadow-sm">
            G
          </div>
          <span className="font-extrabold text-white text-base tracking-tight hidden sm:inline">
            GradGate
          </span>
        </div>

        {/* Subject Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-850 border border-slate-700/80 text-xs font-bold text-slate-200 transition shadow-sm"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: selectedSection?.color_hex || '#10B981' }}
            />
            <span className="max-w-[140px] truncate">{selectedSection?.short_title || 'Select Subject'}</span>
            <CaretDown size={14} weight="bold" className="text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 overflow-hidden">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                GATE DA Subjects
              </div>
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    onSelectSection?.(sec.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition ${
                    sec.id === selectedSection?.id
                      ? 'bg-slate-800 text-emerald-400 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sec.color_hex }} />
                  <span className="truncate">{sec.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Gamification Stats HUD */}
      <div className="flex items-center gap-3">
        {/* Streak Flame */}
        <div
          title="Daily Study Streak"
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-black text-orange-400 shadow-sm"
        >
          <Flame size={18} weight="fill" className="text-orange-500" />
          <span>{userStats?.current_streak ?? 0}</span>
        </div>

        {/* Gems */}
        <button
          type="button"
          onClick={onOpenGemShop}
          title="Gem Balance — Click to open Gem Shop"
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-xs font-black text-cyan-400 transition shadow-sm"
        >
          <Diamond size={18} weight="fill" className="text-cyan-400" />
          <span>{userStats?.gems ?? 150}</span>
        </button>

        {/* Hearts */}
        <button
          type="button"
          onClick={onOpenHeartsRefill}
          title="Hearts — Click to refill or practice mistakes"
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-xs font-black text-rose-400 transition shadow-sm"
        >
          <Heart size={18} weight="fill" className="text-rose-500" />
          <span>{isInfiniteHearts ? '∞' : `${userStats?.hearts ?? 5}/5`}</span>
        </button>

        {/* Audio Mute Toggle */}
        <button
          type="button"
          onClick={toggleMute}
          title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-slate-300 transition"
        >
          {isMuted ? (
            <SpeakerSimpleSlash size={16} weight="bold" className="text-slate-400" />
          ) : (
            <SpeakerHigh size={16} weight="bold" className="text-emerald-400" />
          )}
        </button>

        {/* OTA / Offline Status Pill */}
        <div
          title={isOnline ? 'Connected to GitHub OTA Sync Engine' : 'Offline Mode (Local SQLite Active)'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
            isOnline
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          {isOnline ? (
            <>
              <CloudCheck size={14} weight="bold" />
              <span className="hidden sm:inline">Online</span>
            </>
          ) : (
            <>
              <CloudSlash size={14} weight="bold" />
              <span className="hidden sm:inline">Offline</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
