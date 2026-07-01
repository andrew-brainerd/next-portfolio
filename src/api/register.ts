'use server';

import { postRequest } from '@/api/client';

// After an invite-gated sign-up, flag the newly created (and now authenticated) user
// as family. Best-effort: the account already exists, so a failure here must not block
// sign-up. The backend re-checks the invite code before honoring it.
export const redeemFamilyInvite = async (code: string): Promise<void> => {
  try {
    await postRequest<{ code: string }, { message: string }>('/register/redeem', { code });
  } catch (error) {
    console.error('Failed to mark user as family', error);
  }
};
