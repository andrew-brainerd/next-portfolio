/**
 * Fetches a list of image URLs from an S3 bucket via API route
 * Uses AWS SDK on the server side to securely list bucket contents
 * @returns Promise<string[]> Array of image URLs
 */
export async function fetchS3Images(): Promise<string[]> {
  try {
    const response = await fetch('/api/images', {
      cache: 'no-store' // Always fetch fresh images
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.statusText}`);
    }

    const data = await response.json();

    // API returns { "images": ["url1", "url2", ...] }
    if (Array.isArray(data.images)) {
      return data.images;
    }

    console.warn('Unexpected data format from S3 API');
    return [];
  } catch (error) {
    console.error('Error fetching S3 images:', error);
    return [];
  }
}
