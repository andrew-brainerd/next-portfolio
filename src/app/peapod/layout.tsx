import { cookies } from 'next/headers';
import { TOKEN_COOKIE } from '@/constants/authentication';
import PeapodNotification from '@/components/peapod/Notification';

export const metadata = {
  title: 'Peapod'
};

export default async function PeapodLayout({ children }: { children: React.ReactNode }) {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white text-xl">Please log in to use Peapod.</p>
      </div>
    );
  }

  return (
    <div>
      {children}
      <PeapodNotification />
    </div>
  );
}
