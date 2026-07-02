import { RSVP_EVENT } from '@/constants/rsvp';

// UTC stamps avoid VTIMEZONE complexity — Sept 13 2026 is EDT (UTC−4),
// so 4–9 PM ET becomes 20:00Z–01:00Z (see RSVP spec §5).
const toIcsUtcStamp = (iso: string): string =>
  new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

const escapeIcsText = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

export const buildEventIcs = (): string => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//brainerd.dev//rsvp//EN',
    'BEGIN:VEVENT',
    'UID:rsvp-2026-09-13@brainerd.dev',
    `DTSTAMP:${toIcsUtcStamp(RSVP_EVENT.start)}`,
    `DTSTART:${toIcsUtcStamp(RSVP_EVENT.start)}`,
    `DTEND:${toIcsUtcStamp(RSVP_EVENT.end)}`,
    `SUMMARY:${escapeIcsText(`${RSVP_EVENT.title} — ${RSVP_EVENT.coupleNames}`)}`,
    `LOCATION:${escapeIcsText(`${RSVP_EVENT.venueName}, ${RSVP_EVENT.venueAddress}`)}`,
    `DESCRIPTION:${escapeIcsText(
      `It's a surprise for ${RSVP_EVENT.surpriseFor} — please don't say anything to her!`
    )}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return lines.join('\r\n');
};

export const mapsDirectionsUrl = (): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(RSVP_EVENT.venueAddress)}`;

export const downloadEventIcs = (): void => {
  const blob = new Blob([buildEventIcs()], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'family-dinner.ics';
  anchor.click();
  URL.revokeObjectURL(url);
};
