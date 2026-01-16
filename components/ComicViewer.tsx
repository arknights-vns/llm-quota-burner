'use client';

import React from 'react';
import { useComicReaderStore, type Photo } from '@/lib/store';

export const ComicViewer: React.FC = () => {
  const {
    currentPhotos,
    currentPhotoIndex,
    nextPhoto,
    previousPhoto,
    goToPhoto,
  } = useComicReaderStore();

  if (currentPhotos.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1 bg-black/50">
        <p className="text-gray-400">No photos to display</p>
      </div>
    );
  }

  const currentPhoto = currentPhotos[currentPhotoIndex];

  return (
    <div className="flex flex-col flex-1 bg-black">
      {/* Main viewer */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        {currentPhoto && (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={currentPhoto.src}
              alt={currentPhoto.caption || 'Photo'}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/400x600?text=Image+Not+Found';
              }}
            />
            {currentPhoto.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                <p className="text-white text-sm">{currentPhoto.caption}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <button
          onClick={previousPhoto}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-lg transition-colors z-10"
          disabled={currentPhotoIndex === 0}
        >
          ← Previous
        </button>
        <button
          onClick={nextPhoto}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-lg transition-colors z-10"
          disabled={currentPhotoIndex === currentPhotos.length - 1}
        >
          Next →
        </button>
      </div>

      {/* Page info and slider */}
      <div className="bg-gray-900 border-t border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-300">
            Page {currentPhotoIndex + 1} of {currentPhotos.length}
          </span>
          <button
            onClick={previousPhoto}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mr-2"
            disabled={currentPhotoIndex === 0}
          >
            ← Prev
          </button>
          <button
            onClick={nextPhoto}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            disabled={currentPhotoIndex === currentPhotos.length - 1}
          >
            Next →
          </button>
        </div>

        {/* Thumbnail slider */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {currentPhotos.slice(0, 10).map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => goToPhoto(index)}
              className={`flex-shrink-0 h-16 w-16 rounded border-2 overflow-hidden transition-all ${
                currentPhotoIndex === index
                  ? 'border-blue-500 opacity-100'
                  : 'border-gray-600 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={photo.src}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/64x64?text=...';
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
