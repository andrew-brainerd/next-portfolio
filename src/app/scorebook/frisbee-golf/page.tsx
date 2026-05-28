import { Suspense } from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';

import { TOKEN_COOKIE } from '@/constants/authentication';
import {
  LOGIN_ROUTE,
  SCOREBOOK_FRISBEE_GOLF_NEW_ROUTE,
  SCOREBOOK_FRISBEE_GOLF_ROUTE,
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
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-y-4">
        <p className="text-white text-xl">Please log in to access Frisbee Golf.</p>
        <Link
          href={`${LOGIN_ROUTE}?returnTo=${SCOREBOOK_FRISBEE_GOLF_ROUTE}`}
          className="text-brand-400 underline hover:text-brand-300"
        >
          Go to login
        </Link>
      </div>
    );
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
        <Link
          href={SCOREBOOK_FRISBEE_GOLF_NEW_ROUTE}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded transition-colors"
        >
          New round
        </Link>
      </div>

      <Suspense fallback={<RoundsLoading />}>
        <RoundsList />
      </Suspense>
    </div>
  );
}
