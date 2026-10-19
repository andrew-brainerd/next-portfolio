// Server-side calls must bypass Cloudflare (its Bot Fight Mode challenges Vercel's AWS IPs), so they use the
// Heroku app URL. BRAINERD_API_SERVER_URL is not NEXT_PUBLIC, so in the browser it is undefined and the public
// URL is used.
export const brainerdApiBaseUrl = (): string | undefined =>
  process.env.BRAINERD_API_SERVER_URL || process.env.NEXT_PUBLIC_BRAINERD_API_URL;
