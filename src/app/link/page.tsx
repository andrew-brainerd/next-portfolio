import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE } from 'constants/authentication';
import { LINK_ROUTE, LOGIN_ROUTE } from 'constants/routes';
import { LinkDeviceForm } from '@/components/link/LinkDeviceForm';

export const metadata = {
  title: 'Link a device'
};

export default async function LinkPage() {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(LINK_ROUTE)}`);
  }

  return (
    <div className="container mx-auto max-w-md p-6">
      <h1 className="mb-1 text-3xl font-bold text-white">Link a device</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Pairing a TV or app (like the Board for Roku). Enter the code it&rsquo;s showing.
      </p>
      <LinkDeviceForm />
    </div>
  );
}
