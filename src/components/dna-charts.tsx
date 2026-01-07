"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DiscogsRelease } from "@/lib/discogs";

interface DNAChartsProps {
  releases: DiscogsRelease[];
}

// Warm vinyl-inspired color palette
const COLORS = [
  "oklch(0.72 0.18 45)",  // Bright orange
  "oklch(0.65 0.14 180)", // Teal
  "oklch(0.80 0.16 85)",  // Gold
  "oklch(0.60 0.18 15)",  // Coral red
  "oklch(0.68 0.12 250)", // Periwinkle
  "oklch(0.55 0.15 320)", // Purple
  "oklch(0.70 0.12 140)", // Green
  "oklch(0.75 0.10 30)",  // Warm tan
];

// Keywords for oddities detection
const ODDITY_PATTERNS = {
  testPressing: /test\s*press/i,
  promo: /promo|white\s*label/i,
  limited: /limited|numbered/i,
};

// Keywords for repress detection
const REPRESS_PATTERN = /reissue|re-issue|remaster|repress|re-press|2nd\s*press|second\s*press|180\s*g/i;

function analyzeCollection(releases: DiscogsRelease[]) {
  const genres: Record<string, number> = {};
  const styles: Record<string, number> = {};
  const decades: Record<string, number> = {};
  const labels: Record<string, number> = {};
  const formats: Record<string, number> = {};
  const countries: Record<string, number> = {};
  const years: Record<number, number> = {};

  // Oddities counters
  let testPressings = 0;
  let promos = 0;
  let limited = 0;
  let represses = 0;

  releases.forEach((release) => {
    const info = release.basic_information;

    // Check format descriptions for oddities
    const formatDescriptions = info.formats
      ?.flatMap((f) => [f.name, ...(f.descriptions || [])])
      .join(" ") || "";

    if (ODDITY_PATTERNS.testPressing.test(formatDescriptions)) testPressings++;
    if (ODDITY_PATTERNS.promo.test(formatDescriptions)) promos++;
    if (ODDITY_PATTERNS.limited.test(formatDescriptions)) limited++;
    if (REPRESS_PATTERN.test(formatDescriptions)) represses++;

    // Genres
    info.genres?.forEach((genre) => {
      genres[genre] = (genres[genre] || 0) + 1;
    });

    // Styles
    info.styles?.forEach((style) => {
      styles[style] = (styles[style] || 0) + 1;
    });

    // Decade
    if (info.year && info.year > 1900) {
      const decade = Math.floor(info.year / 10) * 10;
      const decadeLabel = `${decade}s`;
      decades[decadeLabel] = (decades[decadeLabel] || 0) + 1;
      years[info.year] = (years[info.year] || 0) + 1;
    }

    // Labels
    info.labels?.forEach((label) => {
      if (label.name && label.name !== "Not On Label") {
        labels[label.name] = (labels[label.name] || 0) + 1;
      }
    });

    // Formats
    info.formats?.forEach((format) => {
      formats[format.name] = (formats[format.name] || 0) + 1;
    });
  });

  // Sort and limit results
  const sortByCount = (obj: Record<string, number>, limit = 10) =>
    Object.entries(obj)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([name, value]) => ({ name, value }));

  const sortDecades = (obj: Record<string, number>) =>
    Object.entries(obj)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => ({ name, value }));

  return {
    genres: sortByCount(genres, 8),
    styles: sortByCount(styles, 10),
    decades: sortDecades(decades),
    labels: sortByCount(labels, 10),
    formats: sortByCount(formats, 5),
    totalReleases: releases.length,
    uniqueGenres: Object.keys(genres).length,
    uniqueLabels: Object.keys(labels).length,
    yearRange: {
      min: Math.min(...Object.keys(years).map(Number).filter(y => y > 1900)),
      max: Math.max(...Object.keys(years).map(Number)),
    },
    oddities: { testPressings, promos, limited },
    represses,
  };
}

export function DNACharts({ releases }: DNAChartsProps) {
  const analysis = useMemo(() => analyzeCollection(releases), [releases]);

  if (releases.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No releases found in your collection to analyze.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">
              {analysis.totalReleases}
            </div>
            <p className="text-sm text-muted-foreground">Total Releases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">
              {analysis.uniqueGenres}
            </div>
            <p className="text-sm text-muted-foreground">Genres</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">
              {analysis.uniqueLabels}
            </div>
            <p className="text-sm text-muted-foreground">Labels</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">
              {analysis.yearRange.min}-{analysis.yearRange.max}
            </div>
            <p className="text-sm text-muted-foreground">Year Range</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Genre Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Genre DNA</CardTitle>
            <CardDescription>
              Your collection&apos;s genre breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analysis.genres}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {analysis.genres.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.16 0.015 30)",
                      border: "1px solid oklch(0.25 0.015 30)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Decade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Era Distribution</CardTitle>
            <CardDescription>When your music was released</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.decades} layout="vertical">
                  <XAxis type="number" stroke="oklch(0.6 0.02 85)" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="oklch(0.6 0.02 85)"
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.16 0.015 30)",
                      border: "1px solid oklch(0.25 0.015 30)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="oklch(0.75 0.15 55)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Labels */}
        <Card>
          <CardHeader>
            <CardTitle>Top Labels</CardTitle>
            <CardDescription>Your most collected labels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.labels.slice(0, 8).map((label, index) => (
                <div key={label.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium truncate max-w-[200px]">
                      {label.name}
                    </span>
                    <span className="text-muted-foreground">
                      {label.value} releases
                    </span>
                  </div>
                  <Progress
                    value={(label.value / analysis.labels[0].value) * 100}
                    className="h-2"
                    style={
                      {
                        "--progress-foreground": COLORS[index % COLORS.length],
                      } as React.CSSProperties
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Oddities & Pressings */}
        <Card>
          <CardHeader>
            <CardTitle>Oddities & Pressings</CardTitle>
            <CardDescription>
              Rare formats and pressing breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              <div className="text-center p-3 rounded-lg bg-purple-500/10">
                <p className="text-2xl font-bold text-purple-500">
                  {analysis.oddities.testPressings}
                </p>
                <p className="text-xs text-muted-foreground">Test Pressings</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-500/10">
                <p className="text-2xl font-bold text-blue-500">
                  {analysis.oddities.promos}
                </p>
                <p className="text-xs text-muted-foreground">Promos</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-500/10">
                <p className="text-2xl font-bold text-amber-500">
                  {analysis.oddities.limited}
                </p>
                <p className="text-xs text-muted-foreground">Limited</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-500/10">
                <p className="text-2xl font-bold text-green-500">
                  {analysis.totalReleases - analysis.represses}
                </p>
                <p className="text-xs text-muted-foreground">Originals</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-500/10">
                <p className="text-2xl font-bold text-red-500">
                  {analysis.represses}
                </p>
                <p className="text-xs text-muted-foreground">Represses</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Top Styles */}
      <Card>
        <CardHeader>
          <CardTitle>Style Breakdown</CardTitle>
          <CardDescription>
            More specific sub-genres in your collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.styles.map((style, index) => (
              <div
                key={style.name}
                className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={{
                  background: `color-mix(in oklch, ${
                    COLORS[index % COLORS.length]
                  } 20%, transparent)`,
                  color: COLORS[index % COLORS.length],
                  border: `1px solid color-mix(in oklch, ${
                    COLORS[index % COLORS.length]
                  } 40%, transparent)`,
                }}
              >
                {style.name} ({style.value})
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
