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

export default async function SteamGamesList({ steamId, count, shouldFetchTTB }: SteamGamesListProps) {
  const [{ personaname }, steamGames, recentGames] = await Promise.all([
    getPlayerSummary(steamId),
    getOwnedGames(steamId),
    getRecentGames(steamId)
  ]);

  const userHeading = `${!steamId ? 'My ' : ''} Games${!steamId ? '' : ` for ${personaname}`}`;
  const pageHeading = personaname === 'Invalid User' ? personaname : userHeading;

  const filteredGames = steamGames.filter(game => !HIDDEN_GAMES.includes(game.appid));

  const hltbService = shouldFetchTTB ? new HowLongToBeatService() : null;

  const gamesWithTTB =
    shouldFetchTTB && hltbService
      ? await Promise.all(
          filteredGames
            .filter(game => (game?.playtime_forever || 0) / 60 > MINIMUM_PLAYTIME)
            .map(async game => {
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
      : filteredGames;

  const processedGames = gamesWithTTB
    .sort((a, b) => (b?.playtime_forever || 0) - (a?.playtime_forever || 0))
    .map(game => {
      const hasPlaytime = (game?.playtime_forever || 0) / 60 > MINIMUM_PLAYTIME;
      const recentGame = recentGames.find(rg => game.appid === rg.appid);
      const isRecent = (recentGame?.playtime_2weeks || 0) / 60 > MINIMUM_PLAYTIME;
      const isCompleted = !!COMPLETED_GAMES.find(completedGame => game.appid === Number(completedGame));

      return hasPlaytime ? { ...game, isRecent, isCompleted } : null;
    })
    .filter((game): game is NonNullable<typeof game> => game !== null)
    .slice(0, count || gamesWithTTB.length);

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
