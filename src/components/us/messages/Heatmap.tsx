'use client';

import { VIZ_EMPTY, VIZ_SEQUENTIAL, WEEKDAY_LABELS } from '@/constants/messageStats';
import { formatHour, heatmapGrid, heatStep } from '@/utils/messageStats';
import type { HeatmapCell } from '@/types/us';
import { TooltipRow, TooltipTitle, useVizTooltip } from '@/components/us/messages/TooltipLayer';

interface HeatmapProps {
  cells: HeatmapCell[];
}

export const Heatmap = ({ cells }: HeatmapProps) => {
  const { show, hide } = useVizTooltip();
  const grid = heatmapGrid(cells);
  const max = cells.reduce((highest, cell) => Math.max(highest, cell.count), 0);

  return (
    <div>
      <div className="grid grid-cols-[2rem_repeat(24,1fr)] items-center gap-0.5">
        {grid.map((hours, weekday) => (
          <div key={WEEKDAY_LABELS[weekday]} className="contents">
            <div className="pr-1 text-right text-[10px] text-neutral-500">{WEEKDAY_LABELS[weekday]}</div>
            {hours.map((count, hour) => {
              const step = heatStep(count, max, VIZ_SEQUENTIAL.length);
              return (
                <div
                  key={hour}
                  className="aspect-square min-h-3 rounded-[2px]"
                  style={{ background: step < 0 ? VIZ_EMPTY : VIZ_SEQUENTIAL[step] }}
                  onMouseMove={event =>
                    show(
                      event,
                      <>
                        <TooltipTitle>{`${WEEKDAY_LABELS[weekday]} ${formatHour(hour)}`}</TooltipTitle>
                        <TooltipRow label="Messages" value={count.toLocaleString('en-US')} />
                      </>
                    )
                  }
                  onMouseLeave={hide}
                />
              );
            })}
          </div>
        ))}

        <div />
        {Array.from({ length: 24 }, (_, hour) => (
          <div key={hour} className="text-center text-[9px] text-neutral-600">
            {hour % 6 === 0 ? formatHour(hour).replace('m', '') : ''}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
        Fewer
        {VIZ_SEQUENTIAL.map(color => (
          <span key={color} className="inline-block h-2 w-5 rounded-[2px]" style={{ background: color }} />
        ))}
        More
      </div>
    </div>
  );
};
