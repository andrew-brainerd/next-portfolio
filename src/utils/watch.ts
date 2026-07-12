import type { StreamingOption, WatchListItem, WatchStatus } from 'types/watch';

// Options included with a plain subscription (or free) count as "watch now"; rent/buy/addon cost extra.
const INCLUDED_TYPES = new Set<StreamingOption['type']>(['subscription', 'free']);

export interface SplitAvailability {
  // On a service the user subscribes to and included with the subscription — the primary "Watch now" links.
  primary: StreamingOption[];
  // Everything else: other services, plus rent/buy/addon on any service.
  more: StreamingOption[];
}

export const splitAvailability = (options: StreamingOption[], myServices: string[]): SplitAvailability => {
  const mine = new Set(myServices);
  const primaryByService = new Map<string, StreamingOption>();
  const more: StreamingOption[] = [];

  options.forEach(option => {
    // YouTube (imported videos) is free and always watchable, so it's primary regardless of the user's
    // subscribed services.
    const isMine =
      option.service.id === 'youtube' || (mine.has(option.service.id) && INCLUDED_TYPES.has(option.type));
    if (isMine) {
      // One "Watch now" per service, even if it lists multiple qualities.
      if (!primaryByService.has(option.service.id)) {
        primaryByService.set(option.service.id, option);
      }
    } else {
      more.push(option);
    }
  });

  return { primary: [...primaryByService.values()], more };
};

export const WATCH_STATUS_ORDER: WatchStatus[] = ['watching', 'watchlist', 'completed', 'dropped'];

export const WATCH_STATUS_LABELS: Record<WatchStatus, string> = {
  watching: 'Watching',
  watchlist: 'Watchlist',
  completed: 'Completed',
  dropped: 'Dropped'
};

export const groupByStatus = (items: WatchListItem[]): Record<WatchStatus, WatchListItem[]> => {
  const groups: Record<WatchStatus, WatchListItem[]> = {
    watchlist: [],
    watching: [],
    completed: [],
    dropped: []
  };

  items.forEach(item => {
    (groups[item.status] ?? groups.watchlist).push(item);
  });

  return groups;
};

// Any primary option that's expiring soon → surface a "leaving soon" badge on the card.
export const hasLeavingSoon = (options: StreamingOption[]): boolean =>
  options.some(option => option.expiresSoon);

// A title "requires rental" when every streaming option is rent/buy — nothing is included with a
// subscription (or free). Unknown availability (no cached options) is not treated as rental.
export const requiresRental = (item: WatchListItem): boolean => {
  const options = item.media?.streamingOptions ?? [];
  return options.length > 0 && options.every(option => option.type === 'rent' || option.type === 'buy');
};
