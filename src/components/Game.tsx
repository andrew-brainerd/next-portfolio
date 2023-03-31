import { OwnedGame } from 'types/steam';
import { buildImageUrl } from 'utils/steam';

import styles from 'styles/components/Game.module.scss';

const Game = ({ appid, name, img_logo_url, img_icon_url, playtime_forever, rtime_last_played }: OwnedGame) => (
  <div key={appid} className={styles.game}>
    <div>
      <img alt={appid.toString()} src={buildImageUrl(appid, img_logo_url || img_icon_url)} />
    </div>
    <div>{name}</div>
  </div>
);

export default Game;
