'use server';

import type { AxiosError } from 'axios';

import { postRequest } from 'api/client';
import type { ApproveResult } from 'types/device';

// Approve a pairing code as the signed-in user. Shared across device clients (board-roku,
// watch-roku, the Charter Forever app); the backend approve endpoint is generic and returns
// the kind of device approved. Errors come back as a status rather than being thrown: a
// server action's thrown error reaches the browser without its details.
export const approveDevice = async (userCode: string): Promise<ApproveResult> => {
  try {
    const result = await postRequest<{ userCode: string }, { message: string; kind?: string }>(
      '/watch/device/approve',
      { userCode }
    );
    return { ok: true, kind: result?.kind };
  } catch (e) {
    const err = e as AxiosError<{ title?: string }>;
    return { ok: false, status: err.response?.status ?? 0, title: err.response?.data?.title };
  }
};
