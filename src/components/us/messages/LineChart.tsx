'use client';

import { useRef, useState } from 'react';

import { formatMonth, niceAxis } from '@/utils/messageStats';
import type { MonthPoint } from '@/types/us';
import { TooltipRow, TooltipTitle, useVizTooltip } from '@/components/us/messages/TooltipLayer';

interface LineChartProps {
  points: MonthPoint[];
  meColor: string;
  herColor: string;
  herLabel: string;
  meLabel: string;
  /** Viewbox width — narrower in half-width cards so axis text isn't scaled down. */
  width?: number;
  height?: number;
  formatValue?: (value: number) => string;
  /** Draws the final segment dashed and its markers hollow (a partial period). */
  partialLast?: boolean;
}

const PADDING = { top: 14, right: 14, bottom: 26, left: 44 };

export const LineChart = ({
  points,
  meColor,
  herColor,
  herLabel,
  meLabel,
  width = 1000,
  height = 250,
  formatValue = value => value.toLocaleString('en-US'),
  partialLast = false
}: LineChartProps) => {
  const { show, hide } = useVizTooltip();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (points.length === 0) return null;

  const rawMax = points.reduce((highest, point) => Math.max(highest, point.me, point.her), 0);
  const { step, max } = niceAxis(rawMax);
  const innerWidth = width - PADDING.left - PADDING.right;
  const innerHeight = height - PADDING.top - PADDING.bottom;

  const x = (index: number) =>
    PADDING.left + (points.length === 1 ? innerWidth / 2 : (index / (points.length - 1)) * innerWidth);
  const y = (value: number) => PADDING.top + innerHeight - (value / max) * innerHeight;

  const series = [
    { key: 'me' as const, label: meLabel, color: meColor },
    { key: 'her' as const, label: herLabel, color: herColor }
  ];

  const solidEnd = partialLast ? points.length - 1 : points.length;
  const labelEvery = Math.ceil(points.length / 8);

  // Nudge the end labels apart when the two series finish close together
  const endLabels = series
    .map(line => ({ ...line, y: y(points[points.length - 1][line.key]) }))
    .sort((a, b) => a.y - b.y);
  endLabels.forEach((label, index) => {
    const previous = endLabels[index - 1];
    if (previous && label.y - previous.y < 13) label.y = previous.y + 13;
  });

  const handleMove = (event: React.MouseEvent<SVGRectElement>) => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const relative = ((event.clientX - bounds.left) / bounds.width) * width;
    const index = Math.max(
      0,
      Math.min(points.length - 1, Math.round(((relative - PADDING.left) / innerWidth) * (points.length - 1)))
    );

    setHoverIndex(index);
    show(
      event,
      <>
        <TooltipTitle>{formatMonth(points[index].month)}</TooltipTitle>
        {series.map(line => (
          <TooltipRow key={line.key} color={line.color} label={line.label} value={formatValue(points[index][line.key])} />
        ))}
      </>
    );
  };

  const handleLeave = () => {
    setHoverIndex(null);
    hide();
  };

  return (
    <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="block w-full overflow-visible" role="img">
      {Array.from({ length: Math.floor(max / step) + 1 }, (_, index) => index * step).map(value => (
        <g key={value}>
          <line x1={PADDING.left} x2={width - PADDING.right} y1={y(value)} y2={y(value)} className="stroke-neutral-700" />
          <text x={PADDING.left - 8} y={y(value) + 3.5} textAnchor="end" className="fill-neutral-500 text-[10px]">
            {formatValue(value)}
          </text>
        </g>
      ))}

      {points.map((point, index) =>
        index % labelEvery === 0 || index === points.length - 1 ? (
          <text key={point.month} x={x(index)} y={height - 8} textAnchor="middle" className="fill-neutral-500 text-[10px]">
            {formatMonth(point.month)}
          </text>
        ) : null
      )}

      {series.map(line => (
        <g key={line.key}>
          <polyline
            points={points
              .slice(0, solidEnd)
              .map((point, index) => `${x(index)},${y(point[line.key])}`)
              .join(' ')}
            fill="none"
            stroke={line.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {partialLast && points.length > 1 && (
            <line
              x1={x(points.length - 2)}
              y1={y(points[points.length - 2][line.key])}
              x2={x(points.length - 1)}
              y2={y(points[points.length - 1][line.key])}
              stroke={line.color}
              strokeWidth={2}
              strokeDasharray="3 3"
              opacity={0.55}
            />
          )}
          {points.map((point, index) => {
            const isPartial = partialLast && index === points.length - 1;
            return (
              <circle
                key={point.month}
                cx={x(index)}
                cy={y(point[line.key])}
                r={3.2}
                fill={isPartial ? '#191919' : line.color}
                stroke={isPartial ? line.color : '#191919'}
                strokeWidth={2}
              />
            );
          })}
        </g>
      ))}

      {endLabels.map(label => (
        <text
          key={label.key}
          x={x(points.length - 1) + 9}
          y={label.y + 3.5}
          fill={label.color}
          className="text-[11px] font-semibold"
        >
          {label.label}
        </text>
      ))}

      {hoverIndex !== null && (
        <line
          x1={x(hoverIndex)}
          x2={x(hoverIndex)}
          y1={PADDING.top}
          y2={PADDING.top + innerHeight}
          className="stroke-neutral-500"
        />
      )}

      <rect
        x={PADDING.left}
        y={PADDING.top}
        width={innerWidth}
        height={innerHeight}
        fill="transparent"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      />
    </svg>
  );
};
