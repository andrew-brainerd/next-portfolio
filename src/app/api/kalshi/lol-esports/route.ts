import { NextRequest, NextResponse } from 'next/server';

import { searchLoLEsportsMarketsByLeague } from '@/api/kalshi';
import { KalshiMarket, LoLLeague } from '@/types/kalshi';

const VALID_LEAGUES: LoLLeague[] = ['LEC', 'LCS', 'LPL', 'LCK'];
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  markets: KalshiMarket[];
  timestamp: number;
}

const cache = new Map<LoLLeague, CacheEntry>();

const getCachedMarkets = (league: LoLLeague): KalshiMarket[] | null => {
  const entry = cache.get(league);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > CACHE_TTL_MS;
  if (isExpired) {
    cache.delete(league);
    return null;
  }

  return entry.markets;
};

const setCachedMarkets = (league: LoLLeague, markets: KalshiMarket[]): void => {
  cache.set(league, { markets, timestamp: Date.now() });
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get('league') as LoLLeague | null;

  if (!league || !VALID_LEAGUES.includes(league)) {
    return NextResponse.json({ error: 'Invalid league. Must be one of: LEC, LCS, LPL, LCK' }, { status: 400 });
  }

  // Check cache first
  const cachedMarkets = getCachedMarkets(league);
  if (cachedMarkets) {
    return NextResponse.json({ league, markets: cachedMarkets, cached: true });
  }

  try {
    const markets = await searchLoLEsportsMarketsByLeague(league);
    setCachedMarkets(league, markets);
    return NextResponse.json({ league, markets, cached: false });
  } catch (error) {
    console.error('Failed to fetch LoL esports markets:', error);
    return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 500 });
  }
}
