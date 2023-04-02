import { OwnedGame } from 'types/steam';
import { buildImageUrl } from 'utils/steam';
import { getGameMedia } from 'app/api/rawg';

import styles from 'styles/components/Game.module.scss';

type GameProps = OwnedGame & { rank: number };

const formatName = (name: string) => {
  let formatted = name;
  formatted = formatted.replaceAll('(2009) - Multiplayer', ''); // CoD: MW2
  formatted = formatted.replaceAll('®', '');
  formatted = formatted.replaceAll('™', '');
  return formatted;
};

const Game = async ({ rank, appid, name, img_logo_url, img_icon_url }: GameProps) => {
  const formattedName = formatName(name);
  const gameMedia = await getGameMedia(formattedName);

  if (!gameMedia) {
    console.log('Missing Game', { name: formattedName });
  } else {
    console.log(`${rank}) ${formattedName} | ${gameMedia.color} | [${gameMedia.image}]`);
  }

  return (
    <div key={appid} className={styles.game} style={{ backgroundImage: `url(${gameMedia.image})` }}>
      <div className={styles.text}>
        <span className={styles.rank}>{rank}</span>
        <span className={styles.name}>{formattedName}</span>
      </div>
      <div className={styles.iconContainer}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={appid.toString()} src={buildImageUrl(appid, img_logo_url || img_icon_url)} width={60} height={60} />
      </div>
    </div>
  );
};

export default Game;
