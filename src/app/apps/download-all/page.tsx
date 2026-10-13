import type { Metadata } from 'next';
import Link from 'next/link';
import { getReleaseManifest } from '@/api/apps';
import { DownloadButtons } from '@/components/apps/DownloadButtons';
import { ScreenshotGallery } from '@/components/apps/ScreenshotGallery';
import { SectionHeading } from '@/components/apps/SectionHeading';
import { DownloadAllIcon } from '@/components/icons/DownloadAllIcon';
import { DOWNLOAD_ALL } from '@/constants/apps';
import { APPS_ROUTE } from '@/constants/routes';
import { formatReleaseDate } from '@/utils/apps';
import type { AppScreenshot } from '@/types/apps';

export const metadata: Metadata = {
  title: 'Download All for Steam',
  description:
    'Download All for Steam adds a button to the Steam Downloads page that starts every pending game update at once. Free for Windows.',
  alternates: { canonical: '/apps/download-all' },
  openGraph: {
    title: 'Download All for Steam | Andrew Brainerd',
    description:
      'A Download All button for the Steam Downloads page — start every scheduled and queued update with one click.',
    url: 'https://brainerd.dev/apps/download-all'
  }
};

const SCREENSHOTS: AppScreenshot[] = [
  {
    src: '/apps/download-all/steam-button.png',
    alt: 'The Download All button in the Steam Downloads page header',
    caption:
      'The button lives in the Downloads page header. It counts pending updates and reads “All Up to Date” when there is nothing to start.'
  },
  {
    src: '/apps/download-all/installer-options.png',
    alt: 'The installer asking whether to install with Millennium or standalone',
    caption: 'Pick how it runs: with Millennium (recommended) or standalone.'
  },
  {
    src: '/apps/download-all/installer-progress.png',
    alt: 'The installer closing Steam, installing the plugin and restarting Steam',
    caption: 'The installer closes Steam, installs, and starts Steam again.'
  },
  {
    src: '/apps/download-all/installer-done.png',
    alt: 'The installer finished screen with an Open Downloads button',
    caption: 'Done — open Steam’s Downloads page and the button is waiting.'
  }
];

const FEATURES: { title: string; body: string }[] = [
  {
    title: 'Every update, one click',
    body: 'Steam only lets you start updates one game at a time. Download All starts everything listed under Scheduled and Not queued at once, and unpauses downloads if they are paused.'
  },
  {
    title: 'Uses Steam’s own controls',
    body: 'It presses the same internal “start now” Steam uses for a single game, so Steam keeps managing the queue, bandwidth and disk the way it always does.'
  },
  {
    title: 'An installer that does the setup',
    body: 'Detects what is already installed, installs Millennium for you if needed (the latest release, checked against its published SHA-256), and closes and reopens Steam for you.'
  },
  {
    title: 'Removes cleanly',
    body: 'Run the installer again and choose Remove. Millennium is only removed if you tick it, and your Millennium settings, themes and other plugins are kept.'
  },
  {
    title: 'No account, no tracking',
    body: 'Nothing to sign in to and no analytics. It only runs inside your own Steam client.'
  },
  {
    title: 'Open source',
    body: 'The plugin, the standalone build and the installer are all on GitHub.'
  }
];

const INSTALL_STEPS: { step: string; body: string }[] = [
  {
    step: 'Download and run the installer',
    body: 'The installer is unsigned for now, so Windows SmartScreen may warn you. Click More info → Run anyway.'
  },
  {
    step: 'Choose Install',
    body: 'The installer finds Steam and shows what is already installed, so you can also reinstall or switch versions later.'
  },
  {
    step: 'Pick how it runs',
    body: 'With Millennium is recommended. Choose Standalone only if you do not want Millennium (see below).'
  },
  {
    step: 'Let it restart Steam',
    body: 'Steam is closed while the installer works and reopened when it is done. Anything downloading in Steam pauses and resumes.'
  },
  {
    step: 'Open Downloads',
    body: 'Click Open Downloads on the last screen (or open Steam’s Downloads page yourself) and use the button in the header.'
  }
];

