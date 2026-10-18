// ==============================================================================
// 2-HOST DEEP DIVE AUDIO & SLIDE PLAYER (NotebookLM-Style Podcast Experience)
// Synchronized dialog between Student Questioner & GATE Professor using Web Speech API
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Play, Pause, CaretRight, CaretLeft, Sparkle, User, GraduationCap } from '@phosphor-icons/react';
import katex from 'katex';

export interface DialogLine {
  speaker: 'HOST_A' | 'HOST_B';
  speakerName: string;
  avatarIcon: 'STUDENT' | 'PROFESSOR';
  text: string;
  latexEquation?: string;
}

export const SAMPLE_DEEP_DIVE: DialogLine[] = [
  {
    speaker: 'HOST_A',
    speakerName: 'Alex (Questioner)',
    avatarIcon: 'STUDENT',
    text: "Welcome back! Today we are digging into Singular Value Decomposition (SVD). Why does GATE DA place so much weight on SVD compared to standard eigendecomposition?"
  },
  {
    speaker: 'HOST_B',
    speakerName: 'Prof. Priya (GATE Specialist)',
    avatarIcon: 'PROFESSOR',
    text: "Great question! Standard eigendecomposition only works for square matrices. But in real-world Data Science, your data matrix A is almost always rectangular (m rows by n columns). SVD works on EVERY matrix!",
    latexEquation: 'A = U \\Sigma V^T, \\quad U \\in \\mathbb{R}^{m \\times m}, \\; \\Sigma \\in \\mathbb{R}^{m \\times n}, \\; V \\in \\mathbb{R}^{n \\times n}'
  },
  {
    speaker: 'HOST_A',
    speakerName: 'Alex (Questioner)',
    avatarIcon: 'STUDENT',
    text: "And what is the geometric intuition behind those singular values sigma_i along the diagonal?"
  },
  {
    speaker: 'HOST_B',
    speakerName: 'Prof. Priya (GATE Specialist)',
    avatarIcon: 'PROFESSOR',
    text: "Think of a unit sphere in n-dimensions. When transformed by matrix A, it turns into a hyper-ellipse! The singular values are simply the lengths of the principal semi-axes of that ellipse.",
    latexEquation: '\\sigma_i = \\sqrt{\\lambda_i(A^T A)}'
  }
];

export const DeepDivePlayer: React.FC = () => {
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  const currentLine = SAMPLE_DEEP_DIVE[currentLineIndex] || SAMPLE_DEEP_DIVE[0];

  const speakLine = (line: DialogLine): void => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.rate = playbackRate;

    // Pitch variation: Host A higher pitch, Host B deeper academic voice
    utterance.pitch = line.speaker === 'HOST_A' ? 1.2 : 0.9;

    utterance.onend = () => {
      if (isPlaying && currentLineIndex + 1 < SAMPLE_DEEP_DIVE.length) {
        setCurrentLineIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isPlaying) {
      speakLine(currentLine);
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [currentLineIndex, isPlaying, playbackRate]);

  const togglePlay = (): void => {
    setIsPlaying((prev) => !prev);
  };

  const handleNext = (): void => {
    if (currentLineIndex + 1 < SAMPLE_DEEP_DIVE.length) {
      setCurrentLineIndex((prev) => prev + 1);
    }
  };

  const handlePrev = (): void => {
    if (currentLineIndex > 0) {
      setCurrentLineIndex((prev) => prev - 1);
    }
  };

  const renderLatex = (formula: string): string => {
    try {
      return katex.renderToString(formula, { throwOnError: false, displayMode: true });
    } catch {
      return formula;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkle size={20} weight="fill" className="text-purple-400" />
            <span>2-Host Deep Dive Conversation (NotebookLM Podcast)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized audio dialogue with animated concept slides &amp; highlighted derivations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Speed:</span>
          {[1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setPlaybackRate(rate)}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition ${
                playbackRate === rate
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Synchronized Live Conversation Slide */}
      <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col gap-6 shadow-inner min-h-[220px]">
        {/* Active Speaker Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md ${
              currentLine.speaker === 'HOST_A'
                ? 'bg-blue-600 text-white'
                : 'bg-purple-600 text-white'
            }`}
          >
            {currentLine.avatarIcon === 'STUDENT' ? (
              <User size={24} weight="fill" />
            ) : (
              <GraduationCap size={24} weight="fill" />
            )}
          </div>

          <div>
            <span
              className={`font-black text-sm ${
                currentLine.speaker === 'HOST_A' ? 'text-blue-400' : 'text-purple-400'
              }`}
            >
              {currentLine.speakerName}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {currentLine.speaker === 'HOST_A' ? 'Conceptual Questioner' : 'GATE DA Subject Lead'}
            </span>
          </div>
        </div>

        {/* Spoken Text */}
        <p className="text-base text-slate-100 font-medium leading-relaxed">
          &ldquo;{currentLine.text}&rdquo;
        </p>

        {/* Highlighted KaTeX Formula if present */}
        {currentLine.latexEquation && (
          <div
            className="p-4 rounded-2xl bg-slate-900 border border-purple-900/60 text-purple-300 text-sm overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: renderLatex(currentLine.latexEquation) }}
          />
        )}
      </div>

      {/* Playback Controls Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
        <span className="text-xs font-mono text-slate-400">
          Slide {currentLineIndex + 1} of {SAMPLE_DEEP_DIVE.length}
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={currentLineIndex === 0}
            onClick={handlePrev}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition"
          >
            <CaretLeft size={18} weight="bold" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-2 shadow-md transition"
          >
            {isPlaying ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
            <span>{isPlaying ? 'Pause Podcast' : 'Play Deep Dive'}</span>
          </button>

          <button
            type="button"
            disabled={currentLineIndex + 1 >= SAMPLE_DEEP_DIVE.length}
            onClick={handleNext}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition"
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
};
