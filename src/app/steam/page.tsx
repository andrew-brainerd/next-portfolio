'use client';

import { useEffect, useState } from 'react';
import cn from 'clsx';
import { COMPLETED_GAMES } from 'constants/steam';
import { useSteam } from 'hooks/useSteam';
import Game from 'components/Game';

import styles from 'styles/components/Steam.module.scss';

interface SteamProps {
  searchParams: {
    count?: number;
    steamId?: string;
  };
}

const Steam = ({ searchParams: { count, steamId } }: SteamProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { games, recentGames, showCompleted, showRecent, username, setShowRecent, setShowCompleted } = useSteam();

  const userHeading = `${!steamId ? 'My ' : ''} Steam Games${!steamId ? '' : ` for ${username}`}`;
  const pageHeading = username === 'Invalid User' ? username : userHeading;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <></>;

  return (
    <div className={styles.steam}>
      <div className={styles.headerContainer}>
        <h1>{pageHeading}</h1>
        <div className={styles.legend}>
          <div className={cn(styles.color, styles.recent)} />
          <span
            className={cn(styles.label, { [styles.recent]: showRecent })}
            onClick={() => setShowRecent(!showRecent)}
          >
            Recent
          </span>
          <div className={cn(styles.color, styles.completed)} />
          <span
            className={cn(styles.label, { [styles.completed]: showCompleted })}
            onClick={() => setShowCompleted(!showCompleted)}
          >
            Completed
          </span>
        </div>
      </div>
      <div className={styles.games}>
        {(games || []).length ? (
          games
            .sort((a, b) => (b?.playtime_forever || 0) - (a?.playtime_forever || 0))
            .map(game => {
              const recentGame = recentGames.find(recentGame => game.appid === recentGame.appid);
              const isRecent = (recentGame?.playtime_2weeks || 0) / 60 > 1;
              const isCompleted = !!COMPLETED_GAMES.find(completedGame => game.appid === Number(completedGame));

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
