// Categorical + sequential steps validated against the site's dark surface
// (#191919). Deliberately fixed rather than theme-derived: the pair was checked
// for colorblind separation and contrast as a set, so a per-theme hue swap would
// invalidate it.
export const VIZ_ME = '#3987e5';
export const VIZ_HER = '#d95926';
export const VIZ_EMPTY = '#262623';
export const VIZ_SEQUENTIAL = ['#103a6e', '#16497f', '#1c5cab', '#256abf', '#3987e5', '#5598e7', '#86b6ef'];

export const ME_LABEL = 'Andrew';
export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Latency is capped at 12 hours upstream; anything longer counts as a new
// conversation rather than a reply.
export const CONVERSATION_GAP_HOURS = 6;
