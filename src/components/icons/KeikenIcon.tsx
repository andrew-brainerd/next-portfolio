import { SVGAttributes, memo } from 'react';

function SvgIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 512 512"
      width="1em"
      height="1em"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      imageRendering="optimizeQuality"
      fillRule="evenodd"
      clipRule="evenodd"
      {...props}
    >
      <path
        d="M128 64h64v-32h128v32h64c17.673 0 32 14.327 32 32v352c0 17.673-14.327 32-32 32H128c-17.673 0-32-14.327-32-32V96c0-17.673 14.327-32 32-32zm64 32v-32h128v32H192zm-64 32v320h256V128H128zm32 32h192v32H160v-32zm0 64h192v32H160v-32zm0 64h128v32H160v-32z"
        opacity={0.993}
      />
    </svg>
  );
}

const KeikenIcon = memo(SvgIcon);

export default KeikenIcon;
