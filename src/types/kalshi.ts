export type OrderSide = 'yes' | 'no';
export type OrderAction = 'buy' | 'sell';
export type OrderType = 'limit' | 'market';
export type OrderStatus = 'resting' | 'canceled' | 'executed';

export interface KalshiOrder {
  order_id: string;
  user_id: string;
  client_order_id: string;
  ticker: string;
  order_group_id: string | null;
  side: OrderSide;
  action: OrderAction;
  type: OrderType;
  status: OrderStatus;
  yes_price: number;
  no_price: number;
  yes_price_dollars: string;
  no_price_dollars: string;
  initial_count: number;
  fill_count: number;
  remaining_count: number;
  taker_fill_cost: number;
  maker_fill_cost: number;
  taker_fill_cost_dollars: string;
  maker_fill_cost_dollars: string;
  taker_fees: number;
  maker_fees: number;
  taker_fees_dollars: string | null;
  maker_fees_dollars: string | null;
  created_time: string | null;
  last_update_time: string | null;
  expiration_time: string | null;
  cancel_order_on_pause: boolean;
}

export interface GetOrdersResponse {
  orders: KalshiOrder[];
  cursor: string;
}

export interface GetOrdersParams {
  ticker?: string;
  event_ticker?: string;
  min_ts?: number;
  max_ts?: number;
  status?: OrderStatus;
  limit?: number;
  cursor?: string;
}

// Market types
export type MarketStatus = 'unopened' | 'open' | 'paused' | 'closed' | 'settled';

export interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  market_type: string;
  title: string;
  subtitle: string;
  status: MarketStatus;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  previous_yes_bid: number;
  previous_yes_ask: number;
  previous_price: number;
  volume: number;
  volume_24h: number;
  open_interest: number;
  result: string;
  can_close_early: boolean;
  expiration_time: string;
  expected_expiration_time: string;
  close_time: string;
  open_time: string;
  created_time: string;
  last_price_time: string;
  settlement_timer_seconds: number;
  cap_strike: number;
  floor_strike: number;
  yes_sub_title: string;
  no_sub_title: string;
}

export interface GetMarketsParams {
  limit?: number;
  cursor?: string;
  event_ticker?: string;
  series_ticker?: string;
  tickers?: string;
  status?: MarketStatus;
  min_close_ts?: number;
  max_close_ts?: number;
}

export interface GetMarketsResponse {
  markets: KalshiMarket[];
  cursor: string;
}

// Event types
export type EventStatus = 'open' | 'closed' | 'settled';

export interface KalshiEvent {
  event_ticker: string;
  series_ticker: string;
  sub_title: string;
  title: string;
  mutually_exclusive: boolean;
  category: string;
  markets?: KalshiMarket[];
  status?: EventStatus;
}

export interface GetEventsParams {
  limit?: number;
  cursor?: string;
  status?: EventStatus;
  series_ticker?: string;
  with_nested_markets?: boolean;
}

export interface GetEventsResponse {
  events: KalshiEvent[];
  cursor: string;
}

// League of Legends leagues
export type LoLLeague = 'LEC' | 'LCS' | 'LPL' | 'LCK';

export interface LoLEsportsMarketsResult {
  league: LoLLeague;
  markets: KalshiMarket[];
}
