'use client';

import { ME_LABEL } from '@/constants/messageStats';
import { TooltipRow, TooltipTitle, useVizTooltip } from '@/components/us/messages/TooltipLayer';

export interface SplitBarItem {
  label: string;
  me: number;
  her: number;
}

interface SplitBarListProps {
  items: SplitBarItem[];
  meColor: string;
  herColor: string;
  herLabel: string;
}

const formatCount = (value: number) => value.toLocaleString('en-US');

/** One bar per row, divided into the two people's shares of the same total. */
export const SplitBarList = ({ items, meColor, herColor, herLabel }: SplitBarListProps) => {
  const { show, hide } = useVizTooltip();
  const max = items.reduce((highest, item) => Math.max(highest, item.me + item.her), 0) || 1;

  return (
    <div className="grid gap-1.5">
      {items.map(item => {
        const total = item.me + item.her;
        return (
          <div
            key={item.label}
            className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-2.5"
            onMouseMove={event =>
              show(
                event,
                <>
                  <TooltipTitle>{item.label}</TooltipTitle>
                  <TooltipRow color={meColor} label={ME_LABEL} value={formatCount(item.me)} />
                  <TooltipRow color={herColor} label={herLabel} value={formatCount(item.her)} />
                  <TooltipRow label="Combined" value={formatCount(total)} />
                </>
              )
            }
            onMouseLeave={hide}
          >
            <div className="truncate text-right text-xs text-neutral-400">{item.label}</div>
            <div className="flex h-3.5 gap-0.5 overflow-hidden rounded-sm bg-neutral-700/40">
              <div style={{ width: `${(item.me / max) * 100}%`, background: meColor }} />
              <div className="rounded-r-sm" style={{ width: `${(item.her / max) * 100}%`, background: herColor }} />
            </div>
            <div className="text-right text-xs text-neutral-500">{formatCount(total)}</div>
          </div>
        );
      })}
    </div>
  );
};
