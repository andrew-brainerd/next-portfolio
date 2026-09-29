import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { TOKEN_COOKIE } from '@/constants/authentication';
import { LOGIN_ROUTE, WEDDING_CARDS_ROUTE, WEDDING_GUIDE_ROUTE } from '@/constants/routes';
import { getFullWeddingConfig } from '@/api/wedding';
import { TableCards } from '@/components/wedding/settings/TableCards';
import { buildGuideTagLinks } from '@/utils/weddingQr';
import { getWeddingPageUrl } from '@/utils/weddingRequest';

export const metadata: Metadata = {
  title: 'Wedding Table Cards',
  robots: { index: false, follow: false }
};

export default async function WeddingCardsPage() {
  const cookieJar = await cookies();
  if (!cookieJar.get(TOKEN_COOKIE)?.value) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(WEDDING_CARDS_ROUTE)}`);
  }

  // Backend 403s non-owners, so they get the empty state
  const config = await getFullWeddingConfig();
  const links = config ? await buildGuideTagLinks(config.guideKey, config.guide.seating) : [];

  if (links.length === 0) {
    return (
      <main className="container mx-auto max-w-3xl p-6">
        <p className="text-neutral-400">No cards yet. Generate a tag key and add tables in the wedding settings.</p>
      </main>
    );
  }

  const guideUrl = await getWeddingPageUrl(WEDDING_GUIDE_ROUTE);
  return <TableCards links={links} fallbackUrl={guideUrl.replace(/^https?:\/\//, '')} />;
}
