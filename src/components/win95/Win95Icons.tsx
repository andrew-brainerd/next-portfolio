// Minimal 16x16 pixel-ish glyphs rendered as inline SVG (no icon library, per conventions).

interface Win95IconProps {
  className?: string;
}

const base = (className?: string) => ({
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  shapeRendering: 'crispEdges' as const,
  className
});

export const StartLogo = ({ className }: Win95IconProps) => (
  <svg {...base(className)} aria-hidden="true">
    <path d="M1 2 L7 1 L7 7 L1 7 Z" fill="#ff3b30" />
    <path d="M8 1 L15 0 L15 7 L8 7 Z" fill="#34c759" />
    <path d="M1 8 L7 8 L7 14 L1 13 Z" fill="#0a84ff" />
    <path d="M8 8 L15 8 L15 15 L8 14 Z" fill="#ffcc00" />
  </svg>
);

export const IconPortfolio = ({ className }: Win95IconProps) => (
  <svg {...base(className)} aria-hidden="true">
    <rect x="1" y="2" width="14" height="9" fill="#c0c0c0" stroke="#000" />
    <rect x="3" y="4" width="10" height="5" fill="#008080" />
    <rect x="6" y="12" width="4" height="2" fill="#808080" />
    <rect x="3" y="14" width="10" height="1" fill="#000" />
  </svg>
);

export const IconSteam = ({ className }: Win95IconProps) => (
  <svg {...base(className)} aria-hidden="true">
    <circle cx="8" cy="8" r="7" fill="#1b2838" stroke="#000" />
    <circle cx="10" cy="6" r="2.4" fill="none" stroke="#66c0f4" strokeWidth="1.2" />
    <circle cx="5" cy="10" r="1.6" fill="#66c0f4" />
    <line x1="10" y1="6" x2="5" y2="10" stroke="#66c0f4" strokeWidth="1" />
  </svg>
);

export const IconPeapod = ({ className }: Win95IconProps) => (
  <svg {...base(className)} aria-hidden="true">
    <circle cx="5" cy="12" r="2.2" fill="#1db954" />
    <circle cx="12" cy="10" r="2.2" fill="#1db954" />
    <path d="M7 12 V4 L14 2 V10" fill="none" stroke="#0a0a0a" strokeWidth="1.4" />
  </svg>
);

export const IconControlPanel = ({ className }: Win95IconProps) => (
  <svg {...base(className)} aria-hidden="true">
    <path
      d="M8 1 l1.6 2.2 2.6-.8.0 2.7 2.4 1.2-1.6 2.2 1.6 2.2-2.4 1.2 0 2.7-2.6-.8L8 19"
      fill="none"
    />
    <circle cx="8" cy="8" r="6" fill="#c0c0c0" stroke="#000" />
    <circle cx="8" cy="8" r="2.2" fill="none" stroke="#000" strokeWidth="1.4" />
    <rect x="7.3" y="0.5" width="1.4" height="3" fill="#000" />
    <rect x="7.3" y="12.5" width="1.4" height="3" fill="#000" />
    <rect x="0.5" y="7.3" width="3" height="1.4" fill="#000" />
    <rect x="12.5" y="7.3" width="3" height="1.4" fill="#000" />
  </svg>
);

export const IconLogOff = ({ className }: Win95IconProps) => (
  <svg {...base(className)} aria-hidden="true">
    <rect x="2" y="2" width="8" height="12" fill="#c0c0c0" stroke="#000" />
    <path d="M11 5 l4 3 -4 3 Z" fill="#000080" />
    <rect x="7" y="7" width="6" height="2" fill="#000080" />
  </svg>
);

const ICONS: Record<string, (props: Win95IconProps) => React.ReactElement> = {
  'portfolio': IconPortfolio,
  'steam': IconSteam,
  'peapod': IconPeapod,
  'control-panel': IconControlPanel
};

export const Win95AppIcon = ({ id, className }: { id: string; className?: string }) => {
  const Icon = ICONS[id] ?? IconPortfolio;
  return <Icon className={className} />;
};
