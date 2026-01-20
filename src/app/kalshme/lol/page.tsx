import LoLEsportsTabs from '@/components/kalshi/LoLEsportsTabs';

export const metadata = {
  title: 'Kalshme - LoL Esports Markets',
  description: 'Browse League of Legends esports markets on Kalshi'
};

export default function LoLEsportsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">League of Legends Esports Markets</h1>
        <p className="text-gray-400">Browse prediction markets for major LoL leagues</p>
      </div>

      <LoLEsportsTabs />
    </div>
  );
}
