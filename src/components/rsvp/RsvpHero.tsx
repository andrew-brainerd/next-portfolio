import { RSVP_EVENT } from '@/constants/rsvp';

export const RsvpHero = () => (
  <header className="text-center">
    <p className="text-sm uppercase tracking-widest text-neutral-400">You&apos;re invited to a</p>
    <h2 className="mt-2 font-oswald text-2xl uppercase tracking-wide text-neutral-100">{RSVP_EVENT.title}</h2>
    <h1 className="mt-3 font-pacifico text-5xl text-brand-400">{RSVP_EVENT.coupleNames}</h1>
    <div className="mt-6 space-y-1 text-neutral-200">
      <p className="text-lg">{RSVP_EVENT.dateLabel}</p>
      <p className="text-lg">{RSVP_EVENT.timeLabel}</p>
    </div>
    <div className="mt-4 text-neutral-300">
      <p className="font-medium">{RSVP_EVENT.venueName}</p>
      <p className="text-sm text-neutral-400">{RSVP_EVENT.venueAddress}</p>
    </div>
    <p className="mx-auto mt-6 max-w-prose text-neutral-300">{RSVP_EVENT.blurb}</p>
  </header>
);
