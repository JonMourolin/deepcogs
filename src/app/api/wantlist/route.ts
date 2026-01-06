import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createDiscogsClient } from "@/lib/discogs";

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
  const username = cookieStore.get("discogs_username")?.value;

  if (!accessToken || !accessTokenSecret || !username) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const { releaseId } = await request.json();

    if (!releaseId || typeof releaseId !== "number") {
      return NextResponse.json(
        { error: "Invalid release ID" },
        { status: 400 }
      );
    }

    const client = createDiscogsClient(
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret
    );

    const result = await client.addToWantlist(username, releaseId);

    return NextResponse.json({
      success: true,
      releaseId,
      result,
    });
  } catch (error) {
    console.error("Add to wantlist error:", error);
    return NextResponse.json(
      { error: "Failed to add to wantlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
  const username = cookieStore.get("discogs_username")?.value;

  if (!accessToken || !accessTokenSecret || !username) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const { releaseId } = await request.json();

    if (!releaseId || typeof releaseId !== "number") {
      return NextResponse.json(
        { error: "Invalid release ID" },
        { status: 400 }
      );
    }

    const client = createDiscogsClient(
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret
    );

    await client.removeFromWantlist(username, releaseId);

    return NextResponse.json({
      success: true,
      releaseId,
    });
  } catch (error) {
    console.error("Remove from wantlist error:", error);
    return NextResponse.json(
      { error: "Failed to remove from wantlist" },
      { status: 500 }
    );
  }
}
