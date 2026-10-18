// ==============================================================================
// GEM SHOP VIEW (In-App Gamification Economy)
// Spend Gems on: Streak Freezes, 2x XP Boosts, Super Cram Mode & Themes
// ==============================================================================

import React, { useState } from 'react';
import { Diamond, Snowflake, Lightning, Infinity as InfinityIcon, Palette, Check } from '@phosphor-icons/react';
import { DuoButton } from '../../components/ui/DuoButton';
import { THEMES, type ThemeId } from '../../styles/themes';
import type { UserStats } from '../../../shared/types';

export interface GemShopViewProps {
  userStats: UserStats | null;
  onPurchaseStreakFreeze?: () => void;
  onPurchaseCramMode?: () => void;
  onPurchaseXpBoost?: () => void;
  onPurchaseTheme?: (themeId: ThemeId) => void;
}

export const GemShopView: React.FC<GemShopViewProps> = ({
  userStats,
  onPurchaseStreakFreeze,
  onPurchaseCramMode,
  onPurchaseXpBoost,
  onPurchaseTheme
}) => {
  const gems = userStats?.gems ?? 150;
  const [purchasedItems, setPurchasedItems] = useState<Record<string, boolean>>({});

  const powerups = [
    {
      id: 'streak_freeze',
      title: 'Streak Freeze',
      desc: 'Protects your daily study streak if you miss a day of practice.',
      cost: 200,
      icon: <Snowflake size={28} weight="fill" className="text-cyan-400" />,
      action: onPurchaseStreakFreeze
    },
    {
      id: 'xp_boost',
      title: '15-Min 2x XP Boost',
      desc: 'Doubles all XP earned in lessons and quizzes for the next 15 minutes.',
      cost: 100,
      icon: <Lightning size={28} weight="fill" className="text-amber-400" />,
      action: onPurchaseXpBoost
    },
    {
      id: 'cram_mode',
      title: 'Super Cram Mode',
      desc: '24 hours of Infinite Hearts! Answer without fear of running out of lives.',
      cost: 450,
      icon: <InfinityIcon size={28} weight="bold" className="text-rose-400" />,
      action: onPurchaseCramMode
    }
  ];

  const themes = [
    { id: 'theme_dark_oled' as ThemeId, cost: 200, theme: THEMES.theme_dark_oled },
    { id: 'theme_cyberpunk_ai' as ThemeId, cost: 350, theme: THEMES.theme_cyberpunk_ai },
    { id: 'theme_retro_terminal' as ThemeId, cost: 500, theme: THEMES.theme_retro_terminal }
  ];

  const handleBuy = (id: string, cost: number, action?: () => void): void => {
    if (gems < cost) {
      alert(`Need ${cost} gems! You currently have ${gems} gems.`);
      return;
    }
    action?.();
    setPurchasedItems((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto p-8 select-none">
      {/* Header & Balance */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Diamond size={30} weight="fill" className="text-cyan-400" />
            <span>Gem Shop</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Spend earned gems on streak protection, cram mode, and exclusive themes.
          </p>
        </div>

        <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-400 font-black text-lg shadow-inner">
          <Diamond size={22} weight="fill" />
          <span>{gems}</span>
          <span className="text-xs text-slate-400 font-semibold uppercase ml-1">Gems</span>
        </div>
      </div>

      {/* Power-ups Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Study Power-Ups &amp; Boosters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {powerups.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between gap-4 shadow-lg hover:border-slate-700 transition"
            >
              <div className="flex flex-col gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-850 flex items-center justify-center shadow-inner">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-black text-cyan-400 flex items-center gap-1">
                  <Diamond size={14} weight="fill" />
                  {item.cost}
                </span>

                <DuoButton
                  size="sm"
                  variant={gems >= item.cost ? 'gold' : 'locked'}
                  onClick={() => handleBuy(item.id, item.cost, item.action)}
                >
                  {purchasedItems[item.id] ? (
                    <span className="flex items-center gap-1"><Check size={14} weight="bold" /> Owned</span>
                  ) : (
                    'Equip'
                  )}
                </DuoButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unlockable UI Themes Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <Palette size={16} weight="bold" />
          <span>Unlockable UI Themes</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map(({ id, cost, theme }) => (
            <div
              key={id}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between gap-4 shadow-lg hover:border-slate-700 transition"
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-white text-base">{theme.name}</h4>
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{theme.tagline}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-black text-cyan-400 flex items-center gap-1">
                  <Diamond size={14} weight="fill" />
                  {cost}
                </span>

                <DuoButton
                  size="sm"
                  variant={gems >= cost ? 'primary' : 'locked'}
                  onClick={() => handleBuy(id, cost, () => onPurchaseTheme?.(id))}
                >
                  {purchasedItems[id] ? (
                    <span className="flex items-center gap-1"><Check size={14} weight="bold" /> Unlocked</span>
                  ) : (
                    'Unlock'
                  )}
                </DuoButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
