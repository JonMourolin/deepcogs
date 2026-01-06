"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { DiscogsRelease } from "@/lib/discogs";

interface CountryDistributionProps {
  releases: DiscogsRelease[];
  isLoading: boolean;
}

interface CountryData {
  country: string;
  count: number;
  flag: string;
}

// Simple country to flag emoji mapping
const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  USA: "🇺🇸",
  "United States": "🇺🇸",
  UK: "🇬🇧",
  "United Kingdom": "🇬🇧",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Japan: "🇯🇵",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Italy: "🇮🇹",
  Spain: "🇪🇸",
  Netherlands: "🇳🇱",
  Belgium: "🇧🇪",
  Sweden: "🇸🇪",
  Brazil: "🇧🇷",
  Mexico: "🇲🇽",
  Jamaica: "🇯🇲",
  "South Africa": "🇿🇦",
  Nigeria: "🇳🇬",
  "New Zealand": "🇳🇿",
  Ireland: "🇮🇪",
  Switzerland: "🇨🇭",
  Austria: "🇦🇹",
  Poland: "🇵🇱",
  Russia: "🇷🇺",
  Norway: "🇳🇴",
  Denmark: "🇩🇰",
  Finland: "🇫🇮",
  Portugal: "🇵🇹",
  Greece: "🇬🇷",
  Argentina: "🇦🇷",
  Chile: "🇨🇱",
  Colombia: "🇨🇴",
  "South Korea": "🇰🇷",
  India: "🇮🇳",
  China: "🇨🇳",
  Europe: "🇪🇺",
  Unknown: "🌍",
};

function getFlag(country: string): string {
  return COUNTRY_FLAGS[country] || "🌍";
}

// Normalize country names
function normalizeCountry(country: string): string {
  const normalized = country.trim();
  if (normalized === "US" || normalized === "USA") return "United States";
  if (normalized === "UK") return "United Kingdom";
  return normalized;
}

export function CountryDistribution({
  releases,
  isLoading,
}: CountryDistributionProps) {
  const [countryData, setCountryData] = useState<Record<number, string>>({});
  const [fetching, setFetching] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchCountryData = async () => {
    setFetching(true);
    setFetchError(null);
    setFetchProgress(0);

    const newCountryData: Record<number, string> = { ...countryData };
    const releasesToFetch = releases.filter(
      (r) => !countryData[r.basic_information.id]
    );

    // Limit to 50 releases to avoid rate limiting
    const batch = releasesToFetch.slice(0, 50);
    let completed = 0;

    for (const release of batch) {
      try {
        const response = await fetch(
          `/api/release/${release.basic_information.id}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.country) {
            newCountryData[release.basic_information.id] = normalizeCountry(
              data.country
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch release:", err);
      }

      completed++;
      setFetchProgress((completed / batch.length) * 100);
      // Small delay to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setCountryData(newCountryData);
    setFetching(false);

    if (releasesToFetch.length > 50) {
      setFetchError(
        `Fetched 50 of ${releasesToFetch.length} releases. Click again to fetch more.`
      );
    }
  };

  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};

    Object.values(countryData).forEach((country) => {
      if (country) {
        counts[country] = (counts[country] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([country, count]) => ({
        country,
        count,
        flag: getFlag(country),
      }))
      .sort((a, b) => b.count - a.count);
  }, [countryData]);

  const totalFetched = Object.keys(countryData).length;
  const totalReleases = releases.length;
  const percentageFetched = totalReleases > 0 ? (totalFetched / totalReleases) * 100 : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Country Distribution</CardTitle>
          <CardDescription>Loading your collection...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (releases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Country Distribution</CardTitle>
          <CardDescription>
            Add some records to see where your music comes from
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🌍</span>
            Country Distribution
          </CardTitle>
          <CardDescription>
            Discover where your vinyl comes from. Country data requires fetching
            individual release details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fetch controls */}
          <div className="flex items-center gap-4">
            <Button
              onClick={fetchCountryData}
              disabled={fetching || totalFetched >= totalReleases}
            >
              {fetching ? (
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
                  Fetching...
                </>
              ) : totalFetched >= totalReleases ? (
                "All data loaded"
              ) : totalFetched > 0 ? (
                "Load more countries"
              ) : (
                "Load country data"
              )}
            </Button>
            <div className="text-sm text-muted-foreground">
              {totalFetched} / {totalReleases} releases loaded
            </div>
          </div>

          {/* Progress bar */}
          {fetching && (
            <div className="space-y-1">
              <Progress value={fetchProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Fetching release details... {Math.round(fetchProgress)}%
              </p>
            </div>
          )}

          {fetchError && (
            <p className="text-sm text-amber-500">{fetchError}</p>
          )}

          {/* Data coverage */}
          {totalFetched > 0 && (
            <div className="flex items-center gap-2">
              <Progress value={percentageFetched} className="h-2 flex-1" />
              <span className="text-xs text-muted-foreground">
                {percentageFetched.toFixed(0)}% coverage
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribution display */}
      {distribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Your Vinyl World Map
              <Badge variant="secondary" className="ml-2">
                {distribution.length} countries
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {distribution.map((item, index) => {
                const maxCount = distribution[0]?.count || 1;
                const percentage = (item.count / maxCount) * 100;

                return (
                  <div key={item.country} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.flag}</span>
                        <span className="font-medium">{item.country}</span>
                        {index === 0 && (
                          <Badge variant="default" className="text-xs">
                            Top
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.count} release{item.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {distribution.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Countries</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {distribution[0]?.flag || "🌍"}
                  </p>
                  <p className="text-xs text-muted-foreground">Top Origin</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {totalFetched}
                  </p>
                  <p className="text-xs text-muted-foreground">Releases</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
