'use client';

import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';
import type { ZillowProperty } from '@/types/zillow';

const PropertyViews = dynamic(() => import('@/components/zillow/PropertyViews'), {
  loading: () => <Loading />,
  ssr: false
});

interface PropertyViewsWrapperProps {
  properties: ZillowProperty[];
  isLoggedIn: boolean;
}

export default function PropertyViewsWrapper({ properties, isLoggedIn }: PropertyViewsWrapperProps) {
  return <PropertyViews properties={properties} isLoggedIn={isLoggedIn} />;
}
