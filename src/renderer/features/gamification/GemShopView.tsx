// ==============================================================================
// GEM SHOP VIEW (In-App Study Economy & Customization Hub)
// Features: Streak Protection, Immersion Study Mode, Focus Multipliers & Verified Themes
// All color schemes strictly sourced from pro-color-palettes (60-30-10 distribution)
// ==============================================================================

import React, { useState } from 'react';
import {
  Diamond,
  Snowflake,
  Lightning,
  Infinity as InfinityIcon,
  Palette,
  Check,
  CheckCircle,
  WarningCircle
} from '@phosphor-icons/react';
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
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const powerups = [
    {
      id: 'streak_freeze',
      title: 'Streak Preservation Shield',
      desc: 'Protects your daily study streak if you miss a scheduled practice day.',
      cost: 200,
      icon: <Snowflake size={26} weight="fill" className="text-cyan-400" />,
      action: onPurchaseStreakFreeze
    },
    {
      id: 'xp_boost',
      title: '15-Min 2x Focus Multiplier',
      desc: 'Doubles all XP earned in lessons and problem drills for 15 minutes of intensive study.',
      cost: 100,
      icon: <Lightning size={26} weight="fill" className="text-amber-400" />,
      action: onPurchaseXpBoost
    },
    {
      id: 'cram_mode',
      title: 'Immersion Study Mode',
      desc: '24 hours of unrestricted practice with zero heart depletion. Focus purely on deep conceptual mastery.',
      cost: 450,
      icon: <InfinityIcon size={26} weight="bold" className="text-rose-400" />,
      action: onPurchaseCramMode
    }
  ];

  // All 4 unlockable Pro Color Palettes (P60 is default unlocked)
  const themeItems: { id: ThemeId; cost: number; theme: (typeof THEMES)[ThemeId] }[] = [
    { id: 'theme_dark_oled', cost: 200, theme: THEMES.theme_dark_oled },
    { id: 'theme_cyberpunk_ai', cost: 350, theme: THEMES.theme_cyberpunk_ai },
    { id: 'theme_retro_terminal', cost: 500, theme: THEMES.theme_retro_terminal },
    { id: 'theme_ideas_amber', cost: 400, theme: THEMES.theme_ideas_amber }
  ];

  const handleBuy = (id: string, cost: number, action?: () => void): void => {
    if (gems < cost) {
      setStatusMessage({
        type: 'error',
        text: `Insufficient gems: Required ${cost} gems (Current balance: ${gems}). Complete practice drills to earn more.`
      });
      setTimeout(() => setStatusMessage(null), 4500);
      return;
    }

    action?.();
    setPurchasedItems((prev) => ({ ...prev, [id]: true }));
    setStatusMessage({
      type: 'success',
      text: `Successfully unlocked! Applied to your active profile.`
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4 md:p-6 select-none">
      {/* Header & Balance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Diamond size={28} weight="fill" className="text-cyan-400" />
            <span>Curriculum Resource Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Allocate earned study gems towards streak preservation, unrestricted immersion mode, and verified UI palettes.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-black text-base shadow-inner self-start sm:self-auto">
          <Diamond size={20} weight="fill" />
          <span>{gems}</span>
          <span className="text-[11px] text-slate-400 font-semibold uppercase ml-1">Gems</span>
        </div>
      </div>

      {/* Status Feedback Banner */}
      {statusMessage && (
        <div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800/80 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle size={18} weight="fill" className="text-emerald-400 shrink-0" />
          ) : (
            <WarningCircle size={18} weight="fill" className="text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Power-ups Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Study Power-Ups &amp; Retention Tools
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {powerups.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between gap-3.5 shadow-md hover:border-slate-700 transition"
            >
              <div className="flex flex-col gap-2.5">
                <div className="w-11 h-11 rounded-xl bg-slate-850 flex items-center justify-center shadow-inner">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-sm">{item.title}</h4>
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
                    <span className="flex items-center gap-1">
                      <Check size={14} weight="bold" /> Active
                    </span>
                  ) : (
                    'Activate'
                  )}
                </DuoButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unlockable UI Themes Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Palette size={16} weight="bold" />
            <span>Verified Pro Color Palettes (60-30-10 System)</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">WCAG AA Compliant</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {themeItems.map(({ id, cost, theme }) => (
            <div
              key={id}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-4.5 flex flex-col justify-between gap-3 shadow-md hover:border-slate-700 transition"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {theme.paletteCode}
                    </span>
                    <h4 className="font-extrabold text-white text-sm truncate">{theme.name}</h4>
                  </div>
                  {/* Swatch Mini Preview: 60% Base, 30% Surface, 10% Accent */}
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800">
                    <span
                      title="60% Base Canvas"
                      className="w-3.5 h-3.5 rounded-sm"
                      style={{ backgroundColor: theme.tokens.bg }}
                    />
                    <span
                      title="30% Surface Cards"
                      className="w-3.5 h-3.5 rounded-sm"
                      style={{ backgroundColor: theme.tokens.surface }}
                    />
                    <span
                      title="10% Action Accent"
                      className="w-3.5 h-3.5 rounded-sm border border-white/20"
                      style={{ backgroundColor: theme.tokens.accent }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {theme.tagline}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between">
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
                    <span className="flex items-center gap-1">
                      <Check size={14} weight="bold" /> Unlocked
                    </span>
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
