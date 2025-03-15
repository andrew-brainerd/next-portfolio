'use client';

import { useEffect, useState } from 'react';

import { Button } from '@mui/material';
import { followManga } from 'api/manga';
import { formatChapterName } from 'utils/manga';

interface MangaDetailsProps {
  page: string;
  slug: string;
}

interface ChapterDetails {
  name: string;
  link: string;
  releaseDate: string;
}

export const MangaDetails = ({ page, slug }: MangaDetailsProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [chapters, setChapters] = useState<ChapterDetails[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const parser = new DOMParser();
    const manga = parser.parseFromString(page, 'text/html');
    const mangaTitle = manga.querySelector('.manga-info-text h1')?.textContent;
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

    setTitle(mangaTitle || '');
    setChapters(mangaChapters);
  }, [page]);

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div>
        <h1>{title}</h1>
        <Button onClick={() => followManga({ name: title, slug })}>Follow</Button>
      </div>
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
