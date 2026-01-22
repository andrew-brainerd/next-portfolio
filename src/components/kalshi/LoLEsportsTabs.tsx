'use client';

import { useState, useEffect, useMemo } from 'react';

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

interface MarketGroup {
  eventTicker: string;
  eventName: string;
  markets: KalshiMarket[];
}

// Group markets by event_ticker
const groupMarketsByEvent = (markets: KalshiMarket[]): MarketGroup[] => {
  const groups = new Map<string, KalshiMarket[]>();

  for (const market of markets) {
    const existing = groups.get(market.event_ticker) || [];
    existing.push(market);
    groups.set(market.event_ticker, existing);
  }

  return Array.from(groups.entries()).map(([eventTicker, eventMarkets]) => {
    // Try to extract event name from subtitle or derive from ticker
    const firstMarket = eventMarkets[0];
    const eventName = firstMarket.subtitle || extractEventName(eventTicker);

    return {
      eventTicker,
      eventName,
      markets: eventMarkets.sort((a, b) => a.title.localeCompare(b.title))
    };
  });
};

// Extract a readable event name from the ticker (e.g., "LOLLCK-26JAN21-T1GENG" -> "T1 vs GENG")
const extractEventName = (ticker: string): string => {
  // Try to find team matchup pattern at the end
  const parts = ticker.split('-');
  if (parts.length > 0) {
    const lastPart = parts[parts.length - 1];
    // Look for patterns like T1GENG, HLET1, etc.
    if (lastPart.length >= 4 && /^[A-Z0-9]+$/.test(lastPart)) {
      return lastPart;
    }
  }
  return ticker;
};

const MarketRow = ({ market }: { market: KalshiMarket }) => {
  const kalshiUrl = `https://kalshi.com/events/${market.event_ticker}`;

  return (
    <a
      href={kalshiUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 hover:bg-brand-600/50 transition-colors rounded"
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white truncate">{market.title}</div>
      </div>
      <div className="flex items-center gap-4 text-sm ml-4">
        <div className="text-right">
          <span className="text-gray-400 text-xs">Yes </span>
          <span className="text-green-400">{formatPrice(market.yes_bid)}</span>
          <span className="text-gray-600">/</span>
          <span className="text-green-300">{formatPrice(market.yes_ask)}</span>
        </div>
        <div className="text-right">
          <span className="text-gray-400 text-xs">No </span>
          <span className="text-red-400">{formatPrice(market.no_bid)}</span>
          <span className="text-gray-600">/</span>
          <span className="text-red-300">{formatPrice(market.no_ask)}</span>
        </div>
        <div className="text-gray-400 text-xs w-16 text-right">Vol: {market.volume.toLocaleString()}</div>
      </div>
    </a>
  );
};

const EventGroup = ({ group }: { group: MarketGroup }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const kalshiUrl = `https://kalshi.com/events/${group.eventTicker}`;
  const totalVolume = group.markets.reduce((sum, m) => sum + m.volume, 0);

  return (
    <div className="bg-brand-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-brand-600/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">{isExpanded ? '▼' : '▶'}</span>
          <div className="text-left">
            <h3 className="font-semibold text-white">{group.eventName}</h3>
            <p className="text-gray-400 text-sm">
              {group.markets.length} market{group.markets.length !== 1 ? 's' : ''} · Total volume:{' '}
              {totalVolume.toLocaleString()}
            </p>
          </div>
        </div>
        <a
          href={kalshiUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-brand-400 hover:text-brand-300 text-sm"
        >
          View on Kalshi →
        </a>
      </button>

      {isExpanded && (
        <div className="border-t border-brand-600">
          {group.markets.map(market => (
            <MarketRow key={market.ticker} market={market} />
          ))}
        </div>
      )}
    </div>
  );
};

const LoLEsportsTabs = () => {
  const [selectedLeague, setSelectedLeague] = useState<LoLLeague>('LCK');
  const [markets, setMarkets] = useState<KalshiMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const groupedMarkets = useMemo(() => groupMarketsByEvent(markets), [markets]);

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
      <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
        {LOL_LEAGUES.map(league => (
          <button
            key={league}
            onClick={() => setSelectedLeague(league)}
            className={`px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${
              selectedLeague === league ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {league}
            {selectedLeague === league && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg text-gray-300">{LEAGUE_NAMES[selectedLeague]}</h3>
        {!loading && markets.length > 0 && (
          <span className="text-sm text-gray-500">
            {groupedMarkets.length} event{groupedMarkets.length !== 1 ? 's' : ''} · {markets.length} market
            {markets.length !== 1 ? 's' : ''}
          </span>
        )}
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

      {!loading && !error && groupedMarkets.length > 0 && (
        <div className="space-y-4">
          {groupedMarkets.map(group => (
            <EventGroup key={group.eventTicker} group={group} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LoLEsportsTabs;
