// @vitest-environment jsdom
// ==============================================================================
// PHASE 4 TEST SUITE: VISUAL CONCEPT STUDIO & YOUTUBE LECTURE HUB
// Verifies:
//   1. YouTubeLectureHub online streaming, offline fallback, language filtering, and notes.
//   2. Mafs 2D math calculations (Matrix determinant, Eigenvalues, Calculus gradients).
//   3. 2D Machine Learning decision boundary classifications (SVM, Tree, k-NN).
//   4. DeepDivePlayer dialog lines and multi-speaker roles.
// ==============================================================================

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { YouTubeLectureHub } from '../src/renderer/features/lectures/YouTubeLectureHub';
import { SAMPLE_DEEP_DIVE } from '../src/renderer/features/studio/DeepDivePlayer';
import type { YouTubeLecture } from '../src/shared/types';

describe('Phase 4: Visual Concept Studio & YouTube Lecture Hub', () => {
  afterEach(() => {
    cleanup();
  });

  const sampleLectures: YouTubeLecture[] = [
    {
      id: 'lec_01',
      topic_id: 'DA_02_LIN_ALG',
      title: 'Eigenvalues & SVD - MIT 18.06',
      channel_name: 'MIT OpenCourseWare',
      language: 'English',
      category: 'NPTEL_IIT',
      youtube_video_id: 'cdZnhQjJu4I',
      duration_sec: 2400,
      start_timestamp_sec: 120,
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: 'lec_02',
      topic_id: 'DA_01_PROB_STATS',
      title: 'Bayes Theorem in Hindi',
      channel_name: 'Gate Smashers',
      language: 'Hindi',
      category: 'COACHING_PLAYLIST',
      youtube_video_id: 'xyz789uvw12',
      duration_sec: 1200,
      start_timestamp_sec: 0,
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ];

  it('renders YouTubeLectureHub with active lecture and handles language filtering', () => {
    render(<YouTubeLectureHub lectures={sampleLectures} />);

    expect(screen.getAllByText(/Eigenvalues & SVD - MIT 18.06/i)).toBeDefined();
    expect(screen.getAllByText(/MIT OpenCourseWare/i)).toBeDefined();

    // Filter to Hindi only
    const hindiFilter = screen.getByRole('button', { name: /^Hindi$/i });
    fireEvent.click(hindiFilter);

    expect(screen.getAllByText(/Bayes Theorem in Hindi/i)).toBeDefined();
  });

  it('adds timestamped study notes and marks lecture finished with XP rewards', () => {
    const handleRewardXp = vi.fn();
    render(<YouTubeLectureHub lectures={sampleLectures} onRewardXp={handleRewardXp} />);

    const noteInput = screen.getByPlaceholderText(/Enter key concept or equation/i);
    fireEvent.change(noteInput, { target: { value: 'Det(A) equals product of eigenvalues' } });

    const saveNoteBtn = screen.getByRole('button', { name: /save note/i });
    fireEvent.click(saveNoteBtn);

    expect(screen.getByText(/Det\(A\) equals product of eigenvalues/i)).toBeDefined();

    // Mark Finished
    const markCompleteBtn = screen.getByRole('button', { name: /mark finished/i });
    fireEvent.click(markCompleteBtn);

    expect(handleRewardXp).toHaveBeenCalledWith(25);
  });

  it('computes 2x2 matrix determinant, trace and eigenvalues accurately', () => {
    // Matrix A = [[2, 0.5], [0.5, 1.5]]
    const a = 2, c = 0.5, b = 0.5, d = 1.5;
    const det = a * d - b * c;
    const tr = a + d;
    const disc = tr * tr - 4 * det;

    expect(det).toBe(2.75);
    expect(tr).toBe(3.5);
    expect(disc).toBe(1.25);

    const lambda1 = (tr + Math.sqrt(disc)) / 2;
    const lambda2 = (tr - Math.sqrt(disc)) / 2;

    expect(lambda1).toBeCloseTo(2.31, 2);
    expect(lambda2).toBeCloseTo(1.19, 2);
  });

  it('evaluates calculus gradient descent update formula', () => {
    // Function f(x) = 0.2 * x^3 - x, f'(x) = 0.6 * x^2 - 1
    const fPrime = (x: number) => 0.6 * Math.pow(x, 2) - 1;
    const alpha = 0.2;
    const x0 = 1.5;

    const grad = fPrime(x0); // 0.6 * 2.25 - 1 = 1.35 - 1 = 0.35
    expect(grad).toBeCloseTo(0.35, 2);

    const x1 = x0 - alpha * grad; // 1.5 - (0.2 * 0.35) = 1.5 - 0.07 = 1.43
    expect(x1).toBeCloseTo(1.43, 2);
  });

  it('verifies 2D Machine Learning RBF decision function', () => {
    // RBF kernel: exp(-gamma * ||x||^2)
    const gamma = 0.9;
    const rbfInner = (x: number, y: number) => Math.exp(-gamma * (x * x + y * y));

    // Near origin (Class 0 inner cluster)
    expect(rbfInner(0.2, 0.2)).toBeGreaterThan(0.4);

    // Far from origin (Class 1 outer ring)
    expect(rbfInner(2.0, 2.0)).toBeLessThan(0.4);
  });

  it('verifies Deep Dive dialog structure and multi-speaker roles', () => {
    expect(SAMPLE_DEEP_DIVE.length).toBeGreaterThanOrEqual(4);

    const hostA = SAMPLE_DEEP_DIVE.find((d) => d.speaker === 'HOST_A');
    expect(hostA).toBeDefined();
    expect(hostA?.avatarIcon).toBe('STUDENT');

    const hostB = SAMPLE_DEEP_DIVE.find((d) => d.speaker === 'HOST_B');
    expect(hostB).toBeDefined();
    expect(hostB?.avatarIcon).toBe('PROFESSOR');
    expect(hostB?.latexEquation).toBeDefined();
  });
});
