"use client";

import { useMemo } from "react";
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

interface DeepCutsProps {
  releases: DiscogsRelease[];
  isLoading: boolean;
}

interface RarityIndicator {
  type: string;
  label: string;
  score: number;
  color: string;
}

interface ScoredRelease {
  release: DiscogsRelease;
  score: number;
  indicators: RarityIndicator[];
}

// Keywords that indicate rarity in format descriptions
const RARITY_KEYWORDS: { pattern: RegExp; label: string; score: number; color: string }[] = [
  { pattern: /test\s*press/i, label: "Test Pressing", score: 50, color: "bg-purple-500" },
  { pattern: /promo/i, label: "Promo", score: 30, color: "bg-blue-500" },
  { pattern: /white\s*label/i, label: "White Label", score: 35, color: "bg-gray-400" },
  { pattern: /limited/i, label: "Limited Edition", score: 25, color: "bg-amber-500" },
  { pattern: /numbered/i, label: "Numbered", score: 20, color: "bg-amber-600" },
  { pattern: /first\s*press/i, label: "First Pressing", score: 20, color: "bg-green-500" },
  { pattern: /original/i, label: "Original", score: 15, color: "bg-green-600" },
  { pattern: /remaster/i, label: "Remaster", score: -5, color: "bg-gray-500" },
  { pattern: /reissue/i, label: "Reissue", score: -10, color: "bg-gray-500" },
  { pattern: /180\s*g/i, label: "180g", score: 5, color: "bg-slate-500" },
  { pattern: /colored|colour|splatter|marble/i, label: "Colored Vinyl", score: 10, color: "bg-pink-500" },
  { pattern: /picture\s*disc/i, label: "Picture Disc", score: 15, color: "bg-indigo-500" },
  { pattern: /gatefold/i, label: "Gatefold", score: 5, color: "bg-slate-600" },
  { pattern: /box\s*set/i, label: "Box Set", score: 15, color: "bg-rose-500" },
  { pattern: /mono/i, label: "Mono", score: 20, color: "bg-teal-500" },
  { pattern: /stereo/i, label: "Stereo", score: 5, color: "bg-teal-400" },
  { pattern: /DJ\s*copy/i, label: "DJ Copy", score: 25, color: "bg-cyan-500" },
  { pattern: /acetate/i, label: "Acetate", score: 60, color: "bg-red-500" },
  { pattern: /bootleg/i, label: "Bootleg", score: 20, color: "bg-red-400" },
];

function calculateRarityScore(release: DiscogsRelease): ScoredRelease {
  const info = release.basic_information;
  const indicators: RarityIndicator[] = [];
  let score = 0;

  // Check format descriptions
  const formatDescriptions = info.formats
    ?.flatMap((f) => [f.name, ...(f.descriptions || [])])
    .join(" ") || "";

  for (const keyword of RARITY_KEYWORDS) {
    if (keyword.pattern.test(formatDescriptions)) {
      indicators.push({
        type: "format",
        label: keyword.label,
        score: keyword.score,
        color: keyword.color,
      });
      score += keyword.score;
    }
  }

  // Check if it's a 7" single (often collectible)
  if (info.formats?.some((f) => f.name === "Vinyl" && f.descriptions?.includes('7"'))) {
    indicators.push({ type: "format", label: '7" Single', score: 5, color: "bg-blue-400" });
    score += 5;
  }

  // Check if it's a 12" single (DJ collectible)
  if (info.formats?.some((f) => f.name === "Vinyl" && f.descriptions?.includes('12"') && f.descriptions?.includes("Single"))) {
    indicators.push({ type: "format", label: '12" Single', score: 8, color: "bg-blue-500" });
    score += 8;
  }

  return { release, score, indicators };
}

export function DeepCuts({ releases, isLoading }: DeepCutsProps) {
  const scoredReleases = useMemo(() => {
    return releases
      .map(calculateRarityScore)
      .filter((r) => r.score > 0) // Only show releases with positive rarity indicators
      .sort((a, b) => b.score - a.score);
  }, [releases]);

  // Stats
  const stats = useMemo(() => {
    const testPressings = scoredReleases.filter((r) =>
      r.indicators.some((i) => i.label === "Test Pressing")
    ).length;
    const promos = scoredReleases.filter((r) =>
      r.indicators.some((i) => i.label === "Promo" || i.label === "White Label")
    ).length;
    const limited = scoredReleases.filter((r) =>
      r.indicators.some((i) => i.label.includes("Limited") || i.label === "Numbered")
    ).length;

    return { testPressings, promos, limited };
  }, [scoredReleases]);

  // 5-star rated releases
  const fiveStarReleases = useMemo(() => {
    return releases
      .filter((r) => r.rating === 5)
      .sort((a, b) => (b.basic_information.year || 0) - (a.basic_information.year || 0));
  }, [releases]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Oddities</CardTitle>
          <CardDescription>Loading your collection...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
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
          <CardTitle>Oddities</CardTitle>
          <CardDescription>
            Add some records to discover your hidden gems
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
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
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            Oddities
          </CardTitle>
          <CardDescription>
            Test pressings, promos, and limited editions in your collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-purple-500/10">
              <p className="text-2xl font-bold text-purple-500">{stats.testPressings}</p>
              <p className="text-xs text-muted-foreground">Test Pressings</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-500/10">
              <p className="text-2xl font-bold text-blue-500">{stats.promos}</p>
              <p className="text-xs text-muted-foreground">Promos</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-500/10">
              <p className="text-2xl font-bold text-amber-500">{stats.limited}</p>
              <p className="text-xs text-muted-foreground">Limited Editions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5 Stars Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <svg
              className="w-5 h-5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Your 5 Stars Records
            {fiveStarReleases.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {fiveStarReleases.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Records you've rated 5 stars in your Discogs collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fiveStarReleases.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No 5-star rated records yet. Rate your favorites on Discogs!
            </p>
          ) : (
            <div className="space-y-3">
              {fiveStarReleases.map((release) => {
                const info = release.basic_information;
                return (
                  <a
                    key={release.instance_id}
                    href={`https://www.discogs.com/release/${info.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <div className="flex gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-all hover:scale-[1.02]">
                      {info.thumb ? (
                        <img
                          src={info.thumb}
                          alt={info.title}
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
                          {info.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {info.artists?.[0]?.name || "Unknown Artist"} {info.year ? `• ${info.year}` : ""}
                        </p>
                        <div className="flex gap-0.5 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className="w-3 h-3 text-yellow-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
