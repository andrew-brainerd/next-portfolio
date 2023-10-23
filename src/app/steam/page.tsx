'use client';

import { useEffect, useState } from 'react';
import cn from 'clsx';
import { COMPLETED_GAMES } from 'constants/steam';
import { useSteam } from 'hooks/useSteam';
import Game from 'components/Game';

import styles from 'styles/components/Steam.module.scss';

interface SteamProps {
  searchParams: {
    completed?: boolean;
    count?: number;
    recent?: boolean;
    steamId?: string;
  };
}

const Steam = ({ searchParams: { completed, count, recent, steamId } }: SteamProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { games, recentGames, username } = useSteam();

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
          <span className={styles.label}>Recent</span>
          <div className={cn(styles.color, styles.completed)} />
          <span className={styles.label}>Completed</span>
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

              if (recent && !isRecent) {
                return undefined;
              }

              if (completed && !isCompleted) {
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
