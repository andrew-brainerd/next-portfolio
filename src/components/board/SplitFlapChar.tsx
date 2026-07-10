'use client';

import { useEffect, useRef, useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { playFlap } from '@/utils/boardSound';
import { BLANK_CODE, glyphForCode, stepToward } from '@/utils/vestaboard';
import s from './SplitFlapChar.module.css';

interface SplitFlapCharProps {
  // Target flap code (index into FLAP_SEQUENCE) this cell should settle on.
  code: number;
  // Duration of a single flap in ms.
  flapSpeedMs: number;
  // Per-cell delay before flipping begins — produces the cascade across the board.
  staggerMs: number;
}

interface FlipState {
  from: number;
  to: number;
  key: number;
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

export const SplitFlapChar = ({ code, flapSpeedMs, staggerMs }: SplitFlapCharProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const [displayCode, setDisplayCode] = useState(BLANK_CODE);
  const [flip, setFlip] = useState<FlipState | null>(null);
  // Last settled code, read synchronously by the stepping loop (avoids stale state).
  const settledRef = useRef(BLANK_CODE);

  useEffect(() => {
    if (reducedMotion) {
      settledRef.current = code;
      setDisplayCode(code);
      setFlip(null);
      return;
    }
    if (settledRef.current === code) return;

    let cancelled = false;
    let cur = settledRef.current;
    let keySeq = 0;
    let stepTimer: ReturnType<typeof setTimeout>;

    const step = () => {
      if (cancelled) return;
      const to = stepToward(cur, code);
      setFlip({ from: cur, to, key: keySeq++ });
      playFlap();
      stepTimer = setTimeout(() => {
        if (cancelled) return;
        cur = to;
        settledRef.current = to;
        setDisplayCode(to);
        setFlip(null);
        if (to !== code) step();
      }, flapSpeedMs);
    };

    const startTimer = setTimeout(step, staggerMs);
    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      clearTimeout(stepTimer);
    };
  }, [code, reducedMotion, flapSpeedMs, staggerMs]);

  const styleVars = { ['--flap-ms']: `${flapSpeedMs}ms` } as React.CSSProperties;

  return (
    <div className={s.cell} style={styleVars}>
      {flip ? (
        <>
          <div className={`${s.half} ${s.top}`}>
            <Glyph code={flip.to} half="top" />
          </div>
          <div className={`${s.half} ${s.bottom}`}>
            <Glyph code={flip.from} half="bottom" />
          </div>
          <div key={`d${flip.key}`} className={`${s.flap} ${s.flapDown}`}>
            <Glyph code={flip.from} half="top" />
          </div>
          <div key={`u${flip.key}`} className={`${s.flap} ${s.flapUp}`}>
            <Glyph code={flip.to} half="bottom" />
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
