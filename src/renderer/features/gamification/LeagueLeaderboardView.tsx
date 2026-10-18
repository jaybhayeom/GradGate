// ==============================================================================
// LEAGUE LEADERBOARD VIEW (Duolingo-grade 30-Slot Competitive Tiers)
// Tiers: Bronze, Silver, Gold, Obsidian, Diamond
// Features: Deterministic simulated IIT/IISc aspirants, Promotion & Demotion zones
// ==============================================================================

import React, { useMemo, useState } from 'react';
import { Trophy, Medal, ArrowUp, ArrowDown, User, ShieldCheck } from '@phosphor-icons/react';
import type { LeagueTier, UserStats } from '../../../shared/types';

export interface LeagueLeaderboardViewProps {
  userStats: UserStats | null;
}

interface Competitor {
  rank: number;
  id: string;
  name: string;
  targetInstitute: string;
  xp: number;
  isCurrentUser: boolean;
}

const ASPIRANT_NAMES = [
  { name: 'Aarav Sharma', target: 'IISc Computational & Data Science' },
  { name: 'Pooja Patel', target: 'IIT Bombay Data Science' },
  { name: 'Rohan Gupta', target: 'IIT Madras AI & Robotics' },
  { name: 'Sneha Roy', target: 'IIT Delhi Machine Learning' },
  { name: 'Vikram Iyer', target: 'IIT Kanpur Algorithmics' },
  { name: 'Ananya Deshmukh', target: 'IIT Kharagpur Data Eng' },
  { name: 'Karthik Nair', target: 'IISc Deep Learning Lab' },
  { name: 'Meera Sen', target: 'IIT Roorkee AI' },
  { name: 'Aditya Verma', target: 'IIT Guwahati ML' },
  { name: 'Tanvi Joshi', target: 'IIT Hyderabad AI Dept' },
  { name: 'Siddharth Rao', target: 'IIT BHU Computer Science' },
  { name: 'Divya Menon', target: 'IISc Mathematics & AI' },
  { name: 'Harsh Agarwal', target: 'IIT Indore Data Science' },
  { name: 'Neha Kulkarni', target: 'IIT Madras CDS' },
  { name: 'Manish Pandey', target: 'IIT Bombay CSE' },
  { name: 'Ritu Bhattacharya', target: 'IIT Delhi AI Research' },
  { name: 'Gaurav Jain', target: 'IIT Kanpur Data Analytics' },
  { name: 'Sanjana Reddy', target: 'IIT Kharagpur CSE' },
  { name: 'Varun Nair', target: 'IISc Quantum & AI' },
  { name: 'Priyanka Das', target: 'IIT Roorkee DS' },
  { name: 'Akash Sinha', target: 'IIT Guwahati AI' },
  { name: 'Swati Pillai', target: 'IIT Hyderabad Vision Lab' },
  { name: 'Kunal Malhotra', target: 'IIT Gandhinagar CS' },
  { name: 'Ishita Ganguly', target: 'IIT Ropar AI' },
  { name: 'Deepak Choudhary', target: 'IIT Jodhpur DS' },
  { name: 'Shreya Saxena', target: 'IIT Patna CSE' },
  { name: 'Nikhil Venkatesh', target: 'IIT Mandi AI' },
  { name: 'Bhavna Chawla', target: 'IIT Tirupati CS' },
  { name: 'Suresh Kumar', target: 'IIT Palakkad DS' }
];

const TIER_COLORS: Record<LeagueTier, { border: string; bg: string; badge: string }> = {
  BRONZE: { border: 'border-amber-700', bg: 'from-amber-900/30 to-amber-950/20', badge: '#CD7F32' },
  SILVER: { border: 'border-slate-400', bg: 'from-slate-700/30 to-slate-900/20', badge: '#C0C0C0' },
  GOLD: { border: 'border-amber-400', bg: 'from-amber-600/30 to-yellow-950/20', badge: '#FFD700' },
  OBSIDIAN: { border: 'border-purple-600', bg: 'from-purple-900/30 to-slate-950/20', badge: '#9333EA' },
  DIAMOND: { border: 'border-cyan-400', bg: 'from-cyan-900/30 to-blue-950/20', badge: '#00F0FF' }
};

