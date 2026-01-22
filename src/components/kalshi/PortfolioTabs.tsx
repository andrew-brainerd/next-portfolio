'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import { getKalshiPositions, getKalshiSettlements } from '@/api/kalshi';
import Loading from '@/components/Loading';
import { MarketPositionWithDetails, SettlementWithDetails } from '@/types/kalshi';

type TabType = 'positions' | 'settlements';

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

const PositionCard = ({ position }: { position: MarketPositionWithDetails }) => {
  const positionSide = position.position > 0 ? 'YES' : 'NO';
  const positionColor = position.position > 0 ? 'bg-green-600' : 'bg-red-600';

  return (
    <div className="bg-brand-700 rounded-lg p-4 hover:bg-brand-600 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-4">
          <h3 className="font-semibold text-white">{position.market?.title ?? position.ticker}</h3>
          {position.market?.subtitle && <p className="text-gray-400 text-sm mt-1">{position.market.subtitle}</p>}
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${positionColor}`}>{positionSide}</span>
      </div>

      <div className="mt-4">
        <div className="mb-2">
          <span className="text-gray-400 text-sm">Total Traded: </span>
          <span className="text-white text-lg font-semibold">{formatDollars(position.total_traded_dollars)}</span>
        </div>
        {position.resting_orders_count > 0 && (
          <div className="text-sm">
            <span className="text-gray-400">Resting Orders: </span>
            <span className="text-yellow-400">{position.resting_orders_count}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const SettlementCard = ({ settlement }: { settlement: SettlementWithDetails }) => {
  const revenue = settlement.revenue / 100;
  const revenueColor = revenue >= 0 ? 'text-green-400' : 'text-red-400';
  const resultColor = settlement.market_result === 'yes' ? 'bg-green-600' : 'bg-red-600';
  const yesCount = parseFloat(settlement.yes_count_fp);
  const noCount = parseFloat(settlement.no_count_fp);

  return (
    <div className="bg-brand-700 rounded-lg p-4 hover:bg-brand-600 transition-colors">
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
    </div>
  );
};

const PortfolioTabs = () => {
  const [activeTab, setActiveTab] = useState<TabType>('positions');
  const [positions, setPositions] = useState<MarketPositionWithDetails[]>([]);
  const [settlements, setSettlements] = useState<SettlementWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const doFetch = async () => {
      setLoading(true);
      setError(null);

      try {
        if (activeTab === 'positions') {
          const data = await getKalshiPositions();
          if (isMounted) {
            setPositions(data);
          }
        } else {
          const data = await getKalshiSettlements();
          if (isMounted) {
            setSettlements(data);
          }
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
  }, [activeTab]);

  // Calculate totals for positions
  const totalTraded = positions.reduce((sum, p) => sum + parseFloat(p.total_traded_dollars), 0);

  // Calculate wins vs losses (compare revenue to total cost)
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
  const winRate = settlements.length > 0 ? (settlementStats.wins / settlements.length) * 100 : 0;

  return (
    <div>
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('positions')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'positions' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Positions
          {activeTab === 'positions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
        </button>
        <button
          onClick={() => setActiveTab('settlements')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'settlements' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Settlements
          {activeTab === 'settlements' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
        </button>
        <div className="flex-1 flex justify-end items-center pr-2">
          <Link href="/kalshme/orders" className="text-blue-400 hover:text-blue-300 text-sm">
            View Orders →
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      )}

      {error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-200">{error}</div>}

      {!loading && !error && activeTab === 'positions' && (
        <>
          {positions.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-brand-800 rounded-lg">
              <div>
                <p className="text-gray-400 text-sm">Total Traded</p>
                <p className="text-xl font-semibold text-white">${totalTraded.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Positions</p>
                <p className="text-xl font-semibold text-white">{positions.length}</p>
              </div>
            </div>
          )}

          {positions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No active positions found.</p>
              <Link href="/kalshme/lol" className="text-blue-400 hover:text-blue-300 underline">
                Browse LoL Esports Markets
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {positions.map(position => (
                <PositionCard key={position.ticker} position={position} />
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !error && activeTab === 'settlements' && (
        <>
          {settlements.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-brand-800 rounded-lg">
              <div>
                <p className="text-gray-400 text-sm">Net P&L</p>
                <p
                  className={`text-xl font-semibold ${settlementStats.netPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {settlements.map(settlement => (
                <SettlementCard key={`${settlement.ticker}-${settlement.settled_time}`} settlement={settlement} />
              ))}
            </div>
          )}
        </>
      )}

      <div className="mt-8 pt-6 border-t border-gray-700">
        <Link href="/kalshme/lol" className="text-blue-400 hover:text-blue-300">
          Browse LoL Esports Markets →
        </Link>
      </div>
    </div>
  );
};

export default PortfolioTabs;
