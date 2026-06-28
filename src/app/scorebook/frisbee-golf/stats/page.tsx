import { Suspense } from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE } from '@/constants/authentication';
import {
  LOGIN_ROUTE,
  SCOREBOOK_FRISBEE_GOLF_ROUTE,
  SCOREBOOK_FRISBEE_GOLF_STATS_ROUTE
} from 'constants/routes';
import { Loading } from '@/components/Loading';
import { StatsView } from '@/components/scorebook/StatsView';

export const metadata = {
  title: 'Frisbee Golf stats'
};

function StatsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <Loading />
      <p className="mt-4 text-gray-400">Crunching numbers...</p>
    </div>
  );
}

export default async function FrisbeeGolfStatsPage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(SCOREBOOK_FRISBEE_GOLF_STATS_ROUTE)}`);
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Link href={SCOREBOOK_FRISBEE_GOLF_ROUTE} className="text-sm text-neutral-400 hover:text-white">
          ← Back to rounds
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-white mb-6">Your stats</h1>
      <Suspense fallback={<StatsLoading />}>
        <StatsView />
      </Suspense>
    </div>
  );
}
