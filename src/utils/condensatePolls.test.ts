import { describe, expect, it } from 'vitest';

import type { CondensatePoll } from 'types/condensatePoll';
import {
  personLabel,
  pollSummary,
  pollsForHome,
  previewDescription,
  rankedOptions,
  toggleTick
} from './condensatePolls';

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

  it('lists open polls by session time, then the five latest closed', () => {
    const open = (id: string, sessionAt: number | null, createdAt: number) => ({
      ...poll,
      pollId: id,
      sessionAt,
      createdAt
    });
    const closed = (id: string, closedAt: number) => ({ ...poll, pollId: id, status: 'closed' as const, closedAt });
    const list = [
      closed('c1', 1),
      open('o-late', 300, 1),
      closed('c2', 2),
      open('o-unscheduled', null, 200),
      closed('c3', 3),
      closed('c4', 4),
      closed('c5', 5),
      closed('c6', 6),
      open('o-soon', 100, 1)
    ];
    expect(pollsForHome(list).map(p => p.pollId)).toEqual([
      'o-soon',
      'o-unscheduled',
      'o-late',
      'c6',
      'c5',
      'c4',
      'c3',
      'c2'
    ]);
  });

  it('summarises a poll for the Condensate view', () => {
    expect(pollSummary(poll)).toBe('Open · 3 games · Leading: C');
    expect(pollSummary({ ...poll, status: 'closed', leader: 2 })).toBe('Closed · 3 games · Winner: B');
    expect(pollSummary({ ...poll, options: poll.options.slice(0, 1), leader: null })).toBe('Open · 1 game');
  });

  it('toggles a tick', () => {
    expect(toggleTick([1, 2], 2)).toEqual([1]);
    expect(toggleTick([1], 2)).toEqual([1, 2]);
  });
});
