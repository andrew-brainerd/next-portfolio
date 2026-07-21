import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { TOKEN_COOKIE } from '@/constants/authentication';
import { LOGIN_ROUTE, WEDDING_SETTINGS_ROUTE } from '@/constants/routes';
import { getFullWeddingConfig, getWeddingRsvps } from '@/api/wedding';
import { RsvpAdminList } from '@/components/wedding/settings/RsvpAdminList';
import { WeddingSettingsForm } from '@/components/wedding/settings/WeddingSettingsForm';

export const metadata: Metadata = {
  title: 'Wedding Settings',
  robots: { index: false, follow: false }
};

export default async function WeddingSettingsPage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(WEDDING_SETTINGS_ROUTE)}`);
  }

  // Owner check is behavioral: the backend 403s anyone but the configured
  // wedding owner, so a non-owner (or a down API) just gets nothing here.
  const [config, rsvps] = await Promise.all([getFullWeddingConfig(), getWeddingRsvps()]);

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Wedding Settings</h1>
        <p className="text-sm text-neutral-400">Everything the storybook shows guests, editable in one place.</p>
      </header>

      {!config ? (
        <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-6 text-center">
          <p className="text-neutral-400">
            Only the wedding owner can edit these settings. If that&apos;s you, is brainerd-api running?
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {rsvps && <RsvpAdminList breakdown={rsvps} />}
          <WeddingSettingsForm initialConfig={config} />
        </div>
      )}
    </div>
  );
}
