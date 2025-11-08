import { getZillowProperties } from '@/api/zillow';
import PropertyTable from '@/components/zillow/PropertyTable';
import Image from 'next/image';
import type { Metadata } from 'next';

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
  const properties = await getZillowProperties();

  if (!properties || properties.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Zillow Properties</h1>
        <p className="text-gray-400">No properties found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Zillow Properties</h1>
        <p className="text-gray-300">
          Showing {properties.length} available rental {properties.length === 1 ? 'property' : 'properties'}
        </p>
      </div>

      <div className="hidden md:block">
        <PropertyTable properties={properties} />
      </div>

      {/* Property Cards for Mobile View */}
      <div className="grid gap-4 md:hidden">
        {properties.map((property, index) => (
          <div
            key={`${property.address}-${index}`}
            className="bg-brand-600 rounded-lg p-4 hover:bg-brand-700 transition-colors"
          >
            {property.image && (
              <Image
                src={property.image}
                alt={property.address}
                width={800}
                height={400}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h2 className="text-xl font-semibold mb-2">{property.address}</h2>
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span className="text-gray-400">Rent:</span>{' '}
                <span className="font-semibold">{property.monthlyRent}</span>
              </div>
              <div>
                <span className="text-gray-400">Type:</span> {property.propertyType}
              </div>
              <div>
                <span className="text-gray-400">Beds:</span> {property.beds}
              </div>
              <div>
                <span className="text-gray-400">Baths:</span> {property.baths}
              </div>
              <div>
                <span className="text-gray-400">Sqft:</span> {property.sqft?.toLocaleString()}
              </div>
              <div>
                <span className="text-gray-400">Year:</span> {property.yearBuilt}
              </div>
            </div>
            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-3">
                <span className="text-gray-400 text-sm">Amenities:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {property.amenities.map((amenity, i) => (
                    <span key={i} className="text-xs bg-brand-800 px-2 py-1 rounded">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                Available: {property.availableDate ? new Date(property.availableDate).toLocaleDateString() : 'N/A'}
              </span>
              <a
                href={property.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline text-sm"
              >
                View Listing
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
