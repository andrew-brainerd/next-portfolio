import { MangaDetails } from 'components/MangaDetails';

export default async function MangaPage() {
  const response = await fetch('https://www.nelomanga.com/manga/solo-leveling-ragnarok');
  const homepageContent = await response.text();

  return <MangaDetails page={homepageContent} />;
}
