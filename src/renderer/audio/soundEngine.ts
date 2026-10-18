// ==============================================================================
// WEB AUDIO API SOUND SYNTHESIZER FOR GRADGATE
// 100% Programmatic Synthesizer (Zero External .mp3 Dependencies)
// ==============================================================================

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private masterGain: GainNode | null = null;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.5, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(volume: number): void {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : clamped, this.ctx.currentTime);
    }
  }

  // 1. Crisp Mechanical Click
  public playClick(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  }

  // 2. Duolingo-style Major Third Rising Chime (C5 -> E5)
  public playCorrect(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, start: 0, dur: 0.12 }, // C5
      { freq: 659.25, start: 0.08, dur: 0.28 } // E5
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.start);

      gain.gain.setValueAtTime(0, now + note.start);
      gain.gain.linearRampToValueAtTime(0.4, now + note.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.dur);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + note.start);
      osc.stop(now + note.start + note.dur);
    });
  }

  // 3. Low Muted Sawtooth Interval for Wrong Answers (F3 -> E3)
  public playWrong(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 174.61, start: 0, dur: 0.14 }, // F3
      { freq: 164.81, start: 0.12, dur: 0.26 } // E3
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.freq, now + note.start);

      // Lowpass filter for warm, non-harsh defeat sound
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, now + note.start);

      gain.gain.setValueAtTime(0, now + note.start);
      gain.gain.linearRampToValueAtTime(0.35, now + note.start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + note.start);
      osc.stop(now + note.start + note.dur);
    });
  }

  // 4. Harmonic Arpeggio Scaling with Streak Count
  public playCombo(comboCount = 1): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    // Harmonic frequencies: C5, E5, G5, B5, C6, E6
    const baseScale = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51];
    const steps = Math.min(baseScale.length, Math.max(2, comboCount + 1));
    const stepDuration = 0.07;

    for (let i = 0; i < steps; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + i * stepDuration;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseScale[i], noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.35, noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    }
  }

  // 5. Full Brass/Bell Victory Fanfare for Level Completion
  public playLevelComplete(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    // Victory fanfare chords: C-E-G -> G-B-D -> C-E-G-C (Maj 7th flourish)
    const sequence = [
      { freq: 523.25, time: 0, dur: 0.12 }, // C5
      { freq: 659.25, time: 0.1, dur: 0.12 }, // E5
      { freq: 783.99, time: 0.2, dur: 0.16 }, // G5
      { freq: 1046.5, time: 0.34, dur: 0.55 }, // C6
      { freq: 1318.51, time: 0.36, dur: 0.55 } // E6
    ];

    sequence.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0, now + note.time);
      gain.gain.linearRampToValueAtTime(0.4, now + note.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    });
  }
}

export const soundEngine = new SoundEngine();
