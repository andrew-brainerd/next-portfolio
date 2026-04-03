'use client';

import { useState } from 'react';
import type { PodMember } from '@/types/peapod';

interface MembersDisplayProps {
  members: PodMember[];
  activeMembers: string[];
  podCreatorId?: string;
  currentUserId?: string;
  maxVisible?: number;
}

function MemberIcon({ name, isActive }: { name: string; isActive: boolean }) {
  const initial = (name || '?')[0].toUpperCase();
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold -ml-2 first:ml-0 border-2 ${
        isActive ? 'bg-brand-600 border-brand-400 text-white' : 'bg-neutral-600 border-neutral-500 text-neutral-200'
      }`}
      title={name}
    >
      {initial}
    </div>
  );
}

export default function MembersDisplay({
  members,
  activeMembers,
  podCreatorId,
  currentUserId,
  maxVisible = 5
}: MembersDisplayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const visible = members.slice(0, maxVisible);
  const overflow = members.length - maxVisible;

  return (
    <>
      <button
        className="flex items-center cursor-pointer"
        onClick={() => setIsModalOpen(true)}
        type="button"
        aria-label="View pod members"
      >
        {visible.map(member => (
          <MemberIcon
            key={member.id}
            name={member.display_name || member.name || member.id}
            isActive={activeMembers.includes(member.id)}
          />
        ))}
        {overflow > 0 && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold -ml-2 bg-neutral-700 border-2 border-neutral-500 text-neutral-300">
            +{overflow}
          </div>
        )}
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="bg-neutral-800 rounded-xl p-6 max-w-sm w-[90%]" onClick={e => e.stopPropagation()}>
            <div className="text-xl mb-4 text-center">Pod Members</div>
            {members.map(member => {
              const isActive = activeMembers.includes(member.id);
              const isCurrentUser = member.id === currentUserId;
              const isCreator = member.id === podCreatorId;
              const displayName = member.display_name || member.name || member.id;

              return (
                <div key={member.id} className="flex items-center gap-3 py-2">
                  <MemberIcon name={displayName} isActive={isActive} />
                  <div className="flex-1">
                    <span className={isActive || isCurrentUser ? 'text-brand-400' : ''}>{displayName}</span>
                    {isCreator && <span className="text-xs text-neutral-400 ml-1">(Creator)</span>}
                  </div>
                  {isActive && <span className="text-xs text-brand-400">Active</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
