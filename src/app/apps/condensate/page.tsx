import type { Metadata } from 'next';
import Link from 'next/link';
import { getReleaseManifest } from '@/api/apps';
import { CondensateIcon } from '@/components/icons/CondensateIcon';
import { DownloadButtons } from '@/components/apps/DownloadButtons';
import { ScreenshotGallery } from '@/components/apps/ScreenshotGallery';
import { CONDENSATE } from '@/constants/apps';
import { APPS_ROUTE } from '@/constants/routes';
import { formatReleaseDate } from '@/utils/apps';
import type { AppScreenshot } from '@/types/apps';

export const metadata: Metadata = {
  title: 'Condensate',
  description:
    'Condensate is a macOS and Windows Steam companion for groups of friends — compare libraries, see what is installed, and estimate download times before game night.',
  alternates: { canonical: '/apps/condensate' },
  openGraph: {
    title: 'Condensate | Andrew Brainerd',
    description:
      'A macOS and Windows Steam companion for groups of friends — compare libraries, see what is installed, and estimate download times before game night.',
    url: 'https://brainerd.dev/apps/condensate'
  }
};

const SCREENSHOTS: AppScreenshot[] = [
  {
    src: '/apps/condensate/sign-in.png',
    alt: 'Condensate sign-in screen prompting for a Steam Web API key',
    caption: 'Sign in with your own Steam Web API key — stored in your OS keychain.'
  },
  {
    src: '/apps/condensate/library.png',
    alt: 'Condensate library view listing owned Steam games with install badges',
    caption: 'Your full library with install status, playtime, and multiplayer badges.'
  },
  {
    src: '/apps/condensate/group.png',
    alt: 'Condensate group view showing games shared across friends',
    caption: 'Build a group and see the games everyone owns.'
  },
  {
    src: '/apps/condensate/settings.png',
    alt: 'Condensate settings with the connection speed test',
    caption: 'Measure your connection to estimate download times.'
  }
];

const FEATURES: { title: string; body: string }[] = [
  {
    title: 'Your whole Steam library',
    body: 'See every game you own with playtime, a local install badge, and a multiplayer indicator. Filter by text, install status, or multiplayer support.'
  },
  {
    title: 'Knows what is installed here',
    body: 'Condensate reads Steam’s local metadata on this machine to flag which owned games are already installed — no guessing before a session.'
  },
  {
    title: 'Compare libraries with friends',
    body: 'Add friends from your Steam friends list or by SteamID / vanity URL (up to 16) and instantly see the games everyone in the group owns.'
  },
  {
    title: 'Download-time estimates',
    body: 'Run a quick connection speed test, then get a realistic download-time estimate for any uninstalled game so you know what is reachable before game night.'
  },
  {
    title: 'Private by design',
    body: 'Your Steam Web API key lives in the macOS Keychain / Windows Credential Manager — never on disk, never in logs. No analytics.'
  },
  {
    title: 'Light, native, fast',
    body: 'A Tauri app, not Electron: a small download, quick cold start, and a native window on both macOS and Windows.'
  }
];

const USAGE: { step: string; body: string }[] = [
  {
    step: 'Get a Steam Web API key',
    body: 'On first run, Condensate links you to steamcommunity.com/dev/apikey. The key is free (a Steam account with a verified phone number is required) and is validated before it is accepted.'
  },
  {
    step: 'Sign in with Steam',
    body: 'Click “Sign in with Steam” to complete the standard Steam login in your browser. Condensate captures your SteamID and shows your avatar and name.'
  },
  {
    step: 'Make your game details public',
    body: 'Steam can only share your library if Profile → Privacy → “Game details” is set to Public. Condensate tells you if this needs changing — it cannot bypass other people’s privacy settings either.'
  },
  {
    step: 'Build your group',
    body: 'Add friends from your Steam friends list or paste a SteamID / vanity URL. The shared-games view shows what everyone owns and who already has it installed.'
  },
  {
    step: 'Test your connection',
    body: 'In Settings, run “Test Connection” (5 quick samples). The result powers download-time estimates for uninstalled games in your library and the shared list.'
  }
];

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-6 text-2xl font-bold text-brand-400 sm:text-3xl">
      {children}
    </h2>
  );
}

