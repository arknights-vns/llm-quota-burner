# Terra Station Comic Reader

A comic reader web application that displays photos from Terra Station Facebook albums in a comic/manga-style reader interface.

## Features

- 📖 Comic/Manga reader interface for browsing photos
- 🎨 Beautiful dark theme with Tailwind CSS
- ⌨️ Keyboard and button navigation (Previous/Next)
- 📱 Responsive design
- 🖼️ Thumbnail navigation
- 💾 Album selection sidebar

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Elysia.js (optional API server)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Web Scraping**: Cheerio

## Prerequisites

- Node.js 18+ or higher
- npm or yarn package manager

## Installation

1. Clone or navigate to the project directory:
```bash
cd vns-ai
```

2. Install dependencies:
```bash
npm install
```

## Development

Start both the Next.js development server and Elysia backend:

```bash
npm run dev
```

Or run them separately:
```bash
npm run dev:next    # Next.js on port 3000
npm run dev:server  # Elysia on port 3001
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

```bash
npm run build
npm start
```

## API Endpoints

### GET /api/albums
Fetches all photo albums from Terra Station Facebook page.

**Response:**
```json
{
  "albums": [
    {
      "id": "string",
      "name": "string",
      "cover": "string (URL)",
      "photoCount": "number"
    }
  ]
}
```

### GET /api/album/:id/photos
Fetches all photos from a specific album.

**Response:**
```json
{
  "photos": [
    {
      "id": "string",
      "src": "string (image URL)",
      "caption": "string (optional)",
      "timestamp": "string (optional)"
    }
  ]
}
```

## File Structure

```
vns-ai/
├── app/
│   ├── api/
│   │   ├── albums/
│   │   │   └── route.ts          # Albums endpoint
│   │   └── album/
│   │       └── [id]/
│   │           └── route.ts      # Photos endpoint
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AlbumList.tsx             # Album sidebar component
│   └── ComicViewer.tsx           # Main comic viewer component
├── lib/
│   └── store.ts                  # Zustand store
├── server/
│   └── index.ts                  # Elysia backend server
├── styles/
│   └── globals.css
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Usage

1. **Select an Album**: Click on an album from the left sidebar to load its photos
2. **Navigate Photos**: Use the Previous/Next buttons or arrow buttons in the main viewer
3. **Quick Navigation**: Click on thumbnails at the bottom to jump to specific photos
4. **Page Counter**: Current page is displayed with the format "Page X of Y"

## Important Notes on Facebook Scraping

Facebook has strong anti-scraping measures. The current implementation uses web scraping which has limitations:

- **Authentication**: Facebook requires login for access to private albums
- **Rate Limiting**: Facebook limits requests from automated tools
- **Structure Changes**: The page structure may change, breaking the scraper

### For Production Use, Consider:

1. **Facebook Graph API**: Official API with proper authentication
   - Requires Facebook App setup
   - Need proper access tokens
   - Better reliability and data access

2. **Manual Data Integration**: Import photos manually
3. **Alternative Sources**: Use a different photo hosting service

## Example: Using Facebook Graph API

```typescript
// Would require:
// 1. Facebook App setup at developers.facebook.com
// 2. Access tokens with proper permissions
// 3. Album ID from the public page

const response = await fetch(
  `https://graph.facebook.com/v18.0/{album-id}/photos`,
  {
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    }
  }
);
```

## Troubleshooting

### Albums not loading
- Facebook may be blocking requests
- Check browser console for errors
- Ensure you have internet connection
- Try refreshing the page

### Images not showing
- Images may require Facebook login to view
- Use placeholder images as fallback
- Consider using different image sources

## License

See LICENSE.md for details.

## Contributing

Feel free to extend this project with:
- Database integration for storing album data
- User authentication
- Image optimization
- Download functionality
- Social sharing features

---

Made with ❤️ for Terra Station
