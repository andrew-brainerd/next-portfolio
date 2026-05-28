import Link from 'next/link';
import { cookies } from 'next/headers';

import { TOKEN_COOKIE } from '@/constants/authentication';
import { LOGIN_ROUTE, SCOREBOOK_FRISBEE_GOLF_ROUTE, SCOREBOOK_ROUTE } from 'constants/routes';

export const metadata = {
  title: 'Frisbee Golf'
};

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
      <h1 className="text-3xl font-bold text-white mb-2">Frisbee Golf</h1>
      <p className="text-neutral-400">Scorekeeping for the 4th of July family round. Coming soon.</p>
    </div>
  );
}
