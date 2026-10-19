import type { PlowedEvent } from '@/types/plowed';

type MutedGetter = () => boolean;

let isMuted: MutedGetter = () => false;
let audioCtx: AudioContext | null = null;
let sfxBus: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

const SFX_VOLUME = 0.5;

export const registerPlowedSfxMutedAccessor = (getter: MutedGetter) => {
  isMuted = getter;
};

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
    sfxBus = audioCtx.createGain();
    sfxBus.gain.value = SFX_VOLUME;
    sfxBus.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
};

// Browsers only allow audio to start from a user gesture, so call this from Start.
export const primePlowedAudio = () => {
  getCtx();
};

const getNoise = (ctx: AudioContext) => {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
};

interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  slideTo?: number;
}

const tone = ({ frequency, duration, type = 'square', gain = 0.12, delay = 0, slideTo }: ToneOptions) => {
  const ctx = getCtx();
  if (!ctx || !sfxBus) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(env).connect(sfxBus);
  osc.start(start);
  osc.stop(start + duration + 0.02);
};

interface NoiseOptions {
  duration: number;
  frequency: number;
  q?: number;
  type?: BiquadFilterType;
  gain?: number;
  delay?: number;
  slideTo?: number;
}

const noise = ({ duration, frequency, q = 1, type = 'bandpass', gain = 0.2, delay = 0, slideTo }: NoiseOptions) => {
  const ctx = getCtx();
  if (!ctx || !sfxBus) return;
  const start = ctx.currentTime + delay;
  const source = ctx.createBufferSource();
  source.buffer = getNoise(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(frequency, start);
  if (slideTo) filter.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.004);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter).connect(env).connect(sfxBus);
  source.start(start, Math.random() * 0.5);
  source.stop(start + duration + 0.02);
};

const arpeggio = (notes: number[], step: number, options: Omit<ToneOptions, 'frequency' | 'delay'>) =>
  notes.forEach((frequency, i) => tone({ ...options, frequency, delay: i * step }));

// Note frequencies (Hz).
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;
const A4 = 440;

const SOUNDS: Record<PlowedEvent, (multiplier: number) => void> = {
  shovel: multiplier => noise({ duration: 0.07, frequency: 1400 + multiplier * 220, q: 2.5, gain: 0.14 }),
  tierUp: multiplier => {
    const root = 392 * Math.pow(2, (multiplier - 2) / 12);
    arpeggio([root, root * 1.25, root * 1.5], 0.05, { duration: 0.09, gain: 0.08 });
  },
  streakLost: () => tone({ frequency: 330, slideTo: 165, duration: 0.25, gain: 0.07 }),
  cheese: () => {
    arpeggio([C5, E5, G5, C6], 0.06, { duration: 0.1, type: 'triangle', gain: 0.2 });
    noise({ duration: 0.18, frequency: 900, q: 8, gain: 0.25, delay: 0.26 });
    tone({ frequency: 110, duration: 0.18, gain: 0.08, delay: 0.26 });
  },
  taunt: () => {
    for (let i = 0; i < 6; i++) tone({ frequency: i % 2 ? 196 : 247, duration: 0.05, gain: 0.07, delay: i * 0.045 });
  },
  cageBreak: () => {
    noise({ duration: 0.35, frequency: 3000, type: 'highpass', gain: 0.2 });
    tone({ frequency: 70, slideTo: 160, duration: 0.45, type: 'sawtooth', gain: 0.1 });
  },
  beerSpawn: () => {
    tone({ frequency: 1760, duration: 0.12, type: 'sine', gain: 0.08 });
    tone({ frequency: 2349, duration: 0.18, type: 'sine', gain: 0.06, delay: 0.07 });
  },
  beer: () => {
    [520, 440, 370].forEach((frequency, i) =>
      tone({ frequency, slideTo: frequency * 0.7, duration: 0.09, type: 'sine', gain: 0.18, delay: i * 0.1 })
    );
    noise({ duration: 0.4, frequency: 6000, type: 'highpass', gain: 0.05, delay: 0.3 });
  },
  caught: () => {
    tone({ frequency: 880, slideTo: 110, duration: 0.8, gain: 0.1 });
    noise({ duration: 0.25, frequency: 400, type: 'lowpass', gain: 0.25 });
  },
  levelClear: () => {
    arpeggio([C5, E5, G5, C6], 0.11, { duration: 0.16, gain: 0.08 });
    tone({ frequency: C6, duration: 0.5, type: 'triangle', gain: 0.18, delay: 0.44 });
  },
  gameOver: () => arpeggio([A4, 392, 349.23, 261.63], 0.22, { duration: 0.3, type: 'triangle', gain: 0.2 })
};

export const playPlowedEvent = (event: PlowedEvent, multiplier: number) => {
  if (isMuted()) return;
  SOUNDS[event](multiplier);
};
