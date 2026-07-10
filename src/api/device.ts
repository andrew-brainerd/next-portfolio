import { postRequest } from 'api/client';

// Approve a TV/device pairing code as the signed-in user. Shared across device
// clients (board-roku, watch-roku); the backend approve endpoint is generic.
export const approveDevice = (userCode: string): Promise<{ message: string }> =>
  postRequest<{ userCode: string }, { message: string }>('/watch/device/approve', { userCode });
