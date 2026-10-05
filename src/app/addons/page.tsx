import type { Metadata } from 'next';
import { getAddons } from '@/api/addons';
import { AddonCard } from '@/components/addons/AddonCard';
import { UpcomingAddonCard } from '@/components/addons/UpcomingAddonCard';
import { AddonsIcon } from '@/components/icons/AddonsIcon';
import { CURSEFORGE_PROFILE_URL, UPCOMING_ADDONS } from '@/constants/addons';

export const metadata: Metadata = {
  title: 'WoW Addons',
  description: 'World of Warcraft addons I build and publish on CurseForge, mostly for WoW: Forever.',
  alternates: { canonical: '/addons' },
  openGraph: {
    title: 'WoW Addons | Andrew Brainerd',
    description: 'World of Warcraft addons I build and publish on CurseForge, mostly for WoW: Forever.',
    url: 'https://brainerd.dev/addons'
  }
};

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-6 text-2xl font-bold text-brand-400 sm:text-3xl">
      {children}
    </h2>
  );
}

export default async function AddonsPage() {
  const addons = await getAddons();

  return (
    <main className="min-h-screen pb-16">
      <header className="bg-[var(--color-brand-300)]/10">
        <div className="container mx-auto flex flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:py-14">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] bg-gradient-to-b from-[#F59E0B] to-[#78350F] shadow-2xl">
            <AddonsIcon className="h-14 w-14 fill-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-roboto text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
              WoW Addons
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[var(--color-hero-text)]/90 sm:text-base">
              Small, focused World of Warcraft addons, mostly for WoW: Forever. All free on CurseForge.
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-6">
        <section className="py-12" aria-labelledby="published-heading">
          <SectionHeading id="published-heading">On CurseForge</SectionHeading>
          {addons?.length ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {addons.map(addon => (
                <AddonCard key={addon.id} addon={addon} />
              ))}
            </div>
          ) : (
            <p className="text-neutral-300">
              Couldn&apos;t load the addon list right now. They&apos;re all on{' '}
              <a href={CURSEFORGE_PROFILE_URL} className="text-brand-400 underline hover:text-brand-300">
                my CurseForge profile
              </a>
              .
            </p>
          )}
        </section>

        {UPCOMING_ADDONS.length > 0 && (
          <section className="py-12" aria-labelledby="upcoming-heading">
            <SectionHeading id="upcoming-heading">Coming soon</SectionHeading>
            <div className="grid gap-5 sm:grid-cols-2">
              {UPCOMING_ADDONS.map(addon => (
                <UpcomingAddonCard key={addon.name} addon={addon} />
              ))}
            </div>
          </section>
        )}

        <p className="text-sm text-neutral-400">
          See everything on{' '}
          <a
            href={CURSEFORGE_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 underline hover:text-brand-300"
          >
            CurseForge
          </a>
          .
        </p>
      </div>
    </main>
  );
}
