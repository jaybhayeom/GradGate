// ==============================================================================
// SNAKE PROGRESS BAR (Tactile Animated Progress Indicator)
// Features: glossy highlight, sinusoidal wave fill edge, combo pulse >= 3
// ==============================================================================

import React from 'react';
import { motion } from 'framer-motion';

export interface SnakeProgressBarProps {
  progressPercent: number; // 0..100
  comboCount?: number;
  height?: number;
  className?: string;
  showLabel?: boolean;
}

export const SnakeProgressBar: React.FC<SnakeProgressBarProps> = ({
  progressPercent,
  comboCount = 0,
  height = 16,
  className = '',
  showLabel = false
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progressPercent));
  const isHighCombo = comboCount >= 3;

  return (
    <div className={`w-full flex items-center gap-3 ${className}`}>
      <div
        className="relative flex-1 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80 shadow-inner"
        style={{ height }}
      >
        {/* Animated Fill Bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${clampedProgress}%`,
            scaleY: isHighCombo ? [1, 1.08, 1] : 1
          }}
          transition={{
            width: { type: 'spring', stiffness: 80, damping: 15 },
            scaleY: { repeat: isHighCombo ? Infinity : 0, duration: 0.8 }
          }}
          className={`h-full relative rounded-full overflow-hidden ${
            isHighCombo
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 shadow-lg shadow-orange-500/30'
              : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
          }`}
        >
          {/* Glossy Top Glass Highlight */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/25 rounded-t-full" />

          {/* Sinusoidal Wave Edge Animation */}
          {clampedProgress > 5 && (
            <motion.div
              animate={{ x: [-20, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              className="absolute right-0 top-0 bottom-0 w-8 opacity-30 bg-gradient-to-r from-transparent to-white"
            />
          )}
        </motion.div>
      </div>

      {showLabel && (
        <span className="text-xs font-mono font-bold text-slate-400 min-w-[36px] text-right">
          {Math.round(clampedProgress)}%
        </span>
      )}

      {isHighCombo && (
        <motion.span
          initial={{ scale: 0.8 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="text-xs font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md"
        >
          {comboCount}x COMBO!
        </motion.span>
      )}
    </div>
  );
};
