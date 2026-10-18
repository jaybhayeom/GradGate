// ==============================================================================
// MISTAKE REPAIR MODAL (Zero-Hearts Recovery & Targeted Review)
// Triggered when user runs out of hearts or practices failed questions.
// ==============================================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Wrench, Sparkle, ArrowRight } from '@phosphor-icons/react';
import { DuoButton } from '../../components/ui/DuoButton';
import type { MistakesVaultItem } from '../../../shared/types';

export interface MistakeRepairModalProps {
  isOpen: boolean;
  mistakes: MistakesVaultItem[];
  onClose: () => void;
  onStartRepairDrill: () => void;
}

export const MistakeRepairModal: React.FC<MistakeRepairModalProps> = ({
  isOpen,
  mistakes,
  onClose,
  onStartRepairDrill
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 240 }}
            className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-8 shadow-2xl flex flex-col items-center text-center gap-6"
          >
            {/* Header Icon */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-500 shadow-inner">
                <Heart size={44} weight="fill" className="animate-pulse" />
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-amber-500 text-slate-950 font-black shadow-md">
                <Wrench size={16} weight="fill" />
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-black text-white tracking-tight">Out of Hearts!</h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                Repair 5 mistakes from your personal vault to refill your hearts to 5/5 and protect your daily streak.
              </p>
            </div>

            {/* Mistakes Vault Summary */}
            <div className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-rose-950/60 text-rose-400 font-bold border border-rose-900/60">
                  {mistakes.length}
                </span>
                <div className="text-left">
                  <span className="font-bold text-slate-200">Vault Questions Pending</span>
                  <p className="text-[11px] text-slate-400">Targeted review from failed drills</p>
                </div>
              </div>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                +5 Hearts <Sparkle size={14} weight="fill" />
              </span>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-3">
              <DuoButton
                variant="primary"
                size="lg"
                fullWidth
                onClick={onStartRepairDrill}
                icon={<ArrowRight size={20} weight="bold" />}
              >
                Start Mistake Drill
              </DuoButton>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5"
              >
                <X size={14} weight="bold" />
                <span>Return to Learning Path</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
