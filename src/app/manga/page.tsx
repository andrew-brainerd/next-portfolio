'use client';

import { useState } from 'react';
import { Button, TextField } from '@mui/material';

export default function MangePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);

    const searchWord = searchTerm.replace(' ', '_');
    const searchResponse = await fetch(`https://www.nelomanga.com/home/search/json?searchword=${searchWord}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const searchData = await searchResponse.json();

    console.log('Search Data', searchData);
  };

  return (
    <div className="flex items-center gap-x-3">
      <TextField
        label="Search"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        autoFocus={true}
        // onKeyDown={handleSearch}
        data-testid="searchInput"
        autoCapitalize="off"
        disabled={isSearching}
        size="small"
        sx={{
          'width': 300,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'white'
          }
        }}
        variant="outlined"
      />
      <Button onClick={handleSearch} variant="contained">
        Search
      </Button>
    </div>
  );
}
