import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TOKEN_COOKIE } from '@/constants/authentication';
import { LOGIN_ROUTE, ROLL_WITH_ME_ROUTE } from '@/constants/routes';
import { InviteAccept } from '@/components/roll-with-me/InviteAccept';

interface InvitePageProps {
  params: Promise<{ gameId: string }>;
}

export default async function RollWithMeInvitePage({ params }: InvitePageProps) {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const { gameId } = await params;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(`${ROLL_WITH_ME_ROUTE}/invite/${gameId}`)}`);
  }

  return <InviteAccept gameId={gameId} />;
}
