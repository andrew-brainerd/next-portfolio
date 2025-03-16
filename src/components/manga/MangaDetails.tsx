/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button } from '@mui/material';
import { followManga, getMangaCover } from 'api/manga';
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
  const [thumb, setThumb] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [chapters, setChapters] = useState<ChapterDetails[]>([]);

  const fetchCover = useCallback(async () => {
    const coverResponse = await getMangaCover(slug);

    if (coverResponse?.imageUrl) {
      setThumb(coverResponse.imageUrl);
    }
  }, [slug]);

  useEffect(() => {
    setIsMounted(true);
    fetchCover();
  }, [fetchCover]);

  useEffect(() => {
    const parser = new DOMParser();
    const manga = parser.parseFromString(page, 'text/html');
    const mangaThumb = manga.querySelector('.manga-info-pic img')?.getAttribute('src');
    const mangaTitle = manga.querySelector('.manga-info-text h1')?.textContent;
    const mangaAuthor = manga.querySelectorAll('.manga-info-text li a').item(0).innerHTML.split('\n')[1].trim();
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
    setAuthor(mangaAuthor || '');
    setChapters(mangaChapters);
  }, [page]);

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div>
        {!!thumb && <img src={thumb} alt={`${title}`} />}
        <h1>{title}</h1>
        <Button onClick={() => followManga({ author, name: title, slug, thumb })}>Follow</Button>
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
