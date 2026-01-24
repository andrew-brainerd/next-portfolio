import { COMPLETED_GAMES, MINIMUM_PLAYTIME } from 'constants/steam';
import { getOwnedGames, getPlayerSummary, getRecentGames } from 'api/steam';
import Game from 'components/steam/Game';
import { HowLongToBeatService } from 'howlongtobeat';

interface SteamGamesListProps {
  steamId?: string;
  count?: number;
  shouldFetchTTB: boolean;
}

const HIDDEN_GAMES = [1454400];
const MAX_TTB_REQUESTS = 20;

export default async function SteamGamesList({ steamId, count, shouldFetchTTB }: SteamGamesListProps) {
  const [{ personaname }, steamGames, recentGames] = await Promise.all([
    getPlayerSummary(steamId),
    getOwnedGames(steamId),
    getRecentGames(steamId)
  ]);

  const userHeading = `${!steamId ? 'My ' : ''} Games${!steamId ? '' : ` for ${personaname}`}`;
  const pageHeading = personaname === 'Invalid User' ? personaname : userHeading;

  // Filter, sort, and limit games before any TTB requests
  const sortedGames = steamGames
    .filter(game => !HIDDEN_GAMES.includes(game.appid))
    .filter(game => (game?.playtime_forever || 0) / 60 > MINIMUM_PLAYTIME)
    .sort((a, b) => (b?.playtime_forever || 0) - (a?.playtime_forever || 0));

  const limitedGames = sortedGames.slice(0, count || sortedGames.length);

  // Only fetch TTB for top games to avoid excessive API calls
  const hltbService = shouldFetchTTB ? new HowLongToBeatService() : null;
  const gamesToFetchTTB = shouldFetchTTB ? limitedGames.slice(0, MAX_TTB_REQUESTS) : [];

  const gamesWithTTB =
    shouldFetchTTB && hltbService
      ? await Promise.all(
          gamesToFetchTTB.map(async game => {
            try {
              const [timeToBeat] = await hltbService.search(game.name);
              return {
                ...game,
                hoursToBeat: timeToBeat?.gameplayMain
              };
            } catch (e) {
              return game;
            }
          })
        )
      : [];

  // Merge TTB data back with remaining games
  const ttbMap = new Map(gamesWithTTB.map(g => [g.appid, g.hoursToBeat]));

  const processedGames = limitedGames.map(game => {
    const recentGame = recentGames.find(rg => game.appid === rg.appid);
    const isRecent = (recentGame?.playtime_2weeks || 0) / 60 > MINIMUM_PLAYTIME;
    const isCompleted = !!COMPLETED_GAMES.find(completedGame => game.appid === Number(completedGame));
    const hoursToBeat = ttbMap.get(game.appid);

    return { ...game, isRecent, isCompleted, ...(hoursToBeat && { hoursToBeat }) };
  });

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
}
