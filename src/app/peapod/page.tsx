'use client';

import { useEffect, useState } from 'react';
import { useSpotifyAuth } from '@/hooks/usePeapod';
import SpotifyConnect from '@/components/peapod/SpotifyConnect';
import PodList from '@/components/peapod/PodList';

export default function PeapodPage() {
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Peapod</h1>
      <PodList />
    </div>
  );
}
