import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';
import { LOGIN_ROUTE, OISHII_ROUTE } from '@/constants/routes';
import { getGmailConnection, getPantry } from '@/api/oishii';
import { PantryDetail } from '@/components/oishii/PantryDetail';

export const metadata = {
  title: 'Pantry'
};

interface PantryDetailPageProps {
  params: Promise<{ pantryId: string }>;
}

export default async function OishiiPantryPage({ params }: PantryDetailPageProps) {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const userId = cookieJar.get(USER_COOKIE)?.value;
  const { pantryId } = await params;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(`${OISHII_ROUTE}/${pantryId}`)}`);
  }

  const [pantry, gmailConnected] = await Promise.all([getPantry(pantryId), getGmailConnection()]);

  // Not-found or forbidden (the API returns nothing for pantries you can't see) → back to the list.
  if (!pantry) {
    redirect(OISHII_ROUTE);
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-4">
        <Link href={OISHII_ROUTE} className="text-sm text-neutral-400 hover:text-white">
          ← Back to pantries
        </Link>
      </div>

      <PantryDetail initialPantry={pantry} currentUserId={userId ?? ''} gmailConnected={gmailConnected} />
    </div>
  );
}
