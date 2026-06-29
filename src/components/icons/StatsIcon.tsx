import { SVGAttributes, memo } from 'react';

function SvgIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...props}>
      <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z" />
    </svg>
  );
}

export const StatsIcon = memo(SvgIcon);
