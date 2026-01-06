import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRequestToken, getAuthorizeUrl } from "@/lib/discogs";

export async function GET() {
  const consumerKey = process.env.DISCOGS_CONSUMER_KEY;
  const consumerSecret = process.env.DISCOGS_CONSUMER_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!consumerKey || !consumerSecret) {
    return NextResponse.json(
      { error: "Discogs credentials not configured" },
      { status: 500 }
    );
  }

  // Check if user is already authenticated - skip OAuth flow
  const cookieStore = await cookies();
  const existingToken = cookieStore.get("discogs_access_token")?.value;
  const existingUsername = cookieStore.get("discogs_username")?.value;

  if (existingToken && existingUsername) {
    // Already authenticated, redirect to dashboard
    return NextResponse.redirect(`${appUrl}/dashboard`);
  }

  try {
    // Get request token
    const callbackUrl = `${appUrl}/api/auth/discogs/callback`;
    const tokens = await getRequestToken(
      consumerKey,
      consumerSecret,
      callbackUrl
    );

    // Store the token secret in a cookie for the callback
    const cookieStore = await cookies();
    cookieStore.set("discogs_oauth_token_secret", tokens.oauth_token_secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    // Redirect to Discogs authorization page
    const authorizeUrl = getAuthorizeUrl(tokens.oauth_token);
    return NextResponse.redirect(authorizeUrl);
  } catch (error) {
    console.error("OAuth error:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth flow" },
      { status: 500 }
    );
  }
}
