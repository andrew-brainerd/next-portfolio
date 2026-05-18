import type { Metadata } from 'next';
import { getReleaseManifest } from '@/api/apps';
import AppCard from '@/components/apps/AppCard';
import { NATIVE_APPS } from '@/constants/apps';

export const metadata: Metadata = {
  title: 'Apps',
  description:
    'Native macOS and Windows apps built by Andrew Brainerd, with direct downloads of the latest release.',
  alternates: { canonical: '/apps' },
  openGraph: {
    title: 'Apps | Andrew Brainerd',
    description:
      'Native macOS and Windows apps built by Andrew Brainerd, with direct downloads of the latest release.',
    url: 'https://brainerd.dev/apps'
  }
};

export default async function AppsPage() {
  const manifests = await Promise.all(
    NATIVE_APPS.map(app => (app.available ? getReleaseManifest(app.slug) : Promise.resolve(null)))
  );

  return (
    <main className="min-h-screen">
      <header className="relative overflow-hidden bg-[var(--color-brand-300)]/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        <div className="relative container mx-auto px-6 py-12 text-center sm:py-16">
          <h1 className="mb-3 font-roboto text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
            Apps
          </h1>
          <p className="mx-auto max-w-2xl text-sm font-light text-[var(--color-hero-text)] sm:text-base lg:text-lg">
            Native desktop apps I&apos;ve built for macOS and Windows. Pick one for the latest
            download and a full install guide.
          </p>
        </div>
      </header>

      <section className="px-6 py-10" aria-label="Available apps">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
          {NATIVE_APPS.map((app, index) => (
            <AppCard key={app.slug} app={app} manifest={manifests[index]} />
          ))}
        </div>
      </section>
    </main>
  );
}
