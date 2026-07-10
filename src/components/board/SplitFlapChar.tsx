'use client';

import { useEffect, useRef, useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { playFlap } from '@/utils/boardSound';
import { BLANK_CODE, SEQUENCE_LENGTH, flapDistance, glyphForCode, isDigitCode, stepToward } from '@/utils/vestaboard';
import s from './SplitFlapChar.module.css';

// Cap the run-up: a cell never rolls more than this many flaps into place, so a
// scene change settles quickly instead of grinding through the whole rotor. Digit
// counting (small ring) is exempt.
const MAX_RUNUP = 6;

const cappedStart = (from: number, to: number): number => {
  if (isDigitCode(from) && isDigitCode(to)) return from;
  if (flapDistance(from, to) <= MAX_RUNUP) return from;
  return (to - MAX_RUNUP + SEQUENCE_LENGTH) % SEQUENCE_LENGTH;
};

interface SplitFlapCharProps {
  // Target flap code (index into FLAP_SEQUENCE) this cell should settle on.
  code: number;
  // Full duration of a single flap fold, in ms.
  foldMs: number;
  // Per-cell delay before the first flap begins — produces the cascade.
  staggerMs: number;
}

interface Fold {
  from: number;
  to: number;
  id: number;
}

const Glyph = ({ code, half }: { code: number; half: 'top' | 'bottom' }) => {
  const glyph = glyphForCode(code);
  const positionClass = half === 'top' ? s.glyphTop : s.glyphBottom;
  if (glyph.color) {
    return <span className={`${s.glyph} ${positionClass}`} style={{ background: glyph.color }} aria-hidden />;
  }
  return (
    <span className={`${s.glyph} ${positionClass}`} aria-hidden>
      {glyph.char === ' ' ? '' : glyph.char}
    </span>
  );
};

export const SplitFlapChar = ({ code, foldMs, staggerMs }: SplitFlapCharProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const [displayCode, setDisplayCode] = useState(BLANK_CODE);
  const [fold, setFold] = useState<Fold | null>(null);

  // Refs mirror the animating state so callbacks read fresh values without re-subscribing.
  const displayRef = useRef(BLANK_CODE);
  const targetRef = useRef(code);
  const foldingRef = useRef(false);
  const foldRef = useRef<Fold | null>(null);
  const stepRef = useRef(0);
  const startTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const beginNextFold = () => {
    const from = displayRef.current;
    const to = stepToward(from, targetRef.current);
    stepRef.current += 1;
    const next = { from, to, id: stepRef.current };
    foldRef.current = next;
    setFold(next);
    playFlap();
  };

  // A single flap finished folding: settle onto it, then either continue the roll
  // toward the target or stop. Chaining here (not on a timer) keeps every fold whole.
  const handleFoldEnd = () => {
    const current = foldRef.current;
    if (!current) return;
    displayRef.current = current.to;
    setDisplayCode(current.to);
    if (current.to !== targetRef.current) {
      beginNextFold();
    } else {
      foldingRef.current = false;
      foldRef.current = null;
      setFold(null);
    }
  };

  useEffect(() => {
    targetRef.current = code;
    if (reducedMotion) {
      displayRef.current = code;
      foldingRef.current = false;
      foldRef.current = null;
      // Defer so no state is set synchronously during the effect.
      queueMicrotask(() => {
        setDisplayCode(code);
        setFold(null);
      });
      return;
    }
    if (!foldingRef.current && displayRef.current !== code) {
      const start = cappedStart(displayRef.current, code);
      if (start !== displayRef.current) {
        displayRef.current = start;
        queueMicrotask(() => setDisplayCode(start));
      }
      foldingRef.current = true;
      clearTimeout(startTimer.current);
      startTimer.current = setTimeout(beginNextFold, staggerMs);
    }
  }, [code, reducedMotion, staggerMs]);

  useEffect(() => () => clearTimeout(startTimer.current), []);

  const styleVars = { ['--fold-ms']: `${foldMs}ms` } as React.CSSProperties;

  return (
    <div className={s.cell} style={styleVars}>
      {fold ? (
        <>
          <div className={`${s.half} ${s.top}`}>
            <Glyph code={fold.to} half="top" />
          </div>
          <div className={`${s.half} ${s.bottom}`}>
            <Glyph code={fold.from} half="bottom" />
          </div>
          <div key={`d${fold.id}`} className={`${s.leaf} ${s.leafTop}`}>
            <Glyph code={fold.from} half="top" />
          </div>
          <div key={`u${fold.id}`} className={`${s.leaf} ${s.leafBottom}`} onAnimationEnd={handleFoldEnd}>
            <Glyph code={fold.to} half="bottom" />
          </div>
        </>
      ) : (
        <>
          <div className={`${s.half} ${s.top}`}>
            <Glyph code={displayCode} half="top" />
          </div>
          <div className={`${s.half} ${s.bottom}`}>
            <Glyph code={displayCode} half="bottom" />
          </div>
        </>
      )}
    </div>
  );
};
