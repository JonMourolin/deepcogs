"use client";

import { useMemo, useState } from "react";
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

  // Age bonus: older releases are often rarer
  const currentYear = new Date().getFullYear();
  const releaseYear = info.year;
  if (releaseYear && releaseYear > 0) {
    const age = currentYear - releaseYear;
    if (age >= 50) {
      indicators.push({ type: "age", label: "50+ years", score: 25, color: "bg-amber-700" });
      score += 25;
    } else if (age >= 40) {
      indicators.push({ type: "age", label: "40+ years", score: 20, color: "bg-amber-600" });
      score += 20;
    } else if (age >= 30) {
      indicators.push({ type: "age", label: "30+ years", score: 15, color: "bg-amber-500" });
      score += 15;
    } else if (age >= 20) {
      indicators.push({ type: "age", label: "20+ years", score: 10, color: "bg-amber-400" });
      score += 10;
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

function ReleaseCard({ scored }: { scored: ScoredRelease }) {
  const { release, score, indicators } = scored;
  const info = release.basic_information;
  const artist = info.artists?.[0]?.name || "Unknown Artist";

  return (
    <a
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
            className="w-16 h-16 rounded object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
            <svg
              className="w-8 h-8 text-muted-foreground"
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
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium truncate group-hover:text-primary transition-colors">
                {info.title}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {artist} {info.year ? `• ${info.year}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs font-bold px-2 py-1 rounded bg-primary/20 text-primary">
                {score}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {indicators.slice(0, 4).map((indicator, i) => (
              <span
                key={i}
                className={`text-xs px-1.5 py-0.5 rounded text-white ${indicator.color}`}
              >
                {indicator.label}
              </span>
            ))}
            {indicators.length > 4 && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                +{indicators.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}

export function DeepCuts({ releases, isLoading }: DeepCutsProps) {
  const [showCount, setShowCount] = useState(10);

  const scoredReleases = useMemo(() => {
    return releases
      .map(calculateRarityScore)
      .filter((r) => r.score > 0) // Only show releases with positive rarity indicators
      .sort((a, b) => b.score - a.score);
  }, [releases]);

  const displayedReleases = scoredReleases.slice(0, showCount);
  const hasMore = scoredReleases.length > showCount;

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
    const vintage = scoredReleases.filter((r) =>
      r.indicators.some((i) => i.type === "age")
    ).length;

    return { testPressings, promos, limited, vintage };
  }, [scoredReleases]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deep Cuts</CardTitle>
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
          <CardTitle>Deep Cuts</CardTitle>
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
            Deep Cuts
          </CardTitle>
          <CardDescription>
            Rare and collectible releases in your collection, scored by format rarity and age
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <div className="text-center p-3 rounded-lg bg-amber-700/10">
              <p className="text-2xl font-bold text-amber-700">{stats.vintage}</p>
              <p className="text-xs text-muted-foreground">Vintage (20+ yrs)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Release list */}
      {scoredReleases.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Your Rarest Records
              <Badge variant="secondary" className="ml-2">
                {scoredReleases.length} found
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayedReleases.map((scored) => (
                <ReleaseCard key={scored.release.instance_id} scored={scored} />
              ))}
            </div>
            {hasMore && (
              <button
                onClick={() => setShowCount((prev) => prev + 10)}
                className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Show more ({scoredReleases.length - showCount} remaining)
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No rare releases detected. Your collection might be mostly standard pressings!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
