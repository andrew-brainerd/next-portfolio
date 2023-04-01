import { OwnedGame } from 'types/steam';
import { buildImageUrl } from 'utils/steam';

import styles from 'styles/components/Game.module.scss';

type GameProps = OwnedGame & { rank: number };

const Game = ({ rank, appid, name, img_logo_url, img_icon_url, playtime_forever, rtime_last_played }: GameProps) => (
  <div key={appid} className={styles.game}>
    <div className={styles.text}>
      <span className={styles.rank}>{rank}</span> {name}
    </div>
    <div className={styles.iconContainer}>
      <img alt={appid.toString()} src={buildImageUrl(appid, img_logo_url || img_icon_url)} width={60} height={60} />
    </div>
  </div>
);

export default Game;
