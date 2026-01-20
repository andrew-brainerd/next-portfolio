import { cookies } from 'next/headers';

import PortfolioTabs from '@/components/kalshi/PortfolioTabs';
import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';

export const metadata = {
  title: 'Kalshme - Portfolio',
  description: 'View your Kalshi portfolio positions and settlements'
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
        <p className="text-gray-400">View your active positions and settlement history</p>
      </div>

      <PortfolioTabs />
    </div>
  );
}
