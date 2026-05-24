import { cookies } from 'next/headers';
import { getZillowProperties } from '@/api/zillow';
import { MobilePropertyCards } from '@/components/zillow/MobilePropertyCards';
import { PropertyViewsWrapper } from '@/components/zillow/PropertyViewsWrapper';
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
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Zillow Properties</h1>
        <p className="text-neutral-400">No properties found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Zillow Properties</h1>
        <p className="text-neutral-300">
          Showing {properties.length} available rental {properties.length === 1 ? 'property' : 'properties'}
        </p>
      </div>

      <div className="hidden md:block">
        <PropertyViewsWrapper properties={properties} isLoggedIn={isLoggedIn} />
      </div>

      {/* Property Cards for Mobile View */}
      <MobilePropertyCards properties={properties} isLoggedIn={isLoggedIn} />
    </div>
  );
}
