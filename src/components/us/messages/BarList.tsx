'use client';

import type { ReactNode } from 'react';

import { TooltipRow, TooltipTitle, useVizTooltip } from '@/components/us/messages/TooltipLayer';

export interface BarItem {
  label: string;
  value: number;
  display?: string;
  tooltip?: ReactNode;
}

interface BarListProps {
  items: BarItem[];
  color: string;
  emoji?: boolean;
  valueLabel?: string;
}

const formatCount = (value: number) => value.toLocaleString('en-US');

export const BarList = ({ items, color, emoji = false, valueLabel = 'Uses' }: BarListProps) => {
  const { show, hide } = useVizTooltip();
  const max = items.reduce((highest, item) => Math.max(highest, item.value), 0) || 1;

  return (
    <div className="grid gap-1.5">
      {items.map(item => {
        const display = item.display ?? formatCount(item.value);
        return (
          <div
            key={item.label}
            className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-2.5"
            onMouseMove={event =>
              show(
                event,
                <>
                  <TooltipTitle>{item.label}</TooltipTitle>
                  {item.tooltip ?? <TooltipRow color={color} label={valueLabel} value={display} />}
                </>
              )
            }
            onMouseLeave={hide}
          >
            <div
              className={`truncate text-right ${emoji ? 'font-emoji text-lg leading-none' : 'text-xs text-neutral-400'}`}
            >
              {item.label}
            </div>
            <div className="h-3.5 overflow-hidden rounded-sm bg-neutral-700/40">
              <div
                className="h-full rounded-r-sm"
                style={{ width: `${Math.max((item.value / max) * 100, 1)}%`, background: color }}
              />
            </div>
            <div className="text-right text-xs text-neutral-500">{display}</div>
          </div>
        );
      })}
    </div>
  );
};
