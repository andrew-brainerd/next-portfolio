'use client';

import { useEffect, useState } from 'react';

interface MangaDetailsProps {
  page: string;
}

export const MangaDetails = ({ page }: MangaDetailsProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const parser = new DOMParser();
  const manga = parser.parseFromString(page, 'text/html');
  const chapters = manga.querySelectorAll('.chapter-list .row');

  chapters.forEach(chapter => {
    const chapterData = chapter.querySelectorAll('span');
    const chapterLink = chapterData[0].querySelector('a')?.href || '';
    const chapterViews = chapterData[1].innerText;
    const chapterReleaseDate = chapterData[2].innerText;

    console.log({ chapterLink, chapterViews, chapterReleaseDate });
  });

  return <></>;
};
