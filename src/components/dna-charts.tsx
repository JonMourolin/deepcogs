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
} from "recharts";
import type { DiscogsRelease } from "@/lib/discogs";

interface DNAChartsProps {
  releases: DiscogsRelease[];
}

// Light theme color palette
const COLORS = [
  "#E67E22", // Orange
  "#3498DB", // Blue
  "#2ECC71", // Green
  "#E74C3C", // Red
  "#9B59B6", // Purple
  "#1ABC9C", // Teal
  "#F39C12", // Yellow
  "#34495E", // Dark gray
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
  const years: Record<number, number> = {};

  let testPressings = 0;
  let promos = 0;
  let limited = 0;
  let represses = 0;

  releases.forEach((release) => {
    const info = release.basic_information;

    const formatDescriptions = info.formats
      ?.flatMap((f) => [f.name, ...(f.descriptions || [])])
      .join(" ") || "";

    if (ODDITY_PATTERNS.testPressing.test(formatDescriptions)) testPressings++;
    if (ODDITY_PATTERNS.promo.test(formatDescriptions)) promos++;
    if (ODDITY_PATTERNS.limited.test(formatDescriptions)) limited++;
    if (REPRESS_PATTERN.test(formatDescriptions)) represses++;

    info.genres?.forEach((genre) => {
      genres[genre] = (genres[genre] || 0) + 1;
    });

    info.styles?.forEach((style) => {
      styles[style] = (styles[style] || 0) + 1;
    });

    if (info.year && info.year > 1900) {
      const decade = Math.floor(info.year / 10) * 10;
      const decadeLabel = `${decade}s`;
      decades[decadeLabel] = (decades[decadeLabel] || 0) + 1;
      years[info.year] = (years[info.year] || 0) + 1;
    }

    info.labels?.forEach((label) => {
      if (label.name && label.name !== "Not On Label") {
        labels[label.name] = (labels[label.name] || 0) + 1;
      }
    });

    info.formats?.forEach((format) => {
      formats[format.name] = (formats[format.name] || 0) + 1;
    });
  });

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
      <Card className="bg-white border-gray-200">
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">
            No releases found in your collection to analyze.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Genre & Era Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Genre Distribution */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Genre DNA</CardTitle>
            <CardDescription className="text-gray-500">
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
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Decade Distribution */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Era Distribution</CardTitle>
            <CardDescription className="text-gray-500">When your music was released</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.decades} layout="vertical">
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#9ca3af"
                    width={60}
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#E67E22"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Style Breakdown - moved here after Genre & Era */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Style Breakdown</CardTitle>
          <CardDescription className="text-gray-500">
            More specific sub-genres in your collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.styles.map((style, index) => (
              <span
                key={style.name}
                className="px-3 py-1.5 rounded-full text-sm font-medium border"
                style={{
                  backgroundColor: `${COLORS[index % COLORS.length]}15`,
                  color: COLORS[index % COLORS.length],
                  borderColor: `${COLORS[index % COLORS.length]}30`,
                }}
              >
                {style.name} ({style.value})
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Labels & Oddities */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Labels */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Top Labels</CardTitle>
            <CardDescription className="text-gray-500">Your most collected labels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.labels.slice(0, 8).map((label, index) => (
                <div key={label.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900 truncate max-w-[200px]">
                      {label.name}
                    </span>
                    <span className="text-gray-500">
                      {label.value} releases
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(label.value / analysis.labels[0].value) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Oddities & Pressings */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Oddities & Pressings</CardTitle>
            <CardDescription className="text-gray-500">
              Rare formats and pressing breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-100">
                <p className="text-2xl font-bold text-purple-600">
                  {analysis.oddities.testPressings}
                </p>
                <p className="text-xs text-gray-500">Test Pressings</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-2xl font-bold text-blue-600">
                  {analysis.oddities.promos}
                </p>
                <p className="text-xs text-gray-500">Promos</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-2xl font-bold text-amber-600">
                  {analysis.oddities.limited}
                </p>
                <p className="text-xs text-gray-500">Limited</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 border border-green-100">
                <p className="text-2xl font-bold text-green-600">
                  {analysis.totalReleases - analysis.represses}
                </p>
                <p className="text-xs text-gray-500">Originals</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-2xl font-bold text-red-600">
                  {analysis.represses}
                </p>
                <p className="text-xs text-gray-500">Represses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
