'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpotifyAuth, usePeapodNotify } from '@/hooks/usePeapod';
import { getPods, createPod } from '@/api/peapod';
import { getSpotifyProfile } from '@/api/spotifyClient';
import type { Pod, SpotifyProfile } from '@/types/peapod';
import { PEAPOD_ROUTE } from '@/constants/routes';

export default function PodList() {
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

  return (
    <div className="p-5">
      <div className="content-start flex flex-row flex-wrap justify-center mx-auto overflow-y-auto w-[98%]">
        {isLoading ? (
          <div className="text-xl my-10 mx-auto text-center">Loading Pods...</div>
        ) : (
          <>
            {pods.map(pod => (
              <button
                key={pod.id}
                className="shadow-md hover:shadow-lg items-center bg-neutral-800 border border-neutral-700 flex flex-col h-32 justify-center m-5 transition-shadow duration-150 w-52 rounded-lg cursor-pointer hover:bg-neutral-700 hover:border-brand-400 max-sm:w-full max-sm:mx-0 max-sm:my-2.5"
                onClick={() => router.push(`${PEAPOD_ROUTE}/${pod.id}`)}
                type="button"
              >
                <div className="text-white text-lg mb-2">{pod.name || 'Untitled Pod'}</div>
                <div className="text-neutral-400 text-sm">
                  {pod.members.length} {pod.members.length === 1 ? 'member' : 'members'}
                </div>
              </button>
            ))}
            <button
              className="shadow-md hover:shadow-lg items-center bg-neutral-800 border border-dashed border-neutral-500 flex flex-col gap-2.5 h-32 justify-center m-5 transition-shadow duration-150 w-52 rounded-lg cursor-pointer hover:bg-neutral-700 hover:border-brand-400 max-sm:w-full max-sm:mx-0 max-sm:my-2.5 disabled:opacity-50"
              disabled={isCreating}
              onClick={handleCreatePod}
              type="button"
            >
              <span className="text-3xl text-neutral-400">+</span>
              <span className="text-neutral-400">Create New Pod</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
