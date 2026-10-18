// @vitest-environment jsdom
// ==============================================================================
// PHASE 1 COMPONENT & AUDIO TEST SUITE
// Verifies:
//   1. DuoButton 3D physics variants, keyboard badges & lock states.
//   2. SnakeProgressBar percentage calculation and combo pulse trigger.
//   3. FeedbackDrawer green celebratory state vs red KaTeX diagnostic state.
//   4. Anti-hallucination AssetSlot contract.
//   5. Web Audio synthesizer methods and mute/volume states.
//   6. Theme token completeness.
// ==============================================================================

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DuoButton } from '../src/renderer/components/ui/DuoButton';
import { SnakeProgressBar } from '../src/renderer/components/ui/SnakeProgressBar';
import { FeedbackDrawer } from '../src/renderer/components/ui/FeedbackDrawer';
import { AssetSlot } from '../src/renderer/components/ui/AssetSlot';
import { soundEngine } from '../src/renderer/audio/soundEngine';
import { THEMES, applyThemeVariables } from '../src/renderer/styles/themes';

describe('Phase 1: Tactile 3D UI Primitives & Web Audio Engine', () => {
  it('renders DuoButton variants and executes click handlers', () => {
    const handleClick = vi.fn();
    render(
      <DuoButton variant="primary" shortcut="1" onClick={handleClick}>
        Start Lesson
      </DuoButton>
    );

    const button = screen.getByRole('button', { name: /start lesson/i });
    expect(button).toBeDefined();
    expect(screen.getByText('1')).toBeDefined();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('prevents click events when DuoButton is in locked variant', () => {
    const handleClick = vi.fn();
    render(
      <DuoButton variant="locked" onClick={handleClick}>
        Locked Node
      </DuoButton>
    );

    const button = screen.getByRole('button', { name: /locked node/i });
    expect(button).toBeDefined();
    expect((button as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders SnakeProgressBar with correct progress and combo trigger', () => {
    const { rerender } = render(
      <SnakeProgressBar progressPercent={65} comboCount={1} showLabel />
    );

    expect(screen.getByText('65%')).toBeDefined();
    expect(screen.queryByText(/COMBO!/i)).toBeNull();

    // Re-render with combo >= 3
    rerender(<SnakeProgressBar progressPercent={80} comboCount={4} showLabel />);
    expect(screen.getByText('80%')).toBeDefined();
    expect(screen.getByText(/4x COMBO!/i)).toBeDefined();
  });

  it('renders FeedbackDrawer in green celebratory state on correct answer', () => {
    const handleContinue = vi.fn();
    render(
      <FeedbackDrawer
        isOpen={true}
        isCorrect={true}
        xpEarned={20}
        comboCount={3}
        onContinue={handleContinue}
      />
    );

    expect(screen.getByText(/Outstanding!/i)).toBeDefined();
    expect(screen.getByText('+20 XP')).toBeDefined();
    expect(screen.getByText(/3 IN A ROW!/i)).toBeDefined();

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueBtn);
    expect(handleContinue).toHaveBeenCalledTimes(1);
  });

  it('renders FeedbackDrawer in red diagnostic state with KaTeX derivation on incorrect answer', () => {
    const handleContinue = vi.fn();
    const handleAddMistake = vi.fn();
    render(
      <FeedbackDrawer
        isOpen={true}
        isCorrect={false}
        correctAnswerText="Option (A): O(N log N)"
        solutionLatex="T(n) = 2T(n/2) + O(n) \implies O(n \log n)"
        onContinue={handleContinue}
        onAddToMistakes={handleAddMistake}
      />
    );

    expect(screen.getByText(/Review Concept/i)).toBeDefined();
    expect(screen.getByText(/Option \(A\): O\(N log N\)/i)).toBeDefined();

    const mistakeBtn = screen.getByRole('button', { name: /save mistake/i });
    fireEvent.click(mistakeBtn);
    expect(handleAddMistake).toHaveBeenCalledTimes(1);

    const solutionToggle = screen.getByText(/View Step-by-Step Derivation/i);
    fireEvent.click(solutionToggle);
    expect(screen.getByText(/Hide Step-by-Step Solution/i)).toBeDefined();
  });

  it('enforces AssetSlot anti-hallucination vector contract', () => {
    render(
      <AssetSlot
        id="slot_test_vector"
        fallbackIcon={<span data-testid="icon-span">VectorIcon</span>}
        label="Test Vector"
      />
    );

    expect(screen.getByTestId('icon-span')).toBeDefined();
    expect(screen.getByText('Test Vector')).toBeDefined();
    const container = screen.getByText('Test Vector').closest('[data-asset-slot-id]');
    expect(container?.getAttribute('data-asset-slot-id')).toBe('slot_test_vector');
  });

  it('operates Web Audio soundEngine volume, mute and synthesis safely', () => {
    expect(soundEngine.getMuted()).toBe(false);

    soundEngine.setMuted(true);
    expect(soundEngine.getMuted()).toBe(true);

    soundEngine.setVolume(0.8);
    soundEngine.setMuted(false);

    // Ensure audio synthesis calls do not throw even in jsdom mock environment
    expect(() => soundEngine.playClick()).not.toThrow();
    expect(() => soundEngine.playCorrect()).not.toThrow();
    expect(() => soundEngine.playWrong()).not.toThrow();
    expect(() => soundEngine.playCombo(3)).not.toThrow();
    expect(() => soundEngine.playLevelComplete()).not.toThrow();
  });

  it('verifies theme token definitions and CSS variable application', () => {
    const themeKeys = Object.keys(THEMES);
    expect(themeKeys).toEqual([
      'theme_python_emerald',
      'theme_dark_oled',
      'theme_cyberpunk_ai',
      'theme_retro_terminal'
    ]);

    expect(THEMES.theme_python_emerald.colors.primary).toBe('#58CC02');
    expect(THEMES.theme_python_emerald.colors.primaryLip).toBe('#46A302');

    // Test applyThemeVariables
    applyThemeVariables(THEMES.theme_python_emerald);
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#58CC02');
    expect(document.documentElement.style.getPropertyValue('--color-primary-lip')).toBe('#46A302');
  });
});
