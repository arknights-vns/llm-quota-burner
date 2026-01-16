import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const albumId = params.id;

    // Note: Direct Facebook album scraping is limited due to authentication requirements
    // This endpoint attempts to fetch public photos but may have limited success
    const response = await axios.get(
      `https://www.facebook.com/terrastationvn/photos/?tab=album&album_id=${albumId}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    const $ = cheerio.load(response.data);
    const photos: any[] = [];

    // Extract image sources
    $('img[src*="fbcdn"]').each((_, element) => {
      const src = $(element).attr('src');
      const alt = $(element).attr('alt');

      if (src && !src.includes('profile') && !src.includes('icon')) {
        photos.push({
          id: Math.random().toString(36).substr(2, 9),
          src: src,
          caption: alt || undefined,
        });
      }
    });

    // If no photos found, return sample data
    if (photos.length === 0) {
      return NextResponse.json({
        photos: [
          {
            id: '1',
            src: 'https://via.placeholder.com/600x800?text=Photo+1',
            caption: 'Sample Photo 1',
          },
          {
            id: '2',
            src: 'https://via.placeholder.com/600x800?text=Photo+2',
            caption: 'Sample Photo 2',
          },
          {
            id: '3',
            src: 'https://via.placeholder.com/600x800?text=Photo+3',
            caption: 'Sample Photo 3',
          },
        ],
        message:
          'Could not fetch real photos from Facebook. Please add album photos manually or use Facebook Graph API with proper authentication.',
      });
    }

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching album photos:', error);

    // Return fallback sample data
    return NextResponse.json({
      photos: [
        {
          id: '1',
          src: 'https://via.placeholder.com/600x800?text=Photo+1',
          caption: 'Sample Photo 1',
        },
        {
          id: '2',
          src: 'https://via.placeholder.com/600x800?text=Photo+2',
          caption: 'Sample Photo 2',
        },
        {
          id: '3',
          src: 'https://via.placeholder.com/600x800?text=Photo+3',
          caption: 'Sample Photo 3',
        },
      ],
      error:
        'Could not fetch from Facebook. Facebook requires authentication and has strong anti-scraping measures. Consider using Facebook Graph API with proper access tokens.',
    });
  }
}
