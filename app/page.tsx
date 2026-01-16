'use client';

import React, { useEffect, useState } from 'react';
import { useComicReaderStore, type Album } from '@/lib/store';
import { AlbumList } from '@/components/AlbumList';
import { ComicViewer } from '@/components/ComicViewer';

export default function Home() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/albums');
        const data = await response.json();
        setAlbums(data.albums || data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching albums:', err);
        setError(
          'Failed to load albums. Please try again later or check the Facebook page directly.'
        );
        setAlbums([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-700 p-4 z-30">
        <h1 className="text-3xl font-bold text-white">
          🎭 Terra Station Comic Reader
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Displaying photos from Terra Station Facebook albums
        </p>
      </div>

      {/* Main content */}
      <div className="w-full flex flex-col mt-24">
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 p-4">
            ⚠️ {error}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <AlbumList albums={albums} isLoading={isLoading} />
          <ComicViewer />
        </div>
      </div>
    </div>
  );
}
