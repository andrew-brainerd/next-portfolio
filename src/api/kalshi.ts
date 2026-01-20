import crypto from 'crypto';
import { KALSHI_API_BASE, KALSHI_API_KEY, KALSHI_PRIVATE_KEY } from '@/constants/kalshi';
import {
  GetOrdersParams,
  GetOrdersResponse,
  KalshiOrder,
  GetMarketsParams,
  GetMarketsResponse,
  KalshiMarket,
  GetEventsParams,
  GetEventsResponse,
  KalshiEvent,
  LoLLeague,
  LoLEsportsMarketsResult,
  GetPositionsParams,
  GetPositionsResponse,
  MarketPosition,
  EventPosition,
  GetSettlementsParams,
  GetSettlementsResponse,
  Settlement
} from '@/types/kalshi';

const generateSignature = (timestamp: string, method: string, path: string): string => {
  if (!KALSHI_PRIVATE_KEY) {
    throw new Error('KALSHI_PRIVATE_KEY is not configured');
  }

  const message = `${timestamp}${method}${path}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(message);
  sign.end();

  const signature = sign.sign(
    {
      key: KALSHI_PRIVATE_KEY,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
    },
    'base64'
  );

  return signature;
};

const getAuthHeaders = (method: string, path: string): Record<string, string> => {
  if (!KALSHI_API_KEY) {
    throw new Error('KALSHI_API_KEY is not configured');
  }

  const timestamp = Date.now().toString();
  const signature = generateSignature(timestamp, method, path);

  return {
    'KALSHI-ACCESS-KEY': KALSHI_API_KEY,
    'KALSHI-ACCESS-TIMESTAMP': timestamp,
    'KALSHI-ACCESS-SIGNATURE': signature,
    'Content-Type': 'application/json'
  };
};

export const getOrders = async (params?: GetOrdersParams): Promise<KalshiOrder[]> => {
  const path = '/trade-api/v2/portfolio/orders';
  const queryParams = new URLSearchParams();

  if (params?.ticker) queryParams.set('ticker', params.ticker);
  if (params?.event_ticker) queryParams.set('event_ticker', params.event_ticker);
  if (params?.min_ts) queryParams.set('min_ts', params.min_ts.toString());
  if (params?.max_ts) queryParams.set('max_ts', params.max_ts.toString());
  if (params?.status) queryParams.set('status', params.status);
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.cursor) queryParams.set('cursor', params.cursor);

  const queryString = queryParams.toString();
  const fullUrl = `${KALSHI_API_BASE}/portfolio/orders${queryString ? `?${queryString}` : ''}`;

  try {
    const headers = getAuthHeaders('GET', path);
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error(`Kalshi API error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Error body:', errorBody);
      return [];
    }

    const data: GetOrdersResponse = await response.json();
    return data.orders ?? [];
  } catch (error) {
    console.error('Failed to fetch Kalshi orders:', error instanceof Error ? error.message : error);
    return [];
  }
};

export const getExecutedOrders = async (): Promise<KalshiOrder[]> => {
  return getOrders({ status: 'executed' });
};

const fetchMarketsPage = async (params?: GetMarketsParams): Promise<{ markets: KalshiMarket[]; cursor: string }> => {
  const path = '/trade-api/v2/markets';
  const queryParams = new URLSearchParams();

  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.cursor) queryParams.set('cursor', params.cursor);
  if (params?.event_ticker) queryParams.set('event_ticker', params.event_ticker);
  if (params?.series_ticker) queryParams.set('series_ticker', params.series_ticker);
  if (params?.tickers) queryParams.set('tickers', params.tickers);
  if (params?.status) queryParams.set('status', params.status);
  if (params?.min_close_ts) queryParams.set('min_close_ts', params.min_close_ts.toString());
  if (params?.max_close_ts) queryParams.set('max_close_ts', params.max_close_ts.toString());

  const queryString = queryParams.toString();
  const fullUrl = `${KALSHI_API_BASE}/markets${queryString ? `?${queryString}` : ''}`;

  const headers = getAuthHeaders('GET', path);
  const response = await fetch(fullUrl, {
    method: 'GET',
    headers,
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    console.error(`Kalshi API error: ${response.status} ${response.statusText}`);
    const errorBody = await response.text();
    console.error('Error body:', errorBody);
    return { markets: [], cursor: '' };
  }

  const data: GetMarketsResponse = await response.json();
  return { markets: data.markets ?? [], cursor: data.cursor ?? '' };
};

export const getMarkets = async (params?: GetMarketsParams): Promise<KalshiMarket[]> => {
  const { markets } = await fetchMarketsPage(params);
  return markets;
};

