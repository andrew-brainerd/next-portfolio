'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

interface TooltipState {
  content: ReactNode;
  x: number;
  y: number;
}

interface TooltipApi {
  show: (event: { clientX: number; clientY: number }, content: ReactNode) => void;
  hide: () => void;
}

const TooltipContext = createContext<TooltipApi>({ show: () => {}, hide: () => {} });

export const useVizTooltip = () => useContext(TooltipContext);

/**
 * One fixed-position tooltip shared by every chart on the page, so hovering a
 * bar, cell or line point never mounts a node per mark.
 */
export const TooltipLayer = ({ children }: { children: ReactNode }) => {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const show = useCallback((event: { clientX: number; clientY: number }, content: ReactNode) => {
    const box = boxRef.current;
    const width = box?.offsetWidth ?? 180;
    const height = box?.offsetHeight ?? 60;

    // Flip to the other side of the cursor rather than overflowing the viewport
    const x = event.clientX + 14 + width > window.innerWidth - 8 ? event.clientX - width - 14 : event.clientX + 14;
    const y = event.clientY + 14 + height > window.innerHeight - 8 ? event.clientY - height - 14 : event.clientY + 14;

    setTooltip({ content, x, y });
  }, []);

  const hide = useCallback(() => setTooltip(null), []);
  const api = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <TooltipContext.Provider value={api}>
      {children}
      <div
        ref={boxRef}
        role="tooltip"
        aria-hidden={!tooltip}
        className="pointer-events-none fixed z-50 max-w-[260px] rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-xs shadow-xl transition-opacity duration-100"
        style={{ left: tooltip?.x ?? 0, top: tooltip?.y ?? 0, opacity: tooltip ? 1 : 0 }}
      >
        {tooltip?.content}
      </div>
    </TooltipContext.Provider>
  );
};

interface TooltipRowProps {
  color?: string;
  label: string;
  value: string;
}

export const TooltipRow = ({ color, label, value }: TooltipRowProps) => (
  <div className="flex items-center gap-2 text-neutral-300">
    {color && <span className="size-2.5 shrink-0 rounded-sm" style={{ background: color }} />}
    <span>{label}</span>
    <b className="ml-auto pl-3 font-medium text-white">{value}</b>
  </div>
);

export const TooltipTitle = ({ children }: { children: ReactNode }) => (
  <div className="mb-1 font-semibold text-white">{children}</div>
);
