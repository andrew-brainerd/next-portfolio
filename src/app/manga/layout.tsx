import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { TOKEN_COOKIE } from '@/constants/authentication';
import { LOGIN_ROUTE, MANGA_ROUTE } from '@/constants/routes';

export const metadata: Metadata = {
  title: 'Manga Search',
  description: 'Search and browse manga collection'
};

export interface MangaLayoutProps {
  children: React.ReactNode;
}

export default async function MangaLayout({ children }: MangaLayoutProps) {
  const cookieJar = await cookies();
  if (!cookieJar.get(TOKEN_COOKIE)?.value) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(MANGA_ROUTE)}`);
  }

  return <div className="w-full h-full bg-neutral-600 p-20">{children}</div>;
}
