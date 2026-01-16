'use client';

import React, { useEffect } from 'react';
import { useComicReaderStore, type Album } from '@/lib/store';

interface AlbumListProps {
  albums: Album[];
  isLoading: boolean;
}

export const AlbumList: React.FC<AlbumListProps> = ({ albums, isLoading }) => {
  const { currentAlbumId, setCurrentAlbum, setCurrentPhotos, setLoading } =
    useComicReaderStore();

  const handleSelectAlbum = async (albumId: string) => {
    setCurrentAlbum(albumId);
    setLoading(true);

    try {
      const response = await fetch(`/api/album/${albumId}/photos`);
      const photos = await response.json();
      setCurrentPhotos(photos.photos || photos || []);
    } catch (error) {
      console.error('Error loading album photos:', error);
      setCurrentPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 z-20">
        <h2 className="text-xl font-bold text-white">Albums</h2>
      </div>

      <div className="divide-y divide-gray-700">
        {isLoading && albums.length === 0 ? (
          <div className="p-4 text-center text-gray-400">Loading albums...</div>
        ) : albums.length === 0 ? (
          <div className="p-4 text-center text-gray-400">No albums found</div>
        ) : (
          albums.map((album) => (
            <button
              key={album.id}
              onClick={() => handleSelectAlbum(album.id)}
              className={`w-full text-left p-4 transition-colors ${
                currentAlbumId === album.id
                  ? 'bg-blue-600'
                  : 'hover:bg-gray-700'
              }`}
            >
              {album.cover && (
                <div className="mb-2 h-24 overflow-hidden rounded">
                  <img
                    src={album.cover}
                    alt={album.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <h3 className="font-semibold text-white truncate">
                {album.name}
              </h3>
              {album.photoCount && (
                <p className="text-sm text-gray-300">
                  {album.photoCount} photos
                </p>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
