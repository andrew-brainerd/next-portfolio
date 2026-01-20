import { cookies } from 'next/headers';

import { getExecutedOrders } from '@/api/kalshi';
import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';
import { KalshiOrder } from '@/types/kalshi';

export const metadata = {
  title: 'Kalshme - Orders',
  description: 'View your Kalshi orders'
};

const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
};

const OrdersTable = ({ orders }: { orders: KalshiOrder[] }) => {
  if (orders.length === 0) {
    return <p className="text-gray-400">No orders found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-brand-700 text-left">
            <th className="p-3 border-b border-gray-600">Ticker</th>
            <th className="p-3 border-b border-gray-600">Side</th>
            <th className="p-3 border-b border-gray-600">Action</th>
            <th className="p-3 border-b border-gray-600">Type</th>
            <th className="p-3 border-b border-gray-600">Price</th>
            <th className="p-3 border-b border-gray-600">Qty</th>
            <th className="p-3 border-b border-gray-600">Filled</th>
            <th className="p-3 border-b border-gray-600">Remaining</th>
            <th className="p-3 border-b border-gray-600">Created</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.order_id} className="hover:bg-brand-600 transition-colors">
              <td className="p-3 border-b border-gray-700 font-mono text-sm">{order.ticker}</td>
              <td className="p-3 border-b border-gray-700">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    order.side === 'yes' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {order.side.toUpperCase()}
                </span>
              </td>
              <td className="p-3 border-b border-gray-700 capitalize">{order.action}</td>
              <td className="p-3 border-b border-gray-700 capitalize">{order.type}</td>
              <td className="p-3 border-b border-gray-700">
                {order.side === 'yes' ? formatPrice(order.yes_price) : formatPrice(order.no_price)}
              </td>
              <td className="p-3 border-b border-gray-700">{order.initial_count}</td>
              <td className="p-3 border-b border-gray-700">{order.fill_count}</td>
              <td className="p-3 border-b border-gray-700">{order.remaining_count}</td>
              <td className="p-3 border-b border-gray-700 text-sm">{formatDate(order.created_time)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default async function OrdersPage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const userId = cookieJar.get(USER_COOKIE)?.value;

  if (!token || !userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white text-xl">Please log in to view your Kalshi orders.</p>
      </div>
    );
  }

  const orders = await getExecutedOrders();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Kalshi Orders</h1>
        <p className="text-gray-400">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </p>
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