export default async function DownloadAllPage() {
  const manifest = await getReleaseManifest(DOWNLOAD_ALL.slug);
  const releasedAt = formatReleaseDate(manifest?.releasedAt);

  return (
    <main className="min-h-screen pb-16">
      <header className="relative overflow-hidden bg-[var(--color-brand-300)]/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        <div className="relative container mx-auto px-6 py-10 sm:py-14">
          <Link
            href={APPS_ROUTE}
            className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-hero-text)] transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-400 rounded"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All apps
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] bg-gradient-to-b from-[#2A2D32] to-[#111214] shadow-2xl">
              <DownloadAllIcon className="h-16 w-16 fill-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-roboto text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                {DOWNLOAD_ALL.name}
              </h1>
              <p className="mt-1 text-[var(--color-hero-text)] sm:text-lg">{DOWNLOAD_ALL.tagline}</p>
              <p className="mt-3 max-w-2xl text-sm text-[var(--color-hero-text)]/90 sm:text-base">
                {DOWNLOAD_ALL.summary}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <DownloadButtons
              manifest={manifest}
              platforms={DOWNLOAD_ALL.platforms}
              appName={DOWNLOAD_ALL.name}
              slug={DOWNLOAD_ALL.slug}
              countDownloads={DOWNLOAD_ALL.countDownloads}
            />
            <p className="mt-3 text-sm text-[var(--color-hero-text)]/80">
              {manifest && (
                <>
                  Version {manifest.version}
                  {releasedAt ? ` · Updated ${releasedAt}` : ''} ·{' '}
                </>
              )}
              <a href={DOWNLOAD_ALL.repoUrl} className="underline hover:text-white">
                Source on GitHub
              </a>
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-6">
        <section className="py-12" aria-labelledby="screenshots-heading">
          <SectionHeading id="screenshots-heading">Screenshots</SectionHeading>
          <ScreenshotGallery screenshots={SCREENSHOTS} />
        </section>

        <section className="py-12" aria-labelledby="features-heading">
          <SectionHeading id="features-heading">What it does</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map(feature => (
              <div key={feature.title} className="rounded-2xl border border-neutral-500/20 bg-neutral-700/20 p-6">
                <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-neutral-300">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12" aria-labelledby="install-heading">
          <SectionHeading id="install-heading">Installing</SectionHeading>
          <ol className="space-y-5">
            {INSTALL_STEPS.map((item, index) => (
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

        <section className="py-12" aria-labelledby="versions-heading">
          <SectionHeading id="versions-heading">With Millennium or standalone?</SectionHeading>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-500/20 bg-neutral-700/20 p-6">
              <h3 className="mb-3 font-semibold text-white">With Millennium (recommended)</h3>
              <p className="text-sm text-neutral-300">
                Runs as a plugin for{' '}
                <a href="https://steambrew.app" className="text-brand-300 underline hover:text-brand-200">
                  Millennium
                </a>
                , the open-source mod framework for the Steam desktop client. The installer sets Millennium up for you
                if it is not installed yet, and you can manage the plugin later under Millennium → Plugins inside Steam.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-500/20 bg-neutral-700/20 p-6">
              <h3 className="mb-3 font-semibold text-white">Standalone</h3>
              <p className="text-sm text-neutral-300">
                No Millennium: a small background app starts with Windows and adds the button through Steam&apos;s local
                debugging port. While that port is on, other programs on your PC can also control Steam through it, so
                only pick this if you would rather not install Millennium.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12" aria-labelledby="requirements-heading">
          <SectionHeading id="requirements-heading">Requirements</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-neutral-500/20 bg-neutral-700/20 p-6">
              <h3 className="mb-2 font-semibold text-white">Windows</h3>
              <ul className="space-y-1 text-sm text-neutral-300">
                <li>Windows 10 or 11 (64-bit)</li>
                <li>The Steam desktop client, signed in at least once</li>
                <li>An internet connection if Millennium needs to be installed</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-neutral-500/20 bg-neutral-700/20 p-6">
              <h3 className="mb-2 font-semibold text-white">Steam Deck</h3>
              <p className="text-sm text-neutral-300">
                An experimental{' '}
                <a
                  href="https://github.com/SteamDeckHomebrew/decky-loader"
                  className="text-brand-300 underline hover:text-brand-200"
                >
                  Decky Loader
                </a>{' '}
                plugin adds the button to the Quick Access Menu. It is not in the Decky store yet — build it from the{' '}
                <a href={DOWNLOAD_ALL.repoUrl} className="text-brand-300 underline hover:text-brand-200">
                  source
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        <p className="text-sm text-neutral-400">
          Download All for Steam is a personal project and is not affiliated with or endorsed by Valve or Steam. Steam
          is a trademark of Valve Corporation.
        </p>
      </div>
    </main>
  );
}
