'use server';

import { cookies } from 'next/headers';

import { TOKEN_COOKIE, WEDDING_MOCK_OFFSET_COOKIE } from '@/constants/authentication';
import { getWeddingQuizLeaderboard, submitWeddingQuiz } from '@/api/wedding';
import { parseMockOffset } from '@/utils/weddingClock';

// brainerd-api honors x-wedding-now only when the token belongs to a WEDDING_ADMINS user
const mockClockHeaders = async (): Promise<Record<string, string>> => {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const offset = parseMockOffset(cookieJar.get(WEDDING_MOCK_OFFSET_COOKIE)?.value);

  return { 'Authorization': `Bearer ${token}`, 'x-wedding-now': String(Date.now() + offset) };
};

/** Admin mock clock: submit the quiz as if it were the mock time. */
export const submitWeddingQuizAtMockNow = async (input: Parameters<typeof submitWeddingQuiz>[0]) =>
  submitWeddingQuiz(input, await mockClockHeaders());

/** Admin mock clock: the leaderboard as it would look at the mock time. */
export const getWeddingQuizLeaderboardAtMockNow = async (clientId?: string) =>
  getWeddingQuizLeaderboard(clientId, await mockClockHeaders());
