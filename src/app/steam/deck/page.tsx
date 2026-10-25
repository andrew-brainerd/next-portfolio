import Link from 'next/link';
import type { Metadata } from 'next';
import { getDeck60List } from 'api/steamDeck';
import { DeckGameCover } from 'components/steam/DeckGameCover';
import { STEAM_ROUTE } from 'constants/routes';
import { sortGamesByName } from 'utils/steam';

const title = 'Steam Deck 60fps Games';
const description = 'Games that hold a stable 60fps on the Steam Deck LCD';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description }
};

const SteamDeck = async () => {
  const { criteria, games } = await getDeck60List();
  const sortedGames = sortGamesByName(games);

  return (
    <main className="font-roboto mx-auto max-w-[1400px] p-4 sm:p-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-pacifico text-4xl sm:text-5xl">Steam Deck 60fps</h1>
          <p className="mt-3 text-neutral-400">
            {criteria || description}
            {sortedGames.length > 0 && <span className="text-neutral-500"> · {sortedGames.length} games</span>}
          </p>
        </div>
        <Link href={STEAM_ROUTE} className="font-oswald text-lg text-neutral-400 hover:text-white">
          My Steam games →
        </Link>
      </header>
      {sortedGames.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-3 gap-3 p-0 sm:grid-cols-4 sm:gap-5 md:grid-cols-5 lg:grid-cols-6">
          {sortedGames.map(game => (
            <li key={game.appId}>
              <DeckGameCover {...game} />
            </li>
          ))}
        </ul>
      ) : (
        <p role="alert" className="text-neutral-400">
          Couldn&apos;t load the Steam Deck list right now.
        </p>
      )}
    </main>
  );
};

export default SteamDeck;
