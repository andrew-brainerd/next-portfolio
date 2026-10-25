'use client';

import { useState } from 'react';
import { steamHeaderArt } from 'utils/condensatePolls';
import { steamCoverArt } from 'utils/steam';
import type { Deck60Game } from 'types/steam';

type CoverArt = 'cover' | 'header' | 'none';

// Older games often lack portrait library art, so fall back to the store header, then to the title.
export const DeckGameCover = ({ appId, name, note }: Deck60Game) => {
  const [art, setArt] = useState<CoverArt>('cover');

  // A server-rendered image can fail before hydration attaches onError, so also check on mount.
  const checkCover = (cover: HTMLImageElement | null) => {
    if (cover?.complete && cover.naturalWidth === 0) setArt('header');
  };

  return (
    <a
      href={`https://store.steampowered.com/app/${appId}`}
      target="_blank"
      rel="noreferrer"
      className="group block focus-visible:outline-none"
      title={note ? `${name}: ${note}` : name}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-neutral-800 shadow-lg shadow-black/40 ring-1 ring-white/10 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-[#1a9fff]/20 group-hover:ring-[#1a9fff]/70 group-focus-visible:ring-2 group-focus-visible:ring-[#1a9fff]">
        {art === 'cover' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={checkCover}
            src={steamCoverArt(appId)}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setArt('header')}
          />
        )}
        {art === 'header' && (
          <div className="flex h-full flex-col justify-center gap-3 bg-gradient-to-b from-neutral-700 to-neutral-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={steamHeaderArt(appId)}
              alt={name}
              loading="lazy"
              className="w-full"
              onError={() => setArt('none')}
            />
            <span className="font-oswald px-2 text-center text-sm leading-tight text-neutral-200">{name}</span>
          </div>
        )}
        {art === 'none' && (
          <div className="font-oswald flex h-full items-center justify-center bg-gradient-to-b from-neutral-700 to-neutral-900 p-3 text-center text-lg leading-tight text-neutral-200">
            {name}
          </div>
        )}
      </div>
      {note && <p className="mt-1.5 line-clamp-2 text-xs text-neutral-400">{note}</p>}
    </a>
  );
};
