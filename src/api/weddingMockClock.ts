'use server';

import { cookies } from 'next/headers';

import { TOKEN_COOKIE, WEDDING_MOCK_OFFSET_COOKIE, WEDDING_UNLOCK_COOKIE } from '@/constants/authentication';
import { getWeddingQuizLeaderboard, submitWeddingQuiz } from '@/api/wedding';
import { parseMockOffset } from '@/utils/weddingClock';

// brainerd-api honors x-wedding-now for a WEDDING_ADMINS token (mock clock panel) or when the
// unlock code is the share key (a share link's preview date); anyone else stays on real time.
const mockClockHeaders = async (): Promise<Record<string, string>> => {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const code = cookieJar.get(WEDDING_UNLOCK_COOKIE)?.value;
  const offset = parseMockOffset(cookieJar.get(WEDDING_MOCK_OFFSET_COOKIE)?.value);

  return {
    'x-wedding-now': String(Date.now() + offset),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(code ? { 'x-wedding-code': code } : {})
  };
};

/** Mock clock: submit the quiz as if it were the mock time. */
export const submitWeddingQuizAtMockNow = async (input: Parameters<typeof submitWeddingQuiz>[0]) =>
  submitWeddingQuiz(input, await mockClockHeaders());

/** Mock clock: the leaderboard as it would look at the mock time. */
export const getWeddingQuizLeaderboardAtMockNow = async (clientId?: string) =>
  getWeddingQuizLeaderboard(clientId, await mockClockHeaders());
