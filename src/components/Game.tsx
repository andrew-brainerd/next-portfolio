import { OwnedGame } from 'types/steam';
import { getGameData } from 'app/api/rawg';
import GameDisplay from 'components/GameDisplay';

type GameProps = OwnedGame & { rank: number };

const formatName = (name: string) => {
  let formatted = name;
  formatted = formatted.replaceAll('(2009) - Multiplayer', ''); // CoD: MW2
  formatted = formatted.replaceAll('®', '');
  formatted = formatted.replaceAll('™', '');
  return formatted;
};

const Game = async ({ rank, appid, name, img_icon_url }: GameProps) => {
  const formattedName = formatName(name);
  const gameData = await getGameData(formattedName);

  return (
    <GameDisplay
      rank={rank}
      appId={appid.toString()}
      name={formattedName}
      icon={img_icon_url}
      image={gameData.image}
      href={gameData.website}
    />
  );
};

export default Game;