export const LeagueLeaderboardView: React.FC<LeagueLeaderboardViewProps> = ({ userStats }) => {
  const currentTier = userStats?.current_league || 'BRONZE';
  const [selectedTier, setSelectedTier] = useState<LeagueTier>(currentTier);

  // Generate deterministic competitors around the user's XP
  const leaderboardData = useMemo(() => {
    const userXp = userStats?.xp ?? 0;
    const baseMultiplier = {
      BRONZE: 1.0,
      SILVER: 1.8,
      GOLD: 2.8,
      OBSIDIAN: 4.2,
      DIAMOND: 6.5
    }[selectedTier];

    const competitors: Competitor[] = ASPIRANT_NAMES.map((asp, idx) => {
      // Deterministic pseudo-random based on index and tier
      const hash = (idx * 9301 + 49297) % 233280;
      const spread = (hash / 233280) * 400 - 200;
      const xp = Math.max(50, Math.round((450 + (29 - idx) * 35 + spread) * baseMultiplier));
      return {
        rank: 0,
        id: `comp_${idx}`,
        name: asp.name,
        targetInstitute: asp.target,
        xp,
        isCurrentUser: false
      };
    });

    // Add current user if viewing their current tier
    if (selectedTier === currentTier) {
      competitors.push({
        rank: 0,
        id: 'current_user',
        name: `${userStats?.display_name || 'You'} (Current User)`,
        targetInstitute: 'Target: Top 100 AIR in GATE DA',
        xp: userXp,
        isCurrentUser: true
      });
    }

    // Sort descending by XP
    competitors.sort((a, b) => b.xp - a.xp);

    // Assign final ranks 1..30
    return competitors.slice(0, 30).map((c, i) => ({ ...c, rank: i + 1 }));
  }, [userStats, selectedTier, currentTier]);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto p-8 select-none">
      {/* Tier Selection Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Trophy size={28} weight="fill" className="text-amber-400" />
            <span>GATE Aspirants League</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Top 10 promote to the next tier every Sunday. Realistic offline simulated IIT aspirants.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          {(['BRONZE', 'SILVER', 'GOLD', 'OBSIDIAN', 'DIAMOND'] as LeagueTier[]).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                selectedTier === tier
                  ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {leaderboardData.slice(0, 3).map((lead, i) => {
          const podiumColor = i === 0 ? 'text-amber-400 border-amber-500/40' : i === 1 ? 'text-slate-300 border-slate-400/40' : 'text-amber-600 border-amber-700/40';
          return (
            <div
              key={lead.id}
              className={`rounded-3xl bg-slate-900 border p-5 flex flex-col items-center text-center gap-2 shadow-lg ${podiumColor}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-850 flex items-center justify-center text-xl font-black">
                <Medal size={28} weight="fill" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Rank #{lead.rank}
              </span>
              <h4 className="font-bold text-white text-sm truncate max-w-full">{lead.name}</h4>
              <p className="text-[11px] text-slate-400 truncate max-w-full">{lead.targetInstitute}</p>
              <span className="mt-1 px-3 py-0.5 rounded-full bg-slate-950 text-emerald-400 font-black text-xs border border-slate-800">
                {lead.xp} XP
              </span>
            </div>
          );
        })}
      </div>

      {/* 30-Slot Full List Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
        {/* Table Header */}
        <div className="px-6 py-3 bg-slate-850/80 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
          <div className="flex items-center gap-6">
            <span className="w-8 text-center">Rank</span>
            <span>Aspirant Name &amp; Target</span>
          </div>
          <span>Total Weekly XP</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-800/60 max-h-[480px] overflow-y-auto">
          {leaderboardData.map((row) => {
            const isPromotion = row.rank <= 10;
            const isDemotion = row.rank > 25 && selectedTier !== 'BRONZE';

            return (
              <div
                key={row.id}
                className={`px-6 py-3.5 flex items-center justify-between transition ${
                  row.isCurrentUser
                    ? 'bg-emerald-950/40 border-l-4 border-emerald-500 font-bold'
                    : 'hover:bg-slate-850/40'
                }`}
              >
                <div className="flex items-center gap-6">
                  {/* Rank Badge */}
                  <div className="w-8 flex items-center justify-center font-mono font-black text-xs">
                    {row.rank <= 3 ? (
                      <span className="text-amber-400">#{row.rank}</span>
                    ) : (
                      <span className="text-slate-400">#{row.rank}</span>
                    )}
                  </div>

                  {/* Name and Target */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          row.isCurrentUser ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {row.name}
                      </span>
                      {isPromotion && (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                          <ArrowUp size={12} weight="bold" />
                          <span>Promote</span>
                        </span>
                      )}
                      {isDemotion && (
                        <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-0.5">
                          <ArrowDown size={12} weight="bold" />
                          <span>Demote</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{row.targetInstitute}</span>
                  </div>
                </div>

                {/* XP Count */}
                <span className="font-mono font-black text-xs text-emerald-400">
                  {row.xp} XP
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
