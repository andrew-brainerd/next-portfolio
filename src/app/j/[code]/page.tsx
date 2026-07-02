import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE } from '@/constants/authentication';
import { LOGIN_ROUTE, SCOREBOOK_FRISBEE_GOLF_ROUTE } from 'constants/routes';
import { lookupFrisbeeGolfRoundByCode } from '@/api/scorebook';

export const metadata = {
  title: 'Join Frisbee Golf round'
};

interface JoinCodePageProps {
  params: Promise<{ code: string }>;
}

// Short invite link: /j/{joinCode} → resolve the code → the round's join page.
export default async function JoinCodePage({ params }: JoinCodePageProps) {
  const { code } = await params;
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(`/j/${code}`)}`);
  }

  const round = await lookupFrisbeeGolfRoundByCode(code);
  if (!round) {
    // Unknown/expired code — drop them on the Frisbee Golf home to retry the code.
    redirect(SCOREBOOK_FRISBEE_GOLF_ROUTE);
  }

  redirect(`${SCOREBOOK_FRISBEE_GOLF_ROUTE}/${round.id}/join`);
}
