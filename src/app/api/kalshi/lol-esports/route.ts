import { NextRequest, NextResponse } from 'next/server';

import { searchLoLEsportsMarketsByLeague } from '@/api/kalshi';
import { LoLLeague } from '@/types/kalshi';

const VALID_LEAGUES: LoLLeague[] = ['LEC', 'LCS', 'LPL', 'LCK'];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get('league') as LoLLeague | null;

  if (!league || !VALID_LEAGUES.includes(league)) {
    return NextResponse.json({ error: 'Invalid league. Must be one of: LEC, LCS, LPL, LCK' }, { status: 400 });
  }

  try {
    const markets = await searchLoLEsportsMarketsByLeague(league);
    return NextResponse.json({ league, markets });
  } catch (error) {
    console.error('Failed to fetch LoL esports markets:', error);
    return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 500 });
  }
}
