interface GeocodingResult {
  lat: number;
  lng: number;
}

interface GeocodingCache {
  [address: string]: GeocodingResult;
}

// In-memory cache to avoid redundant API calls
const geocodingCache: GeocodingCache = {};

/**
 * Geocode an address using Google Maps Geocoding API
 * @param address - Full address string to geocode
 * @returns Promise with lat/lng coordinates or null if geocoding fails
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  // Check cache first
  if (geocodingCache[address]) {
    return geocodingCache[address];
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('Google Maps API key not found.');
    throw new Error('Google Maps API key not configured');
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const result = {
        lat: location.lat,
        lng: location.lng
      };

      // Cache the result
      geocodingCache[address] = result;
      return result;
    } else if (data.status === 'ZERO_RESULTS') {
      console.warn(`No geocoding results found for address: ${address}`);
      return null;
    } else if (data.status === 'OVER_QUERY_LIMIT') {
      console.error('Google Maps API quota exceeded.');
      throw new Error('Geocoding quota exceeded');
    } else {
      console.error(`Geocoding error: ${data.status}`, data.error_message);
      return null;
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
}

/**
 * Batch geocode multiple addresses with rate limiting
 * @param addresses - Array of address strings
 * @param delayMs - Delay between requests in milliseconds (default: 200ms)
 * @returns Promise with array of geocoding results
 */
export async function geocodeAddresses(
  addresses: string[],
  delayMs: number = 200
): Promise<(GeocodingResult | null)[]> {
  const results: (GeocodingResult | null)[] = [];

  for (const address of addresses) {
    const result = await geocodeAddress(address);
    results.push(result);

    // Add delay between requests to avoid rate limiting
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
