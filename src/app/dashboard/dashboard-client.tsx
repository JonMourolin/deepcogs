"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DNACharts } from "@/components/dna-charts";
import { FriendCompare } from "@/components/friend-compare";
import { Recommendations } from "@/components/recommendations";
import { DNACard } from "@/components/dna-card";
import Link from "next/link";
import type { DiscogsRelease } from "@/lib/discogs";

interface DashboardClientProps {
  username: string;
}

interface CollectionData {
  releases: DiscogsRelease[];
  total: number;
}

type TabValue = "dna" | "compare" | "discover";

// Icons as components
const DNAIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
  </svg>
);

const CompareIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);

const DiscoverIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
  </svg>
);

const VinylIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
  </svg>
);

export function DashboardClient({ username }: DashboardClientProps) {
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>("dna");

  const fetchPage = useCallback(async (page: number, existingReleases: DiscogsRelease[] = []) => {
    const response = await fetch(`/api/collection?username=${username}&page=${page}`);
    if (!response.ok) {
      throw new Error("Failed to fetch collection");
    }
    const data = await response.json();
    return {
      releases: [...existingReleases, ...data.releases],
      total: data.total,
      hasMore: data.hasMore,
      page: data.page,
    };
  }, [username]);

  useEffect(() => {
    async function fetchCollection() {
      try {
        setLoading(true);
        let allReleases: DiscogsRelease[] = [];
        let currentPageNum = 1;
        let hasMore = true;
        let total = 0;

        while (hasMore) {
          const result = await fetchPage(currentPageNum, allReleases);
          allReleases = result.releases;
          total = result.total;
          hasMore = result.hasMore;
          currentPageNum = result.page + 1;
        }

        setCollection({ releases: allReleases, total });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load collection");
      } finally {
        setLoading(false);
      }
    }

    fetchCollection();
  }, [fetchPage]);

  // Calculate stats from collection
  const stats = collection ? calculateStats(collection.releases) : null;

  const navItems = [
    { id: "dna" as const, label: "DNA", icon: DNAIcon },
    { id: "compare" as const, label: "Compare", icon: CompareIcon },
    { id: "discover" as const, label: "Discover", icon: DiscoverIcon },
  ];

  return (
    <div className="min-h-screen flex bg-[#fafafa]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-semibold text-lg text-gray-900">DeepCogs</span>
          </Link>
        </div>

        {/* User */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-amber-100 text-amber-700 text-sm font-medium">
                {username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{username}</p>
              <p className="text-xs text-gray-500">
                {loading ? "Loading..." : `${collection?.total || 0} releases`}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-2">
            Navigation
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <item.icon />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-gray-100">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            asChild
          >
            <Link href="/api/auth/logout">
              <LogoutIcon />
              Sign out
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              {activeTab === "dna" && "Collection DNA"}
              {activeTab === "compare" && "Compare Collections"}
              {activeTab === "discover" && "Discover New Music"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === "dna" && "Analyze the patterns in your vinyl collection"}
              {activeTab === "compare" && "Find overlaps and trade opportunities with friends"}
              {activeTab === "discover" && "Get personalized recommendations based on your taste"}
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="py-4">
                <p className="text-red-700">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* DNA Tab */}
          {activeTab === "dna" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Releases"
                  value={loading ? "-" : String(collection?.total || 0)}
                  icon={<VinylIcon />}
                  loading={loading}
                />
                <StatCard
                  label="Top Genre"
                  value={loading ? "-" : stats?.topGenre || "N/A"}
                  sublabel={stats?.topGenrePercent ? `${stats.topGenrePercent}%` : undefined}
                  loading={loading}
                />
                <StatCard
                  label="Top Decade"
                  value={loading ? "-" : stats?.topDecade || "N/A"}
                  sublabel={stats?.topDecadePercent ? `${stats.topDecadePercent}%` : undefined}
                  loading={loading}
                />
                <StatCard
                  label="Top Label"
                  value={loading ? "-" : stats?.topLabel || "N/A"}
                  sublabel={stats?.topLabelCount ? `${stats.topLabelCount} releases` : undefined}
                  loading={loading}
                />
              </div>

              {/* Charts */}
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-white">
                      <CardHeader>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-48 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : collection ? (
                <>
                  <DNACharts releases={collection.releases} />
                  <div className="grid md:grid-cols-2 gap-6">
                    <DNACard
                      username={username}
                      releases={collection.releases}
                      isLoading={loading}
                    />
                  </div>
                </>
              ) : (
                <Card className="bg-white">
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">
                      No collection data available. Add some records on Discogs first!
                    </p>
                    <Button className="mt-4" asChild>
                      <a
                        href="https://www.discogs.com/user/collection"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Go to Discogs Collection
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Compare Tab */}
          {activeTab === "compare" && (
            <div className="space-y-6">
              <FriendCompare
                myUsername={username}
                myCollection={collection?.releases || []}
                isLoading={loading}
              />
            </div>
          )}

          {/* Discover Tab */}
          {activeTab === "discover" && (
            <div className="space-y-6">
              <Recommendations
                releases={collection?.releases || []}
                isLoading={loading}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Stat Card Component - Compact version
function StatCard({
  label,
  value,
  sublabel,
  icon,
  loading,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <Card className="bg-white">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-1.5 rounded-md bg-gray-100 text-gray-500 flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
            {loading ? (
              <Skeleton className="h-5 w-16 mt-0.5" />
            ) : (
              <div className="flex items-baseline gap-1.5">
                <p className="text-lg font-semibold text-gray-900 truncate">{value}</p>
                {sublabel && (
                  <span className="text-xs text-amber-600 flex-shrink-0">{sublabel}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to calculate stats
function calculateStats(releases: DiscogsRelease[]) {
  if (!releases.length) return null;

  // Genre stats
  const genreCounts: Record<string, number> = {};
  releases.forEach((r) => {
    r.basic_information.genres?.forEach((g) => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });
  const topGenreEntry = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0];
  const topGenre = topGenreEntry?.[0] || "N/A";
  const topGenrePercent = topGenreEntry
    ? Math.round((topGenreEntry[1] / releases.length) * 100)
    : 0;

  // Decade stats
  const decadeCounts: Record<string, number> = {};
  releases.forEach((r) => {
    const year = r.basic_information.year;
    if (year && year > 1900) {
      const decade = `${Math.floor(year / 10) * 10}s`;
      decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
    }
  });
  const topDecadeEntry = Object.entries(decadeCounts).sort((a, b) => b[1] - a[1])[0];
  const topDecade = topDecadeEntry?.[0] || "N/A";
  const topDecadePercent = topDecadeEntry
    ? Math.round((topDecadeEntry[1] / releases.length) * 100)
    : 0;

  // Label stats
  const labelCounts: Record<string, number> = {};
  releases.forEach((r) => {
    r.basic_information.labels?.forEach((l) => {
      labelCounts[l.name] = (labelCounts[l.name] || 0) + 1;
    });
  });
  const topLabelEntry = Object.entries(labelCounts).sort((a, b) => b[1] - a[1])[0];
  const topLabel = topLabelEntry?.[0] || "N/A";
  const topLabelCount = topLabelEntry?.[1] || 0;

  return {
    topGenre,
    topGenrePercent,
    topDecade,
    topDecadePercent,
    topLabel,
    topLabelCount,
  };
}
