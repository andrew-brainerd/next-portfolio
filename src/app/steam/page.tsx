export const dynamic = 'force-dynamic';

import { getOwnedGames, getPlayerSummary } from 'api/steam';
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

  const userHeading = `${!steamId ? 'My ' : ''} Steam Games${!steamId ? '' : ` for ${personaname}`}`;
  const pageHeading = personaname === 'Invalid User' ? personaname : userHeading;

  return (
    <div className={styles.steam}>
      <div className={styles.headerContainer}>
        <h1>{pageHeading}</h1>
        <div className={styles.legend}>
          <div className={styles.color} />
          <span>Completed</span>
        </div>
      </div>
      <div className={styles.games}>
        {(games || []).length ? (
          games
            .sort((a, b) => (b?.playtime_forever || 0) - (a?.playtime_forever || 0))
            /* @ts-expect-error Async Server Component */
            .map((game, g) => <Game key={game.appid} rank={g + 1} {...game} />)
            .slice(0, count || games.length)
        ) : (
          <h3>Invalid Steam ID Provided</h3>
        )}
      </div>
    </div>
  );
};

export default Steam;
