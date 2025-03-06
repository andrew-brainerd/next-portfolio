import cn from 'clsx';
import Image from 'next/image';
import { buildImageUrl } from 'utils/steam';
// import { COMPLETED_GAMES } from 'constants/steam';

type GameProps = {
  appId: string;
  href?: string;
  icon: string;
  image?: string;
  isRecent: boolean;
  name: string;
  rank: number;
  playtime: number;
  hoursToBeat?: number;
};

export const GameDisplay = ({ appId, href, icon, image, isRecent, name, playtime, rank, hoursToBeat }: GameProps) => (
  <div
    key={appId}
    className="items-center bg-[#2f2f2f] bg-no-repeat rounded border-2 border-solid border-transparent flex justify-between mt-2.5 p-1 sm:py-1 sm:px-4"
    style={{ backgroundImage: image ? `url(${image})` : 'none', cursor: href ? 'pointer' : 'default' }}
    title={(playtime / 60).toFixed(0)}
    data-app-id={appId}
    data-beat-hours={hoursToBeat}
  >
    <div className="bg-[#2f2f2f80] font-oswald sm:text-3xl mx-1 overflow-hidden pl-2.5 text-ellipsis whitespace-nowrap text-xl m-0">
      <span className="text-[#a3a3a3] inline-block opacity-80 sm:min-w-10 w-8 sm:w-10 min-w-8 relative right-3 text-center">{rank}</span>{' '}
      <span
        className={cn({
          // [styles.recent]: isRecent
          // [styles.completed]: COMPLETED_GAMES.includes(appId)
        })}
      >
        {name}
      </span>
    </div>
    <div className="flex justify-center overflow-hidden">
      <Image
        className="border-white rounded border-1 sm:h-14 sm:w-14 w-6 h-6"
        alt={appId}
        src={buildImageUrl(appId, icon)}
        width={60}
        height={60}
      />
    </div>
  </div>
);
