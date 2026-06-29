// Self-contained Web Audio cues for score submission (no asset files).

let audioCtx: AudioContext | null = null;

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      audioCtx = new Ctor();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
};

interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
}

const playTone = ({ frequency, duration, type = 'sine', gain = 0.14, delay = 0 }: ToneOptions) => {
  const ctx = getCtx();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(env).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration);
};

/** Bright rising two-note chime on a successful score submission. */
export const playScoreSuccess = () => {
  playTone({ frequency: 587.33, duration: 0.14, type: 'triangle', gain: 0.14 });
  playTone({ frequency: 880, duration: 0.22, type: 'triangle', gain: 0.16, delay: 0.1 });
};

/** Low descending buzz when a submission fails. */
export const playScoreError = () => {
  playTone({ frequency: 220, duration: 0.18, type: 'sawtooth', gain: 0.12 });
  playTone({ frequency: 164.81, duration: 0.3, type: 'sawtooth', gain: 0.12, delay: 0.12 });
};
