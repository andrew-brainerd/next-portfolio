import { Suspense } from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE } from '@/constants/authentication';
import {
  LOGIN_ROUTE,
  SCOREBOOK_FRISBEE_GOLF_NEW_ROUTE,
  SCOREBOOK_FRISBEE_GOLF_ROUTE,
  SCOREBOOK_FRISBEE_GOLF_STATS_ROUTE,
  SCOREBOOK_ROUTE
} from 'constants/routes';
import { Loading } from '@/components/Loading';
import { RoundsList } from '@/components/scorebook/RoundsList';

export const metadata = {
  title: 'Frisbee Golf'
};

function RoundsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <Loading />
      <p className="mt-4 text-gray-400">Loading rounds...</p>
    </div>
  );
}

export default async function FrisbeeGolfPage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(SCOREBOOK_FRISBEE_GOLF_ROUTE)}`);
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Link href={SCOREBOOK_ROUTE} className="text-sm text-neutral-400 hover:text-white">
          ← Back to Scorebook
        </Link>
      </div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Frisbee Golf</h1>
        <div className="flex items-center gap-3">
          <Link
            href={SCOREBOOK_FRISBEE_GOLF_STATS_ROUTE}
            className="text-sm text-neutral-300 hover:text-white"
          >
            Stats
          </Link>
          <Link
            href={SCOREBOOK_FRISBEE_GOLF_NEW_ROUTE}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded transition-colors"
          >
            New round
          </Link>
        </div>
      </div>

      <Suspense fallback={<RoundsLoading />}>
        <RoundsList />
      </Suspense>
    </div>
  );
}
