import { SVGAttributes, memo } from 'react';

function SvgIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg height="1em" viewBox="0 0 24 24" width="1em" name="Home" fill="currentColor" {...props}>
      <path d="M12 3l9 8h-3v9h-4v-6h-4v6H6v-9H3l9-8z" />
    </svg>
  );
}

export const HomeIcon = memo(SvgIcon);
