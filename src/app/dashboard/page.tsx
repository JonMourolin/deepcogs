import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const username = cookieStore.get("discogs_username")?.value;
  const accessToken = cookieStore.get("discogs_access_token")?.value;
  const avatarUrl = cookieStore.get("discogs_avatar")?.value;
  const collectionCount = cookieStore.get("discogs_collection_count")?.value;

  // Redirect to login if not authenticated
  if (!username || !accessToken) {
    redirect("/login");
  }

  return (
    <DashboardClient
      username={username}
      avatarUrl={avatarUrl}
      expectedTotal={collectionCount ? parseInt(collectionCount, 10) : undefined}
    />
  );
}
