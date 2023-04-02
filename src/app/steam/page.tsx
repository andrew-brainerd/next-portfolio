export const dynamic = 'force-dynamic';

import { getOwnedGames } from 'app/api/steam';
import Game from 'components/Game';

import styles from 'styles/components/Steam.module.scss';

interface SteamProps {
  searchParams: {
    steamId?: string;
  };
}

const Steam = async ({ searchParams: { steamId } }: SteamProps) => {
  const games = await getOwnedGames(steamId);

  return (
    <div className={styles.steam}>
      <h1>{`${!steamId ? 'My ' : ''}Top 10 Steam Games`}</h1>
      <div className={styles.games}>
        {games.length ? (
          games
            .sort((a, b) => b.playtime_forever - a.playtime_forever)
            /* @ts-expect-error Async Server Component */
            .map((game, g) => <Game key={game.appid} rank={g + 1} {...game} />)
            .slice(0, 10)
        ) : (
          <h3>Invalid Steam ID Provided</h3>
        )}
      </div>
    </div>
  );
};

export default Steam;
