type SoundStateGetter = () => boolean;

let isMuted: SoundStateGetter = () => true;
let audioCtx: AudioContext | null = null;

export const registerMutedAccessor = (getter: SoundStateGetter) => {
  isMuted = getter;
};

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  attack?: number;
}

const playTone = ({ frequency, duration, type = 'sine', gain = 0.15, delay = 0, attack = 0.01 }: ToneOptions) => {
  if (isMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(env).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration);
};

export const playRoll = () => {
  // Quick rattle of high-pitched ticks
  for (let i = 0; i < 5; i++) {
    playTone({
      frequency: 800 + Math.random() * 400,
      duration: 0.06,
      type: 'square',
      gain: 0.06,
      delay: i * 0.05
    });
  }
};

export const playLock = () => {
  playTone({ frequency: 360, duration: 0.08, type: 'triangle', gain: 0.12 });
};

export const playCommit = (variant: 'normal' | 'big' = 'normal') => {
  if (variant === 'big') {
    // Major triad arpeggio
    playTone({ frequency: 523.25, duration: 0.18, type: 'triangle', gain: 0.15 });
    playTone({ frequency: 659.25, duration: 0.18, type: 'triangle', gain: 0.15, delay: 0.12 });
    playTone({ frequency: 783.99, duration: 0.32, type: 'triangle', gain: 0.18, delay: 0.24 });
    return;
  }
  playTone({ frequency: 523.25, duration: 0.18, type: 'triangle', gain: 0.13 });
  playTone({ frequency: 659.25, duration: 0.22, type: 'triangle', gain: 0.13, delay: 0.08 });
};

export const playJoin = () => {
  playTone({ frequency: 440, duration: 0.16, type: 'sine', gain: 0.14 });
  playTone({ frequency: 587.33, duration: 0.24, type: 'sine', gain: 0.14, delay: 0.12 });
};

export const playGameOver = (variant: 'win' | 'lose' = 'win') => {
  if (variant === 'win') {
    playTone({ frequency: 523.25, duration: 0.18, type: 'sine', gain: 0.16 });
    playTone({ frequency: 659.25, duration: 0.18, type: 'sine', gain: 0.16, delay: 0.16 });
    playTone({ frequency: 783.99, duration: 0.18, type: 'sine', gain: 0.16, delay: 0.32 });
    playTone({ frequency: 1046.5, duration: 0.4, type: 'sine', gain: 0.18, delay: 0.48 });
    return;
  }
  playTone({ frequency: 392, duration: 0.22, type: 'sine', gain: 0.13 });
  playTone({ frequency: 329.63, duration: 0.32, type: 'sine', gain: 0.13, delay: 0.18 });
};
