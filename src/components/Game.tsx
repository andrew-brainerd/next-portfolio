import { OwnedGame } from 'types/steam';
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

  return (
    <GameDisplay
      rank={rank}
      appId={appid.toString()}
      name={formattedName}
      icon={img_icon_url}
    />
  );
};

export default Game;
