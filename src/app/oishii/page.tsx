import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE } from '@/constants/authentication';
import { LOGIN_ROUTE, OISHII_ROUTE } from '@/constants/routes';
import { getGmailConnection, getPreferences, listPantries } from '@/api/oishii';
import { DietaryPreferences } from '@/components/oishii/DietaryPreferences';
import { GmailConnectCard } from '@/components/oishii/GmailConnectCard';
import { PantryList } from '@/components/oishii/PantryList';

export const metadata = {
  title: 'Oishii'
};

interface OishiiPageProps {
  searchParams: Promise<{ gmail?: string }>;
}

export default async function OishiiPage({ searchParams }: OishiiPageProps) {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(OISHII_ROUTE)}`);
  }

  const { gmail } = await searchParams;
  const notice = gmail === 'connected' ? 'connected' : gmail === 'error' ? 'error' : null;

  const [pantries, gmailConnected, preferences] = await Promise.all([
    listPantries(),
    getGmailConnection(),
    getPreferences()
  ]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2 text-white">Oishii</h1>
      <p className="text-neutral-400 mb-6">Shared grocery pantries for the people you cook with.</p>

      <div className="mb-8 flex flex-col gap-6">
        <GmailConnectCard connected={gmailConnected} notice={notice} />
        <DietaryPreferences initialPreferences={preferences} />
      </div>

      <PantryList initialPantries={pantries} />
    </div>
  );
}
