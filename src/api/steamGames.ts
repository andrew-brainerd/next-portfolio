import { COMPLETED_GAMES, MINIMUM_PLAYTIME } from 'constants/steam';
import { getOwnedGames, getPlayerSummary, getRecentGames } from 'api/steam';
import { HowLongToBeatService } from 'howlongtobeat';
import type { ProcessedSteamGame, SteamGamesData } from 'types/steam';

interface LoadSteamGamesOptions {
  steamId?: string;
  count?: number;
  shouldFetchTTB: boolean;
}

const HIDDEN_GAMES = [1454400];
const MAX_TTB_REQUESTS = 20;

/**
 * Shared data loader for the Steam library: fetches, filters, sorts, and (optionally) enriches
 * games with time-to-beat. Used by both the classic and Win95 presentations so they stay in sync.
 */
export const loadSteamGames = async ({
  steamId,
  count,
  shouldFetchTTB
}: LoadSteamGamesOptions): Promise<SteamGamesData> => {
  const [{ personaname }, steamGames, recentGames] = await Promise.all([
    getPlayerSummary(steamId),
    getOwnedGames(steamId),
    getRecentGames(steamId)
  ]);

  const userHeading = `${!steamId ? 'My ' : ''} Games${!steamId ? '' : ` for ${personaname}`}`;
  const pageHeading = personaname === 'Invalid User' ? personaname : userHeading;

  const sortedGames = steamGames
    .filter(game => !HIDDEN_GAMES.includes(game.appid))
    .filter(game => (game?.playtime_forever || 0) / 60 > MINIMUM_PLAYTIME)
    .sort((a, b) => (b?.playtime_forever || 0) - (a?.playtime_forever || 0));

  const limitedGames = sortedGames.slice(0, count || sortedGames.length);

  const hltbService = shouldFetchTTB ? new HowLongToBeatService() : null;
  const gamesToFetchTTB = shouldFetchTTB ? limitedGames.slice(0, MAX_TTB_REQUESTS) : [];

  const gamesWithTTB =
    shouldFetchTTB && hltbService
      ? await Promise.all(
          gamesToFetchTTB.map(async game => {
            try {
              const [timeToBeat] = await hltbService.search(game.name);
              return { ...game, hoursToBeat: timeToBeat?.gameplayMain };
            } catch (e) {
              return game;
            }
          })
        )
      : [];

  const ttbMap = new Map(gamesWithTTB.map(g => [g.appid, g.hoursToBeat]));

  const games: ProcessedSteamGame[] = limitedGames.map(game => {
    const recentGame = recentGames.find(rg => game.appid === rg.appid);
    const isRecent = (recentGame?.playtime_2weeks || 0) / 60 > MINIMUM_PLAYTIME;
    const isCompleted = !!COMPLETED_GAMES.find(completedGame => game.appid === Number(completedGame));
    const hoursToBeat = ttbMap.get(game.appid);

    return { ...game, isRecent, isCompleted, ...(hoursToBeat && { hoursToBeat }) };
  });

  return { pageHeading, games };
};
