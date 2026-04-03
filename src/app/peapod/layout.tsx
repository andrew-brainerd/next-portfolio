import Image from 'next/image';
import { cookies } from 'next/headers';
import { TOKEN_COOKIE } from '@/constants/authentication';
import PeapodNotification from '@/components/peapod/Notification';
import peapodLogo from '@/img/peapod-logo.png';

export const metadata = {
  title: 'Peapod'
};

export default async function PeapodLayout({ children }: { children: React.ReactNode }) {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)]">
        <Image src={peapodLogo} alt="Peapod" width={96} height={96} className="mb-4" />
        <p className="text-white text-xl">Please log in to use Peapod</p>
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
