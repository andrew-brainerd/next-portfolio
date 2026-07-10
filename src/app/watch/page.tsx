import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE } from 'constants/authentication';
import { LOGIN_ROUTE, WATCH_ROUTE, WATCH_USAGE_ROUTE } from 'constants/routes';
import { WatchLibrary } from 'components/watch/WatchLibrary';

export const metadata = {
  title: 'Watch'
};

export default async function WatchPage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(WATCH_ROUTE)}`);
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-1 text-3xl font-bold text-white">Watch</h1>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-400">Your movies and shows, and where to stream them.</p>
        <Link
          href={WATCH_USAGE_ROUTE}
          className="whitespace-nowrap text-sm text-neutral-400 transition-colors hover:text-white"
        >
          API usage →
        </Link>
      </div>
      <WatchLibrary />
    </div>
  );
}
