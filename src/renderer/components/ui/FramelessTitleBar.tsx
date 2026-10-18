// ==============================================================================
// FRAMELESS TITLE BAR (Custom Native Electron Window Bar & Shortcuts Modal)
// Features: draggable top bar, keyboard shortcut cheat-sheet trigger (Ctrl+?)
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Keyboard, X } from '@phosphor-icons/react';

export interface FramelessTitleBarProps {
  title?: string;
}

export const FramelessTitleBar: React.FC<FramelessTitleBarProps> = ({
  title = 'GradGate — GATE DA Desktop'
}) => {
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '?' || e.key === '/')) {
        e.preventDefault();
        setShowCheatSheet((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const shortcuts = [
    { key: '1, 2, 3, 4', desc: 'Select Option in MCQ / MSQ exercises' },
    { key: 'Enter', desc: 'Confirm Answer / Advance to next question' },
    { key: 'Ctrl + D', desc: 'Toggle transparent on-screen math scratchpad' },
    { key: 'Space', desc: 'Flip active SRS formula flashcard' },
    { key: 'Ctrl + ?', desc: 'Toggle keyboard shortcuts cheat-sheet' }
  ];

  return (
    <>
      <div
        className="h-8 bg-slate-950 border-b border-slate-900 flex items-center justify-between px-3 text-xs select-none text-slate-400"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300 tracking-tight">{title}</span>
        </div>

        {/* Shortcuts button (non-draggable area) */}
        <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            type="button"
            onClick={() => setShowCheatSheet(true)}
            title="Keyboard Shortcuts (Ctrl+?)"
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition"
          >
            <Keyboard size={12} weight="bold" />
            <span>Shortcuts</span>
            <kbd className="text-[9px] text-slate-400">Ctrl+?</kbd>
          </button>
        </div>
      </div>

      {/* Shortcuts Modal */}
      {showCheatSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard size={20} weight="fill" className="text-emerald-400" />
                <h3 className="font-bold text-white text-base">Keyboard Shortcuts</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCheatSheet(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {shortcuts.map((sc) => (
                <div
                  key={sc.key}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs"
                >
                  <span className="text-slate-300">{sc.desc}</span>
                  <kbd className="px-2 py-1 rounded bg-slate-900 border border-slate-700 font-mono font-bold text-emerald-400 text-[11px]">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowCheatSheet(false)}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition"
            >
              Close Cheat-Sheet
            </button>
          </div>
        </div>
      )}
    </>
  );
};
