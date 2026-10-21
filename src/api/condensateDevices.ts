'use server';

import { deleteRequest, getRequest } from 'api/client';
import type { CondensateDevice } from 'types/condensateDevice';

// null means the list couldn't be loaded, as opposed to an empty list.
export const getCondensateDevices = async (): Promise<CondensateDevice[] | null> =>
  (await getRequest<CondensateDevice[]>('/condensate/devices')) ?? null;

export const revokeCondensateDevice = async (id: string): Promise<void> =>
  deleteRequest(`/condensate/devices/${encodeURIComponent(id)}`);
