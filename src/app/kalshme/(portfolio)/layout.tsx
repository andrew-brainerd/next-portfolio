import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';
import { KALSHME_ROUTE, LOGIN_ROUTE } from '@/constants/routes';
import { PortfolioNav } from '@/components/kalshi/PortfolioNav';

export default async function KalshmeLayout({ children }: { children: React.ReactNode }) {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const userId = cookieJar.get(USER_COOKIE)?.value;

  if (!token || !userId) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(KALSHME_ROUTE)}`);
  }

  return (
    <div className="container mx-auto p-3 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
        <p className="text-gray-400">View your active positions and settlement history</p>
      </div>

      <PortfolioNav />

      {children}
    </div>
  );
}
