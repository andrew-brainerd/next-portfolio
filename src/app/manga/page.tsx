/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@uidotdev/usehooks';
import { TextField } from '@mui/material';

import { postRequest } from 'api/client';
import { formatChapterName } from 'utils/manga';
import { MANGA_ROUTE } from 'constants/routes';

interface MangePostData {
  searchTerm: string;
}

interface Manga {
  id: number;
  author: string;
  name: string;
  chapterLatest: string;
  url: string;
  thumb: string;
  slug: string;
}

export default function MangePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchData, setSearchData] = useState<Manga[]>([]);
  const [searchPage, setSearchPage] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const hasValidSearchTerm = debouncedSearchTerm.length > 2;
  const router = useRouter();

  const handleSearch = async (term: string) => {
    setIsSearching(true);

    const searchData = await postRequest<MangePostData, Manga[] | string>('/manga/search', { searchTerm: term });

    console.log('Search Data', searchData);

    if (typeof searchData === 'string') {
      setSearchPage(searchData);
    } else {
      setSearchData(searchData);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (hasValidSearchTerm && !isSearching) {
      handleSearch(debouncedSearchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (searchPage) {
      const parser = new DOMParser();
      const page = parser.parseFromString(searchPage, 'text/html');
      const searchResults = page.querySelectorAll('.story_item_right');

      const mangaList: Manga[] = [];

      searchResults.forEach((result, id) => {
        const mangaAuthor = result.querySelectorAll('span')[0].innerText;
        const mangaLink = result.querySelector('a');
        const mangaName = mangaLink?.innerText || '';
        const mangaUrl = mangaLink?.href || '';
        const urlParts = mangaUrl.split('/');
        const mangaSlug = urlParts[urlParts.length - 1];

        mangaList.push({
          author: mangaAuthor.replace('Author(s) : ', ''),
          chapterLatest: '',
          id,
          name: mangaName,
          slug: mangaSlug,
          thumb: '',
          url: mangaUrl
        });
      });

      setSearchData(mangaList);
      setIsSearching(false);
    }
  }, [searchPage]);

  return (
    <>
      <div className="flex items-center gap-x-3 mb-10">
        <TextField
          label="Search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          autoFocus={true}
          data-testid="searchInput"
          autoCapitalize="off"
          autoComplete="off"
          // disabled={isSearching}
          size="small"
          sx={{
            'width': 300,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white'
            }
          }}
          variant="outlined"
        />
        {/* <Button onClick={() => handleSearch(searchTerm)} variant="contained">
          Search
        </Button> */}
      </div>
      {isSearching && <h1>Searching...</h1>}
      {hasValidSearchTerm && !isSearching && !searchData.length && <h1>No Results</h1>}
      {searchData.map(searchResult => (
        <div
          key={searchResult.id}
          className="flex flex-col mt-4 bg-brand-600 px-5 py-3 rounded gap-y-2 hover:bg-brand-700 cursor-pointer transition-colors"
          onClick={() => router.push(`${MANGA_ROUTE}/${searchResult.slug}`)}
        >
          <div className="flex gap-x-4">
            {false && !searchResult.thumb.includes('2xstorage') && (
              <img src={searchResult.thumb} alt={`${searchResult.name} thumbnail`} width={38} height={56} />
            )}
            <div className="text-xl">{searchResult.name}</div>
          </div>
          <div className="text-sm italic">{searchResult.author}</div>
        </div>
      ))}
    </>
  );
}
