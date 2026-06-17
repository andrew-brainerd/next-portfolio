'use client';

import { useEffect, useState } from 'react';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useSpotifyAuth } from '@/hooks/usePeapod';
import { useWin95Mode } from '@/hooks/useWin95Mode';
import { LoginTabs } from '@/components/LoginTabs';
import { SpotifyConnect } from '@/components/peapod/SpotifyConnect';
import { PodList } from '@/components/peapod/PodList';
import { Win95SpotifyConnect } from '@/components/win95/apps/Win95SpotifyConnect';
import { Win95PodList } from '@/components/win95/apps/Win95PodList';
import { PEAPOD_ROUTE } from '@/constants/routes';

export default function PeapodPage() {
  const { user, ready: authReady } = useFirebaseUser();
  const hasAuth = useSpotifyAuth(s => s.hasAuth);
  const loadLocalAuth = useSpotifyAuth(s => s.loadLocalAuth);
  const win95 = useWin95Mode(s => s.enabled);
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
    return win95 ? <Win95SpotifyConnect /> : <SpotifyConnect />;
  }

  if (win95) {
    return <Win95PodList />;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Peapod</h1>
      <PodList />
    </div>
  );
}
