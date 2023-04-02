export const dynamic = 'force-dynamic';

import { searchGames } from 'app/api/rawg';
import { getOwnedGames, getPlayerSummary } from 'app/api/steam';
import Game from 'components/Game';

import styles from 'styles/components/Steam.module.scss';

interface SteamProps {
  searchParams: {
    steamId?: string;
    count?: number;
  };
}

const Steam = async ({ searchParams: { steamId, count } }: SteamProps) => {
  const playerData = getPlayerSummary(steamId);
  const gamesData = getOwnedGames(steamId);
  const [{ personaname }, games] = await Promise.all([playerData, gamesData]);

  const numGames = count && count <= 25 ? count : 10;

  return (
    <div className={styles.steam}>
      <h1>{`${!steamId ? 'My ' : ''}Top ${numGames} Steam Games${!steamId ? '' : ` for ${personaname}`}`}</h1>
      <div className={styles.games}>
        {games.length ? (
          games
            .sort((a, b) => b.playtime_forever - a.playtime_forever)
            /* @ts-expect-error Async Server Component */
            .map((game, g) => <Game key={game.appid} rank={g + 1} {...game} />)
            .slice(0, numGames)
        ) : (
          <h3>Invalid Steam ID Provided</h3>
        )}
      </div>
    </div>
  );
};

export default Steam;
