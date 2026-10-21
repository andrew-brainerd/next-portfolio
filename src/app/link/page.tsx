import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE } from 'constants/authentication';
import { LOGIN_ROUTE } from 'constants/routes';
import { LinkDeviceForm } from '@/components/link/LinkDeviceForm';
import { codeFromQuery, linkPath } from 'utils/linkDevice';

export const metadata = {
  title: 'Link a device'
};

interface LinkPageProps {
  searchParams: Promise<{ code?: string | string[] }>;
}

export default async function LinkPage({ searchParams }: LinkPageProps) {
  const code = codeFromQuery((await searchParams).code);
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(linkPath(code))}`);
  }

  return (
    <div className="container mx-auto max-w-md p-6">
      <h1 className="mb-1 text-3xl font-bold text-white">Link a device</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Pairing a TV or app, like the Board for Roku, the Charter Forever companion app or Condensate. Enter the code
        it&rsquo;s showing.
      </p>
      <LinkDeviceForm initialCode={code} />
    </div>
  );
}
