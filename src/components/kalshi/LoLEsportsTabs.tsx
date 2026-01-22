'use client';

import { useState, useEffect } from 'react';

import { getLoLEsportsMarkets } from '@/api/kalshi';
import Loading from '@/components/Loading';
import { KalshiMarket, LoLLeague } from '@/types/kalshi';

const LOL_LEAGUES: LoLLeague[] = ['LEC', 'LCS', 'LPL', 'LCK', 'Other'];

const LEAGUE_NAMES: Record<LoLLeague, string> = {
  LEC: 'LEC (Europe)',
  LCS: 'LCS (North America)',
  LPL: 'LPL (China)',
  LCK: 'LCK (Korea)',
  Other: 'Other LoL Markets'
};

const formatPrice = (cents: number): string => {
  return `${cents}¢`;
};

const MarketCard = ({ market }: { market: KalshiMarket }) => {
  const kalshiUrl = `https://kalshi.com/events/${market.event_ticker}`;

  return (
    <a
      href={kalshiUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-brand-700 rounded-lg p-4 hover:bg-brand-600 transition-colors"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-white flex-1 pr-4">{market.title}</h3>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            market.status === 'open' ? 'bg-green-600' : 'bg-gray-600'
          }`}
        >
          {market.status.toUpperCase()}
        </span>
      </div>
      {market.subtitle && <p className="text-gray-400 text-sm mb-3">{market.subtitle}</p>}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Yes: </span>
          <span className="text-green-400">{formatPrice(market.yes_bid)}</span>
          <span className="text-gray-500"> / </span>
          <span className="text-green-300">{formatPrice(market.yes_ask)}</span>
        </div>
        <div>
          <span className="text-gray-400">No: </span>
          <span className="text-red-400">{formatPrice(market.no_bid)}</span>
          <span className="text-gray-500"> / </span>
          <span className="text-red-300">{formatPrice(market.no_ask)}</span>
        </div>
        <div>
          <span className="text-gray-400">Volume: </span>
          <span className="text-white">{market.volume.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-400">Last: </span>
          <span className="text-white">{formatPrice(market.last_price)}</span>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500 font-mono">{market.ticker}</div>
    </a>
  );
};

const LoLEsportsTabs = () => {
  const [selectedLeague, setSelectedLeague] = useState<LoLLeague>('LCK');
  const [markets, setMarkets] = useState<KalshiMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const doFetch = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getLoLEsportsMarkets(selectedLeague);
        if (isMounted) {
          setMarkets(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setMarkets([]);
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
  }, [selectedLeague]);

  return (
    <div>
      <div className="flex border-b border-gray-700 mb-6">
        {LOL_LEAGUES.map(league => (
          <button
            key={league}
            onClick={() => setSelectedLeague(league)}
            className={`px-6 py-3 font-medium transition-colors relative ${
              selectedLeague === league ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {league}
            {selectedLeague === league && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <h3 className="text-lg text-gray-300">{LEAGUE_NAMES[selectedLeague]}</h3>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      )}

      {error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-200">{error}</div>}

      {!loading && !error && markets.length === 0 && (
        <p className="text-gray-400 py-8 text-center">No open markets found for {selectedLeague}.</p>
      )}

      {!loading && !error && markets.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {markets.map(market => (
            <MarketCard key={market.ticker} market={market} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LoLEsportsTabs;
