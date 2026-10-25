import { loadSteamGames } from 'api/steamGames';
import Link from 'next/link';
import { Game } from 'components/steam/Game';
import { steamPageHref } from 'utils/steam';

interface SteamGamesListProps {
  steamId?: string;
  count?: number;
  shouldFetchTTB: boolean;
  deck60Only: boolean;
}

export const SteamGamesList = async ({ steamId, count, shouldFetchTTB, deck60Only }: SteamGamesListProps) => {
  const { pageHeading, games: processedGames } = await loadSteamGames({ steamId, count, shouldFetchTTB, deck60Only });

  return (
    <>
      <header className="items-center flex flex-wrap justify-between mb-3">
        <h1 className="font-pacifico text-4xl m-3.5">{pageHeading}</h1>
        <Link
          className="font-oswald m-3.5 rounded border-2 border-solid border-[#a3a3a3] px-3 py-1 text-lg hover:border-white"
          href={steamPageHref({ steamId, deck60: !deck60Only })}
        >
          {deck60Only ? 'All games' : 'Steam Deck 60fps'}
        </Link>
      </header>
      <section aria-label="Game library">
        {processedGames.length > 0 ? (
          <ul className="list-none p-0 m-0">
            {processedGames.map((game, index) => (
              <li key={game.appid}>
                <Game rank={index + 1} {...game} />
              </li>
            ))}
          </ul>
        ) : (
          <p role="alert">Invalid Steam ID Provided</p>
        )}
      </section>
    </>
  );
};
