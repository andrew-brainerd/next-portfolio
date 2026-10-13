import { SVGAttributes, memo } from 'react';

/** The Download All mark — a download arrow over a progress bar. Mirrors
 * `steam-download-all/installer/icon.svg`. Monochrome so it inherits
 * `fill-*`/text color like the other home + nav icons. */
function SvgIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" {...props}>
      <path d="M468 232a44 44 0 0 1 88 0v306l114-114a44 44 0 0 1 62 62L543 675a44 44 0 0 1-62 0L292 486a44 44 0 0 1 62-62l114 114Z" />
      <rect x="252" y="748" width="520" height="88" rx="44" opacity="0.7" />
    </svg>
  );
}

export const DownloadAllIcon = memo(SvgIcon);
