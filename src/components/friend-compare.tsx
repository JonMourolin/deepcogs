"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface FriendCompareProps {
  myUsername: string;
  myCollection: DiscogsRelease[];
  isLoading: boolean;
}

interface WantlistItem {
  id: number;
  basic_information: {
    id: number;
    master_id: number;
    title: string;
    year: number;
    thumb: string;
    artists: Array<{ name: string; id: number }>;
    genres: string[];
    styles: string[];
  };
}

interface TradeOpportunity {
  release: DiscogsRelease;
  matchedWant: WantlistItem;
}

interface StyleCompatibility {
  score: number;
  sharedStyles: string[];
  styleComparison: { style: string; myPercent: number; friendPercent: number }[];
}

interface ComparisonResult {
  friendUsername: string;
  friendCollection: DiscogsRelease[];
  overlap: DiscogsRelease[];
  styleCompatibility: StyleCompatibility;
  youCanOffer: TradeOpportunity[];
  theyCanOffer: TradeOpportunity[];
}

function calculateStyleCompatibility(
  myCollection: DiscogsRelease[],
  friendCollection: DiscogsRelease[]
): StyleCompatibility {
  const myStyles: Record<string, number> = {};
  const friendStyles: Record<string, number> = {};

  // Count styles in my collection
  myCollection.forEach((r) => {
    r.basic_information.styles?.forEach((s) => {
      myStyles[s] = (myStyles[s] || 0) + 1;
    });
  });

  // Count styles in friend's collection
  friendCollection.forEach((r) => {
    r.basic_information.styles?.forEach((s) => {
      friendStyles[s] = (friendStyles[s] || 0) + 1;
    });
  });

  const myTotal = myCollection.length;
  const friendTotal = friendCollection.length;

  // Get all styles from both collections
  const allStyles = new Set([
    ...Object.keys(myStyles),
    ...Object.keys(friendStyles),
  ]);

  // Calculate style comparison with percentages
  const styleData = Array.from(allStyles).map((style) => {
    const myCount = myStyles[style] || 0;
    const friendCount = friendStyles[style] || 0;
    const myPercent = myTotal > 0 ? (myCount / myTotal) * 100 : 0;
    const friendPercent = friendTotal > 0 ? (friendCount / friendTotal) * 100 : 0;
    // Overlap is the minimum of the two percentages (conservative measure)
    const overlap = Math.min(myPercent, friendPercent);

    return { style, myPercent, friendPercent, overlap };
  });

  // Calculate total compatibility score (sum of overlaps, max 100%)
  const totalOverlap = styleData.reduce((sum, s) => sum + s.overlap, 0);
  const score = Math.min(Math.round(totalOverlap), 100);

  // Get shared styles (both have >3% presence) sorted by overlap
  const sharedStyles = styleData
    .filter((s) => s.myPercent >= 3 && s.friendPercent >= 3)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 5)
    .map((s) => s.style);

  // Get style comparison for display (top styles by combined presence)
  const styleComparison = styleData
    .sort((a, b) => (b.myPercent + b.friendPercent) - (a.myPercent + a.friendPercent))
    .slice(0, 10)
    .map(({ style, myPercent, friendPercent }) => ({ style, myPercent, friendPercent }));

  return { score, sharedStyles, styleComparison };
}

