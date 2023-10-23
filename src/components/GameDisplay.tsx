import cn from 'clsx';
import Image from 'next/image';
import { buildImageUrl } from 'utils/steam';
import { COMPLETED_GAMES } from 'constants/steam';

import styles from 'styles/components/Game.module.scss';

type GameProps = {
  appId: string;
  href?: string;
  icon: string;
  image?: string;
  isRecent: boolean;
  name: string;
  rank: number;
  playtime: number;
};

const GameDisplay = ({ appId, href, icon, image, isRecent, name, playtime, rank }: GameProps) => (
  <div
    key={appId}
    className={styles.game}
    style={{ backgroundImage: image ? `url(${image})` : 'none', cursor: href ? 'pointer' : 'default' }}
    title={(playtime / 60).toFixed(0)}
    data-app-id={appId}
  >
    <div className={styles.text}>
      <span className={styles.rank}>{rank}</span>{' '}
      <span
        className={cn(styles.name, {
          [styles.recent]: isRecent,
          [styles.completed]: COMPLETED_GAMES.includes(appId)
        })}
      >
        {name}
      </span>
    </div>
    <div className={styles.iconContainer}>
      <Image alt={appId} src={buildImageUrl(appId, icon)} width={60} height={60} />
    </div>
  </div>
);

export default GameDisplay;
