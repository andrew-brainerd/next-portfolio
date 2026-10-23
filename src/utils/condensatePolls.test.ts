import { describe, expect, it } from 'vitest';

import type { CondensatePoll } from 'types/condensatePoll';
import { personLabel, previewDescription, rankedOptions, toggleTick } from './condensatePolls';

const poll: CondensatePoll = {
  pollId: 'a'.repeat(32),
  title: 'Friday',
  sessionAt: null,
  status: 'open',
  creatorSteamId: '76561198000000001',
  invitees: [],
  participants: [],
  people: { '76561198000000001': { name: 'Andrew' } },
  options: [
    { appId: 1, name: 'A', suggestedBy: 'x', suggestedAt: 1, voters: ['p'], owners: [], installedBy: [] },
    { appId: 2, name: 'B', suggestedBy: 'x', suggestedAt: 2, voters: ['p'], owners: ['p'], installedBy: [] },
    { appId: 3, name: 'C', suggestedBy: 'x', suggestedAt: 3, voters: ['p', 'q'], owners: [], installedBy: [] }
  ],
  myBallot: [],
  leader: 3,
  createdAt: 1,
  closedAt: null
};

describe('Condensate poll helpers', () => {
  it('ranks by votes, then owners, then the earliest suggestion', () => {
    expect(rankedOptions(poll).map(o => o.name)).toEqual(['C', 'B', 'A']);
  });

  it('names people who reported a name, and abbreviates everyone else', () => {
    expect(personLabel(poll, '76561198000000001')).toBe('Andrew');
    expect(personLabel(poll, '76561198000009876')).toBe('Steam user ·9876');
  });

  it('describes the poll for link previews without naming anyone', () => {
    expect(
      previewDescription({
        title: 'Friday',
        sessionAt: null,
        status: 'open',
        optionCount: 3,
        leading: { appId: 3, name: 'C', votes: 2 }
      })
    ).toBe('Vote on what to play · 3 games · Leading: C (2 votes)');
    expect(
      previewDescription({ title: 'Friday', sessionAt: null, status: 'closed', optionCount: 1, leading: null })
    ).toBe('Voting closed · 1 game');
  });

  it('toggles a tick', () => {
    expect(toggleTick([1, 2], 2)).toEqual([1]);
    expect(toggleTick([1], 2)).toEqual([1, 2]);
  });
});
