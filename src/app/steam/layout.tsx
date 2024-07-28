import React from 'react';
import { HowLongToBeatService } from 'howlongtobeat';
import { getOwnedGames, getPlayerSummary, getRecentGames } from 'api/steam';
import GamesProvider from 'providers/SteamProvider';
import { MINIMUM_PLAYTIME } from 'constants/steam';

interface SteamProps {
  children: React.ReactNode;
  params: {
    steamId?: string;
    ttb?: boolean;
  };
}

const Steam = async ({ children, params: { steamId, ttb } }: SteamProps) => {
  const playerData = getPlayerSummary(steamId);
  const gamesData = getOwnedGames(steamId);
  const recentGamesData = getRecentGames(steamId);
  const [{ personaname }, steamGames, recentGames] = await Promise.all([playerData, gamesData, recentGamesData]);
  const hltbService = new HowLongToBeatService();

  const games = ttb
    ? await Promise.all(
        steamGames
          .filter(game => (game?.playtime_forever || 0) / 60 > MINIMUM_PLAYTIME)
          .map(async game => {
            try {
              const [timeToBeat] = await hltbService.search(game.name);

              return {
                ...game,
                hoursToBeat: timeToBeat?.gameplayMain
              };
            } catch (e) {
              return game;
            }
          })
      )
    : steamGames;

  return (
    <>
      <GamesProvider games={games} recentGames={recentGames} username={personaname} />
      {children}
    </>
  );
};

export default Steam;
