import AppleIcon from '@/components/icons/AppleIcon';
import WindowsIcon from '@/components/icons/WindowsIcon';
import { downloadFor, formatBytes } from '@/utils/apps';
import type { AppPlatform, ReleaseManifest } from '@/types/apps';

interface DownloadButtonsProps {
  manifest: ReleaseManifest | null;
  platforms: AppPlatform[];
  appName: string;
  /** Smaller buttons for the /apps index card. */
  compact?: boolean;
}

const PLATFORM_ICON: Record<AppPlatform, typeof AppleIcon> = {
  macos: AppleIcon,
  windows: WindowsIcon
};

export default function DownloadButtons({
  manifest,
  platforms,
  appName,
  compact = false
}: DownloadButtonsProps) {
  if (!manifest) {
    return (
      <p
        className={`text-neutral-300 ${compact ? 'text-sm' : 'text-base'}`}
        role="status"
      >
        Builds for {appName} aren&apos;t published yet — check back soon.
      </p>
    );
  }

  const sizeClasses = compact ? 'px-4 py-2 text-sm gap-2' : 'px-6 py-3 text-base gap-3';
  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className={`flex flex-wrap ${compact ? 'gap-2' : 'gap-3'}`}>
      {platforms.map(platform => {
        const download = downloadFor(manifest, platform);
        if (!download) return null;
        const Icon = PLATFORM_ICON[platform];
        const size = download.sizeBytes ? formatBytes(download.sizeBytes) : null;

        return (
          <a
            key={platform}
            href={download.url}
            download
            className={`group inline-flex items-center ${sizeClasses} rounded-xl bg-brand-600 text-white font-semibold shadow-lg shadow-brand-600/20 transition-all duration-300 hover:bg-brand-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-neutral-800`}
            aria-label={`Download ${appName} for ${download.label}${size ? `, ${size}` : ''}`}
          >
            <Icon className={`${iconSize} fill-current`} aria-hidden="true" />
            <span>{download.label}</span>
            {size && !compact && (
              <span className="text-white/70 font-normal">· {size}</span>
            )}
          </a>
        );
      })}
    </div>
  );
}
