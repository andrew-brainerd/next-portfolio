'use client';

import { useEffect, useState } from 'react';

interface MangaDetailsProps {
  page: string;
}

interface ChapterDetails {
  name: string;
  link: string;
  releaseDate: string;
}

const formatChapterName = (chapterLink: string) => {
  const parts = chapterLink.split('/');
  const chapterLinkName = parts[parts.length - 1];
  const chapterNumParts = chapterLinkName.split('-').slice(1).join('.');

  return `Chapter ${chapterNumParts}`;
};

export const MangaDetails = ({ page }: MangaDetailsProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [chapters, setChapters] = useState<ChapterDetails[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const parser = new DOMParser();
    const manga = parser.parseFromString(page, 'text/html');
    const chapterRows = manga.querySelectorAll('.chapter-list .row');

    const mangaChapters: ChapterDetails[] = [];

    chapterRows.forEach(chapter => {
      const chapterData = chapter.querySelectorAll('span');
      const chapterLink = chapterData[0].querySelector('a')?.href || '';
      const chapterName = formatChapterName(chapterLink);
      // const chapterViews = chapterData[1].innerText;
      const chapterReleaseDate = chapterData[2].innerText;

      mangaChapters.push({ link: chapterLink, name: chapterName, releaseDate: chapterReleaseDate });
    });

    setChapters(mangaChapters);
  }, [page]);

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      {chapters.map(chapter => (
        <div key={chapter.name}>
          <a href={chapter.link} target="_blank">
            {chapter.name}
          </a>
        </div>
      ))}
    </div>
  );
};
