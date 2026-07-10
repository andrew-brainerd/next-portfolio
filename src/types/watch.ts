export type WatchStatus = 'watchlist' | 'watching' | 'completed' | 'dropped';

export type ShowType = 'movie' | 'series';

export type StreamingOptionType = 'free' | 'subscription' | 'buy' | 'rent' | 'addon';

export interface SeriesProgress {
  season: number;
  episode: number;
  updatedAt: number;
}

export interface WatchItem {
  id: string;
  showType: ShowType;
  status: WatchStatus;
  addedAt: number;
  updatedAt: number;
  progress?: SeriesProgress;
}

export interface WatchSettings {
  country: string;
  services: string[];
}

export interface StreamingServiceRef {
  id: string;
  name: string;
  homePage?: string;
  themeColorCode?: string;
  imageUrl?: string;
}

export interface StreamingPrice {
  amount: string;
  currency: string;
  formatted: string;
}

export interface StreamingOption {
  service: StreamingServiceRef;
  type: StreamingOptionType;
  addon?: { id: string; name: string };
  link: string;
  videoLink?: string;
  quality?: string;
  expiresSoon?: boolean;
  expiresOn?: number;
  availableSince?: number;
  price?: StreamingPrice;
}

export interface WatchEpisode {
  title?: string;
  overview?: string;
  airYear?: number;
  streamingOptions: StreamingOption[];
}

export interface WatchSeason {
  title?: string;
  episodes: WatchEpisode[];
}

export interface Trailer {
  site: string;
  key: string;
  name?: string;
}

export interface WatchMedia {
  id: string;
  country: string;
  showType: ShowType;
  title: string;
  overview?: string;
  year?: number;
  lastAirYear?: number;
  genres?: { id: string; name: string }[];
  rating?: number;
  runtime?: number;
  seasonCount?: number;
  episodeCount?: number;
  poster?: string;
  streamingOptions: StreamingOption[];
  seasons?: WatchSeason[];
  trailer?: Trailer;
}

export interface WatchSearchResult {
  id: string;
  title: string;
  showType: ShowType;
  year?: number;
  poster?: string;
}

export interface WatchListItem extends WatchItem {
  media?: WatchMedia;
}

export interface WatchListResponse {
  items: WatchListItem[];
  settings: WatchSettings;
}
