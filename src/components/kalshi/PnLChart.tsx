'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChartDataPoint, SettlementWithDetails } from '@/types/kalshi';

const formatChartDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const calculatePnl = (settlement: SettlementWithDetails): number => {
  const totalCost = (settlement.yes_total_cost + settlement.no_total_cost) / 100;
  const revenue = settlement.revenue / 100;
  return revenue - totalCost - parseFloat(settlement.fee_cost);
};

interface PnLChartProps {
  settlements: SettlementWithDetails[];
}

export const PnLChart = ({ settlements }: PnLChartProps) => {
  const chartData = useMemo(() => {
    const sorted = [...settlements].sort(
      (a, b) => new Date(a.settled_time).getTime() - new Date(b.settled_time).getTime()
    );

    return sorted.reduce<ChartDataPoint[]>((acc, s) => {
      const pnl = calculatePnl(s);
      const prevCumulative = acc.length > 0 ? acc[acc.length - 1].cumulativePnl : 0;
      const cumulativePnl = Math.round((prevCumulative + pnl) * 100) / 100;

      acc.push({
        date: s.settled_time,
        dateLabel: formatChartDate(s.settled_time),
        pnl: Math.round(pnl * 100) / 100,
        cumulativePnl,
        isWin: pnl > 0
      });

      return acc;
    }, []);
  }, [settlements]);

  if (chartData.length < 2) {
    return null;
  }

  const minPnl = Math.min(...chartData.map(d => d.cumulativePnl));
  const maxPnl = Math.max(...chartData.map(d => d.cumulativePnl));
  const padding = Math.max(Math.abs(maxPnl - minPnl) * 0.1, 1);

  return (
    <div className="bg-brand-800 rounded-lg p-4 mb-6">
      <h3 className="text-gray-300 text-sm font-medium mb-4">Cumulative P&L Over Time</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <XAxis dataKey="dateLabel" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[minPnl - padding, maxPnl + padding]}
              tickFormatter={value => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                color: '#fff'
              }}
              formatter={(value, name) => [
                typeof value === 'number' ? `$${value.toFixed(2)}` : '$0.00',
                name === 'cumulativePnl' ? 'Cumulative P&L' : 'Trade P&L'
              ]}
              labelFormatter={label => label}
            />
            <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="cumulativePnl"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={props => {
                const { cx, cy, payload } = props as { cx?: number; cy?: number; payload?: ChartDataPoint };
                if (cx === undefined || cy === undefined || !payload) return null;
                return (
                  <circle
                    key={`dot-${payload.date}`}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={payload.isWin ? '#22c55e' : '#ef4444'}
                    stroke="none"
                  />
                );
              }}
              activeDot={{ r: 6, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-3 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span>Win</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>Loss</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-blue-500" />
          <span>Cumulative P&L</span>
        </div>
      </div>
    </div>
  );
};
