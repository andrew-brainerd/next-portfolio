export type VenueCategory = 'greenhouse' | 'glass-nature' | 'urban-loft' | 'historic-ballroom';
export type VenueRegion = 'west-michigan' | 'detroit-metro' | 'other';

export interface VenueCoords {
  lat: number;
  lng: number;
}

export interface VenueCapacity {
  min?: number;
  max: number;
}

export interface Venue {
  slug: string;
  name: string;
  city: string;
  region: VenueRegion;
  category: VenueCategory;
  description: string;
  url: string;
  priceRange: string;
  priceMidpoint: number;
  capacity: VenueCapacity;
  // Geocoded once and committed to venues.json; null until B-2 fills them in.
  coords: VenueCoords | null;
  // Added in Phase D; optional during A–C.
  imageUrls?: string[];
  features: string[];
}
