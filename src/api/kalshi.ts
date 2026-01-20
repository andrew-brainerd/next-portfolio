import crypto from 'crypto';
import { KALSHI_API_BASE, KALSHI_API_KEY, KALSHI_PRIVATE_KEY } from '@/constants/kalshi';
import { GetOrdersParams, GetOrdersResponse, KalshiOrder } from '@/types/kalshi';

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
