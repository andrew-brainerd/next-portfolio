'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSpotifyAuth } from '@/hooks/usePeapod';
import SpotifyConnect from '@/components/peapod/SpotifyConnect';
import PodDetail from '@/components/peapod/PodDetail';

export default function PodPage() {
  const params = useParams();
  const podId = params.podId as string;
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

  if (!ready) return null;

  if (!hasAuth()) {
    return <SpotifyConnect />;
  }

  return <PodDetail podId={podId} />;
}
