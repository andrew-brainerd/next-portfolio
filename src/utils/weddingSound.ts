// Synthesized storybook page-turn "swish" (Web Audio). Side-effect-only module —
// exempt from unit tests per project conventions. Mirrors boardSound.ts, but with
// its own mute state (localStorage) — the storybook is a public guest page and
// shouldn't share the roll-with-me sound store.

const STORAGE_KEY = 'wedding:sound';

let audioCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
let muted: boolean | null = null;

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
 * (a flip button, arrow key, or the mute toggle) — browsers won't let a context
 * started outside a gesture produce sound.
 */
export const primeWeddingAudio = (): void => {
  getCtx();
};

/** Sound is ON by default — it can only ever start from a user gesture. */
export const getWeddingSoundMuted = (): boolean => {
  if (muted === null) {
    if (typeof window === 'undefined') return false;
    try {
      muted = window.localStorage.getItem(STORAGE_KEY) === 'off';
    } catch {
      muted = false;
    }
  }
  return muted;
};

export const setWeddingSoundMuted = (next: boolean): void => {
  muted = next;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? 'off' : 'on');
  } catch {
    // localStorage may be unavailable (private mode etc.) — ignore
  }
};

const getNoise = (ctx: AudioContext): AudioBuffer => {
  if (!noiseBuffer) {
    const length = Math.floor(ctx.sampleRate * 0.4);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffer = buffer;
  }
  return noiseBuffer;
};

/** Play one soft paper page-turn: a rising noise swish + a settle tick. */
export const playPageTurn = (): void => {
  if (getWeddingSoundMuted()) return;

  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;

  // The swish — band-passed noise sweeping upward as the page slides.
  const swish = ctx.createBufferSource();
  swish.buffer = getNoise(ctx);
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.setValueAtTime(450 + Math.random() * 150, t);
  band.frequency.exponentialRampToValueAtTime(2000 + Math.random() * 500, t + 0.24);
  band.Q.value = 0.7;
  const swishGain = ctx.createGain();
  swishGain.gain.setValueAtTime(0.0001, t);
  swishGain.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.02, t + 0.08);
  swishGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
  swish.connect(band).connect(swishGain).connect(ctx.destination);
  swish.start(t);
  swish.stop(t + 0.34);

  // The settle — a tiny high tick as the page lands.
  const tick = ctx.createBufferSource();
  tick.buffer = getNoise(ctx);
  const high = ctx.createBiquadFilter();
  high.type = 'highpass';
  high.frequency.value = 1800;
  const tickGain = ctx.createGain();
  const tickAt = t + 0.24;
  tickGain.gain.setValueAtTime(0.0001, tickAt);
  tickGain.gain.exponentialRampToValueAtTime(0.025, tickAt + 0.004);
  tickGain.gain.exponentialRampToValueAtTime(0.0001, tickAt + 0.05);
  tick.connect(high).connect(tickGain).connect(ctx.destination);
  tick.start(tickAt);
  tick.stop(tickAt + 0.06);
};
