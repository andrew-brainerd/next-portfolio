'use client';

import { parseYouTubeVideoId, youTubeThumbnail } from '@/utils/buzzed';

interface VideoLinkInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export const VideoLinkInput = ({ value, onChange, id = 'video' }: VideoLinkInputProps) => {
  const trimmed = value.trim();
  const videoId = parseYouTubeVideoId(trimmed);
  const invalid = trimmed.length > 0 && !videoId;

  return (
    <div>
      <input
        id={id}
        type="url"
        inputMode="url"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="https://youtube.com/watch?v=…"
        className={`w-full rounded-md border bg-neutral-900 px-3 py-2 text-base text-white placeholder:text-neutral-600 focus:outline-none ${
          invalid ? 'border-red-600 focus:border-red-500' : 'border-neutral-700 focus:border-brand-500'
        }`}
      />

      {invalid && <p className="mt-1 text-xs text-red-400">That doesn’t look like a YouTube link.</p>}

      {videoId && (
        <div className="mt-3 flex items-center gap-3 rounded-md border border-neutral-800 bg-neutral-900/60 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={youTubeThumbnail(videoId)}
            alt=""
            className="h-12 w-20 shrink-0 rounded object-cover"
          />
          <div className="min-w-0">
            <p className="text-sm text-white">Video ready</p>
            <p className="truncate font-mono text-xs text-neutral-500">{videoId}</p>
          </div>
        </div>
      )}
    </div>
  );
};
