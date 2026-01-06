import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createDiscogsClient } from "@/lib/discogs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const releaseId = parseInt(id, 10);

  if (isNaN(releaseId)) {
    return NextResponse.json(
      { error: "Invalid release ID" },
      { status: 400 }
    );
  }

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
    const client = createDiscogsClient(
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret
    );

    const release = await client.getRelease(releaseId);

    // Return only the fields we need to minimize response size
    const releaseData = release as {
      id: number;
      country?: string;
      year?: number;
      notes?: string;
    };

    return NextResponse.json({
      id: releaseData.id,
      country: releaseData.country || null,
      year: releaseData.year || null,
    });
  } catch (error) {
    console.error("Release fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch release" },
      { status: 500 }
    );
  }
}