export const getMarket = async (ticker: string): Promise<KalshiMarket | null> => {
  const path = `/trade-api/v2/markets/${ticker}`;
  const fullUrl = `${KALSHI_API_BASE}/markets/${ticker}`;

  try {
    const headers = getAuthHeaders('GET', path);
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error(`Kalshi API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.market ?? null;
  } catch (error) {
    console.error('Failed to fetch Kalshi market:', error instanceof Error ? error.message : error);
    return null;
  }
};

export const getEvents = async (params?: GetEventsParams): Promise<KalshiEvent[]> => {
  const path = '/trade-api/v2/events';
  const queryParams = new URLSearchParams();

  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.cursor) queryParams.set('cursor', params.cursor);
  if (params?.status) queryParams.set('status', params.status);
  if (params?.series_ticker) queryParams.set('series_ticker', params.series_ticker);
  if (params?.with_nested_markets) queryParams.set('with_nested_markets', 'true');

  const queryString = queryParams.toString();
  const fullUrl = `${KALSHI_API_BASE}/events${queryString ? `?${queryString}` : ''}`;

  try {
    const headers = getAuthHeaders('GET', path);
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error(`Kalshi API error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Error body:', errorBody);
      return [];
    }

    const data: GetEventsResponse = await response.json();
    return data.events ?? [];
  } catch (error) {
    console.error('Failed to fetch Kalshi events:', error instanceof Error ? error.message : error);
    return [];
  }
};

const LOL_LEAGUES: LoLLeague[] = ['LEC', 'LCS', 'LPL', 'LCK'];

const LOL_LEAGUE_PATTERNS: Record<LoLLeague, RegExp> = {
  LEC: /\bLEC\b/i,
  LCS: /\bLCS\b/i,
  LPL: /\bLPL\b/i,
  LCK: /\bLCK\b/i
};

export const searchLoLEsportsMarkets = async (): Promise<LoLEsportsMarketsResult[]> => {
  const allMarkets: KalshiMarket[] = [];
  let cursor: string | undefined;
  let pageCount = 0;
  const maxPages = 10; // Safety limit to prevent infinite loops

  // Fetch all open markets (paginated)
  while (pageCount < maxPages) {
    const { markets, cursor: nextCursor } = await fetchMarketsPage({
      status: 'open',
      limit: 1000,
      cursor
    });

    pageCount++;

    if (markets.length === 0) break;

    allMarkets.push(...markets);

    if (!nextCursor) break;
    cursor = nextCursor;
  }

  // Filter markets for each LoL league
  const results: LoLEsportsMarketsResult[] = LOL_LEAGUES.map(league => {
    const pattern = LOL_LEAGUE_PATTERNS[league];
    const leagueMarkets = allMarkets.filter(
      market => pattern.test(market.title) || pattern.test(market.subtitle || '')
    );

    return {
      league,
      markets: leagueMarkets
    };
  });

  return results;
};

export const searchLoLEsportsMarketsByLeague = async (league: LoLLeague): Promise<KalshiMarket[]> => {
  const results = await searchLoLEsportsMarkets();
  const leagueResult = results.find(r => r.league === league);
  return leagueResult?.markets ?? [];
};

export const getPositions = async (
  params?: GetPositionsParams
): Promise<{ marketPositions: MarketPosition[]; eventPositions: EventPosition[] }> => {
  const path = '/trade-api/v2/portfolio/positions';
  const queryParams = new URLSearchParams();

  if (params?.cursor) queryParams.set('cursor', params.cursor);
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.count_filter) queryParams.set('count_filter', params.count_filter);
  if (params?.ticker) queryParams.set('ticker', params.ticker);
  if (params?.event_ticker) queryParams.set('event_ticker', params.event_ticker);

  const queryString = queryParams.toString();
  const fullUrl = `${KALSHI_API_BASE}/portfolio/positions${queryString ? `?${queryString}` : ''}`;

  try {
    const headers = getAuthHeaders('GET', path);
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error(`Kalshi API error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Error body:', errorBody);
      return { marketPositions: [], eventPositions: [] };
    }

    const data: GetPositionsResponse = await response.json();
    return {
      marketPositions: data.market_positions ?? [],
      eventPositions: data.event_positions ?? []
    };
  } catch (error) {
    console.error('Failed to fetch Kalshi positions:', error instanceof Error ? error.message : error);
    return { marketPositions: [], eventPositions: [] };
  }
};

export const getActivePositions = async (): Promise<{
  marketPositions: MarketPosition[];
  eventPositions: EventPosition[];
}> => {
  return getPositions({ count_filter: 'position' });
};

export const getSettlements = async (params?: GetSettlementsParams): Promise<Settlement[]> => {
  const path = '/trade-api/v2/portfolio/settlements';
  const queryParams = new URLSearchParams();

  if (params?.cursor) queryParams.set('cursor', params.cursor);
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.ticker) queryParams.set('ticker', params.ticker);
  if (params?.event_ticker) queryParams.set('event_ticker', params.event_ticker);
  if (params?.min_ts) queryParams.set('min_ts', params.min_ts.toString());
  if (params?.max_ts) queryParams.set('max_ts', params.max_ts.toString());

  const queryString = queryParams.toString();
  const fullUrl = `${KALSHI_API_BASE}/portfolio/settlements${queryString ? `?${queryString}` : ''}`;

  try {
    const headers = getAuthHeaders('GET', path);
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error(`Kalshi API error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Error body:', errorBody);
      return [];
    }

    const data: GetSettlementsResponse = await response.json();
    return data.settlements ?? [];
  } catch (error) {
    console.error('Failed to fetch Kalshi settlements:', error instanceof Error ? error.message : error);
    return [];
  }
};
