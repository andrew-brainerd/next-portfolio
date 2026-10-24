import Link from 'next/link';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';

import { TOKEN_COOKIE } from 'constants/authentication';
import { LOGIN_ROUTE, SETTINGS_ROUTE } from 'constants/routes';
import { getPoll, getPollPreview } from '@/api/condensatePolls';
import { CondensatePoll } from '@/components/condensate/CondensatePoll';
import { condensatePollPath, previewDescription, steamHeaderArt } from '@/utils/condensatePolls';

interface PollPageProps {
  params: Promise<{ id: string }>;
}

// Open Graph tags from the public preview, so the link unfurls in Discord without naming anyone (AC-26.8).
export async function generateMetadata({ params }: PollPageProps): Promise<Metadata> {
  const preview = await getPollPreview((await params).id);
  if (!preview) return { title: 'Condensate poll' };
  const description = previewDescription(preview, 'en-US');
  const images = preview.leading ? [{ url: steamHeaderArt(preview.leading.appId), width: 460, height: 215 }] : [];
  return {
    title: preview.title,
    description,
    openGraph: { title: preview.title, description, images, siteName: 'Condensate' },
    twitter: { card: images.length ? 'summary_large_image' : 'summary', title: preview.title, description }
  };
}

export default async function CondensatePollPage({ params }: PollPageProps) {
  const { id } = await params;
  const signedIn = Boolean((await cookies()).get(TOKEN_COOKIE)?.value);
  const signIn = `${LOGIN_ROUTE}?from=${encodeURIComponent(condensatePollPath(id))}`;

  if (!signedIn) {
    const preview = await getPollPreview(id);
    return (
      <div className="container mx-auto max-w-2xl p-6">
        <h1 className="mb-2 text-3xl font-bold text-white">{preview?.title ?? 'Condensate poll'}</h1>
        {preview ? (
          <p className="mb-6 text-neutral-400">{previewDescription(preview)}</p>
        ) : (
          <p className="mb-6 text-neutral-400">That poll doesn’t exist any more.</p>
        )}
        {preview && (
          <Link
            href={signIn}
            className="rounded-lg bg-white/90 px-4 py-3 text-sm font-medium text-black hover:bg-white"
          >
            Sign in with Steam to vote
          </Link>
        )}
      </div>
    );
  }

  const result = await getPoll(id);
  return (
    <div className="container mx-auto max-w-2xl p-6">
      {result.ok ? (
        <>
          <h1 className="mb-4 text-3xl font-bold text-white">{result.poll.title}</h1>
          <CondensatePoll initial={result.poll} />
        </>
      ) : (
        <>
          <h1 className="mb-2 text-3xl font-bold text-white">Condensate poll</h1>
          <p className="text-neutral-400">
            Condensate polls need a Steam account.{' '}
            <Link href={signIn} className="underline">
              Sign in with Steam
            </Link>{' '}
            or{' '}
            <Link href={SETTINGS_ROUTE} className="underline">
              link Steam in Settings
            </Link>{' '}
            to vote, or check the link is right.
          </p>
        </>
      )}
    </div>
  );
}
