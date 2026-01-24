import { Suspense } from 'react';
import { MY_STEAM_ID } from 'constants/steam';
import { getPlayerSummary } from 'api/steam';
import SteamGamesList from 'components/steam/SteamGamesList';
import Loading from '@/components/Loading';
import type { Metadata } from 'next';

interface SteamProps {
  searchParams: Promise<{
    count?: string;
    steamId?: string;
    ttb?: string;
  }>;
}

export async function generateMetadata(props: SteamProps): Promise<Metadata> {
  const { steamId } = await props.searchParams;
  const { personaname } = await getPlayerSummary(steamId);

  const title = steamId ? `${personaname}'s Steam Games` : 'My Steam Games';
  const description = `Browse ${personaname}'s Steam gaming library and stats`;

  return {
    title,
    description,
    openGraph: {
      title,
      description
    },
    twitter: {
      title,
      description
    }
  };
}

function SteamLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loading />
      <p className="mt-4 text-gray-400">Loading games...</p>
    </div>
  );
}

const Steam = async (props: SteamProps) => {
  const { count, steamId, ttb } = await props.searchParams;

  const countNumber = count ? parseInt(count, 10) : undefined;
  const shouldFetchTTB = ttb === 'true';

  return (
    <main
      className="font-roboto my-0 mx-0 sm:mx-auto max-w-[1200px] p-2 sm:p-12"
      data-steam-id={steamId || MY_STEAM_ID}
    >
      <Suspense fallback={<SteamLoadingFallback />}>
        <SteamGamesList steamId={steamId} count={countNumber} shouldFetchTTB={shouldFetchTTB} />
      </Suspense>
    </main>
  );
};

export default Steam;
