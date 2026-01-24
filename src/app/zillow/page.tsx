import { cookies } from 'next/headers';
import { getZillowProperties } from '@/api/zillow';
import MobilePropertyCards from '@/components/zillow/MobilePropertyCards';
import PropertyViewsWrapper from '@/components/zillow/PropertyViewsWrapper';
import type { Metadata } from 'next';
import { TOKEN_COOKIE } from '@/constants/authentication';

export const metadata: Metadata = {
  title: 'Zillow Properties',
  description: 'Browse available rental properties from Zillow',
  openGraph: {
    title: 'Zillow Properties',
    description: 'Browse available rental properties from Zillow'
  },
  twitter: {
    title: 'Zillow Properties',
    description: 'Browse available rental properties from Zillow'
  }
};

export default async function ZillowPage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const isLoggedIn = !!token;

  const properties = await getZillowProperties();

  if (!properties || properties.length === 0) {
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundImage: `
            linear-gradient(to bottom,
              rgba(245, 158, 11, 0.2) 0%,
              rgba(217, 119, 6, 0.25) 15%,
              rgba(180, 83, 9, 0.3) 30%,
              transparent 50%
            ),
            linear-gradient(to top,
              #d4a574 0%,
              #c19a6b 8%,
              #b08a5e 15%,
              #a67c52 22%,
              #8b6f47 30%,
              #7a5f3d 40%,
              #6b5442 50%,
              #5a4838 60%,
              #4a3f35 70%,
              #3a3228 80%,
              #2d2620 90%,
              #1f1a15 100%
            )
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Zillow Properties</h1>
          <p className="text-gray-400">No properties found.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `
          linear-gradient(to bottom,
            rgba(245, 158, 11, 0.2) 0%,
            rgba(217, 119, 6, 0.25) 15%,
            rgba(180, 83, 9, 0.3) 30%,
            transparent 50%
          ),
          linear-gradient(to top,
            #d4a574 0%,
            #c19a6b 8%,
            #b08a5e 15%,
            #a67c52 22%,
            #8b6f47 30%,
            #7a5f3d 40%,
            #6b5442 50%,
            #5a4838 60%,
            #4a3f35 70%,
            #3a3228 80%,
            #2d2620 90%,
            #1f1a15 100%
          )
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Zillow Properties</h1>
          <p className="text-gray-300">
            Showing {properties.length} available rental {properties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        <div className="hidden md:block">
          <PropertyViewsWrapper properties={properties} isLoggedIn={isLoggedIn} />
        </div>

        {/* Property Cards for Mobile View */}
        <MobilePropertyCards properties={properties} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
