'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';

import { getKalshiPositions } from '@/api/kalshi';
import Loading from '@/components/Loading';
import { MarketPositionWithDetails } from '@/types/kalshi';

const formatDollars = (dollars: string | number): string => {
  const num = typeof dollars === 'string' ? parseFloat(dollars) : dollars;
  const isNegative = num < 0;
  const formatted = `$${Math.abs(num).toFixed(2)}`;
  return isNegative ? `-${formatted}` : formatted;
};

const formatCents = (cents: number): string => {
  return `${cents}¢`;
};

const PositionCard = ({ position }: { position: MarketPositionWithDetails }) => {
  const isYes = position.position > 0;
  const contracts = Math.abs(position.position);
  const positionSide = isYes ? 'YES' : 'NO';
  const positionColor = isYes ? 'bg-green-600' : 'bg-red-600';
  const kalshiUrl = position.market?.event_ticker ? `https://kalshi.com/events/${position.market.event_ticker}` : null;

  // Current odds from market
  const currentBid = isYes ? position.market?.yes_bid : position.market?.no_bid;
  const currentAsk = isYes ? position.market?.yes_ask : position.market?.no_ask;

  // Potential profit if position wins: (contracts × $1.00) - exposure
  const exposure = parseFloat(position.market_exposure_dollars);
  const potentialPayout = contracts * 1.0;
  const potentialProfit = potentialPayout - exposure;

  const content = (
    <>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-4">
          <h3 className="font-semibold text-white">{position.market?.title ?? position.ticker}</h3>
          {position.market?.subtitle && <p className="text-gray-400 text-sm mt-1">{position.market.subtitle}</p>}
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${positionColor}`}>{positionSide}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-400">Contracts: </span>
          <span className="text-white font-medium">{contracts}</span>
        </div>
        <div>
          <span className="text-gray-400">Exposure: </span>
          <span className="text-white font-medium">{formatDollars(exposure)}</span>
        </div>
        {currentBid !== undefined && currentAsk !== undefined && (
          <div>
            <span className="text-gray-400">Current Odds: </span>
            <span className={isYes ? 'text-green-400' : 'text-red-400'}>
              {formatCents(currentBid)}/{formatCents(currentAsk)}
            </span>
          </div>
        )}
        <div>
          <span className="text-gray-400">If Win: </span>
          <span className={potentialProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
            {potentialProfit >= 0 ? '+' : ''}
            {formatDollars(potentialProfit)}
          </span>
        </div>
      </div>

      {position.resting_orders_count > 0 && (
        <div className="mt-3 text-sm">
          <span className="text-gray-400">Resting Orders: </span>
          <span className="text-yellow-400">{position.resting_orders_count}</span>
        </div>
      )}
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

const PositionsContent = () => {
  const [positions, setPositions] = useState<MarketPositionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter for active positions (positions where we currently hold contracts)
  const activePositions = useMemo(() => positions.filter(p => p.position !== 0), [positions]);

  // Calculate position stats
  const positionStats = useMemo(() => {
    return activePositions.reduce(
      (acc, p) => {
        const exposure = parseFloat(p.market_exposure_dollars);
        const contracts = Math.abs(p.position);
        const potentialPayout = contracts * 1.0;
        const potentialProfit = potentialPayout - exposure;

        acc.totalExposure += exposure;
        acc.totalPotentialProfit += potentialProfit;
        return acc;
      },
      { totalExposure: 0, totalPotentialProfit: 0 }
    );
  }, [activePositions]);

  useEffect(() => {
    let isMounted = true;

    const doFetch = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getKalshiPositions();
        if (isMounted) {
          setPositions(data);
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
      {activePositions.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-brand-800 rounded-lg">
          <div>
            <p className="text-gray-400 text-sm">Positions</p>
            <p className="text-xl font-semibold text-white">{activePositions.length}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Exposure</p>
            <p className="text-xl font-semibold text-white">{formatDollars(positionStats.totalExposure)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">If All Win</p>
            <p
              className={`text-xl font-semibold ${positionStats.totalPotentialProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {positionStats.totalPotentialProfit >= 0 ? '+' : ''}
              {formatDollars(positionStats.totalPotentialProfit)}
            </p>
          </div>
        </div>
      )}

      {activePositions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No active positions found.</p>
          <Link href="/kalshme/lol" className="text-blue-400 hover:text-blue-300 underline">
            Browse LoL Esports Markets
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activePositions.map(position => (
            <PositionCard key={position.ticker} position={position} />
          ))}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-700">
        <Link href="/kalshme/lol" className="text-blue-400 hover:text-blue-300">
          Browse LoL Esports Markets →
        </Link>
      </div>
    </>
  );
};

export default PositionsContent;
