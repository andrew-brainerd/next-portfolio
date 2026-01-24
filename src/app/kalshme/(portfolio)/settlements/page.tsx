import dynamic from 'next/dynamic';

import Loading from '@/components/Loading';

const SettlementsContent = dynamic(() => import('@/components/kalshi/SettlementsContent'), {
  loading: () => <Loading />
});

export const metadata = {
  title: 'Kalshme - Settlements',
  description: 'View your Kalshi settlement history'
};

export default function SettlementsPage() {
  return <SettlementsContent />;
}
