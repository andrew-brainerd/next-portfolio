import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE } from 'constants/authentication';
import { LOGIN_ROUTE, WATCH_ROUTE, WATCH_USAGE_ROUTE } from 'constants/routes';
import { UsageDashboard } from 'components/watch/UsageDashboard';

export const metadata = {
  title: 'Watch · API usage'
};

export default async function WatchUsagePage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(WATCH_USAGE_ROUTE)}`);
  }

  return (
    <div className="container mx-auto p-6">
      <Link href={WATCH_ROUTE} className="text-sm text-neutral-400 transition-colors hover:text-white">
        ← Watch
      </Link>
      <h1 className="mb-1 mt-2 text-3xl font-bold text-white">API usage</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Media API request quotas, captured from the calls we already make — so this costs no extra requests.
      </p>
      <UsageDashboard />
    </div>
  );
}
