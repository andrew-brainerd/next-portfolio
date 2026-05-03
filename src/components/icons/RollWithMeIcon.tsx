import { SVGAttributes, memo } from 'react';

function SvgIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fillRule="evenodd" clipRule="evenodd" {...props}>
      <rect x="64" y="64" width="384" height="384" rx="72" fill="none" stroke="currentColor" strokeWidth="28" />
      <circle cx="160" cy="160" r="34" />
      <circle cx="352" cy="160" r="34" />
      <circle cx="256" cy="256" r="34" />
      <circle cx="160" cy="352" r="34" />
      <circle cx="352" cy="352" r="34" />
    </svg>
  );
}

const RollWithMeIcon = memo(SvgIcon);

export default RollWithMeIcon;
