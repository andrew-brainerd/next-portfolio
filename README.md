# next-portfolio

Source for [brainerd.dev](https://brainerd.dev), Andrew Brainerd's personal site. The homepage links out to professional profiles, desktop apps, and games, with an optional Windows 95 style mode. Behind it sits a collection of personal and family tools: a wedding site with RSVPs and a day-of guide, Peapod (collaborative Spotify listening, migrated in from its standalone repo), a manga library, multiplayer party games, and several trackers. Most data lives in the companion `brainerd-api` Express backend (private repo); many sections require a Firebase login.

## Sections

**Public**

- `/` - Homepage with Work, Apps, and Play tabs
- `/apps`, `/apps/condensate` - Native macOS/Windows apps and download pages (Condensate is a Steam companion for groups of friends)
- `/steam` - Steam library and gaming stats
- `/peapod` - Collaborative Spotify listening "pods" with invites, Spotify OAuth, and real-time sync via Pusher
- `/roll-with-me` - Async multiplayer dice game with invite links
- `/zillow` - Rental property browser with rankings and map view

**Wedding**

- `/wedding` - Passcode-gated hub with time-based release windows
- `/wedding/story` - Illustrated page-flip storybook
- `/wedding/details` - Event details
- `/wedding/rsvp` (+ `find`, `edit`) - Guest RSVP form; guests can look up and edit their RSVP until a cutoff, with email or text verification
- `/wedding/guide` - Day-of guidebook: live timeline, seating, menu, venue, registry, hotel, quiz with leaderboard, and messages
- `/wedding/settings` (+ `cards`) - Owner CMS for content, RSVP list, share links with QR codes, table cards, and a mock clock for previewing release windows
- `/rsvp` - Standalone RSVP page for a separate family event

**Signed-in tools**

- `/manga` - Manga search and followed-series library
- `/keiken` - Experience tracker organized into groups
- `/kalshme` - Kalshi positions, settlements, orders, and LoL esports markets
- `/scorebook/frisbee-golf` - Frisbee golf rounds, join-by-code (`/j/[code]`), and stats
- `/buzzed` - Music buzzer party game with YouTube-backed rounds, join codes, and results
- `/watch` - Watchlist with search, YouTube playlist import, and usage dashboard
- `/oishii` - Shared pantries with members, invites, item scanning, and recipe ideas
- `/board` - Split-flap message board display and notes
- `/link` - Pair a TV or app (for example the Board on Roku) with a device code
- `/us` - Private photo slideshow (from S3) and a messages stats dashboard
- `/settings` - Account, display name, profile picture, and theme (`/appearance` redirects here)
- `/login` - Sign in, sign up, and password reset

Route handlers under `src/app/api/` cover auth cookies, S3 image listing, audio, and Buzzed playback position.

## Tech stack

- Next.js 16 (App Router, React Compiler) and React 19
- TypeScript
- Tailwind CSS 4, with some MUI and Emotion
- Zustand for client state
- Axios for calls to brainerd-api
- Firebase Auth (site-wide) and Spotify OAuth (Peapod)
- Pusher for real-time updates
- AWS S3 for images
- Leaflet, Recharts, Motion, page-flip
- Vitest (unit), Playwright (e2e)
- ESLint, Stylelint, Prettier via lint-staged

## Local development

Uses **pnpm** (see `pnpm-lock.yaml` and the `packageManager` field). Installing runs a `preinstall` script that copies the repo's git hooks from `scripts/hooks` into `.git/hooks`.

```bash
pnpm install
pnpm dev
```

`pnpm dev` serves over HTTPS at `https://local.brainerd.dev:3001` using Next's experimental self-signed certificates (written to `certificates/`, which is gitignored). `local.brainerd.dev` must resolve to your machine.

| Command | Description |
| --- | --- |
| `pnpm dev` | Dev server (HTTPS, port 3001) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm lint` / `pnpm lint:fix` | ESLint and Stylelint |
| `pnpm verify` | Type check, lint, and unit tests |
| `pnpm e2e` | Playwright tests (frisbee golf scorebook, against the real stack) |
| `pnpm e2e:ui` / `pnpm e2e:report` | Playwright UI mode / last HTML report |
| `pnpm analyze` | Bundle analysis |
| `pnpm clean` | Remove `node_modules` and `.next` |

Run `pnpm verify` before committing.

## Environment variables

Set these in `.env` (gitignored). Values are not included here.

**Backend and auth**

- `NEXT_PUBLIC_BRAINERD_API_URL` - brainerd-api base URL
- `COOKIE_DOMAIN` - Domain for the auth cookie
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_DB_URL`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

**Integrations**

- `NEXT_PUBLIC_PUSHER_APP_KEY` - Real-time sync (Peapod, Buzzed, Roll With Me, Scorebook, Oishii)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Geocoding
- `STEAM_API_KEY` - Steam stats
- `RAWG_API_KEY` - Game metadata lookups
- `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` - Twitch app token

**S3 images (server-side only)**

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`
- `AWS_REGION` - Defaults to `us-east-1`
- `AWS_S3_IMAGE_PREFIX` - Optional key prefix filter

**E2E tests** (`.env.e2e`, gitignored)

- `E2E_USER_EMAIL`, `E2E_USER_PASSWORD` - Firebase test account
- `E2E_BASE_URL` - Optional; defaults to the local dev URL

## Project structure

```
src/
  api/          API clients (mostly brainerd-api)
  app/          App Router pages, layouts, and route handlers
  components/   Components grouped by feature
  constants/    Routes and app constants
  content/      Static content (wedding)
  hooks/        Hooks and Zustand stores
  providers/    Context providers
  styles/       Global CSS and Tailwind theme
  types/        Shared TypeScript types by domain
  utils/        Pure utilities with co-located Vitest tests
e2e/            Playwright specs
```

See `CLAUDE.md` for code conventions.
