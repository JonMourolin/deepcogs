import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createDiscogsClient } from "@/lib/discogs";

interface StyleData {
  name: string;
  count: number;
  artists: string[];
}

interface RecommendationRequest {
  styles: StyleData[];
  ownedMasterIds: number[];
  ownedArtistNames: string[];
}

interface SimilarArtist {
  name: string;
  match: number;
  sourceArtist: string;
}

export async function POST(request: NextRequest) {
  const consumerKey = process.env.DISCOGS_CONSUMER_KEY;
  const consumerSecret = process.env.DISCOGS_CONSUMER_SECRET;
  const lastfmApiKey = process.env.LASTFM_API_KEY;

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
    const { styles, ownedMasterIds, ownedArtistNames } = body;

    const ownedSet = new Set(ownedMasterIds);
    const ownedArtistsSet = new Set(ownedArtistNames.map((n) => n.toLowerCase()));

    // Get top styles (up to 6)
    const topStyles = styles.slice(0, 6);

    // Collect artists from top styles for Last.fm lookup
    const artistsForLastfm: string[] = [];
    topStyles.forEach((style) => {
      artistsForLastfm.push(...style.artists.slice(0, 2));
    });
    const uniqueArtists = [...new Set(artistsForLastfm)].slice(0, 6);

    // Fetch similar artists from Last.fm if API key is available
    let similarArtists: SimilarArtist[] = [];
    if (lastfmApiKey && uniqueArtists.length > 0) {
      try {
        const baseUrl = request.nextUrl.origin;
        const lastfmResponse = await fetch(`${baseUrl}/api/lastfm/similar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artists: uniqueArtists }),
        });

        if (lastfmResponse.ok) {
          const lastfmData = await lastfmResponse.json();
          similarArtists = lastfmData.similarArtists || [];
          // Filter out artists user already owns
          similarArtists = similarArtists.filter(
            (a) => !ownedArtistsSet.has(a.name.toLowerCase())
          );
        }
      } catch (err) {
        console.error("Last.fm fetch failed:", err);
        // Continue without Last.fm data
      }
    }

    const client = createDiscogsClient(
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret
    );

    const recommendations: {
      style: string;
      reason: string;
      basedOn: string[];
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
        similarTo?: string;
      }>;
    }[] = [];

    // Search for releases by similar artists (grouped by style)
    const styleArtistMap = new Map<string, SimilarArtist[]>();

    // Map similar artists back to styles
    for (const similar of similarArtists) {
      // Find which style this artist came from
      for (const style of topStyles) {
        if (style.artists.some((a) => a.toLowerCase() === similar.sourceArtist.toLowerCase())) {
          const existing = styleArtistMap.get(style.name) || [];
          existing.push(similar);
          styleArtistMap.set(style.name, existing);
          break;
        }
      }
    }

    // For each style, search for releases by similar artists
    for (const style of topStyles) {
      const styleArtists = styleArtistMap.get(style.name) || [];
      const basedOnArtists = style.artists.slice(0, 2);

      const reason = styleArtists.length > 0
        ? `Based on ${basedOnArtists.join(", ")} in your collection`
        : `More ${style.name} for you`;

      const releases: typeof recommendations[0]["releases"] = [];

      // Search similar artists on Discogs
      const artistsToSearch = styleArtists.slice(0, 3);

      for (const artist of artistsToSearch) {
        try {
          const searchResult = await client.search(
            `${artist.name}`,
            "master",
            { format: "Vinyl", sort: "want", sort_order: "desc" }
          );
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
            .slice(0, 3)
            .map((r) => {
              const [artistName, ...titleParts] = (r.title || "").split(" - ");
              return {
                id: r.id,
                masterId: r.master_id || r.id,
                title: titleParts.join(" - ") || r.title || "Unknown",
                artist: artistName || "Unknown Artist",
                year: parseInt(r.year || "0") || 0,
                thumb: r.thumb || "",
                genre: r.genre || [],
                style: r.style || [],
                community: r.community || { have: 0, want: 0 },
                similarTo: artist.sourceArtist,
              };
            });

          releases.push(...filtered);

          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (err) {
          console.error(`Search failed for artist ${artist.name}:`, err);
        }
      }

      // Deduplicate by masterId
      const uniqueReleases = Array.from(
        new Map(releases.map((r) => [r.masterId, r])).values()
      ).slice(0, 6);

      if (uniqueReleases.length > 0) {
        recommendations.push({
          style: style.name,
          reason,
          basedOn: basedOnArtists,
          releases: uniqueReleases,
        });
      }
    }

    return NextResponse.json({
      recommendations,
      analyzedStyles: topStyles.map((s) => s.name),
      hasLastfm: similarArtists.length > 0,
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
