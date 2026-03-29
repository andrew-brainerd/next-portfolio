'use client';

import type { PodMember } from '@/types/peapod';

interface PodMembersProps {
  members: PodMember[];
  activeMembers: string[];
  podCreatorId?: string;
  currentUserId?: string;
}

export default function PodMembers({ members, activeMembers, podCreatorId, currentUserId }: PodMembersProps) {
  return (
    <div className="m-6">
      <div className="text-lg pb-1 relative underline">Pod Members</div>
      {members.map(member => {
        const isActive = activeMembers.includes(member.id);
        const isCurrentUser = member.id === currentUserId;
        const isCreator = member.id === podCreatorId;

        return (
          <div
            key={member.id}
            className={`py-2.5 my-1 ${isActive || isCurrentUser ? 'text-brand-400' : ''} ${isCreator ? 'italic' : ''}`}
          >
            {member.display_name}
            {isCreator && <span className="text-xs ml-1">(Creator)</span>}
          </div>
        );
      })}
    </div>
  );
}
