import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TOKEN_COOKIE } from '@/constants/authentication';
import { LOGIN_ROUTE, ROLL_WITH_ME_ROUTE } from '@/constants/routes';
import { Game } from '@/components/roll-with-me/Game';

interface GamePageProps {
  params: Promise<{ gameId: string }>;
}

export default async function RollWithMeGamePage({ params }: GamePageProps) {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const { gameId } = await params;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(`${ROLL_WITH_ME_ROUTE}/${gameId}`)}`);
  }

  return <Game gameId={gameId} />;
}
