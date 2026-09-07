'use client';

import { ME_LABEL } from '@/constants/messageStats';
import { TooltipRow, TooltipTitle, useVizTooltip } from '@/components/us/messages/TooltipLayer';

export interface GroupedRow {
  label: string;
  me: number;
  her: number;
}

interface GroupedBarsProps {
  rows: GroupedRow[];
  meColor: string;
  herColor: string;
  herLabel: string;
}

const formatCount = (value: number) => value.toLocaleString('en-US');

export const GroupedBars = ({ rows, meColor, herColor, herLabel }: GroupedBarsProps) => {
  const { show, hide } = useVizTooltip();
  const max = rows.reduce((highest, row) => Math.max(highest, row.me, row.her), 0) || 1;

  return (
    <div>
      {rows.map(row => (
        <div key={row.label} className="mb-2 grid grid-cols-[7rem_1fr] items-center gap-3">
          <div className="truncate text-right text-xs text-neutral-400">{row.label}</div>
          <div className="grid gap-0.5 pr-12">
            {[
              { color: meColor, value: row.me, who: ME_LABEL },
              { color: herColor, value: row.her, who: herLabel }
            ].map(bar => (
              <div
                key={bar.who}
                className="flex h-3.5 items-center rounded-r-sm"
                style={{ width: `${Math.max((bar.value / max) * 100, 0.6)}%`, background: bar.color }}
                onMouseMove={event =>
                  show(
                    event,
                    <>
                      <TooltipTitle>{row.label}</TooltipTitle>
                      <TooltipRow color={bar.color} label={bar.who} value={formatCount(bar.value)} />
                    </>
                  )
                }
                onMouseLeave={hide}
              >
                <span className="ml-1.5 whitespace-nowrap text-[11px] text-neutral-500">{formatCount(bar.value)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
