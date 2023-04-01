import { getOwnedGames, getPlayerSummary } from 'app/api/steam';
import Game from 'components/Game';

import styles from 'styles/components/Steam.module.scss';

// Last Two Weeks: .filter(game => game.rtime_last_played > 1676768400)

const Steam = async () => {
  const games = await getOwnedGames();

  return (
    <div className={styles.steam}>
      <h1>My Top 10 Steam Games</h1>
      <div className={styles.games}>
        {(games || [])
          .sort((a, b) => b.playtime_forever - a.playtime_forever)
          .map((game, g) => <Game key={game.appid} rank={g + 1} {...game} />)
          .slice(0, 10)}
      </div>
    </div>
  );
};

export default Steam;
