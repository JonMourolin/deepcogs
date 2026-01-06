import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createDiscogsClient, createSimpleDiscogsClient } from "@/lib/discogs";

export async function GET(request: NextRequest) {
  const consumerKey = process.env.DISCOGS_CONSUMER_KEY;
  const consumerSecret = process.env.DISCOGS_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    return NextResponse.json(
      { error: "Discogs credentials not configured" },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  try {
    // Check if we have auth tokens (for private collections)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("discogs_access_token")?.value;
    const accessTokenSecret = cookieStore.get("discogs_access_token_secret")?.value;

    let releases;
    let total;

    if (accessToken && accessTokenSecret) {
      // Use authenticated client
      const client = createDiscogsClient(
        consumerKey,
        consumerSecret,
        accessToken,
        accessTokenSecret
      );

      // Fetch first page to get total count
      const firstPage = await client.getCollection(username, 0, 1, 100);
      total = firstPage.pagination.items;

      // For now, fetch up to 500 releases (5 pages)
      // Full collection fetch can be done progressively on client
      const pagesToFetch = Math.min(Math.ceil(total / 100), 5);
      releases = [...firstPage.releases];

      for (let page = 2; page <= pagesToFetch; page++) {
        const pageData = await client.getCollection(username, 0, page, 100);
        releases.push(...pageData.releases);
        // Small delay to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } else {
      // Use simple client for public collections
      const client = createSimpleDiscogsClient(consumerKey, consumerSecret);

      const firstPage = await client.getPublicCollection(username, 0, 1, 100);
      total = firstPage.pagination.items;

      const pagesToFetch = Math.min(Math.ceil(total / 100), 5);
      releases = [...firstPage.releases];

      for (let page = 2; page <= pagesToFetch; page++) {
        const pageData = await client.getPublicCollection(username, 0, page, 100);
        releases.push(...pageData.releases);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return NextResponse.json({
      releases,
      total,
      fetched: releases.length,
    });
  } catch (error) {
    console.error("Collection fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 }
    );
  }
}
