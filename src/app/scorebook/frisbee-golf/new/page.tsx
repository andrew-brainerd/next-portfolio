import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE } from '@/constants/authentication';
import {
  LOGIN_ROUTE,
  SCOREBOOK_FRISBEE_GOLF_NEW_ROUTE,
  SCOREBOOK_FRISBEE_GOLF_ROUTE
} from 'constants/routes';
import { NewRoundForm } from '@/components/scorebook/NewRoundForm';

export const metadata = {
  title: 'New Frisbee Golf round'
};

export default async function NewFrisbeeGolfRoundPage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(SCOREBOOK_FRISBEE_GOLF_NEW_ROUTE)}`);
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Link href={SCOREBOOK_FRISBEE_GOLF_ROUTE} className="text-sm text-neutral-400 hover:text-white">
          ← Back to rounds
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-white mb-6">New round</h1>
      <NewRoundForm />
    </div>
  );
}
