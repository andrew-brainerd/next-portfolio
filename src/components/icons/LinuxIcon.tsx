import { SVGAttributes, memo } from 'react';

// A terminal prompt, standing in for Linux / SteamOS.
function SvgIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...props}>
      <path d="M3 4h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm1.3 4.3 3.7 3.7-3.7 3.7 1.4 1.4L10.8 12 5.7 6.9 4.3 8.3zM12 15.5V17.5h7v-2h-7z" />
    </svg>
  );
}

export const LinuxIcon = memo(SvgIcon);
