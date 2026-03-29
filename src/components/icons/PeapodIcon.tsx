import { SVGAttributes, memo } from 'react';

function SvgIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fillRule="evenodd" clipRule="evenodd" {...props}>
      {/* Circle outline */}
      <circle cx="256" cy="256" r="232" fill="none" stroke="currentColor" strokeWidth="24" />
      {/* Left eye */}
      <circle cx="172" cy="195" r="24" />
      {/* Right eye */}
      <circle cx="292" cy="195" r="24" />
      {/* Open smile/mouth */}
      <path d="M130 268 C130 268 130 254 144 254 L336 254 C350 254 350 268 350 268 C350 362 302 405 240 405 C178 405 130 362 130 268 Z" />
    </svg>
  );
}

const PeapodIcon = memo(SvgIcon);

export default PeapodIcon;
