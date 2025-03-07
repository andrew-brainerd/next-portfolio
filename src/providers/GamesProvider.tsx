'use client';

import React, { useEffect } from 'react';
import { OwnedGame } from 'types/steam';
import { useSteam } from 'hooks/useSteam';

interface GamesProviderProps {
  games: OwnedGame[];
  recentGames: OwnedGame[];
  username?: string;
}

export default function GamesProvider({ games, recentGames, username }: GamesProviderProps) {
  const { setGames, setRecentGames, setUsername } = useSteam();

  useEffect(() => {
    setGames(games);
  }, [games, setGames]);

  useEffect(() => {
    setRecentGames(recentGames);
  }, [recentGames, setRecentGames]);

  useEffect(() => {
    username && setUsername(username);
  }, [username, setUsername]);

  return <></>;
}
