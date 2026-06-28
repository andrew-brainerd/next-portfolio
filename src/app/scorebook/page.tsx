import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE } from '@/constants/authentication';
import { LOGIN_ROUTE, SCOREBOOK_ROUTE } from 'constants/routes';
import { SCOREBOOK_GAMES } from 'constants/scorebookGames';

export const metadata = {
  title: 'Scorebook'
};

export default async function ScorebookPage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(SCOREBOOK_ROUTE)}`);
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2 text-white">Scorebook</h1>
      <p className="text-neutral-400 mb-6">Keep score for the games you play together.</p>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SCOREBOOK_GAMES.map(game => {
          const card = (
            <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-5 h-full transition hover:border-brand-500 hover:bg-neutral-700">
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-xl font-semibold text-white">{game.name}</h2>
                {!game.available && (
                  <span className="text-xs uppercase tracking-wider text-neutral-400">Soon</span>
                )}
              </div>
              <p className="text-sm text-neutral-300">{game.description}</p>
            </div>
          );

          return (
            <li key={game.id}>
              {game.available ? <Link href={game.route}>{card}</Link> : card}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
