'use client';

import { usePodList } from '@/hooks/usePodList';

export const PodList = () => {
  const { pods, isLoading, isCreating, handleCreatePod, openPod } = usePodList();

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
                onClick={() => openPod(pod.id)}
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
};
