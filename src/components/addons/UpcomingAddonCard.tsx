import { AddonLogo } from '@/components/addons/AddonLogo';
import type { UpcomingAddon } from '@/types/addons';

interface UpcomingAddonCardProps {
  addon: UpcomingAddon;
}

export const UpcomingAddonCard = ({ addon }: UpcomingAddonCardProps) => (
  <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-neutral-500/30 bg-neutral-700/10 p-6">
    <div className="flex items-center gap-4">
      <AddonLogo name={addon.name} src={addon.logo} />
      <div className="min-w-0">
        <h3 className="font-semibold text-white">{addon.name}</h3>
        <span className="mt-1 inline-block rounded-full bg-brand-400/15 px-2 py-0.5 text-xs font-medium text-brand-300">
          Coming soon
        </span>
      </div>
    </div>
    <p className="text-sm text-neutral-300">{addon.summary}</p>
  </div>
);
