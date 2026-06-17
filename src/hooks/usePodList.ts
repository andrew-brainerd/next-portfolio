import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpotifyAuth, usePeapodNotify } from '@/hooks/usePeapod';
import { getPods, createPod } from '@/api/peapod';
import { getSpotifyProfile } from '@/api/spotifyClient';
import type { Pod, SpotifyProfile } from '@/types/peapod';
import { PEAPOD_ROUTE } from '@/constants/routes';

/** Pod-list data + actions, shared by the classic and Win95 presentations. */
export const usePodList = () => {
  const router = useRouter();
  const accessToken = useSpotifyAuth(s => s.accessToken);
  const displayNotification = usePeapodNotify(s => s.displayNotification);
  const [pods, setPods] = useState<Pod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    getSpotifyProfile()
      .then(p => {
        setProfile(p);
        return getPods(p.id);
      })
      .then(data => {
        setPods((data as { items: Pod[] })?.items || []);
      })
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  const handleCreatePod = async () => {
    if (!accessToken || !profile || isCreating) return;
    setIsCreating(true);
    try {
      const newPod = await createPod(profile);
      displayNotification('Pod created!', { icon: 'success' });
      router.push(`${PEAPOD_ROUTE}/${(newPod as Pod).id}`);
    } catch {
      displayNotification('Failed to create pod', { icon: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const openPod = (id: string) => router.push(`${PEAPOD_ROUTE}/${id}`);

  return { pods, isLoading, isCreating, handleCreatePod, openPod };
};