export default async function CondensatePage() {
  const manifest = await getReleaseManifest(CONDENSATE.slug);
  const releasedAt = formatReleaseDate(manifest?.releasedAt);

  return (
    <main className="min-h-screen pb-16">
      {/* Hero */}
      <header className="relative overflow-hidden bg-[var(--color-brand-300)]/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        <div className="relative container mx-auto px-6 py-10 sm:py-14">
          <Link
            href={APPS_ROUTE}
            className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-hero-text)] transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-400 rounded"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All apps
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] bg-gradient-to-b from-[#0EA5E9] to-[#0C4A6E] shadow-2xl">
              <CondensateIcon className="h-16 w-16 fill-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-roboto text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                Condensate
              </h1>
              <p className="mt-1 text-[var(--color-hero-text)] sm:text-lg">{CONDENSATE.tagline}</p>
              <p className="mt-3 max-w-2xl text-sm text-[var(--color-hero-text)]/90 sm:text-base">
                {CONDENSATE.summary}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <DownloadButtons
              manifest={manifest}
              platforms={CONDENSATE.platforms}
              appName={CONDENSATE.name}
            />
            {manifest && (
              <p className="mt-3 text-sm text-[var(--color-hero-text)]/80">
                Version {manifest.version}
                {releasedAt ? ` · Updated ${releasedAt}` : ''} ·{' '}
                <a href="#install" className="underline hover:text-white">
                  First launch needs one extra step
                </a>
              </p>
            )}
            {manifest?.notes && (
              <p className="mt-1 text-sm text-[var(--color-hero-text)]/70">{manifest.notes}</p>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-6">
        {/* Screenshots */}
        <section className="py-12" aria-labelledby="screenshots-heading">
          <SectionHeading id="screenshots-heading">Screenshots</SectionHeading>
          <ScreenshotGallery screenshots={SCREENSHOTS} />
        </section>

        {/* Features */}
        <section className="py-12" aria-labelledby="features-heading">
          <SectionHeading id="features-heading">What it does</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map(feature => (
              <div
                key={feature.title}
                className="rounded-2xl border border-neutral-500/20 bg-neutral-700/20 p-6"
              >
                <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-neutral-300">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* System requirements */}
        <section className="py-12" aria-labelledby="requirements-heading">
          <SectionHeading id="requirements-heading">System requirements</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-neutral-500/20 bg-neutral-700/20 p-6">
              <h3 className="mb-2 font-semibold text-white">macOS</h3>
              <ul className="space-y-1 text-sm text-neutral-300">
                <li>macOS 12 (Monterey) or newer</li>
                <li>Apple Silicon or Intel (universal build)</li>
                <li>Steam installed locally to detect installed games</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-neutral-500/20 bg-neutral-700/20 p-6">
              <h3 className="mb-2 font-semibold text-white">Windows</h3>
              <ul className="space-y-1 text-sm text-neutral-300">
                <li>Windows 10 or newer (64-bit)</li>
                <li>Steam installed locally to detect installed games</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm text-neutral-400">
            Condensate works without a local Steam install too — you just won&apos;t see the
            “installed on this machine” badges.
          </p>
        </section>

        {/* Install */}
        <section className="py-12" aria-labelledby="install-heading">
          <SectionHeading id="install-heading">Installing</SectionHeading>
          <p className="mb-6 max-w-3xl text-neutral-300">
            Condensate is currently distributed unsigned, so the first launch needs one extra click
            to get past Gatekeeper (macOS) or SmartScreen (Windows). This is expected for a
            pre-1.0 build — signed installers are planned.
          </p>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-500/20 bg-neutral-700/20 p-6">
              <h3 className="mb-3 font-semibold text-white">macOS</h3>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-neutral-300">
                <li>Open the downloaded <code className="text-brand-300">.dmg</code>.</li>
                <li>Drag <strong>Condensate</strong> into the Applications folder.</li>
                <li>
                  Launch it from Applications. If macOS says it “cannot be opened”,
                  <strong> right-click the app → Open</strong>, then confirm <strong>Open</strong> in
                  the dialog. You only need to do this once.
                </li>
                <li>
                  Alternatively, run{' '}
                  <code className="text-brand-300">
                    xattr -dr com.apple.quarantine /Applications/Condensate.app
                  </code>{' '}
                  in Terminal, then open it normally.
                </li>
              </ol>
            </div>
            <div className="rounded-2xl border border-neutral-500/20 bg-neutral-700/20 p-6">
              <h3 className="mb-3 font-semibold text-white">Windows</h3>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-neutral-300">
                <li>Run the downloaded installer.</li>
                <li>
                  If Windows SmartScreen appears, click <strong>More info</strong> →{' '}
                  <strong>Run anyway</strong>.
                </li>
                <li>Follow the installer, then launch Condensate from the Start menu.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Usage */}
        <section className="py-12" aria-labelledby="usage-heading">
          <SectionHeading id="usage-heading">Getting started</SectionHeading>
          <ol className="space-y-5">
            {USAGE.map((item, index) => (
              <li key={item.step} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-white">{item.step}</h3>
                  <p className="mt-1 text-sm text-neutral-300">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Privacy */}
        <section className="py-12" aria-labelledby="privacy-heading">
          <SectionHeading id="privacy-heading">Privacy</SectionHeading>
          <div className="rounded-2xl border border-neutral-500/20 bg-neutral-700/20 p-6">
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>
                Your Steam Web API key is stored only in the OS secret store (macOS Keychain /
                Windows Credential Manager) — never in plaintext, logs, or cloud.
              </li>
              <li>
                Condensate talks only to Steam, Cloudflare (the speed test), and its own backend.
                No third-party analytics or tracking.
              </li>
              <li>
                Sharing anonymous game install sizes (to improve download estimates for everyone)
                is opt-in and asked for explicitly on first run — never your SteamID, name, or
                friends.
              </li>
              <li>Group membership and caches are stored locally on your machine.</li>
            </ul>
          </div>
        </section>

        <p className="text-sm text-neutral-400">
          Condensate is a personal project and is not affiliated with or endorsed by Valve or
          Steam.
        </p>
      </div>
    </main>
  );
}
