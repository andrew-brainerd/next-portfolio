// Condensate game night polls, as brainerd-api returns them (condensate spec US-26, FR-44).

export interface CondensatePollPerson {
  name: string;
  avatarUrl?: string;
}

export interface CondensatePollOption {
  appId: number;
  name: string;
  suggestedBy: string;
  suggestedAt: number;
  voters: string[];
  owners: string[];
  installedBy: string[];
}

export interface CondensatePoll {
  pollId: string;
  title: string;
  sessionAt: number | null;
  status: 'open' | 'closed';
  creatorSteamId: string;
  invitees: string[];
  participants: string[];
  people: Record<string, CondensatePollPerson>;
  options: CondensatePollOption[];
  myBallot: number[];
  leader: number | null;
  createdAt: number;
  closedAt: number | null;
}

export interface CondensatePollPreview {
  title: string;
  sessionAt: number | null;
  status: 'open' | 'closed';
  optionCount: number;
  leading: { appId: number; name: string; votes: number } | null;
}

export interface SteamStoreHit {
  appId: number;
  name: string;
}

export type PollLoad = { ok: true; poll: CondensatePoll } | { ok: false; status: number };
