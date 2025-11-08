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
          <PropertyTable properties={properties} />
        </div>

        {/* Property Cards for Mobile View */}
        <div className="grid gap-4 md:hidden">
          {properties.map((property, index) => (
            <div
              key={`${property.address}-${index}`}
              className="bg-amber-50/85 rounded-lg p-4 hover:bg-amber-100/85 transition-colors shadow-lg backdrop-blur-sm border border-amber-200"
            >
              {property.image && (
                <Image
                  src={property.image}
                  alt={property.address}
                  width={800}
                  height={400}
                  className="w-full h-48 object-cover rounded-lg mb-4 border-2 border-amber-300"
                />
              )}
              <h2 className="text-xl font-semibold mb-2 text-orange-900">{property.address}</h2>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-orange-700">Rent:</span>{' '}
                  <span className="font-semibold text-amber-950">{property.price}</span>
                </div>
                <div>
                  <span className="text-orange-700">Type:</span>{' '}
                  <span className="text-amber-950">{property.propertyType}</span>
                </div>
                <div>
                  <span className="text-orange-700">Beds:</span> <span className="text-amber-950">{property.beds}</span>
                </div>
                <div>
                  <span className="text-orange-700">Baths:</span>{' '}
                  <span className="text-amber-950">{property.baths}</span>
                </div>
                <div>
                  <span className="text-orange-700">Sqft:</span>{' '}
                  <span className="text-amber-950">{property.sqft?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-orange-700">Year:</span>{' '}
                  <span className="text-amber-950">{property.yearBuilt}</span>
                </div>
              </div>
              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-3">
                  <span className="text-orange-700 text-sm">Amenities:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {property.amenities.map((amenity, i) => (
                      <span key={i} className="text-xs bg-orange-800 text-amber-50 px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-700">
                  Available: {property.availableDate ? new Date(property.availableDate).toLocaleDateString() : 'N/A'}
                </span>
                <a
                  href={property.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-700 hover:text-orange-900 underline text-sm font-semibold"
                >
                  View Listing
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
