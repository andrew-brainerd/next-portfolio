'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSpotifyAuth } from '@/hooks/usePeapod';
import { addMemberToPod } from '@/api/peapod';
import { getSpotifyProfile } from '@/api/spotify-client';
import { PEAPOD_ROUTE } from '@/constants/routes';
import SpotifyConnect from '@/components/peapod/SpotifyConnect';
import Loading from '@/components/Loading';
import type { SpotifyProfile } from '@/types/peapod';

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const podId = params.podId as string;
  const accessToken = useSpotifyAuth(s => s.accessToken);
  const hasAuth = useSpotifyAuth(s => s.hasAuth);
  const loadLocalAuth = useSpotifyAuth(s => s.loadLocalAuth);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadLocalAuth();
      setReady(true);
    };
    init();
  }, [loadLocalAuth]);

  useEffect(() => {
    if (!accessToken || !podId) return;

    const joinPod = async () => {
      try {
        const profile: SpotifyProfile = await getSpotifyProfile(accessToken);
        await addMemberToPod(podId, profile);
      } finally {
        router.push(`${PEAPOD_ROUTE}/${podId}`);
      }
    };

    joinPod();
  }, [accessToken, podId, router]);

  if (!ready) return null;

  if (!hasAuth()) {
    return <SpotifyConnect />;
  }

  return (
    <div className="flex items-center flex-col text-xl gap-5 justify-center min-h-[50vh]">
      <Loading />
      <p>Joining pod...</p>
    </div>
  );
}
