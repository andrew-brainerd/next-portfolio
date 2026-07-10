import { describe, expect, it } from 'vitest';

import type { StreamingOption, WatchListItem } from '../types/watch';
import { groupByStatus, hasLeavingSoon, requiresRental, splitAvailability } from './watch';

const option = (serviceId: string, type: StreamingOption['type'], extra: Partial<StreamingOption> = {}): StreamingOption => ({
  service: { id: serviceId, name: serviceId },
  type,
  link: `https://${serviceId}.com/title`,
  ...extra
});

const itemWith = (options: StreamingOption[]): WatchListItem =>
  ({
    id: 'x',
    showType: 'movie',
    status: 'watchlist',
    addedAt: 0,
    updatedAt: 0,
    media: { id: 'x', country: 'us', showType: 'movie', title: 'T', streamingOptions: options }
  }) as WatchListItem;

describe('splitAvailability', () => {
  it('puts subscription options on my services into primary', () => {
    const { primary, more } = splitAvailability(
      [option('netflix', 'subscription'), option('max', 'subscription')],
      ['netflix']
    );

    expect(primary.map(o => o.service.id)).toEqual(['netflix']);
    expect(more.map(o => o.service.id)).toEqual(['max']);
  });

  it('treats rent/buy on my service as "more options", not watch-now', () => {
    const { primary, more } = splitAvailability([option('netflix', 'rent'), option('netflix', 'buy')], ['netflix']);

    expect(primary).toHaveLength(0);
    expect(more).toHaveLength(2);
  });

  it('includes free options on my services in primary', () => {
    const { primary } = splitAvailability([option('tubi', 'free')], ['tubi']);
    expect(primary).toHaveLength(1);
  });

  it('dedupes primary to one option per service', () => {
    const { primary } = splitAvailability(
      [option('netflix', 'subscription', { quality: 'hd' }), option('netflix', 'subscription', { quality: 'uhd' })],
      ['netflix']
    );

    expect(primary).toHaveLength(1);
    expect(primary[0].quality).toBe('hd');
  });

  it('puts everything in more when no services are configured', () => {
    const { primary, more } = splitAvailability([option('netflix', 'subscription')], []);
    expect(primary).toHaveLength(0);
    expect(more).toHaveLength(1);
  });
});

describe('groupByStatus', () => {
  it('buckets items by their status', () => {
    const items = [
      { id: 'a', status: 'watching' },
      { id: 'b', status: 'watchlist' },
      { id: 'c', status: 'watching' },
      { id: 'd', status: 'dropped' }
    ] as WatchListItem[];

    const groups = groupByStatus(items);

    expect(groups.watching.map(i => i.id)).toEqual(['a', 'c']);
    expect(groups.watchlist.map(i => i.id)).toEqual(['b']);
    expect(groups.dropped.map(i => i.id)).toEqual(['d']);
    expect(groups.completed).toEqual([]);
  });
});

describe('hasLeavingSoon', () => {
  it('is true when any option is expiring soon', () => {
    expect(hasLeavingSoon([option('netflix', 'subscription', { expiresSoon: true })])).toBe(true);
    expect(hasLeavingSoon([option('netflix', 'subscription')])).toBe(false);
    expect(hasLeavingSoon([])).toBe(false);
  });
});

describe('requiresRental', () => {
  it('is true when every option is rent or buy', () => {
    expect(requiresRental(itemWith([option('apple', 'rent'), option('amazon', 'buy')]))).toBe(true);
  });

  it('is false when a subscription option exists', () => {
    expect(requiresRental(itemWith([option('apple', 'rent'), option('netflix', 'subscription')]))).toBe(false);
  });

  it('is false when availability is unknown (no options)', () => {
    expect(requiresRental(itemWith([]))).toBe(false);
  });
});
