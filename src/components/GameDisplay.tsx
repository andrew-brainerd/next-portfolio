'use client';

import { buildImageUrl } from 'utils/steam';

import styles from 'styles/components/Game.module.scss';

type GameProps = {
  appId: string;
  name: string;
  rank: number;
  icon: string;
  image: string;
  href: string;
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
      style={{ backgroundImage: `url(${image})`, cursor: href ? 'pointer' : 'default' }}
      title={href}
    >
      <div className={styles.text}>
        <span className={styles.rank}>{rank}</span> {name}
      </div>
      <div className={styles.iconContainer}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={appId} src={buildImageUrl(appId, icon)} width={60} height={60} />
      </div>
    </div>
  );
};

export default GameDisplay;
