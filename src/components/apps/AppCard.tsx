import Link from 'next/link';
import CondensateIcon from '@/components/icons/CondensateIcon';
import AppsIcon from '@/components/icons/AppsIcon';
import DownloadButtons from '@/components/apps/DownloadButtons';
import type { NativeApp, ReleaseManifest } from '@/types/apps';

interface AppCardProps {
  app: NativeApp;
  manifest: ReleaseManifest | null;
}

const PLATFORM_LABEL = {
  macos: 'macOS',
  windows: 'Windows'
} as const;

function AppMark({ slug }: { slug: string }) {
  if (slug === 'condensate') {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#0EA5E9] to-[#0C4A6E] shadow-lg">
        <CondensateIcon className="h-10 w-10 fill-white" aria-hidden="true" />
      </div>
    );
  }
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-neutral-700">
      <AppsIcon className="h-9 w-9 fill-white" aria-hidden="true" />
    </div>
  );
}

export default function AppCard({ app, manifest }: AppCardProps) {
  return (
    <article className="animate-fade-in-up flex flex-col gap-5 rounded-3xl border border-neutral-500/20 bg-gradient-to-br from-neutral-600/30 to-neutral-700/30 p-6 shadow-lg backdrop-blur-sm sm:p-8">
      <div className="flex items-start gap-4">
        <AppMark slug={app.slug} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold text-white">{app.name}</h2>
            {!app.available && (
              <span className="rounded-full bg-neutral-700 px-2.5 py-0.5 text-xs font-medium text-neutral-300">
                Coming soon
              </span>
            )}
          </div>
          <p className="text-brand-400">{app.tagline}</p>
        </div>
      </div>

      <p className="text-neutral-300">{app.summary}</p>

      <div className="flex flex-wrap items-center gap-2">
        {app.platforms.map(platform => (
          <span
            key={platform}
            className="rounded-full border border-neutral-500/30 px-3 py-1 text-xs font-medium text-neutral-300"
          >
            {PLATFORM_LABEL[platform]}
          </span>
        ))}
      </div>

      {app.available && (
        <DownloadButtons manifest={manifest} platforms={app.platforms} appName={app.name} compact />
      )}

      <Link
        href={app.route}
        className="mt-auto inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-400 transition-colors hover:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-neutral-800 rounded"
        aria-label={`${app.name} details and install guide`}
      >
        Details &amp; install guide
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>
    </article>
  );
}
