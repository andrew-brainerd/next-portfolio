import { RSVP_EVENT } from '@/constants/rsvp';

export const SurpriseBanner = () => (
  <div
    role="alert"
    className="rounded-lg border border-warning-700/60 bg-warning-400/10 p-4 text-center text-warning-100"
  >
    🤫 It&apos;s a surprise for {RSVP_EVENT.surpriseFor} — please don&apos;t say anything to her!
  </div>
);
