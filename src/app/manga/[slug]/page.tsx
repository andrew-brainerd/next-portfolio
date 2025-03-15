import { MangaDetails } from 'components/manga/MangaDetails';

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
