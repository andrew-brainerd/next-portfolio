import { cookies } from 'next/headers';
import Link from 'next/link';

import { getActivePositions, getMarket } from '@/api/kalshi';
import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';
import { MarketPosition, KalshiMarket } from '@/types/kalshi';

export const metadata = {
  title: 'Kalshme - Portfolio',
  description: 'View your Kalshi portfolio positions'
};

interface PositionWithMarket extends MarketPosition {
  market: KalshiMarket | null;
}

const formatDollars = (dollars: string): string => {
  const num = parseFloat(dollars);
  const isNegative = num < 0;
  const formatted = `$${Math.abs(num).toFixed(2)}`;
  return isNegative ? `-${formatted}` : formatted;
};

const PositionCard = ({ position }: { position: PositionWithMarket }) => {
  const pnl = parseFloat(position.realized_pnl_dollars);
  const pnlColor = pnl >= 0 ? 'text-green-400' : 'text-red-400';
  const positionSide = position.position > 0 ? 'YES' : 'NO';
  const positionColor = position.position > 0 ? 'bg-green-600' : 'bg-red-600';

  return (
    <div className="bg-brand-700 rounded-lg p-4 hover:bg-brand-600 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-4">
          <h3 className="font-semibold text-white">{position.market?.title ?? position.ticker}</h3>
          {position.market?.subtitle && <p className="text-gray-400 text-sm mt-1">{position.market.subtitle}</p>}
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${positionColor}`}>{positionSide}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mt-4">
        <div>
          <span className="text-gray-400">Position: </span>
          <span className="text-white">{Math.abs(position.position)} contracts</span>
        </div>
        <div>
          <span className="text-gray-400">Exposure: </span>
          <span className="text-white">{formatDollars(position.market_exposure_dollars)}</span>
        </div>
        <div>
          <span className="text-gray-400">Total Traded: </span>
          <span className="text-white">{formatDollars(position.total_traded_dollars)}</span>
        </div>
        <div>
          <span className="text-gray-400">Realized P&L: </span>
          <span className={pnlColor}>{formatDollars(position.realized_pnl_dollars)}</span>
        </div>
        {position.resting_orders_count > 0 && (
          <div>
            <span className="text-gray-400">Resting Orders: </span>
            <span className="text-yellow-400">{position.resting_orders_count}</span>
          </div>
        )}
        <div>
          <span className="text-gray-400">Fees: </span>
          <span className="text-gray-300">{formatDollars(position.fees_paid_dollars)}</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 font-mono">{position.ticker}</div>
    </div>
  );
};

export default async function KalshmePage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const userId = cookieJar.get(USER_COOKIE)?.value;

  if (!token || !userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white text-xl">Please log in to view your Kalshi portfolio.</p>
      </div>
    );
  }

  const { marketPositions } = await getActivePositions();

  // Fetch market details for each position
  const positionsWithMarkets: PositionWithMarket[] = await Promise.all(
    marketPositions.map(async position => {
      const market = await getMarket(position.ticker);
      return { ...position, market };
    })
  );

  // Calculate totals
  const totalExposure = marketPositions.reduce((sum, p) => sum + parseFloat(p.market_exposure_dollars), 0);
  const totalPnl = marketPositions.reduce((sum, p) => sum + parseFloat(p.realized_pnl_dollars), 0);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
        <p className="text-gray-400">
          {marketPositions.length} active position{marketPositions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {marketPositions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-brand-800 rounded-lg">
          <div>
            <p className="text-gray-400 text-sm">Total Exposure</p>
            <p className="text-xl font-semibold text-white">${totalExposure.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Realized P&L</p>
            <p className={`text-xl font-semibold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnl >= 0 ? '' : '-'}${Math.abs(totalPnl).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Positions</p>
            <p className="text-xl font-semibold text-white">{marketPositions.length}</p>
          </div>
          <div className="flex items-end">
            <Link href="/kalshme/orders" className="text-blue-400 hover:text-blue-300 text-sm underline">
              View Orders
            </Link>
          </div>
        </div>
      )}

      {marketPositions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No active positions found.</p>
          <Link href="/kalshme/lol" className="text-blue-400 hover:text-blue-300 underline">
            Browse LoL Esports Markets
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {positionsWithMarkets.map(position => (
            <PositionCard key={position.ticker} position={position} />
          ))}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-700">
        <Link href="/kalshme/lol" className="text-blue-400 hover:text-blue-300">
          Browse LoL Esports Markets →
        </Link>
      </div>
    </div>
  );
}
