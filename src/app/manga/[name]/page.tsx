import { Manga } from 'components/Manga';

export default async function MangaPage() {
  const response = await fetch('https://www.nelomanga.com/manga/solo-leveling-ragnarok');
  const homepageContent = await response.text();

  return <Manga page={homepageContent} />;
}
