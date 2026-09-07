import type { MessageStats } from '@/types/us';
import { getRequest } from '@/api/client';

/**
 * Aggregate iMessage statistics for the /us/messages dashboard. Public and
 * unauthenticated — the payload is counts only, never message text. Generated
 * locally and pushed to brainerd-api with `pnpm upload:message-stats`.
 */
export const getMessageStats = (): Promise<MessageStats | undefined> => {
  return getRequest<MessageStats>('/us/message-stats');
};
