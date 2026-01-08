"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { DiscogsRelease } from "@/lib/discogs";

type WantlistStatus = "idle" | "loading" | "added" | "error";

interface RecommendationsProps {
  releases: DiscogsRelease[];
  isLoading: boolean;
}

interface Recommendation {
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
}

interface RecommendationsData {
  recommendations: Recommendation[];
  analyzedStyles: string[];
  hasLastfm: boolean;
}

function ReleaseCard({
  release,
  wantlistStatus,
  onAddToWantlist,
}: {
  release: Recommendation["releases"][0];
  wantlistStatus: WantlistStatus;
  onAddToWantlist: (releaseId: number) => void;
}) {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all group border border-gray-100">
      <a
        href={`https://www.discogs.com/master/${release.masterId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-3 flex-1 min-w-0"
      >
        {release.thumb ? (
          <img
            src={release.thumb}
            alt={release.title}
            className="w-14 h-14 rounded object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900 truncate group-hover:text-amber-600 transition-colors">
            {release.title}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {release.artist} {release.year ? `• ${release.year}` : ""}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {release.similarTo ? (
              <span className="text-xs text-amber-600">
                Similar to {release.similarTo}
              </span>
            ) : (
              <>
                <span className="text-xs text-gray-500">
                  {release.community.have.toLocaleString()} have
                </span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">
                  {release.community.want.toLocaleString()} want
                </span>
              </>
            )}
          </div>
        </div>
      </a>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={(e) => {
            e.preventDefault();
            if (wantlistStatus === "idle") {
              onAddToWantlist(release.id);
            }
          }}
          disabled={wantlistStatus === "loading" || wantlistStatus === "added"}
          className={`p-2 rounded-md transition-all ${
            wantlistStatus === "added"
              ? "bg-green-100 text-green-600 cursor-default"
              : wantlistStatus === "loading"
              ? "bg-gray-100 text-gray-400 cursor-wait"
              : wantlistStatus === "error"
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-gray-100 text-gray-500 hover:bg-amber-100 hover:text-amber-600"
          }`}
          title={
            wantlistStatus === "added"
              ? "Added to wantlist"
              : wantlistStatus === "loading"
              ? "Adding..."
              : wantlistStatus === "error"
              ? "Failed - click to retry"
              : "Add to wantlist"
          }
        >
          {wantlistStatus === "loading" ? (
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : wantlistStatus === "added" ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          )}
        </button>
        <a
          href={`https://www.discogs.com/master/${release.masterId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-md bg-gray-100 text-gray-500 hover:bg-amber-100 hover:text-amber-600 transition-all"
          title="View on Discogs"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}

// Artist names to exclude (compilations, various artists)
const EXCLUDED_ARTISTS = new Set([
  "various",
  "va",
  "various artists",
  "v/a",
  "v.a.",
  "various artist",
]);

function isExcludedArtist(name: string): boolean {
  return EXCLUDED_ARTISTS.has(name.toLowerCase().trim());
}

// Extract styles with their top artists from releases
function analyzeCollection(releases: DiscogsRelease[]) {
  const styleCounts: Record<string, { count: number; artists: Record<string, number> }> = {};
  const ownedMasterIds: number[] = [];
  const ownedArtistNames: string[] = [];

  releases.forEach((release) => {
    const info = release.basic_information;

    if (info.master_id) {
      ownedMasterIds.push(info.master_id);
    }

    // Collect artist names (excluding various/VA)
    info.artists?.forEach((artist) => {
      if (artist.name && !isExcludedArtist(artist.name) && !ownedArtistNames.includes(artist.name)) {
        ownedArtistNames.push(artist.name);
      }
    });

    // Count styles and associate artists
    info.styles?.forEach((style) => {
      if (!styleCounts[style]) {
        styleCounts[style] = { count: 0, artists: {} };
      }
      styleCounts[style].count++;

      // Associate artists with this style (excluding various/VA)
      info.artists?.forEach((artist) => {
        if (artist.name && !isExcludedArtist(artist.name)) {
          styleCounts[style].artists[artist.name] =
            (styleCounts[style].artists[artist.name] || 0) + 1;
        }
      });
    });
  });

  // Convert to sorted array with top artists per style
  const styles = Object.entries(styleCounts)
    .map(([name, data]) => ({
      name,
      count: data.count,
      artists: Object.entries(data.artists)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([artistName]) => artistName),
    }))
    .sort((a, b) => b.count - a.count);

  return { styles, ownedMasterIds, ownedArtistNames };
}

export function Recommendations({ releases, isLoading }: RecommendationsProps) {
  const [recommendations, setRecommendations] =
    useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wantlistStatus, setWantlistStatus] = useState<Record<number, WantlistStatus>>({});

  const handleAddToWantlist = useCallback(async (releaseId: number) => {
    setWantlistStatus((prev) => ({ ...prev, [releaseId]: "loading" }));

    try {
      const response = await fetch("/api/wantlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ releaseId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to wantlist");
      }

      setWantlistStatus((prev) => ({ ...prev, [releaseId]: "added" }));
    } catch (err) {
      console.error("Failed to add to wantlist:", err);
      setWantlistStatus((prev) => ({ ...prev, [releaseId]: "error" }));
    }
  }, []);

  const fetchRecommendations = async () => {
    if (releases.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Analyze collection for styles and artists
      const { styles, ownedMasterIds, ownedArtistNames } = analyzeCollection(releases);

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ styles, ownedMasterIds, ownedArtistNames }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load recommendations"
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount if we have releases
  useEffect(() => {
    if (releases.length > 0 && !recommendations && !loading) {
      fetchRecommendations();
    }
  }, [releases]);

  if (isLoading) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Smart Recommendations</CardTitle>
          <CardDescription className="text-gray-500">Loading your collection first...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (releases.length === 0) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Smart Recommendations</CardTitle>
          <CardDescription className="text-gray-500">
            Add some records to your Discogs collection to get personalized
            recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <p className="text-gray-500">No collection data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">Smart Recommendations</CardTitle>
              <CardDescription className="text-gray-500">
                {recommendations?.hasLastfm
                  ? "Based on similar artists from Last.fm and your collection styles"
                  : "Based on your collection styles"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRecommendations}
              disabled={loading}
              className="border-gray-200 text-gray-700 hover:bg-gray-100"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && !recommendations && (
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white border-gray-200">
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {recommendations && recommendations.recommendations.length > 0 && (
        <>
          {/* Analyzed styles indicator */}
          {recommendations.analyzedStyles.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">
                Analyzing styles:
              </span>
              {recommendations.analyzedStyles.map((style) => (
                <Badge key={style} variant="secondary" className="bg-gray-100 text-gray-700">
                  {style}
                </Badge>
              ))}
              {recommendations.hasLastfm && (
                <Badge variant="outline" className="border-amber-200 text-amber-600">
                  + Last.fm
                </Badge>
              )}
            </div>
          )}

          {/* Recommendation cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {recommendations.recommendations.map((rec) => (
              <Card key={rec.style} className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    {rec.style}
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    {rec.reason}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rec.releases.map((release) => (
                      <ReleaseCard
                        key={release.id}
                        release={release}
                        wantlistStatus={wantlistStatus[release.id] || "idle"}
                        onAddToWantlist={handleAddToWantlist}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {recommendations && recommendations.recommendations.length === 0 && (
        <Card className="bg-white border-gray-200">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              No recommendations available at the moment. Try refreshing!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
