import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createDiscogsClient } from "@/lib/discogs";

// Major genres to consider for recommendations
const MAJOR_GENRES = [
  "Electronic",
  "Rock",
  "Jazz",
  "Hip Hop",
  "Classical",
  "Folk, World, & Country",
  "Funk / Soul",
  "Pop",
  "Reggae",
  "Blues",
  "Latin",
  "Stage & Screen",
];

interface RecommendationRequest {
  genres: { name: string; count: number }[];
  ownedMasterIds: number[];
}

export async function POST(request: NextRequest) {
  const consumerKey = process.env.DISCOGS_CONSUMER_KEY;
  const consumerSecret = process.env.DISCOGS_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    return NextResponse.json(
      { error: "Discogs credentials not configured" },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("discogs_access_token")?.value;
  const accessTokenSecret = cookieStore.get("discogs_access_token_secret")?.value;

  if (!accessToken || !accessTokenSecret) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const body: RecommendationRequest = await request.json();
    const { genres, ownedMasterIds } = body;

    // Calculate genre gaps - find genres user has less of
    const totalReleases = genres.reduce((sum, g) => sum + g.count, 0);
    const genrePercentages = genres.map((g) => ({
      ...g,
      percentage: (g.count / totalReleases) * 100,
    }));

    // Find underrepresented major genres (less than 10% of collection)
    const userGenreNames = new Set(genres.map((g) => g.name));
    const gaps = MAJOR_GENRES.filter((genre) => {
      const userGenre = genrePercentages.find((g) => g.name === genre);
      return !userGenre || userGenre.percentage < 10;
    }).slice(0, 3); // Top 3 gaps

    // Also suggest more of their top genres
    const topGenres = genrePercentages
      .filter((g) => MAJOR_GENRES.includes(g.name))
      .slice(0, 2)
      .map((g) => g.name);

    const genresToSearch = [...new Set([...gaps, ...topGenres])].slice(0, 4);

    // Search Discogs for each genre
    const client = createDiscogsClient(
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret
    );

    const ownedSet = new Set(ownedMasterIds);
    const recommendations: {
      genre: string;
      reason: string;
      releases: Array<{
        id: number;
        masterId: number;
        title: string;
        artist: string;
        year: number;
        thumb: string;
        genre: string[];
        style: string[];
        community: { have: number; want: number };
      }>;
    }[] = [];

    // Run searches in parallel for faster response
    const searchPromises = genresToSearch.map(async (genre) => {
      const isGap = gaps.includes(genre);
      const reason = isGap
        ? `Expand your horizons - you have few ${genre} releases`
        : `More of what you love - ${genre}`;

      try {
        // Search for popular releases in this genre
        const searchResult = await client.search(genre, "master");
        const results = (searchResult as { results?: Array<{
          id: number;
          master_id?: number;
          title: string;
          year?: string;
          thumb?: string;
          genre?: string[];
          style?: string[];
          community?: { have: number; want: number };
        }> }).results || [];

        // Filter and format results
        const filtered = results
          .filter((r) => {
            const masterId = r.master_id || r.id;
            return masterId && !ownedSet.has(masterId);
          })
          .slice(0, 8)
          .map((r) => {
            const [artist, ...titleParts] = (r.title || "").split(" - ");
            return {
              id: r.id,
              masterId: r.master_id || r.id,
              title: titleParts.join(" - ") || r.title || "Unknown",
              artist: artist || "Unknown Artist",
              year: parseInt(r.year || "0") || 0,
              thumb: r.thumb || "",
              genre: r.genre || [],
              style: r.style || [],
              community: r.community || { have: 0, want: 0 },
            };
          });

        if (filtered.length > 0) {
          return {
            genre,
            reason,
            releases: filtered,
          };
        }
        return null;
      } catch (err) {
        console.error(`Search failed for genre ${genre}:`, err);
        return null;
      }
    });

    const results = await Promise.all(searchPromises);
    recommendations.push(...results.filter((r): r is NonNullable<typeof r> => r !== null));

    return NextResponse.json({
      recommendations,
      analyzedGenres: genresToSearch,
      gaps,
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
