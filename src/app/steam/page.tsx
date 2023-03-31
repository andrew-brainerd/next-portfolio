import { getOwnedGames, getPlayerSummary } from 'app/api/steam';
import Game from 'components/Game';

import styles from 'styles/components/Steam.module.scss';

// Last Two Weeks: .filter(game => game.rtime_last_played > 1676768400)

const Steam = async () => {
  const playerSummary = await getPlayerSummary();
  const games = await getOwnedGames();

  return (
    <div className={styles.steam}>
      {(games || [])
        .sort((a, b) => b.playtime_forever - a.playtime_forever)
        .map(game => <Game key={game.appid} {...game} />)
        .slice(0, 10)}
    </div>
  );
};

export default Steam;
