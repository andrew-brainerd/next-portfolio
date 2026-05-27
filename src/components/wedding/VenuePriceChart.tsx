'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import type { Venue } from '@/types/wedding';

interface VenuePriceChartProps {
  venues: Venue[];
  budgetTarget: number;
}

const CATEGORY_COLOR: Record<Venue['category'], string> = {
  greenhouse: '#22c55e',
  'glass-nature': '#10b981',
  'urban-loft': '#f59e0b',
  'historic-ballroom': '#a855f7'
};

const fmtUsd = (n: number) => `$${(n / 1000).toFixed(0)}K`;

interface ChartDatum {
  slug: string;
  shortName: string;
  fullName: string;
  city: string;
  priceMidpoint: number;
  priceRange: string;
  category: Venue['category'];
}

interface TooltipPayloadEntry {
  payload?: ChartDatum;
}

interface VenueTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

const VenueTooltip = ({ active, payload }: VenueTooltipProps) => {
  const d = payload?.[0]?.payload;
  if (!active || !d) return null;
  return (
    <div className="rounded-md border border-neutral-700 bg-neutral-900/95 px-3 py-2 text-sm shadow-lg">
      <div className="font-semibold text-white">{d.fullName}</div>
      <div className="text-xs text-neutral-400 mb-1">{d.city}</div>
      <div className="text-neutral-200">{d.priceRange}</div>
    </div>
  );
};

export const VenuePriceChart = ({ venues, budgetTarget }: VenuePriceChartProps) => {
  const data: ChartDatum[] = useMemo(() => {
    return [...venues]
      .sort((a, b) => a.priceMidpoint - b.priceMidpoint)
      .map(v => ({
        slug: v.slug,
        // Short label for the X axis — keep it terse so labels don't collide.
        shortName: v.name.split(/[—@]/)[0].replace(/^The\s+/i, '').trim(),
        fullName: v.name,
        city: v.city,
        priceMidpoint: v.priceMidpoint,
        priceRange: v.priceRange,
        category: v.category
      }));
  }, [venues]);

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900/40 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-neutral-200">Estimated price by venue</h3>
        <p className="text-xs text-neutral-400">Bar = midpoint; red line = ${fmtUsd(budgetTarget)} target</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 60 }}>
            <XAxis
              dataKey="shortName"
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              angle={-35}
              textAnchor="end"
              interval={0}
              height={70}
            />
            <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={fmtUsd} />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<VenueTooltip />} />
            <ReferenceLine
              y={budgetTarget}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: 'Budget', position: 'insideTopRight', fill: '#ef4444', fontSize: 11 }}
            />
            <Bar dataKey="priceMidpoint" radius={[4, 4, 0, 0]}>
              {data.map(d => (
                <Cell key={d.slug} fill={CATEGORY_COLOR[d.category]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-neutral-400">
        {Object.entries(CATEGORY_COLOR).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span>{cat.replace('-', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
