import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE } from '@/constants/authentication';
import { LOGIN_ROUTE, OISHII_ROUTE } from '@/constants/routes';
import { getInvite } from '@/api/oishii';
import { InviteLanding } from '@/components/oishii/InviteLanding';

export const metadata = {
  title: 'Pantry invite'
};

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function OishiiInvitePage({ params }: InvitePageProps) {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const { token: inviteToken } = await params;

  // Send unauthenticated users through login and back to this same invite page.
  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(`${OISHII_ROUTE}/invite/${inviteToken}`)}`);
  }

  const invite = await getInvite(inviteToken);

  if (!invite) {
    return (
      <div className="container mx-auto p-6">
        <div className="mx-auto max-w-md rounded-xl border border-neutral-700 bg-neutral-800 p-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-white">Invite not found</h1>
          <p className="mb-4 text-neutral-400">This invite link is invalid or has expired.</p>
          <Link href={OISHII_ROUTE} className="text-brand-400 underline hover:text-brand-300">
            Go to your pantries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <InviteLanding token={inviteToken} invite={invite} />
    </div>
  );
}
