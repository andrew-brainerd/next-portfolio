'use server';

import { getRequest } from 'api/client';
import type { CondensateAccount } from 'types/condensateAccount';

// null when the signed-in account has no Steam account (not Steam-only and not linked), or the API is unreachable.
export const getCondensateAccount = async (): Promise<CondensateAccount | null> =>
  (await getRequest<CondensateAccount>('/condensate/account')) ?? null;
