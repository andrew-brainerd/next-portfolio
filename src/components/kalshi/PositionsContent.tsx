'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import { getKalshiPositions } from '@/api/kalshi';
import Loading from '@/components/Loading';
import { MarketPositionWithDetails } from '@/types/kalshi';

const formatDollars = (dollars: string | number): string => {
  const num = typeof dollars === 'string' ? parseFloat(dollars) : dollars;
  const isNegative = num < 0;
  const formatted = `$${Math.abs(num).toFixed(2)}`;
  return isNegative ? `-${formatted}` : formatted;
};

const PositionCard = ({ position }: { position: MarketPositionWithDetails }) => {
  const positionSide = position.position > 0 ? 'YES' : 'NO';
  const positionColor = position.position > 0 ? 'bg-green-600' : 'bg-red-600';
  const kalshiUrl = position.market?.event_ticker ? `https://kalshi.com/events/${position.market.event_ticker}` : null;

  const content = (
    <>
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

  const totalTraded = positions.reduce((sum, p) => sum + parseFloat(p.total_traded_dollars), 0);

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

      <div className="mt-8 pt-6 border-t border-gray-700">
        <Link href="/kalshme/lol" className="text-blue-400 hover:text-blue-300">
          Browse LoL Esports Markets →
        </Link>
      </div>
    </>
  );
};

export default PositionsContent;
