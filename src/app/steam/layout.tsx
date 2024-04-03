import React from 'react';
import { HowLongToBeatService } from 'howlongtobeat';
import { getOwnedGames, getPlayerSummary, getRecentGames } from 'api/steam';
import GamesProvider from 'providers/SteamProvider';
import { MINIMUM_PLAYTIME } from 'constants/steam';

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
  const hltbService = new HowLongToBeatService();

  const gamesWithTimeToBeat = await Promise.all(
    games
      .filter(game => (game?.playtime_forever || 0) / 60 > MINIMUM_PLAYTIME)
      .map(async game => {
        const [timeToBeat] = await hltbService.search(game.name);

        return {
          ...game,
          hoursToBeat: timeToBeat?.gameplayMain
        };
      })
  );

  return (
    <>
      <GamesProvider games={gamesWithTimeToBeat} recentGames={recentGames} username={personaname} />
      {children}
    </>
  );
};

export default Steam;
