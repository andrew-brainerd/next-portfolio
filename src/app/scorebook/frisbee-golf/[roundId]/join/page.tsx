import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE } from '@/constants/authentication';
import { LOGIN_ROUTE, SCOREBOOK_FRISBEE_GOLF_ROUTE } from 'constants/routes';
import { JoinRound } from '@/components/scorebook/JoinRound';

export const metadata = {
  title: 'Join Frisbee Golf round'
};

interface JoinFrisbeeGolfRoundPageProps {
  params: Promise<{ roundId: string }>;
}

export default async function JoinFrisbeeGolfRoundPage({ params }: JoinFrisbeeGolfRoundPageProps) {
  const { roundId } = await params;
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    const target = `${SCOREBOOK_FRISBEE_GOLF_ROUTE}/${roundId}/join`;
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(target)}`);
  }

  return <JoinRound roundId={roundId} />;
}
