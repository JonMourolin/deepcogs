import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cookieStore = await cookies();

  // Clear all auth cookies
  cookieStore.delete("discogs_access_token");
  cookieStore.delete("discogs_access_token_secret");
  cookieStore.delete("discogs_username");

  return NextResponse.redirect(`${appUrl}/`);
}

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cookieStore = await cookies();

  // Clear all auth cookies
  cookieStore.delete("discogs_access_token");
  cookieStore.delete("discogs_access_token_secret");
  cookieStore.delete("discogs_username");

  return NextResponse.redirect(`${appUrl}/`);
}
