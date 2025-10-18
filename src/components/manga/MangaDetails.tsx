'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@mui/material';
import Image from 'next/image';

import { followManga, getMangaCover } from 'api/manga';
import { formatChapterName } from 'utils/manga';
import Loading from 'components/Loading';

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
  const [thumb, setThumb] = useState('');

  // Parse manga details from page HTML - useMemo avoids setState in effect
  const mangaDetails = useMemo(() => {
    const parser = new DOMParser();
    const manga = parser.parseFromString(page, 'text/html');
    const mangaTitle = manga.querySelector('.manga-info-text h1')?.textContent;
    const mangaAuthor = manga.querySelectorAll('.manga-info-text li a').item(0).innerHTML.split('\n')[1].trim();
    const chapterRows = manga.querySelectorAll('.chapter-list .row');

    const mangaChapters: ChapterDetails[] = [];

    chapterRows.forEach(chapter => {
      const chapterData = chapter.querySelectorAll('span');
      const chapterLink = chapterData[0].querySelector('a')?.href || '';
      const chapterName = formatChapterName(chapterLink);
      const chapterReleaseDate = chapterData[2].innerText;

      mangaChapters.push({ link: chapterLink, name: chapterName, releaseDate: chapterReleaseDate });
    });

    return {
      title: mangaTitle || '',
      author: mangaAuthor || '',
      chapters: mangaChapters
    };
  }, [page]);

  // Fetch cover image from external API - this is a legitimate use of useEffect
  // for synchronizing with external systems
  useEffect(() => {
    const fetchCover = async () => {
      const coverResponse = await getMangaCover(slug);

      if (coverResponse?.imageUrl) {
        setThumb(coverResponse.imageUrl);
      }
    };

    fetchCover();
  }, [slug]);

  return !thumb ? (
    <Loading />
  ) : (
    <div className="flex flex-col gap-y-10">
      <div className="flex justify-center items-center gap-y-3 sm:gap-x-4 flex-col">
        <Image
          className="rounded-full w-20 h-20 object-cover"
          src={thumb}
          alt={`${mangaDetails.title} cover`}
          height={150}
          width={150}
        />
        <div className="flex flex-col items-center gap-y-2">
          <h1 className="text-3xl text-center sm:text-left">{mangaDetails.title}</h1>
          <Button
            onClick={() => followManga({ author: mangaDetails.author, name: mangaDetails.title, slug, thumb })}
            variant="contained"
          >
            Follow
          </Button>
        </div>
      </div>
      <div className="sm:grid sm:grid-cols-3 gap-2 text-center">
        {mangaDetails.chapters.map(chapter => (
          <div key={chapter.name}>
            <a href={chapter.link} target="_blank">
              {chapter.name}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
