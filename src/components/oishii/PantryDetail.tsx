'use client';

import { useCallback, useEffect, useState } from 'react';

import { getPantry } from '@/api/oishii';
import { PANTRY_UPDATED_EVENT, pantryChannelName } from '@/constants/oishii';
import { getChannel } from '@/utils/pusher';
import { AddItemForm } from '@/components/oishii/AddItemForm';
import { ItemGrid } from '@/components/oishii/ItemGrid';
import { MembersPanel } from '@/components/oishii/MembersPanel';
import { PantrySettings } from '@/components/oishii/PantrySettings';
import { RecipeIdeasPanel } from '@/components/oishii/RecipeIdeasPanel';
import { ScanButton } from '@/components/oishii/ScanButton';
import type { PantryDetail as PantryDetailType } from '@/types/oishii';

interface PantryDetailProps {
  initialPantry: PantryDetailType;
  currentUserId: string;
  gmailConnected: boolean;
}

export const PantryDetail = ({ initialPantry, currentUserId, gmailConnected }: PantryDetailProps) => {
  const [pantry, setPantry] = useState(initialPantry);

  const isOwner = currentUserId === pantry.ownerUserId;

  // Every mutation re-reads the whole detail so members/items/invites stay in sync.
  const refresh = useCallback(async () => {
    const fresh = await getPantry(pantry.id);
    if (fresh) setPantry(fresh);
  }, [pantry.id]);

  // Realtime: any member's change pings the pantry channel; re-fetch on it so
  // this session stays in sync with the shared pantry (O-E-1).
  useEffect(() => {
    const channel = getChannel(pantryChannelName(pantry.id));
    const onUpdate = () => {
      refresh();
    };
    channel.bind(PANTRY_UPDATED_EVENT, onUpdate);
    return () => {
      channel.unbind(PANTRY_UPDATED_EVENT, onUpdate);
      channel.unsubscribe();
    };
  }, [pantry.id, refresh]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{pantry.name}</h1>
        <p className="mt-1 text-neutral-400">
          {pantry.items.length} item{pantry.items.length === 1 ? '' : 's'} · {pantry.members.length} member
          {pantry.members.length === 1 ? '' : 's'}
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">Scan for receipts</h2>
        <ScanButton pantryId={pantry.id} gmailConnected={gmailConnected} onScanned={refresh} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">Add an item</h2>
        <AddItemForm pantryId={pantry.id} onAdded={refresh} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">Items</h2>
        <ItemGrid pantry={pantry} onChanged={refresh} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">Recipe ideas</h2>
        <RecipeIdeasPanel pantry={pantry} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">Members</h2>
        <MembersPanel pantry={pantry} currentUserId={currentUserId} isOwner={isOwner} onChanged={refresh} />
      </section>

      {isOwner && (
        <section>
          <h2 className="mb-3 text-xl font-semibold text-white">Settings</h2>
          <PantrySettings pantry={pantry} onChanged={refresh} />
        </section>
      )}
    </div>
  );
};
