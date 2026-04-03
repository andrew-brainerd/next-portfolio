import PeapodNotification from '@/components/peapod/Notification';

export const metadata = {
  title: 'Peapod'
};

export default function PeapodLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <PeapodNotification />
    </div>
  );
}