function ReleaseCard({ release }: { release: DiscogsRelease }) {
  const info = release.basic_information;
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
      {info.thumb && (
        <img
          src={info.thumb}
          alt={info.title}
          className="w-12 h-12 rounded object-cover flex-shrink-0"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900 truncate">{info.title}</p>
        <p className="text-sm text-gray-500 truncate">
          {info.artists?.map((a) => a.name).join(", ")} • {info.year || "N/A"}
        </p>
      </div>
    </div>
  );
}

function TradeCard({ opportunity }: { opportunity: TradeOpportunity }) {
  const info = opportunity.release.basic_information;
  return (
    <a
      href={`https://www.discogs.com/release/${info.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <div className="flex gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all hover:scale-[1.02] border border-gray-100">
        {info.thumb ? (
          <img
            src={info.thumb}
            alt={info.title}
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
          <p className="font-medium text-gray-900 truncate">{info.title}</p>
          <p className="text-sm text-gray-500 truncate">
            {info.artists?.map((a) => a.name).join(", ")} {info.year ? `• ${info.year}` : ""}
          </p>
          <div className="flex gap-1 mt-1">
            {info.genres?.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
        <svg
          className="w-5 h-5 text-green-500 flex-shrink-0 self-center"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      </div>
    </a>
  );
}

export function FriendCompare({
  myUsername,
  myCollection,
  isLoading: myCollectionLoading,
}: FriendCompareProps) {
  const [friendUsername, setFriendUsername] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  
  const handleSearch = async () => {
    if (!friendUsername.trim()) return;
    if (friendUsername.toLowerCase() === myUsername.toLowerCase()) {
      setError("You can't compare with yourself!");
      return;
    }

    setSearching(true);
    setError(null);

    try {
      // Fetch friend's collection
      const collectionResponse = await fetch(
        `/api/collection?username=${encodeURIComponent(friendUsername)}`
      );

      if (!collectionResponse.ok) {
        throw new Error("Failed to fetch friend's collection");
      }

      const collectionData = await collectionResponse.json();
      const friendCollection: DiscogsRelease[] = collectionData.releases || [];

      if (friendCollection.length === 0) {
        throw new Error("Friend's collection is empty or private");
      }

      // Calculate style-based compatibility
      const styleCompatibility = calculateStyleCompatibility(myCollection, friendCollection);

      // Calculate albums in common (for display purposes)
      const myMasterIds = new Set(
        myCollection.map((r) => r.basic_information.master_id)
      );
      const friendMasterIds = new Set(
        friendCollection.map((r) => r.basic_information.master_id)
      );

      const overlapMasterIds = new Set(
        [...myMasterIds].filter((id) => id && friendMasterIds.has(id))
      );

      const overlap = myCollection.filter((r) =>
        overlapMasterIds.has(r.basic_information.master_id)
      );

      // Fetch trade opportunities
      let youCanOffer: TradeOpportunity[] = [];
      let theyCanOffer: TradeOpportunity[] = [];

      try {
        // Fetch friend's wantlist
        const friendWantlistResponse = await fetch(
          `/api/wantlist/${encodeURIComponent(friendUsername)}`
        );

        if (friendWantlistResponse.ok) {
          const friendWantlistData = await friendWantlistResponse.json();
          const friendWants: WantlistItem[] = friendWantlistData.wants || [];

          const friendWantMasterIds = new Set(
            friendWants.map((w) => w.basic_information.master_id).filter(Boolean)
          );

          youCanOffer = myCollection
            .filter((r) => friendWantMasterIds.has(r.basic_information.master_id))
            .map((release) => ({
              release,
              matchedWant: friendWants.find(
                (w) => w.basic_information.master_id === release.basic_information.master_id
              )!,
            }));
        }

        // Fetch my wantlist
        const myWantlistResponse = await fetch(
          `/api/wantlist/${encodeURIComponent(myUsername)}`
        );

        if (myWantlistResponse.ok) {
          const myWantlistData = await myWantlistResponse.json();
          const myWants: WantlistItem[] = myWantlistData.wants || [];

          const myWantMasterIds = new Set(
            myWants.map((w) => w.basic_information.master_id).filter(Boolean)
          );

          theyCanOffer = friendCollection
            .filter((r) => myWantMasterIds.has(r.basic_information.master_id))
            .map((release) => ({
              release,
              matchedWant: myWants.find(
                (w) => w.basic_information.master_id === release.basic_information.master_id
              )!,
            }));
        }
      } catch (tradeErr) {
        console.error("Failed to fetch trade data:", tradeErr);
        // Continue without trade data
      }

      setResult({
        friendUsername,
        friendCollection,
        overlap,
        styleCompatibility,
        youCanOffer,
        theyCanOffer,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to compare collections"
      );
    } finally {
      setSearching(false);
    }
  };

  if (myCollectionLoading) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Compare & Trade</CardTitle>
          <CardDescription className="text-gray-500">Loading your collection first...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unified Search */}
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Compare & Trade with a Friend
          </CardTitle>
          <CardDescription className="text-gray-500">
            Enter a Discogs username to compare collections and find trade opportunities.
            <span className="block mt-1 text-amber-600">
              Note: Their collection and wantlist must be public.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter Discogs username"
              value={friendUsername}
              onChange={(e) => setFriendUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={searching}
              className="max-w-xs bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
            />
            <Button
              onClick={handleSearch}
              disabled={searching || !friendUsername.trim()}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              {searching ? (
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
                  Analyzing...
                </>
              ) : (
                "Compare & Find Trades"
              )}
            </Button>
          </div>

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Taste Compatibility */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-amber-600 mb-1">
                    {result.styleCompatibility.score}%
                  </div>
                  <p className="text-sm text-gray-600">
                    Taste Compatibility
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on style preferences
                  </p>
                </div>

                {/* Shared styles */}
                {result.styleCompatibility.sharedStyles.length > 0 && (
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 mb-2">You both love</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {result.styleCompatibility.sharedStyles.map((style) => (
                        <span
                          key={style}
                          className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trade Summary */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-gray-200">
              <CardContent className="pt-6 pb-6">
                <div className="text-center mb-4">
                  <p className="text-sm font-medium text-gray-600">Trade Opportunities</p>
                </div>
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{result.youCanOffer.length}</p>
                    <p className="text-xs text-gray-500">You can offer</p>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{result.theyCanOffer.length}</p>
                    <p className="text-xs text-gray-500">They can offer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Style Comparison */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 text-base">Style Comparison</CardTitle>
              <CardDescription className="text-gray-500 text-xs">
                How your style preferences compare (% of collection)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {result.styleCompatibility.styleComparison.map((s) => (
                  <div key={s.style} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">{s.style}</span>
                      <span className="text-xs text-gray-500">
                        {s.myPercent.toFixed(0)}% / {s.friendPercent.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100">
                      <div
                        className="bg-amber-500"
                        style={{
                          width: `${(s.myPercent / (s.myPercent + s.friendPercent)) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-gray-300"
                        style={{
                          width: `${(s.friendPercent / (s.myPercent + s.friendPercent)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trade Opportunities */}
          {(result.youCanOffer.length > 0 || result.theyCanOffer.length > 0) && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* You can offer */}
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="text-green-600">You can offer</span>
                    {result.youCanOffer.length > 0 && (
                      <Badge variant="default" className="bg-green-600 text-white">
                        {result.youCanOffer.length}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-500 text-xs">
                    Records you have that {result.friendUsername} wants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result.youCanOffer.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">
                      No matches found
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {result.youCanOffer.map((opportunity) => (
                        <TradeCard
                          key={opportunity.release.instance_id}
                          opportunity={opportunity}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* They can offer */}
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="text-blue-600">{result.friendUsername} can offer</span>
                    {result.theyCanOffer.length > 0 && (
                      <Badge variant="default" className="bg-blue-600 text-white">
                        {result.theyCanOffer.length}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-500 text-xs">
                    Records they have that you want
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result.theyCanOffer.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">
                      No matches found
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {result.theyCanOffer.map((opportunity) => (
                        <TradeCard
                          key={opportunity.release.instance_id}
                          opportunity={opportunity}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Albums In Common */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 text-base">
                Albums In Common ({result.overlap.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.overlap.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No overlapping albums found
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                  {result.overlap.slice(0, 50).map((release) => (
                    <ReleaseCard key={release.instance_id} release={release} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
