import { TOKEN_COOKIE } from '@/constants/authentication';

// Calls brainerd-api straight from the browser, skipping the Next server action hop.
//
// Every other feature goes through `api/client.ts` ('use server'), and that is the right default — it keeps
// the token server-side. But a server action costs a full extra round-trip (browser -> Next -> brainerd-api
// -> back, measured at ~205ms locally), and on the buzz path that delay lands BEFORE the server can even
// decide who rang in first. It delays the winner and, through the fan-out, everyone else's pause.
//
// This is safe here only because the session cookie is deliberately set `httpOnly: false` (see
// brainerd-api `/auth/session`), so the browser can read it, and brainerd-api's CORS already allows this
// origin with credentials. If the cookie ever becomes httpOnly this returns null and callers fall back to
// the server action — slower, but never broken.
const readSessionToken = (): string | null => {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const canCallBrainerdDirectly = (): boolean => readSessionToken() !== null;

export const brainerdDirectPost = async <T>(path: string, body: unknown): Promise<T> => {
  const token = readSessionToken();
  if (!token) throw new Error('No readable session token');

  const response = await fetch(`${process.env.NEXT_PUBLIC_BRAINERD_API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    credentials: 'include',
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(`${path} failed: ${response.status}`);

  return response.json() as Promise<T>;
};
