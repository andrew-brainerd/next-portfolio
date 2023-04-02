import { OwnedGame } from 'types/steam';
import { buildImageUrl } from 'utils/steam';
import { getArtworks, searchGames } from 'app/api/igdb';

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
  const [game] = await searchGames(formattedName);
  const [artwork] = await getArtworks(game?.id);

  if (!game) {
    console.log('Missing Game', { name: formattedName, game });
  } else {
    console.log(`${rank}) ${game.name} [${game.id}]`, artwork);
  }

  return (
    <div key={appid} className={styles.game}>
      <div className={styles.text}>
        <span className={styles.rank}>{rank}</span> {formattedName}
      </div>
      <div className={styles.iconContainer}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={appid.toString()} src={buildImageUrl(appid, img_logo_url || img_icon_url)} width={60} height={60} />
      </div>
    </div>
  );
};

export default Game;
