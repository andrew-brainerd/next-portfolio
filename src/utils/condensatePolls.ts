import type { CondensatePoll, CondensatePollOption, CondensatePollPreview } from 'types/condensatePoll';

export const condensatePollPath = (pollId: string) => `/condensate/polls/${pollId}`;

export const steamHeaderArt = (appId: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;

// Approvals, then owners, then the earliest suggestion: the order brainerd-api picks the winner.
export const rankedOptions = (poll: CondensatePoll): CondensatePollOption[] =>
  [...poll.options].sort(
    (a, b) => b.voters.length - a.voters.length || b.owners.length - a.owners.length || a.suggestedAt - b.suggestedAt
  );

// Steam sign-ins carry no display name, so people who never reported one show by the end of their SteamID.
export const personLabel = (poll: CondensatePoll, steamId: string) =>
  poll.people[steamId]?.name ?? `Steam user ·${steamId.slice(-4)}`;

export const formatSession = (sessionAt: number | null, locale?: string) =>
  sessionAt === null
    ? null
    : new Date(sessionAt).toLocaleString(locale, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });

// One line for the link unfurl; names nobody (AC-26.8).
export const previewDescription = (preview: CondensatePollPreview, locale?: string) => {
  const parts = [
    formatSession(preview.sessionAt, locale),
    preview.status === 'closed' ? 'Voting closed' : 'Vote on what to play',
    `${preview.optionCount} ${preview.optionCount === 1 ? 'game' : 'games'}`,
    preview.leading
      ? `${preview.status === 'closed' ? 'Winner' : 'Leading'}: ${preview.leading.name} (${preview.leading.votes} ${
          preview.leading.votes === 1 ? 'vote' : 'votes'
        })`
      : null
  ];
  return parts.filter(Boolean).join(' · ');
};

const RECENT_CLOSED = 5;

// The Condensate view's list (AC-24.13): open polls by session time, then the latest closed ones.
export const pollsForHome = (polls: CondensatePoll[]): CondensatePoll[] => {
  const when = (poll: CondensatePoll) => poll.sessionAt ?? poll.createdAt;
  const open = polls.filter(p => p.status === 'open').sort((a, b) => when(a) - when(b));
  const closed = polls
    .filter(p => p.status === 'closed')
    .sort((a, b) => (b.closedAt ?? b.createdAt) - (a.closedAt ?? a.createdAt))
    .slice(0, RECENT_CLOSED);
  return [...open, ...closed];
};

export const pollSummary = (poll: CondensatePoll, locale?: string) => {
  const leader = poll.options.find(o => o.appId === poll.leader);
  const games = poll.options.length;
  return [
    formatSession(poll.sessionAt, locale),
    poll.status === 'closed' ? 'Closed' : 'Open',
    `${games} ${games === 1 ? 'game' : 'games'}`,
    leader ? `${poll.status === 'closed' ? 'Winner' : 'Leading'}: ${leader.name}` : null
  ]
    .filter(Boolean)
    .join(' · ');
};

export const toggleTick = (ballot: number[], appId: number) =>
  ballot.includes(appId) ? ballot.filter(id => id !== appId) : [...ballot, appId];
