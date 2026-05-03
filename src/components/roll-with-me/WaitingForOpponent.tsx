'use client';

import { useState } from 'react';
import { InviteModal } from './InviteModal';

interface WaitingForOpponentProps {
  gameId: string;
  canInvite: boolean;
}

export const WaitingForOpponent = ({ gameId, canInvite }: WaitingForOpponentProps) => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 max-w-md text-center">
      <h1 className="text-2xl font-bold mb-3">Waiting for opponent…</h1>
      <p className="text-neutral-400 mb-6">
        {canInvite
          ? 'Send an invite link or message to get someone in the game.'
          : "Hang tight — the game's host needs to add you."}
      </p>
      {canInvite && (
        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="bg-brand-500 hover:bg-brand-400 text-white px-5 py-2.5 rounded-md cursor-pointer"
        >
          Invite a player
        </button>
      )}
      <InviteModal isOpen={isInviteOpen} gameId={gameId} closeModal={() => setIsInviteOpen(false)} />
    </div>
  );
};
