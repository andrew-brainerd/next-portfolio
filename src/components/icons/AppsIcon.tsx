import { SVGAttributes, memo } from 'react';

function SvgIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg viewBox="0 0 512 512" width="1em" height="1em" {...props}>
      <rect x="64" y="64" width="160" height="160" rx="40" />
      <rect x="288" y="64" width="160" height="160" rx="40" />
      <rect x="64" y="288" width="160" height="160" rx="40" />
      <rect x="288" y="288" width="160" height="160" rx="80" />
    </svg>
  );
}

const AppsIcon = memo(SvgIcon);

export default AppsIcon;
