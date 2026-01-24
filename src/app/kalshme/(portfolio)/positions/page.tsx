import dynamic from 'next/dynamic';

import Loading from '@/components/Loading';

const PositionsContent = dynamic(() => import('@/components/kalshi/PositionsContent'), {
  loading: () => <Loading />
});

export const metadata = {
  title: 'Kalshme - Positions',
  description: 'View your active Kalshi positions'
};

export default function PositionsPage() {
  return <PositionsContent />;
}
