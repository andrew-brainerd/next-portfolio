import { NextResponse } from 'next/server';

import { getSettlements, getMarket } from '@/api/kalshi';

export async function GET() {
  try {
    const settlements = await getSettlements({ limit: 100 });

    // Fetch market details for each settlement
    const settlementsWithMarkets = await Promise.all(
      settlements.map(async settlement => {
        const market = await getMarket(settlement.ticker);
        return { ...settlement, market };
      })
    );

    return NextResponse.json({ settlements: settlementsWithMarkets });
  } catch (error) {
    console.error('Failed to fetch settlements:', error);
    return NextResponse.json({ error: 'Failed to fetch settlements' }, { status: 500 });
  }
}
