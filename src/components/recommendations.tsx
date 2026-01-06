"use client";

import { useEffect, useState } from "react";
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

interface RecommendationsProps {
  releases: DiscogsRelease[];
  isLoading: boolean;
}

interface Recommendation {
  genre: string;
  reason: string;
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
  }>;
}

interface RecommendationsData {
  recommendations: Recommendation[];
  gaps: string[];
}

function ReleaseCard({
  release,
}: {
  release: Recommendation["releases"][0];
}) {
  return (
    <a
      href={`https://www.discogs.com/master/${release.masterId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="flex gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-all hover:scale-[1.02]">
        {release.thumb ? (
          <img
            src={release.thumb}
            alt={release.title}
            className="w-14 h-14 rounded object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded bg-muted flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-muted-foreground"
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
          <p className="font-medium truncate group-hover:text-primary transition-colors">
            {release.title}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {release.artist} {release.year ? `• ${release.year}` : ""}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {release.community.have.toLocaleString()} have
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {release.community.want.toLocaleString()} want
            </span>
          </div>
        </div>
        <svg
          className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 self-center"
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
      </div>
    </a>
  );
}

export function Recommendations({ releases, isLoading }: RecommendationsProps) {
  const [recommendations, setRecommendations] =
    useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (releases.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Calculate genres from releases
      const genreCounts: Record<string, number> = {};
      const ownedMasterIds: number[] = [];

      releases.forEach((release) => {
        const info = release.basic_information;
        if (info.master_id) {
          ownedMasterIds.push(info.master_id);
        }
        info.genres?.forEach((genre) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      });

      const genres = Object.entries(genreCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genres, ownedMasterIds }),
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
      <Card>
        <CardHeader>
          <CardTitle>Smart Recommendations</CardTitle>
          <CardDescription>Loading your collection first...</CardDescription>
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
      <Card>
        <CardHeader>
          <CardTitle>Smart Recommendations</CardTitle>
          <CardDescription>
            Add some records to your Discogs collection to get personalized
            recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
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
          <p className="text-muted-foreground">No collection data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Smart Recommendations</CardTitle>
              <CardDescription>
                Based on your collection DNA, here are releases you might enjoy
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRecommendations}
              disabled={loading}
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
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="py-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && !recommendations && (
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
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
          {/* Gaps indicator */}
          {recommendations.gaps.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Genres to explore:
              </span>
              {recommendations.gaps.map((gap) => (
                <Badge key={gap} variant="secondary">
                  {gap}
                </Badge>
              ))}
            </div>
          )}

          {/* Recommendation cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {recommendations.recommendations.map((rec) => (
              <Card key={rec.genre}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {rec.genre}
                    {recommendations.gaps.includes(rec.genre) && (
                      <Badge
                        variant="outline"
                        className="text-xs font-normal"
                      >
                        New territory
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{rec.reason}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rec.releases.map((release) => (
                      <ReleaseCard key={release.id} release={release} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {recommendations && recommendations.recommendations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No recommendations available at the moment. Try refreshing!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
