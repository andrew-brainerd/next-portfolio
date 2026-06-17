import Image from 'next/image';
import { loadSteamGames } from 'api/steamGames';
import { buildImageUrl } from 'utils/steam';
import { IconSteam } from '@/components/win95/Win95Icons';

interface Win95SteamGamesListProps {
  steamId?: string;
  count?: number;
  shouldFetchTTB: boolean;
}

const cleanName = (name: string): string =>
  name
    .replaceAll('(2009) - Multiplayer', '')
    .replaceAll('®', '')
    .replaceAll('™', '')
    .replaceAll(': Game of the Year', '');

export const Win95SteamGamesList = async ({ steamId, count, shouldFetchTTB }: Win95SteamGamesListProps) => {
  const { pageHeading, games } = await loadSteamGames({ steamId, count, shouldFetchTTB });

  return (
    <div className="p-2 text-[11px]">
      <div className="win95-raised mb-2 flex items-center gap-2 p-1.5">
        <IconSteam />
        <span className="font-bold">{pageHeading.trim()}</span>
        <span className="ml-auto text-neutral-600">{games.length} programs</span>
      </div>

      {games.length > 0 ? (
        <div className="win95-listbox">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left">
                <th className="win95-raised w-10 px-2 py-1 text-center font-bold">#</th>
                <th className="win95-raised px-2 py-1 font-bold">Name</th>
                <th className="win95-raised w-20 px-2 py-1 text-right font-bold">Hours</th>
                <th className="win95-raised w-24 px-2 py-1 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game, index) => (
                <tr key={game.appid} className="border-b border-neutral-200">
                  <td className="px-2 py-1 text-center text-neutral-500">{index + 1}</td>
                  <td className="px-2 py-1">
                    <span className="flex items-center gap-2">
                      <Image
                        className="shrink-0"
                        alt=""
                        src={buildImageUrl(game.appid.toString(), game.img_icon_url)}
                        width={20}
                        height={20}
                      />
                      <span className="truncate">{cleanName(game.name)}</span>
                    </span>
                  </td>
                  <td className="px-2 py-1 text-right tabular-nums">
                    {Math.round(game.playtime_forever / 60)}
                  </td>
                  <td className="px-2 py-1">
                    {game.isCompleted ? (
                      <span className="font-bold text-[#008000]">✓ Done</span>
                    ) : game.isRecent ? (
                      <span className="text-[#000080]">Recent</span>
                    ) : (
                      ''
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p role="alert" className="p-2">
          Invalid Steam ID Provided
        </p>
      )}
    </div>
  );
};
