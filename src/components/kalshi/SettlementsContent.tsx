'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

import { getKalshiSettlements } from '@/api/kalshi';
import { Loading } from '@/components/Loading';
import { SettlementWithDetails } from '@/types/kalshi';

// recharts is ~330KB — only ship it when the chart actually renders.
const PnLChart = dynamic(() => import('./PnLChart').then(m => m.PnLChart), { ssr: false });

const formatDollars = (dollars: string | number): string => {
  const num = typeof dollars === 'string' ? parseFloat(dollars) : dollars;
  const isNegative = num < 0;
  const formatted = `$${Math.abs(num).toFixed(2)}`;
  return isNegative ? `-${formatted}` : formatted;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const SettlementCard = ({ settlement }: { settlement: SettlementWithDetails }) => {
  const revenue = settlement.revenue / 100;
  const revenueColor = revenue >= 0 ? 'text-green-400' : 'text-red-400';
  const resultColor = settlement.market_result === 'yes' ? 'bg-green-600' : 'bg-red-600';
  const yesCount = parseFloat(settlement.yes_count_fp);
  const noCount = parseFloat(settlement.no_count_fp);
  const kalshiUrl = settlement.market?.event_ticker
    ? `https://kalshi.com/events/${settlement.market.event_ticker}`
    : null;

  const content = (
    <>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-4">
          <h3 className="font-semibold text-white">{settlement.market?.title ?? settlement.ticker}</h3>
          {settlement.market?.subtitle && <p className="text-gray-400 text-sm mt-1">{settlement.market.subtitle}</p>}
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${resultColor}`}>
          {settlement.market_result.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mt-4">
        {yesCount > 0 && (
          <div>
            <span className="text-gray-400">Yes Contracts: </span>
            <span className="text-green-400">{yesCount}</span>
          </div>
        )}
        {noCount > 0 && (
          <div>
            <span className="text-gray-400">No Contracts: </span>
            <span className="text-red-400">{noCount}</span>
          </div>
        )}
        <div>
          <span className="text-gray-400">Revenue: </span>
          <span className={revenueColor}>{formatDollars(revenue)}</span>
        </div>
        <div>
          <span className="text-gray-400">Settled: </span>
          <span className="text-white">{formatDate(settlement.settled_time)}</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 font-mono">{settlement.ticker}</div>
    </>
  );

  if (kalshiUrl) {
    return (
      <a
        href={kalshiUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-brand-700 rounded-lg p-4 hover:bg-brand-600 transition-colors"
      >
        {content}
      </a>
    );
  }

  return <div className="bg-brand-700 rounded-lg p-4">{content}</div>;
};

export const SettlementsContent = () => {
  const [settlements, setSettlements] = useState<SettlementWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const doFetch = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getKalshiSettlements();
        if (isMounted) {
          setSettlements(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    doFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  const settlementStats = settlements.reduce(
    (acc, s) => {
      const totalCost = (s.yes_total_cost + s.no_total_cost) / 100;
      const revenue = s.revenue / 100;
      const pnl = revenue - totalCost - parseFloat(s.fee_cost);

      if (pnl > 0) {
        acc.wins++;
        acc.totalProfit += pnl;
      } else if (pnl < 0) {
        acc.losses++;
        acc.totalLoss += Math.abs(pnl);
      } else {
        acc.breakeven++;
      }
      acc.netPnl += pnl;
      return acc;
    },
    { wins: 0, losses: 0, breakeven: 0, totalProfit: 0, totalLoss: 0, netPnl: 0 }
  );
  const totalDecided = settlementStats.wins + settlementStats.losses;
  const winRate = totalDecided > 0 ? (settlementStats.wins / totalDecided) * 100 : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-200">{error}</div>;
  }

  return (
    <>
      {settlements.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-brand-800 rounded-lg">
          <div>
            <p className="text-gray-400 text-sm">Net P&L</p>
            <p className={`text-xl font-semibold ${settlementStats.netPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {settlementStats.netPnl >= 0 ? '' : '-'}${Math.abs(settlementStats.netPnl).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Win Rate</p>
            <p className="text-xl font-semibold text-white">{winRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Wins / Losses</p>
            <p className="text-xl font-semibold">
              <span className="text-green-400">{settlementStats.wins}</span>
              <span className="text-gray-500"> / </span>
              <span className="text-red-400">{settlementStats.losses}</span>
            </p>
          </div>
        </div>
      )}

      {settlements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No settlements found.</p>
        </div>
      ) : (
        <>
          <PnLChart settlements={settlements} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {settlements.map(settlement => (
              <SettlementCard key={`${settlement.ticker}-${settlement.settled_time}`} settlement={settlement} />
            ))}
          </div>
        </>
      )}

      <div className="mt-8 pt-6 border-t border-gray-700">
        <Link href="/kalshme/lol" className="text-blue-400 hover:text-blue-300">
          Browse LoL Esports Markets →
        </Link>
      </div>
    </>
  );
};
