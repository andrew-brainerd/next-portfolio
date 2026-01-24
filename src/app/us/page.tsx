'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchS3Images } from 'utils/s3';
import Slideshow from 'components/Slideshow';

export default function UsPage() {
  const [images, setImages] = useState<string[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [musicUrl, setMusicUrl] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        // Load images
        const imageUrls = await fetchS3Images();
        setImages(imageUrls);

        // Load music URL
        const musicResponse = await fetch('/api/audio');
        const musicData = await musicResponse.json();
        if (musicData.url) {
          setMusicUrl(musicData.url);
        }
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, []);

  // Load audio when music URL is ready (important for iOS)
  useEffect(() => {
    if (musicUrl && audioRef.current) {
      audioRef.current.load();
    }
  }, [musicUrl]);

  const handleStart = async () => {
    if (audioRef.current && musicUrl) {
      // Set volume before playing
      audioRef.current.volume = 0.5;

      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Audio playback error:', error);
      }
    }

    // Start slideshow after audio has been initiated
    setIsStarted(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[100dvh] bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden">
      {/* Click to start overlay */}
      {!isStarted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm touch-none">
          <button
            onClick={handleStart}
            className="group relative px-8 py-4 sm:px-12 sm:py-6 text-white text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 active:from-blue-700 active:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl touch-manipulation"
          >
            <span className="relative z-10">Let Me In</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
          </button>
        </div>
      )}

      {/* Slideshow */}
      {isStarted && images.length > 0 && <Slideshow images={images} interval={5000} />}

      {/* Audio player - Always render for mobile compatibility */}
      <audio ref={audioRef} loop playsInline preload="none" className="hidden">
        {musicUrl && <source src={musicUrl} type="audio/mpeg" />}
        <track kind="captions" />
      </audio>
    </div>
  );
}
