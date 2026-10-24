import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { getCondensateAccount } from '@/api/condensateAccount';
import { getCondensateDevices } from '@/api/condensateDevices';
import { getCondensatePolls } from '@/api/condensatePolls';
import { getCondensateDownloads, getReleaseManifest } from '@/api/apps';
import { getPlayerSummary } from '@/api/steam';
import { DownloadButtons } from '@/components/apps/DownloadButtons';
import { CondensateDevices } from '@/components/condensate/CondensateDevices';
import { CondensateIcon } from '@/components/icons/CondensateIcon';
import { CONDENSATE } from '@/constants/apps';
import { TOKEN_COOKIE } from '@/constants/authentication';
import { APPS_CONDENSATE_ROUTE, CONDENSATE_ROUTE, LINK_ROUTE, LOGIN_ROUTE, SETTINGS_ROUTE } from '@/constants/routes';
import { condensatePollPath, pollSummary, pollsForHome, steamHeaderArt } from '@/utils/condensatePolls';

export const metadata: Metadata = { title: 'Condensate' };

const FEATURE_LABELS: Record<string, string> = { lighting: 'Game lighting' };

const Section = ({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="mb-10">
    <h2 className="mb-2 text-xl font-semibold text-neutral-200">{title}</h2>
    {description && <p className="mb-4 text-sm text-neutral-400">{description}</p>}
    {children}
  </section>
);

const Downloads = async () => {
  const { stable, beta } = await getCondensateDownloads();
  const manifest = stable ?? (await getReleaseManifest(CONDENSATE.slug));
  return (
    <Section title="Download">
      <DownloadButtons manifest={manifest} platforms={CONDENSATE.platforms} appName={CONDENSATE.name} compact />
      {beta && (
        <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-300">Beta · {beta.version}</h3>
          <DownloadButtons
            manifest={beta}
            platforms={[...CONDENSATE.platforms, 'linux']}
            appName={`${CONDENSATE.name} beta`}
            compact
          />
        </div>
      )}
      <p className="mt-3 text-sm text-neutral-500">
        <Link href={APPS_CONDENSATE_ROUTE} className="underline hover:text-neutral-300">
          About Condensate and first-launch steps
        </Link>
      </p>
    </Section>
  );
};

// A signed-in user's Condensate data (condensate spec AC-24.13).
export default async function CondensateHomePage() {
  if (!(await cookies()).get(TOKEN_COOKIE)?.value) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(CONDENSATE_ROUTE)}`);
  }

  const account = await getCondensateAccount();
  const [player, devices, polls] = account
    ? await Promise.all([getPlayerSummary(account.steamId), getCondensateDevices(), getCondensatePolls()])
    : [null, null, null];
  const name = player?.personaname && player.personaname !== 'Invalid User' ? player.personaname : null;
  const shownPolls = polls ? pollsForHome(polls) : null;

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#0EA5E9] to-[#0C4A6E]">
            <CondensateIcon className="h-9 w-9 fill-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Condensate</h1>
            <p className="text-neutral-400">Your devices, game nights and downloads.</p>
          </div>
        </div>

        {!account ? (
          <Section title="Link your Steam account">
            <p className="mb-4 text-sm text-neutral-400">
              Condensate uses your Steam account. Link Steam to this account in Settings to see your devices and game
              night polls here.
            </p>
            <Link
              href={SETTINGS_ROUTE}
              className="inline-block rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-black hover:bg-white"
            >
              Go to Settings
            </Link>
          </Section>
        ) : (
          <>
            <Section title="Account">
              <div className="flex items-center gap-4 rounded-lg border border-neutral-700 px-4 py-3">
                {player?.avatarmedium && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={player.avatarmedium} alt="" width={48} height={48} className="h-12 w-12 rounded-md" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-white">{name ?? 'Steam account'}</p>
                  <p className="font-mono text-xs text-neutral-500">{account.steamId}</p>
                </div>
                {account.features.length > 0 && (
                  <ul className="flex flex-wrap justify-end gap-2" aria-label="Features">
                    {account.features.map(feature => (
                      <li
                        key={feature}
                        className="rounded-full border border-sky-400/40 bg-sky-400/10 px-2.5 py-0.5 text-xs text-sky-200"
                      >
                        {FEATURE_LABELS[feature] ?? feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Section>

            <Section
              title="Devices"
              description="Computers and Steam Decks signed in to Condensate. A device you sign out has to sign in again."
            >
              <CondensateDevices initial={devices} />
              <p className="mt-3 text-sm text-neutral-500">
                <Link href={LINK_ROUTE} className="underline hover:text-neutral-300">
                  Link a new device
                </Link>
              </p>
            </Section>

            <Section title="Game nights" description="Polls you made, were invited to or voted in.">
              {shownPolls === null && (
                <p className="text-sm text-red-400">Couldn’t load your polls. Try again in a moment.</p>
              )}
              {shownPolls?.length === 0 && (
                <p className="text-sm text-neutral-500">
                  No polls yet. Start one from Condensate’s Group tab under Game night.
                </p>
              )}
              {shownPolls && shownPolls.length > 0 && (
                <ul className="divide-y divide-neutral-700 rounded-lg border border-neutral-700">
                  {shownPolls.map(poll => (
                    <li key={poll.pollId}>
                      <Link
                        href={condensatePollPath(poll.pollId)}
                        className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/5"
                      >
                        {poll.leader !== null ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={steamHeaderArt(poll.leader)}
                            alt=""
                            width={92}
                            height={43}
                            className="h-[43px] w-[92px] shrink-0 rounded object-cover"
                          />
                        ) : (
                          <div className="h-[43px] w-[92px] shrink-0 rounded bg-neutral-800" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm text-white">{poll.title}</p>
                          <p className="truncate text-xs text-neutral-500">{pollSummary(poll, 'en-US')}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </>
        )}

        <Downloads />
      </div>
    </main>
  );
}
