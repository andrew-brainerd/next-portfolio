import { AddonLogo } from '@/components/addons/AddonLogo';
import { formatReleaseDate } from '@/utils/apps';
import { formatDownloads } from '@/utils/addons';
import type { CurseForgeAddon } from '@/types/addons';

interface AddonCardProps {
  addon: CurseForgeAddon;
}

export const AddonCard = ({ addon }: AddonCardProps) => {
  const updated = formatReleaseDate(addon.updatedAt);

  return (
    <a
      href={addon.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-4 rounded-2xl border border-neutral-500/20 bg-neutral-700/20 p-6 transition-colors hover:border-brand-400/40 hover:bg-neutral-700/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      <div className="flex items-center gap-4">
        <AddonLogo name={addon.name} src={addon.logoUrl} />
        <div className="min-w-0">
          <h3 className="font-semibold text-white group-hover:text-brand-300">{addon.name}</h3>
          <p className="text-sm text-neutral-400">{formatDownloads(addon.downloads)}</p>
        </div>
      </div>
      <p className="flex-1 text-sm text-neutral-300">{addon.summary}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
        <span>
          {addon.latestVersion && <>Latest {addon.latestVersion}</>}
          {addon.latestVersion && updated && ' · '}
          {updated && <>Updated {updated}</>}
        </span>
        <span className="font-medium text-brand-400">
          View on CurseForge <span aria-hidden="true">→</span>
        </span>
      </div>
    </a>
  );
};
