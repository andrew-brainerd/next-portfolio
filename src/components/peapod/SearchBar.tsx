'use client';

interface SearchBarProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
}

export default function SearchBar({ searchText, onSearchTextChange }: SearchBarProps) {
  return (
    <div className="mt-2.5">
      <input
        type="text"
        className="appearance-none bg-neutral-800 border border-neutral-600 rounded-md text-white outline-none py-2.5 px-3 transition-[border] duration-200 focus:border-brand-400 text-base w-full"
        placeholder="Search for a song"
        value={searchText}
        onChange={e => onSearchTextChange(e.target.value)}
      />
    </div>
  );
}
