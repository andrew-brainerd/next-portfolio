import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { TOKEN_COOKIE } from '@/constants/authentication';
import { LOGIN_ROUTE, WEDDING_ROUTE, WEDDING_PLANNING_ROUTE } from '@/constants/routes';

export const metadata: Metadata = {
  title: 'Wedding',
  robots: { index: false, follow: false }
};

export default async function WeddingPage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(WEDDING_ROUTE)}`);
  }

  return (
    <div className="container mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Our Wedding</h1>
        <p className="text-sm text-neutral-400">Everything about the day we&apos;re planning.</p>
      </header>

      <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-6">
        <p className="text-neutral-400">More coming soon.</p>
      </div>

      <Link
        href={WEDDING_PLANNING_ROUTE}
        className="mt-6 inline-block text-sm text-neutral-400 hover:text-neutral-200 transition-colors underline underline-offset-4"
      >
        Venue comparison →
      </Link>
    </div>
  );
}
