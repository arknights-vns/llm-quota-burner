import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    const response = await axios.get(
      'https://www.facebook.com/terrastationvn/photos_albums',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    );

    const $ = cheerio.load(response.data);
    const albums: any[] = [];

    // Try to extract album data from the page
    $('a[href*="/photos/a."]').each((_, element) => {
      const $el = $(element);
      const href = $el.attr('href');
      const text = $el.text().trim();
      const cover = $el.find('img').attr('src');

      if (href && text) {
        albums.push({
          id: href.replace(/[^0-9]/g, ''),
          name: text,
          cover: cover,
          url: `https://www.facebook.com${href}`,
        });
      }
    });

    // Fallback: return sample data if no albums found
    if (albums.length === 0) {
      return NextResponse.json({
        albums: [
          {
            id: 'sample1',
            name: 'Sample Album 1',
            cover: null,
            photoCount: 0,
          },
          {
            id: 'sample2',
            name: 'Sample Album 2',
            cover: null,
            photoCount: 0,
          },
        ],
        message:
          'Could not fetch real albums. Facebook may be blocking scraping. Please add Facebook album data manually.',
      });
    }

    return NextResponse.json({ albums });
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      {
        error:
          'Unable to fetch albums from Facebook. The page structure may have changed or access is restricted.',
        albums: [],
      },
      { status: 500 }
    );
  }
}
