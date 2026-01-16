import { create } from 'zustand';

export interface Photo {
  id: string;
  src: string;
  caption?: string;
  timestamp?: string;
}

export interface Album {
  id: string;
  name: string;
  cover?: string;
  photoCount?: number;
}

interface ComicReaderStore {
  albums: Album[];
  currentAlbumId: string | null;
  currentPhotos: Photo[];
  currentPhotoIndex: number;
  isLoading: boolean;
  error: string | null;

  setAlbums: (albums: Album[]) => void;
  setCurrentAlbum: (albumId: string) => void;
  setCurrentPhotos: (photos: Photo[]) => void;
  nextPhoto: () => void;
  previousPhoto: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  goToPhoto: (index: number) => void;
}

export const useComicReaderStore = create<ComicReaderStore>((set) => ({
  albums: [],
  currentAlbumId: null,
  currentPhotos: [],
  currentPhotoIndex: 0,
  isLoading: false,
  error: null,

  setAlbums: (albums) => set({ albums }),
  setCurrentAlbum: (albumId) =>
    set({ currentAlbumId: albumId, currentPhotoIndex: 0 }),
  setCurrentPhotos: (photos) => set({ currentPhotos: photos }),
  nextPhoto: () =>
    set((state) => ({
      currentPhotoIndex: Math.min(
        state.currentPhotoIndex + 1,
        state.currentPhotos.length - 1
      ),
    })),
  previousPhoto: () =>
    set((state) => ({
      currentPhotoIndex: Math.max(state.currentPhotoIndex - 1, 0),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  goToPhoto: (index) => set({ currentPhotoIndex: index }),
}));
