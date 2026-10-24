import { DownloadButtons } from '@/components/apps/DownloadButtons';
import { CONDENSATE } from '@/constants/apps';
import type { ReleaseManifest } from '@/types/apps';

// Signed-in users only (condensate spec §21).
export const CondensateLinuxDownload = ({ manifest }: { manifest: ReleaseManifest | null }) =>
  manifest && (
    <div className="mt-4 rounded-2xl border border-neutral-500/30 bg-neutral-700/20 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-300">
        Linux / SteamOS · {manifest.version}
      </h3>
      <DownloadButtons manifest={manifest} platforms={['linux']} appName={CONDENSATE.name} compact />
    </div>
  );
