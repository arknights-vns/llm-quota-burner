import Elysia from 'elysia';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface Photo {
  id: string;
  src: string;
  caption?: string;
  timestamp?: string;
}

interface Album {
  id: string;
  name: string;
  cover?: string;
  photoCount?: number;
}

// Note: Direct Facebook scraping is limited. This uses publicly available data.
const app = new Elysia()
  .get('/api/albums', async () => {
    try {
      // Facebook page info endpoint
      const response = await axios.get(
        'https://www.facebook.com/terrastationvn/photos_albums',
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        }
      );

      // Parse HTML using cheerio
      const $ = cheerio.load(response.data);
      const albums: Album[] = [];

      // Extract album data from page
      $('div[data-album-id]').each((_, element) => {
        const $el = $(element);
        albums.push({
          id: $el.attr('data-album-id') || '',
          name: $el.find('span').text() || 'Untitled Album',
          cover: $el.find('img').attr('src'),
        });
      });

      return albums;
    } catch (error) {
      console.error('Error fetching albums:', error);
      return {
        error: 'Unable to fetch albums. Facebook page may have changed structure.',
        albums: [],
      };
    }
  })
  .get('/api/album/:id/photos', async ({ params: { id } }) => {
    try {
      const response = await axios.get(
        `https://www.facebook.com/terrastationvn/photos_albums//${id}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        }
      );

      const $ = cheerio.load(response.data);
      const photos: Photo[] = [];

      // Extract photos from album
      $('img[src*="fbcdn"]').each((_, element) => {
        const $img = $(element);
        const src = $img.attr('src');
        if (src && !src.includes('profile')) {
          photos.push({
            id: Math.random().toString(36).substr(2, 9),
            src: src,
            caption: $img.attr('alt') || undefined,
          });
        }
      });

      return photos;
    } catch (error) {
      console.error('Error fetching photos:', error);
      return {
        error: 'Unable to fetch photos',
        photos: [],
      };
    }
  })
  .get('/health', () => ({ status: 'ok' }))
  .listen(3001);

console.log('🦊 Elysia server running at http://localhost:3001');
