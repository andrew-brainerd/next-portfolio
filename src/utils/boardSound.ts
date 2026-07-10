// Synthesized split-flap "flap" click (Web Audio). Side-effect-only module —
// exempt from unit tests per project conventions. Mirrors rollWithMeSound.ts.
// Reads mute state directly from the shared sound store.

import { useSoundStore } from '@/hooks/useSoundStore';

let audioCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

// Throttle: when a whole scene flips, hundreds of cells fire at once. Cap how many
// clicks actually sound in a short window so it reads as a dense mechanical whirr
// instead of clipped noise.
const WINDOW_MS = 22;
const MAX_IN_WINDOW = 4;
const recent: number[] = [];

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
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

/**
 * Create + resume the AudioContext. MUST be called from within a user gesture
 * (e.g. the sound toggle's click handler) — browsers won't let a context started
 * from a timer callback produce sound. After this, the timer-driven playFlap()
 * calls work because the context is already running.
 */
export const primeBoardAudio = (): void => {
  getCtx();
};

const getNoise = (ctx: AudioContext): AudioBuffer => {
  if (!noiseBuffer) {
    const length = Math.floor(ctx.sampleRate * 0.05);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffer = buffer;
  }
  return noiseBuffer;
};

/** Play one mechanical flap click. Cheap, self-throttled, respects the mute store. */
export const playFlap = (): void => {
  if (useSoundStore.getState().muted) return;

  const now = Date.now();
  while (recent.length && now - recent[0] > WINDOW_MS) recent.shift();
  if (recent.length >= MAX_IN_WINDOW) return;
  recent.push(now);

  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;

  // Sharp "click" — a short band-passed noise burst with random center pitch.
  const click = ctx.createBufferSource();
  click.buffer = getNoise(ctx);
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 1700 + Math.random() * 1300;
  band.Q.value = 0.9;
  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(0.0001, t);
  clickGain.gain.exponentialRampToValueAtTime(0.08 + Math.random() * 0.04, t + 0.002);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  click.connect(band).connect(clickGain).connect(ctx.destination);
  click.start(t);
  click.stop(t + 0.06);

  // Low "thock" — the flap hitting its stop.
  const thock = ctx.createOscillator();
  thock.type = 'triangle';
  thock.frequency.setValueAtTime(170 + Math.random() * 50, t);
  const thockGain = ctx.createGain();
  thockGain.gain.setValueAtTime(0.0001, t);
  thockGain.gain.exponentialRampToValueAtTime(0.05, t + 0.004);
  thockGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
  thock.connect(thockGain).connect(ctx.destination);
  thock.start(t);
  thock.stop(t + 0.05);
};
