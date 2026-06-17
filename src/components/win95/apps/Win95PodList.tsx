'use client';

import { usePodList } from '@/hooks/usePodList';
import { IconPeapod } from '@/components/win95/Win95Icons';

const NewPodIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" shapeRendering="crispEdges">
    <rect x="3" y="8" width="26" height="18" fill="#c0c0c0" stroke="#000" />
    <rect x="3" y="8" width="11" height="4" fill="#808080" stroke="#000" />
    <path d="M22 14 v8 M18 18 h8" stroke="#000080" strokeWidth="2" />
  </svg>
);

export const Win95PodList = () => {
  const { pods, isLoading, isCreating, handleCreatePod, openPod } = usePodList();

  return (
    <div className="p-2 text-[11px]">
      <div className="win95-raised mb-2 flex items-center gap-2 p-1.5">
        <IconPeapod />
        <span className="font-bold">Peapod</span>
        <span className="ml-auto text-neutral-600">
          {pods.length} {pods.length === 1 ? 'pod' : 'pods'}
        </span>
      </div>

      <div className="win95-listbox min-h-[220px]">
        {isLoading ? (
          <div className="p-3">Loading Pods...</div>
        ) : (
          <div className="flex flex-wrap content-start gap-1 p-1">
            {pods.map(pod => (
              <button
                key={pod.id}
                type="button"
                onClick={() => openPod(pod.id)}
                className="win95-desktop-icon"
              >
                <IconPeapod className="h-8 w-8" />
                <span className="win95-desktop-icon-label">{pod.name || 'Untitled Pod'}</span>
                <span className="text-neutral-500">
                  {pod.members.length} {pod.members.length === 1 ? 'member' : 'members'}
                </span>
              </button>
            ))}
            <button
              type="button"
              disabled={isCreating}
              onClick={handleCreatePod}
              className="win95-desktop-icon disabled:opacity-50"
            >
              <NewPodIcon />
              <span className="win95-desktop-icon-label">New Pod</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
