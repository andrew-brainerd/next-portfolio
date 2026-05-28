'use client';

import { useEffect, useState } from 'react';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useSpotifyAuth } from '@/hooks/usePeapod';
import { LoginTabs } from '@/components/LoginTabs';
import { SpotifyConnect } from '@/components/peapod/SpotifyConnect';
import { PodList } from '@/components/peapod/PodList';
import { PEAPOD_ROUTE } from '@/constants/routes';

export default function PeapodPage() {
  const { user, ready: authReady } = useFirebaseUser();
  const hasAuth = useSpotifyAuth(s => s.hasAuth);
  const loadLocalAuth = useSpotifyAuth(s => s.loadLocalAuth);
  const [spotifyReady, setSpotifyReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadLocalAuth();
      setSpotifyReady(true);
    };
    init();
  }, [loadLocalAuth]);

  if (!authReady) return null;

  if (!user) {
    return <LoginTabs redirectRoute={PEAPOD_ROUTE} fromPath={PEAPOD_ROUTE} />;
  }

  if (!spotifyReady) return null;

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
