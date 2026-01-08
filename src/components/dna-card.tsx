"use client";

import { useRef, useState, useMemo } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DiscogsRelease } from "@/lib/discogs";

interface DNACardProps {
  username: string;
  releases: DiscogsRelease[];
  isLoading: boolean;
}

interface DNAStats {
  totalReleases: number;
  topGenres: { name: string; count: number; percentage: number }[];
  topDecades: { decade: string; count: number; percentage: number }[];
  topLabels: { name: string; count: number }[];
  oldestYear: number;
  newestYear: number;
}

function calculateDNAStats(releases: DiscogsRelease[]): DNAStats {
  const genreCounts: Record<string, number> = {};
  const decadeCounts: Record<string, number> = {};
  const labelCounts: Record<string, number> = {};
  let oldestYear = Infinity;
  let newestYear = 0;

  releases.forEach((release) => {
    const info = release.basic_information;

    // Genres
    info.genres?.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    // Decades
    if (info.year && info.year > 0) {
      const decade = `${Math.floor(info.year / 10) * 10}s`;
      decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
      if (info.year < oldestYear) oldestYear = info.year;
      if (info.year > newestYear) newestYear = info.year;
    }

    // Labels
    info.labels?.forEach((label) => {
      if (label.name && label.name !== "Unknown") {
        labelCounts[label.name] = (labelCounts[label.name] || 0) + 1;
      }
    });
  });

  const total = releases.length;

  const topGenres = Object.entries(genreCounts)
    .map(([name, count]) => ({ name, count, percentage: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topDecades = Object.entries(decadeCounts)
    .map(([decade, count]) => ({ decade, count, percentage: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topLabels = Object.entries(labelCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalReleases: total,
    topGenres,
    topDecades,
    topLabels,
    oldestYear: oldestYear === Infinity ? 0 : oldestYear,
    newestYear,
  };
}

// Colors for genres
const GENRE_COLORS = [
  "bg-amber-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-rose-500",
  "bg-pink-500",
];

export function DNACard({ username, releases, isLoading }: DNACardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const stats = useMemo(() => calculateDNAStats(releases), [releases]);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#1a1412",
      });

      const link = document.createElement("a");
      link.download = `${username}-dna-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;

    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#1a1412",
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `${username}-dna-card.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${username}'s Collection DNA`,
          text: "Check out my vinyl collection DNA on DeepCogs!",
        });
      } else {
        // Fallback to download
        handleDownload();
      }
    } catch (err) {
      console.error("Failed to share:", err);
      // Fallback to download
      handleDownload();
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading || releases.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <svg
            className="w-5 h-5 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Shareable DNA Card
        </CardTitle>
        <CardDescription className="text-gray-500">
          Download or share your collection DNA as an image
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview card */}
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div
            ref={cardRef}
            className="p-6 space-y-4"
            style={{
              background: "linear-gradient(135deg, #1a1412 0%, #2d1f1a 50%, #1a1412 100%)",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {username[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{username}</h2>
                  <p className="text-amber-500/80 text-sm">Collection DNA</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-amber-500">{stats.totalReleases}</p>
                <p className="text-xs text-gray-400">releases</p>
              </div>
            </div>

            {/* Genres bar */}
            <div>
              <p className="text-xs text-gray-400 mb-2">TOP GENRES</p>
              <div className="flex rounded-full overflow-hidden h-4">
                {stats.topGenres.map((genre, i) => (
                  <div
                    key={genre.name}
                    className={`${GENRE_COLORS[i]} transition-all`}
                    style={{ width: `${genre.percentage}%` }}
                    title={`${genre.name}: ${genre.percentage.toFixed(1)}%`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {stats.topGenres.map((genre, i) => (
                  <div key={genre.name} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${GENRE_COLORS[i]}`} />
                    <span className="text-xs text-gray-300">{genre.name}</span>
                    <span className="text-xs text-gray-500">
                      {genre.percentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decades */}
            <div>
              <p className="text-xs text-gray-400 mb-2">ERA BREAKDOWN</p>
              <div className="flex gap-1">
                {stats.topDecades.map((decade) => (
                  <div
                    key={decade.decade}
                    className="flex-1 text-center p-2 rounded bg-white/5"
                  >
                    <p className="text-amber-500 font-bold text-sm">{decade.decade}</p>
                    <p className="text-xs text-gray-400">{decade.count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Labels */}
            <div>
              <p className="text-xs text-gray-400 mb-2">TOP LABELS</p>
              <div className="flex flex-wrap gap-1">
                {stats.topLabels.map((label) => (
                  <span
                    key={label.name}
                    className="px-2 py-1 text-xs rounded bg-white/10 text-gray-300"
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-black">D</span>
                </div>
                <span className="text-xs text-gray-400">deepcogs.vercel.app</span>
              </div>
              {stats.oldestYear > 0 && stats.newestYear > 0 && (
                <span className="text-xs text-gray-500">
                  {stats.oldestYear} - {stats.newestYear}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
          >
            {downloading ? (
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
                Processing...
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download PNG
              </>
            )}
          </Button>
          <Button
            onClick={handleShare}
            disabled={downloading}
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-100"
          >
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
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
