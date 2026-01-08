import { NextRequest, NextResponse } from "next/server";

const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";

interface SimilarArtistRequest {
  artists: string[];
}

interface LastfmSimilarArtist {
  name: string;
  match: string;
  url: string;
}

interface LastfmResponse {
  similarartists?: {
    artist: LastfmSimilarArtist[];
  };
  error?: number;
  message?: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.LASTFM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Last.fm API key not configured" },
      { status: 500 }
    );
  }

  try {
    const body: SimilarArtistRequest = await request.json();
    const { artists } = body;

    if (!artists || artists.length === 0) {
      return NextResponse.json(
        { error: "No artists provided" },
        { status: 400 }
      );
    }

    // Fetch similar artists for each input artist (limit to 5 to avoid rate limits)
    const artistsToQuery = artists.slice(0, 5);
    const allSimilar: Array<{
      name: string;
      match: number;
      sourceArtist: string;
    }> = [];

    // Process sequentially to respect rate limits (5 req/sec)
    for (const artist of artistsToQuery) {
      try {
        const url = new URL(LASTFM_API_URL);
        url.searchParams.set("method", "artist.getsimilar");
        url.searchParams.set("artist", artist);
        url.searchParams.set("api_key", apiKey);
        url.searchParams.set("format", "json");
        url.searchParams.set("limit", "10");

        const response = await fetch(url.toString());
        const data: LastfmResponse = await response.json();

        if (data.similarartists?.artist) {
          const similar = data.similarartists.artist.map((a) => ({
            name: a.name,
            match: parseFloat(a.match),
            sourceArtist: artist,
          }));
          allSimilar.push(...similar);
        }

        // Small delay to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`Failed to get similar artists for ${artist}:`, err);
        // Continue with other artists
      }
    }

    // Deduplicate by artist name, keeping highest match score
    const uniqueArtists = new Map<
      string,
      { name: string; match: number; sourceArtist: string }
    >();

    for (const artist of allSimilar) {
      const existing = uniqueArtists.get(artist.name.toLowerCase());
      if (!existing || existing.match < artist.match) {
        uniqueArtists.set(artist.name.toLowerCase(), artist);
      }
    }

    // Sort by match score and return
    const similarArtists = Array.from(uniqueArtists.values())
      .sort((a, b) => b.match - a.match)
      .slice(0, 20);

    return NextResponse.json({ similarArtists });
  } catch (error) {
    console.error("Last.fm API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch similar artists" },
      { status: 500 }
    );
  }
}
