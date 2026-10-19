import type { PlowedScoreEntry, PlowedScoreResult, PlowedScoreSubmission } from '@/types/plowed';

// Called from the browser, not through the 'use server' client: brainerd-api rate-limits these per IP,
// and a server action would make every player share the Next server's IP.
const url = (path: string) => `${process.env.NEXT_PUBLIC_BRAINERD_API_URL}/plowed${path}`;

export const getPlowedScores = async (limit: number): Promise<PlowedScoreEntry[]> => {
  const response = await fetch(url(`/scores?limit=${limit}`));
  if (!response.ok) throw new Error(`Plowed scores failed: ${response.status}`);
  return response.json();
};

export const submitPlowedScore = async (submission: PlowedScoreSubmission): Promise<PlowedScoreResult> => {
  const response = await fetch(url('/scores'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission)
  });
  if (!response.ok) throw new Error(`Plowed score submit failed: ${response.status}`);
  return response.json();
};
