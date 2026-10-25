import { loadSteamGames } from 'api/steamGames';
import { Game } from 'components/steam/Game';

interface SteamGamesListProps {
  steamId?: string;
  count?: number;
  shouldFetchTTB: boolean;
}

export const SteamGamesList = async ({ steamId, count, shouldFetchTTB }: SteamGamesListProps) => {
  const { pageHeading, games: processedGames } = await loadSteamGames({ steamId, count, shouldFetchTTB });

  return (
    <>
      <header className="items-center flex flex-wrap justify-between mb-3">
        <h1 className="font-pacifico text-4xl m-3.5">{pageHeading}</h1>
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
