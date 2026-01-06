# Vinyl DNA

Discover your musical identity by analyzing your Discogs record collection.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)

## Features

- **Collection DNA Analyzer** - Visualize your genre breakdown, decade distribution, and top labels
- **Collection Compatibility** - Compare your collection with friends to find overlaps and trade opportunities
- **Smart Recommendations** - Discover releases based on gaps in your musical taste

## Getting Started

### 1. Get Discogs API Credentials

1. Go to [Discogs Developer Settings](https://www.discogs.com/settings/developers)
2. Click "Generate new token" or create a new application
3. Copy your Consumer Key and Consumer Secret

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```
DISCOGS_CONSUMER_KEY=your_key_here
DISCOGS_CONSUMER_SECRET=your_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **Auth:** Discogs OAuth 1.0a
- **Storage:** HTTP-only cookies (no database required)

## Deployment

Deploy to Vercel:

```bash
npm i -g vercel
vercel
```

Remember to add your environment variables in Vercel's project settings.

## API Rate Limits

Discogs API allows 60 requests/minute for authenticated users. The app handles this gracefully with:
- Pagination (100 items per request)
- Request delays between batch fetches

## License

MIT

---

Data provided by [Discogs](https://www.discogs.com). Not affiliated with Discogs.
