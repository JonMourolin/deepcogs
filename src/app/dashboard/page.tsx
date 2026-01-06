import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const username = cookieStore.get("discogs_username")?.value;
  const accessToken = cookieStore.get("discogs_access_token")?.value;

  // Redirect to login if not authenticated
  if (!username || !accessToken) {
    redirect("/login");
  }

  return <DashboardClient username={username} />;
}
