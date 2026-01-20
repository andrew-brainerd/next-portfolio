import { NextResponse } from 'next/server';

import { getActivePositions, getMarket } from '@/api/kalshi';

export async function GET() {
  try {
    const { marketPositions } = await getActivePositions();

    // Fetch market details for each position
    const positionsWithMarkets = await Promise.all(
      marketPositions.map(async position => {
        const market = await getMarket(position.ticker);
        return { ...position, market };
      })
    );

    return NextResponse.json({ positions: positionsWithMarkets });
  } catch (error) {
    console.error('Failed to fetch positions:', error);
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 });
  }
}
