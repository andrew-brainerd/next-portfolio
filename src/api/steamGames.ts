import { COMPLETED_GAMES, MINIMUM_PLAYTIME } from 'constants/steam';
import { selectSteamGames } from 'utils/steam';
import { getOwnedGames, getPlayerSummary, getRecentGames } from 'api/steam';
import { getDeck60AppIds } from 'api/steamDeck';
import { HowLongToBeatService } from 'howlongtobeat';
import type { ProcessedSteamGame, SteamGamesData } from 'types/steam';

interface LoadSteamGamesOptions {
  steamId?: string;
  count?: number;
  shouldFetchTTB: boolean;
  deck60Only?: boolean;
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
  shouldFetchTTB,
  deck60Only = false
}: LoadSteamGamesOptions): Promise<SteamGamesData> => {
  const [{ personaname }, steamGames, recentGames, deck60AppIds] = await Promise.all([
    getPlayerSummary(steamId),
    getOwnedGames(steamId),
    getRecentGames(steamId),
    getDeck60AppIds()
  ]);

  const gamesLabel = deck60Only ? 'Steam Deck 60fps Games' : 'Games';
  const userHeading = `${!steamId ? 'My ' : ''} ${gamesLabel}${!steamId ? '' : ` for ${personaname}`}`;
  const pageHeading = personaname === 'Invalid User' ? personaname : userHeading;

  const sortedGames = selectSteamGames(steamGames, {
    hiddenAppIds: HIDDEN_GAMES,
    minimumHours: MINIMUM_PLAYTIME,
    deck60AppIds: deck60Only ? deck60AppIds : undefined
  });

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
    const isDeck60 = deck60AppIds.includes(game.appid);
    const hoursToBeat = ttbMap.get(game.appid);

    return { ...game, isRecent, isCompleted, isDeck60, ...(hoursToBeat && { hoursToBeat }) };
  });

  return { pageHeading, games };
};
