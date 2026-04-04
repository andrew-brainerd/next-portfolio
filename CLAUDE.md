# next-portfolio

Next.js React web app. Personal portfolio and suite of tools including Steam gaming stats, Peapod (collaborative Spotify listening), Manga library, Kalshi trading, Keiken experience tracker, and Zillow property viewer.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State**: Zustand (client state), React hooks
- **API Client**: Axios with shared interceptor (`src/api/spotify-api.ts`)
- **Auth**: Firebase Auth (site-wide), Spotify OAuth (Peapod)
- **Testing**: Vitest
- **Linting**: ESLint + Stylelint
- **Package Manager**: pnpm

## Commands

- `pnpm dev` — local dev server with HTTPS on `local.brainerd.dev:3001`
- `pnpm build` — production build
- `pnpm verify` — type check + lint (run before committing)
- `pnpm test` — run unit tests
- `pnpm lint:fix` — auto-fix lint issues

## Project Structure

```
src/
├── api/            # API client functions (peapod.ts, spotify-client.ts, spotify-api.ts)
├── app/            # Next.js App Router pages and layouts
├── components/     # React components grouped by feature (peapod/, kalshi/, manga/, etc.)
├── constants/      # App constants
├── hooks/          # Custom React hooks and Zustand stores
├── providers/      # Context providers (ThemeProvider)
├── styles/         # Global CSS and Tailwind theme
├── types/          # TypeScript interfaces and type definitions
└── utils/          # Utility functions with unit tests
```

## Conventions

### Types

- All shared TypeScript interfaces belong in `src/types/` organized by domain (peapod.ts, kalshi.ts, manga.ts, etc.)
- Component props interfaces stay in their component file
- Do not declare non-props interfaces inline in components — extract them to the appropriate types file

### Utility Functions

- Complex logic (data transformations, scoring algorithms, deduplication, formatting) belongs in `src/utils/` not inline in components
- All utility functions must have unit tests (Vitest) in a co-located `.test.ts` file
- Prefer pure functions that are easy to test

### Components

- Use `'use client'` directive only when needed (hooks, browser APIs, interactivity)
- Props interfaces are named `{ComponentName}Props`
- SVG icons are inline — no icon library
- Modals use the shared `Modal` component (`components/peapod/Modal.tsx`) which handles Escape to close and backdrop click

### Theming

- Color themes defined in `src/styles/index.css` via CSS custom properties under `@theme` and `html[data-theme]` selectors
- Homepage gets a random theme per session (server-rendered, persisted in sessionStorage)
- Other pages use the session theme

## Related Projects

- **brainerd-api** (`../brainerd-api`) — Express backend
- **Brainerd** (`../Brainerd`) — Native SwiftUI companion app
