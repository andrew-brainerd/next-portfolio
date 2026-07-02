// One-off event — details are hardcoded per the RSVP spec (no multi-event system)
export const RSVP_EVENT = {
  coupleNames: 'Andrew + Hayley',
  title: 'Surprise Family Dinner',
  surpriseFor: 'Hayley',
  start: '2026-09-13T16:00:00-04:00',
  end: '2026-09-13T21:00:00-04:00',
  dateLabel: 'Sunday, September 13, 2026',
  timeLabel: '4:00 – 9:00 PM ET',
  venueName: 'White Horse Inn',
  venueAddress: '1 E High St, Metamora, MI 48455',
  blurb:
    "We're trading the desert for Michigan and flying in from Las Vegas for the weekend — and we " +
    "couldn't be in town without rounding up some of our very favorite people. Come join us for a " +
    'night of good food, good drinks, and even better company!'
} as const;

export const RSVP_CLIENT_ID_KEY = 'rsvp-client-id';
export const RSVP_SAVED_KEY = 'rsvp';
