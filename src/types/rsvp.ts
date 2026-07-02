export type RsvpStatus = 'going' | 'maybe' | 'no';

export interface RsvpInput {
  clientId: string;
  name: string;
  status: RsvpStatus;
  guests: number;
  guestNames: string[];
}

export interface Rsvp extends RsvpInput {
  id?: string;
  createdAt: number;
  updatedAt: number;
}

export interface RsvpGuestBookEntry {
  name: string;
  guests: number;
  guestNames: string[];
}

export interface RsvpGuestBook {
  going: RsvpGuestBookEntry[];
  headcount: number;
}

export interface RsvpBreakdown {
  going: Rsvp[];
  maybe: Rsvp[];
  no: Rsvp[];
  counts: { going: number; maybe: number; no: number };
  headcount: number;
}
