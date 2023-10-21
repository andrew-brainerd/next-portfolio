import { OwnedGame } from 'types/steam';
import GameDisplay from 'components/GameDisplay';

type GameProps = OwnedGame & { isCompleted: boolean; isRecent: boolean; rank: number };

const formatName = (name: string) => {
  let formatted = name;
  formatted = formatted.replaceAll('(2009) - Multiplayer', ''); // CoD: MW2
  formatted = formatted.replaceAll('®', '');
  formatted = formatted.replaceAll('™', '');
  formatted = formatted.replaceAll(': Game of the Year', '');
  return formatted;
};

const Game = async ({ appid, img_icon_url, name, isRecent, playtime_forever, rank }: GameProps) => {
  const formattedName = formatName(name);

  return (
    <GameDisplay
      rank={rank}
      appId={appid.toString()}
      name={formattedName}
      icon={img_icon_url}
      isRecent={isRecent}
      playtime={playtime_forever}
    />
  );
};

export default Game;
