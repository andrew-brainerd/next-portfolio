'use client';

import Image from 'next/image';
import { buildImageUrl } from 'utils/steam';

import styles from 'styles/components/Game.module.scss';

type GameProps = {
  appId: string;
  name: string;
  rank: number;
  icon: string;
  image?: string;
  href?: string;
};

const GameDisplay = ({ rank, appId, name, icon, image, href }: GameProps) => {
  const handleClick = (e: any) => {
    e.preventDefault();
    if (href) {
      window.open(href);
    }
  };

  return (
    <div
      key={appId}
      className={styles.game}
      onClick={handleClick}
      style={{ backgroundImage: image ? `url(${image})` : 'none', cursor: href ? 'pointer' : 'default' }}
      title={href}
    >
      <div className={styles.text}>
        <span className={styles.rank}>{rank}</span> {name}
      </div>
      <div className={styles.iconContainer}>
        <Image alt={appId} src={buildImageUrl(appId, icon)} width={60} height={60} />
      </div>
    </div>
  );
};

export default GameDisplay;
