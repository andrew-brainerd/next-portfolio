import React from 'react';
import { HowLongToBeatService } from 'howlongtobeat';
import { getOwnedGames, getPlayerSummary, getRecentGames } from 'api/steam';
import GamesProvider from 'providers/GamesProvider';
import { MINIMUM_PLAYTIME } from 'constants/steam';

interface SteamProps {
  children: React.ReactNode;
  params: Promise<{
    steamId?: string;
    ttb?: boolean;
  }>;
}

const HIDDEN_GAMES = [1454400];

const Steam = async (props: SteamProps) => {
  const params = await props.params;

  const {
    steamId,
    ttb
  } = params;

  const {
    children
  } = props;

  const playerData = getPlayerSummary(steamId);
  const gamesData = getOwnedGames(steamId);
  const recentGamesData = getRecentGames(steamId);
  const [{ personaname }, steamGames, recentGames] = await Promise.all([playerData, gamesData, recentGamesData]);
  const hltbService = new HowLongToBeatService();
  const filteredGames = steamGames.filter(game => !HIDDEN_GAMES.includes(game.appid));

  const games = ttb
    ? await Promise.all(
        filteredGames
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
    : filteredGames;

  return (
    <>
      <GamesProvider games={games} recentGames={recentGames} username={personaname} />
      {children}
    </>
  );
};

export default Steam;
