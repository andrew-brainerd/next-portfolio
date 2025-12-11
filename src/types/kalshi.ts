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
