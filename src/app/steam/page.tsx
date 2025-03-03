'use client';

import { useEffect, useState, use } from 'react';
import cn from 'clsx';
import { COMPLETED_GAMES, MINIMUM_PLAYTIME, MY_STEAM_ID } from 'constants/steam';
import { useSteam } from 'hooks/useSteam';
import Game from 'components/Game';

interface SteamProps {
  searchParams: Promise<{
    count?: number;
    steamId?: string;
  }>;
}

const Steam = (props: SteamProps) => {
  const { count, steamId } = use(props.searchParams);

  const [isMounted, setIsMounted] = useState(false);
  const { games, recentGames, showCompleted, showRecent, username, setShowRecent, setShowCompleted } = useSteam();

  const userHeading = `${!steamId ? 'My ' : ''} Games${!steamId ? '' : ` for ${username}`}`;
  const pageHeading = username === 'Invalid User' ? username : userHeading;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="font-roboto my-0 mx-0 sm:mx-auto max-w-[1200px] p-2 sm:p-12" data-steam-id={steamId || MY_STEAM_ID}>
      <div className="items-center flex flex-wrap justify-between mb-3">
        <h2 className="font-pacifico text-4xl m-3.5">{pageHeading}</h2>
        <div className="hidden">
          <div className="h-5 ml-6 mr-2 w-5 bg-[#aef49e]" />
          <span
            className={cn('cursor-pointer select-none', { ['font-bold']: showRecent })}
            onClick={() => setShowRecent(!showRecent)}
          >
            Recent
          </span>
          {/* <div className="h-5 ml-6 mr-2 w-5 bg-[#a3daed]" /> */}
          {/* <span
            className={cn("cursor-pointer select-none", { "font-bold": showRecent })}
            onClick={() => setShowCompleted(!showCompleted)}
          >
            Completed
          </span> */}
        </div>
      </div>
      <div>
        {(games || []).length ? (
          games
            .sort((a, b) => (b?.playtime_forever || 0) - (a?.playtime_forever || 0))
            .map(game => {
              const hasPlaytime = (game?.playtime_forever || 0) / 60 > MINIMUM_PLAYTIME;
              const recentGame = recentGames.find(recentGame => game.appid === recentGame.appid);
              const isRecent = (recentGame?.playtime_2weeks || 0) / 60 > MINIMUM_PLAYTIME;
              const isCompleted = !!COMPLETED_GAMES.find(completedGame => game.appid === Number(completedGame));

              if (!hasPlaytime) {
                return undefined;
              }

              if (showRecent && !isRecent) {
                return undefined;
              }

              if (showCompleted && !isCompleted) {
                return undefined;
              }

              return { ...game, isRecent, isCompleted };
            })
            .filter(game => !!game)
            .map((game, g) => game && <Game key={game.appid} rank={g + 1} {...game} />)
            .slice(0, count || games.length)
        ) : (
          <h3>Invalid Steam ID Provided</h3>
        )}
      </div>
    </div>
  );
};

export default Steam;
