import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAccessToken, createDiscogsClient } from "@/lib/discogs";

export async function GET(request: NextRequest) {
  const consumerKey = process.env.DISCOGS_CONSUMER_KEY;
  const consumerSecret = process.env.DISCOGS_CONSUMER_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!consumerKey || !consumerSecret) {
    return NextResponse.redirect(`${appUrl}/login?error=config`);
  }

  // Get OAuth parameters from URL
  const searchParams = request.nextUrl.searchParams;
  const oauthToken = searchParams.get("oauth_token");
  const oauthVerifier = searchParams.get("oauth_verifier");

  if (!oauthToken || !oauthVerifier) {
    return NextResponse.redirect(`${appUrl}/login?error=missing_params`);
  }

  // Get the stored token secret
  const cookieStore = await cookies();
  const tokenSecret = cookieStore.get("discogs_oauth_token_secret")?.value;

  if (!tokenSecret) {
    return NextResponse.redirect(`${appUrl}/login?error=expired`);
  }

  try {
    // Exchange for access token
    const accessTokens = await getAccessToken(
      consumerKey,
      consumerSecret,
      oauthToken,
      tokenSecret,
      oauthVerifier
    );

    // Get user identity
    const client = createDiscogsClient(
      consumerKey,
      consumerSecret,
      accessTokens.oauth_token,
      accessTokens.oauth_token_secret
    );
    const identity = await client.getIdentity();

    // Fetch full profile for avatar and collection count
    const profile = await client.getUser(identity.username);
    console.log("Profile response:", JSON.stringify(profile, null, 2));

    // Store access tokens in secure cookies
    cookieStore.set("discogs_access_token", accessTokens.oauth_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    cookieStore.set(
      "discogs_access_token_secret",
      accessTokens.oauth_token_secret,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      }
    );

    cookieStore.set("discogs_username", identity.username, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    // Store profile data for UX (avatar, collection count)
    const avatarUrl = profile.avatar_url || profile.avatar;
    if (avatarUrl) {
      cookieStore.set("discogs_avatar", avatarUrl, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    if (profile.num_collection !== undefined) {
      cookieStore.set("discogs_collection_count", String(profile.num_collection), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    // Clean up temporary cookie
    cookieStore.delete("discogs_oauth_token_secret");

    // Redirect to dashboard
    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(`${appUrl}/login?error=auth_failed`);
  }
}
