// ==============================================================================
// DESIGN SYSTEM PREVIEW ROUTE (/design-system)
// Interactive showcase of Tactile 3D Primitives, Themes & Web Audio Engine
// ==============================================================================

import React, { useState } from 'react';
import { DuoButton } from '../../components/ui/DuoButton';
import { SnakeProgressBar } from '../../components/ui/SnakeProgressBar';
import { FeedbackDrawer } from '../../components/ui/FeedbackDrawer';
import { AssetSlot } from '../../components/ui/AssetSlot';
import { THEMES, applyThemeVariables, type ThemeId } from '../../styles/themes';
import { soundEngine } from '../../audio/soundEngine';
import {
  Sparkle,
  Brain,
  ChartBar,
  ShieldCheck,
  CheckCircle,
  XCircle,
  SpeakerHigh
} from '@phosphor-icons/react';

export const DesignSystemPreview: React.FC = () => {
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>('theme_python_emerald');
  const [progressVal, setProgressVal] = useState<number>(45);
  const [comboCount, setComboCount] = useState<number>(3);
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);
  const [isCorrectFeedback, setIsCorrectFeedback] = useState<boolean>(true);

  const handleThemeChange = (id: ThemeId): void => {
    setCurrentThemeId(id);
    applyThemeVariables(THEMES[id]);
  };

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto p-8 pb-32">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          Tactile 3D Design System &amp; Audio Engine
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Duolingo-inspired tactile 3D physical primitives with Web Audio API sound synthesis and 4 theme palettes.
        </p>
      </div>

      {/* 1. Theme Switcher */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Theme Tokens &amp; Palettes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
            const theme = THEMES[tId];
            const isSelected = currentThemeId === tId;
            return (
              <button
                key={tId}
                type="button"
                onClick={() => handleThemeChange(tId)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">{theme.name}</span>
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{theme.tagline}</p>
                </div>
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.accentGold }}
                  />
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.danger }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Tactile 3D DuoButtons */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-6 shadow-xl">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            DuoButton (6 Variants with Spring Physics)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tactile 3D raised button with active 4px press translation and mechanical click sound.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <DuoButton variant="primary" shortcut="1">
            Primary (Emerald)
          </DuoButton>

          <DuoButton variant="secondary" shortcut="2">
            Secondary (Blue)
          </DuoButton>

          <DuoButton variant="gold" shortcut="3">
            Gold (Scale)
          </DuoButton>

          <DuoButton variant="danger" shortcut="4">
            Danger (Coral)
          </DuoButton>

          <DuoButton variant="locked">
            Locked Node
          </DuoButton>

          <DuoButton variant="ghost">
            Ghost Outline
          </DuoButton>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400">Sizes:</span>
          <DuoButton size="sm" variant="primary">Small</DuoButton>
          <DuoButton size="md" variant="primary">Medium (Default)</DuoButton>
          <DuoButton size="lg" variant="primary">Large Hero</DuoButton>
        </div>
      </section>

      {/* 3. Snake Progress Bar */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              SnakeProgressBar (Glossy Highlight &amp; Wave Edge)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sinusoidal wave fill edge with dynamic combo pulse trigger (Combo &gt;= 3).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setComboCount((c) => (c >= 5 ? 0 : c + 1))}
              className="px-2.5 py-1 text-xs rounded-xl bg-slate-800 text-amber-400 font-bold border border-slate-700"
            >
              Toggle Combo: {comboCount}x
            </button>
          </div>
        </div>

        <SnakeProgressBar progressPercent={progressVal} comboCount={comboCount} showLabel />

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-bold">Adjust Progress:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progressVal}
            onChange={(e) => setProgressVal(Number(e.target.value))}
            className="w-48 accent-emerald-500 cursor-pointer"
          />
          <span className="text-xs font-mono text-emerald-400">{progressVal}%</span>
        </div>
      </section>

      {/* 4. Web Audio Synthesizer Sound Board */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Web Audio API Polyphonic Sound Synthesizer
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pure programmatic sound synthesis without external audio files.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => soundEngine.playClick()}
            className="p-3 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition flex flex-col items-center gap-1.5"
          >
            <SpeakerHigh size={18} className="text-slate-400" />
            <span>playClick()</span>
            <span className="text-[10px] text-slate-500">Mechanical pop</span>
          </button>

          <button
            type="button"
            onClick={() => soundEngine.playCorrect()}
            className="p-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-800 text-xs font-bold text-emerald-300 transition flex flex-col items-center gap-1.5"
          >
            <CheckCircle size={18} weight="fill" className="text-emerald-400" />
            <span>playCorrect()</span>
            <span className="text-[10px] text-emerald-400/70">Rising Chime C5-E5</span>
          </button>

          <button
            type="button"
            onClick={() => soundEngine.playWrong()}
            className="p-3 rounded-2xl bg-rose-950/40 hover:bg-rose-950/60 border border-rose-800 text-xs font-bold text-rose-300 transition flex flex-col items-center gap-1.5"
          >
            <XCircle size={18} weight="fill" className="text-rose-400" />
            <span>playWrong()</span>
            <span className="text-[10px] text-rose-400/70">Muted Sawtooth F3-E3</span>
          </button>

          <button
            type="button"
            onClick={() => soundEngine.playCombo(4)}
            className="p-3 rounded-2xl bg-amber-950/40 hover:bg-amber-950/60 border border-amber-800 text-xs font-bold text-amber-300 transition flex flex-col items-center gap-1.5"
          >
            <Sparkle size={18} weight="fill" className="text-amber-400" />
            <span>playCombo(4)</span>
            <span className="text-[10px] text-amber-400/70">Harmonic Arpeggio</span>
          </button>

          <button
            type="button"
            onClick={() => soundEngine.playLevelComplete()}
            className="p-3 rounded-2xl bg-purple-950/40 hover:bg-purple-950/60 border border-purple-800 text-xs font-bold text-purple-300 transition flex flex-col items-center gap-1.5"
          >
            <ShieldCheck size={18} weight="fill" className="text-purple-400" />
            <span>playLevelComplete()</span>
            <span className="text-[10px] text-purple-400/70">Victory Fanfare</span>
          </button>
        </div>
      </section>

      {/* 5. Anti-Hallucination AssetSlot Component */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Anti-Hallucination &lt;AssetSlot /&gt; Contract
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict fallback wrapper for verified Phosphor/Lucide vector icons.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <AssetSlot
            id="slot_dsa_binary_tree"
            fallbackIcon={<Brain size={24} className="text-emerald-400" />}
            label="DSA Tree"
          />
          <AssetSlot
            id="slot_linear_algebra_matrix"
            fallbackIcon={<ChartBar size={24} className="text-blue-400" />}
            label="Matrix SVD"
          />
          <AssetSlot
            id="slot_ai_search_agent"
            fallbackIcon={<Sparkle size={24} className="text-amber-400" />}
            label="A* Search"
          />
        </div>
      </section>

      {/* 6. Feedback Drawer Trigger Controls */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            FeedbackDrawer Trigger Test
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click to test sliding bottom feedback drawer with sound effects and KaTeX derivation.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <DuoButton
            variant="primary"
            onClick={() => {
              setIsCorrectFeedback(true);
              setFeedbackOpen(true);
            }}
          >
            Trigger Correct Sheet (Green)
          </DuoButton>

          <DuoButton
            variant="danger"
            onClick={() => {
              setIsCorrectFeedback(false);
              setFeedbackOpen(true);
            }}
          >
            Trigger Incorrect Sheet (Red + KaTeX)
          </DuoButton>
        </div>
      </section>

      {/* Render Feedback Drawer */}
      <FeedbackDrawer
        isOpen={feedbackOpen}
        isCorrect={isCorrectFeedback}
        xpEarned={15}
        comboCount={comboCount}
        correctAnswerText="Option (C): \lambda_1 = 4, \lambda_2 = 1"
        solutionLatex="\text{Characteristic Eq: } \det(A - \lambda I) = 0 \implies \lambda^2 - 5\lambda + 4 = 0 \implies (\lambda - 4)(\lambda - 1) = 0"
        onContinue={() => setFeedbackOpen(false)}
        onAddToMistakes={() => alert('Saved to Mistakes Vault in user_profile.db')}
      />
    </div>
  );
};
