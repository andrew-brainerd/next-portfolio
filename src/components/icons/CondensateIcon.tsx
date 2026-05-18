import { SVGAttributes, memo } from 'react';

/** The Condensate mark — a cloud condensing into droplets. Mirrors the
 * artwork in `condensate/src-tauri/icons/icon.svg`. Monochrome so it inherits
 * `fill-*`/text color like the other home + nav icons. */
function SvgIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" {...props}>
      <g>
        <circle cx="360" cy="400" r="100" />
        <circle cx="512" cy="336" r="140" />
        <circle cx="660" cy="400" r="100" />
        <rect x="310" y="400" width="400" height="130" rx="65" />
      </g>
      <g opacity="0.88">
        <circle cx="360" cy="720" r="26" />
        <circle cx="460" cy="784" r="18" />
        <circle cx="560" cy="744" r="22" />
        <circle cx="660" cy="792" r="16" />
      </g>
      <g opacity="0.55">
        <circle cx="400" cy="864" r="14" />
        <circle cx="520" cy="884" r="12" />
        <circle cx="620" cy="860" r="14" />
      </g>
    </svg>
  );
}

const CondensateIcon = memo(SvgIcon);

export default CondensateIcon;
