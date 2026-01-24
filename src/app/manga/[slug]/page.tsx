import dynamic from 'next/dynamic';

import Loading from '@/components/Loading';

const MangaDetails = dynamic(() => import('components/manga/MangaDetails').then(mod => mod.MangaDetails), {
  loading: () => <Loading />
});

interface MangaPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function MangaPage({ params }: MangaPageProps) {
  const { slug } = await params;

  const response = await fetch(`https://www.nelomanga.com/manga/${slug}`);
  const pageContent = await response.text();

  return <MangaDetails page={pageContent} slug={slug} />;
}
