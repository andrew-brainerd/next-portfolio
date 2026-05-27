'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/Loading';
import type { Venue } from '@/types/wedding';

const VenueViews = dynamic(() => import('@/components/wedding/VenueViews').then(m => m.VenueViews), {
  loading: () => (
    <div className="flex items-center justify-center p-12">
      <Loading />
    </div>
  ),
  ssr: false
});

interface VenueViewsWrapperProps {
  venues: Venue[];
  budgetTarget: number;
}

export const VenueViewsWrapper = ({ venues, budgetTarget }: VenueViewsWrapperProps) => {
  return <VenueViews venues={venues} budgetTarget={budgetTarget} />;
};
