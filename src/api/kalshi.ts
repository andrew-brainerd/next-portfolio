'use server';

import { getRequest } from '@/api/client';
import { KalshiMarket, KalshiOrder, LoLLeague, MarketPositionWithDetails, SettlementWithDetails } from '@/types/kalshi';

interface PositionsResponse {
  positions: MarketPositionWithDetails[];
}

interface SettlementsResponse {
  settlements: SettlementWithDetails[];
}

interface OrdersResponse {
  orders: KalshiOrder[];
}

interface LoLEsportsResponse {
  league: LoLLeague;
  markets: KalshiMarket[];
  cached: boolean;
}

export async function getKalshiPositions(): Promise<MarketPositionWithDetails[]> {
  const response = await getRequest<PositionsResponse>('/kalshi/positions');
  return response?.positions ?? [];
}

export async function getKalshiSettlements(): Promise<SettlementWithDetails[]> {
  const response = await getRequest<SettlementsResponse>('/kalshi/settlements');
  return response?.settlements ?? [];
}

export async function getExecutedOrders(): Promise<KalshiOrder[]> {
  const response = await getRequest<OrdersResponse>('/kalshi/orders');
  return response?.orders ?? [];
}

export async function getLoLEsportsMarkets(league: LoLLeague): Promise<KalshiMarket[]> {
  const response = await getRequest<LoLEsportsResponse>('/kalshi/lol-esports', { league });
  return response?.markets ?? [];
}
