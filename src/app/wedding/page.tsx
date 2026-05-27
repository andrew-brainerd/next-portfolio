import { cookies } from 'next/headers';
import type { Metadata } from 'next';

import { TOKEN_COOKIE } from '@/constants/authentication';
import { getWeddingVenues } from '@/api/wedding';
import { WeddingShell } from '@/components/wedding/WeddingShell';

export const metadata: Metadata = {
  title: 'Wedding Planning',
  robots: { index: false, follow: false }
};

const TARGET_DATES = 'Late June – early July 2028';
const TARGET_LOCATION = 'Michigan';
const BUDGET_TARGET_LABEL = '$50K target';
const BUDGET_TARGET = 50000;

interface HeaderStatProps {
  label: string;
  value: string;
}

const HeaderStat = ({ label, value }: HeaderStatProps) => (
  <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 px-4 py-3">
    <p className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</p>
    <p className="text-sm font-semibold text-neutral-100 mt-0.5">{value}</p>
  </div>
);

export default async function WeddingPage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white text-xl">Please log in to view wedding planning.</p>
      </div>
    );
  }

  const venues = (await getWeddingVenues()) ?? [];

  return (
    <div className="container mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Wedding Planning</h1>
        <p className="text-sm text-neutral-400 mb-4">{venues.length}-venue shortlist</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-2xl">
          <HeaderStat label="Dates" value={TARGET_DATES} />
          <HeaderStat label="Location" value={TARGET_LOCATION} />
          <HeaderStat label="Budget" value={BUDGET_TARGET_LABEL} />
        </div>
      </header>

      {venues.length === 0 ? (
        <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-6 text-center">
          <p className="text-neutral-400">Unable to load venues. Is brainerd-api running?</p>
        </div>
      ) : (
        <WeddingShell venues={venues} budgetTarget={BUDGET_TARGET} />
      )}
    </div>
  );
}
