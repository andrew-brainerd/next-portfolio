import React from 'react';
import { getOwnedGames, getPlayerSummary, getRecentGames } from 'api/steam';
import GamesProvider from 'providers/SteamProvider';

interface SteamProps {
  children: React.ReactNode;
  params: {
    steamId?: string;
  };
}

const Steam = async ({ children, params: { steamId } }: SteamProps) => {
  const playerData = getPlayerSummary(steamId);
  const gamesData = getOwnedGames(steamId);
  const recentGamesData = getRecentGames(steamId);
  const [{ personaname }, games, recentGames] = await Promise.all([playerData, gamesData, recentGamesData]);

  return (
    <>
      <GamesProvider games={games} recentGames={recentGames} username={personaname} />
      {children}
    </>
  );
};

export default Steam;
