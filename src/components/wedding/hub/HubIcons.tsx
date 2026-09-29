const ICON_PROPS = {
  viewBox: '0 0 24 24',
  className: 'h-7 w-7',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true
};

export const StoryIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M12 6.5C10.2 5 7.6 4.5 4 4.8v13c3.6-.3 6.2.2 8 1.7 1.8-1.5 4.4-2 8-1.7v-13c-3.6-.3-6.2.2-8 1.7Z" />
    <path d="M12 6.5v13" />
  </svg>
);

export const DetailsIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.4" />
  </svg>
);

export const RsvpIcon = () => (
  <svg {...ICON_PROPS}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="m3.8 6.5 8.2 6.3 8.2-6.3" />
    <path d="M12 16.2c-1.4-1-2.2-1.8-2.2-2.7a1.1 1.1 0 0 1 2.2-.4 1.1 1.1 0 0 1 2.2.4c0 .9-.8 1.7-2.2 2.7Z" />
  </svg>
);

export const GuideIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M12 3.5 13.9 9l5.6.2-4.4 3.5 1.6 5.4L12 15l-4.7 3.1 1.6-5.4L4.5 9.2l5.6-.2L12 3.5Z" />
  </svg>
);
