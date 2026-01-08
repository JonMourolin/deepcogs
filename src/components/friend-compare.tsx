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

interface ComparisonResult {
  friendUsername: string;
  friendCollection: DiscogsRelease[];
  overlap: DiscogsRelease[];
  onlyMe: DiscogsRelease[];
  onlyFriend: DiscogsRelease[];
  compatibilityScore: number;
  genreOverlap: { genre: string; myCount: number; friendCount: number }[];
  youCanOffer: TradeOpportunity[];
  theyCanOffer: TradeOpportunity[];
}

function calculateGenreComparison(
  myCollection: DiscogsRelease[],
  friendCollection: DiscogsRelease[]
): ComparisonResult["genreOverlap"] {
  const myGenres: Record<string, number> = {};
  const friendGenres: Record<string, number> = {};

  myCollection.forEach((r) => {
    r.basic_information.genres?.forEach((g) => {
      myGenres[g] = (myGenres[g] || 0) + 1;
    });
  });

  friendCollection.forEach((r) => {
    r.basic_information.genres?.forEach((g) => {
      friendGenres[g] = (friendGenres[g] || 0) + 1;
    });
  });

  const allGenres = new Set([
    ...Object.keys(myGenres),
    ...Object.keys(friendGenres),
  ]);

  return Array.from(allGenres)
    .map((genre) => ({
      genre,
      myCount: myGenres[genre] || 0,
      friendCount: friendGenres[genre] || 0,
    }))
    .sort((a, b) => b.myCount + b.friendCount - (a.myCount + a.friendCount))
    .slice(0, 8);
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
  const [activeCompareTab, setActiveCompareTab] = useState<"overlap" | "onlyMe" | "onlyFriend">("overlap");

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

      // Calculate collection comparison
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

      const onlyMe = myCollection.filter(
        (r) =>
          r.basic_information.master_id &&
          !overlapMasterIds.has(r.basic_information.master_id)
      );

      const onlyFriend = friendCollection.filter(
        (r) =>
          r.basic_information.master_id &&
          !overlapMasterIds.has(r.basic_information.master_id)
      );

      const totalUnique = new Set([...myMasterIds, ...friendMasterIds]).size;
      const compatibilityScore =
        totalUnique > 0
          ? Math.round((overlapMasterIds.size / totalUnique) * 100)
          : 0;

      const genreOverlap = calculateGenreComparison(myCollection, friendCollection);

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
        onlyMe,
        onlyFriend,
        compatibilityScore,
        genreOverlap,
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
            {/* Compatibility Score */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-amber-600 mb-1">
                    {result.compatibilityScore}%
                  </div>
                  <p className="text-sm text-gray-600">
                    Collection Compatibility
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {result.overlap.length} albums in common
                  </p>
                </div>

                {/* Mini Venn diagram */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-200 flex items-center justify-center">
                      <span className="font-bold text-sm text-amber-800">
                        {result.onlyMe.length}
                      </span>
                    </div>
                    <p className="text-xs mt-1 text-gray-500">Only you</p>
                  </div>
                  <div className="text-center -mx-3 z-10">
                    <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center">
                      <span className="font-bold text-sm text-white">
                        {result.overlap.length}
                      </span>
                    </div>
                    <p className="text-xs mt-1 font-medium text-gray-900">Both</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="font-bold text-sm text-gray-700">
                        {result.onlyFriend.length}
                      </span>
                    </div>
                    <p className="text-xs mt-1 text-gray-500">Only them</p>
                  </div>
                </div>
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

          {/* Genre Comparison */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 text-base">Genre Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {result.genreOverlap.map((g) => (
                  <div key={g.genre} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">{g.genre}</span>
                      <span className="text-xs text-gray-500">
                        {g.myCount} / {g.friendCount}
                      </span>
                    </div>
                    <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100">
                      <div
                        className="bg-amber-500"
                        style={{
                          width: `${(g.myCount / (g.myCount + g.friendCount)) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-gray-300"
                        style={{
                          width: `${(g.friendCount / (g.myCount + g.friendCount)) * 100}%`,
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

          {/* Collection Details */}
          <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
              <button
                onClick={() => setActiveCompareTab("overlap")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeCompareTab === "overlap"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                In Common ({result.overlap.length})
              </button>
              <button
                onClick={() => setActiveCompareTab("onlyMe")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeCompareTab === "onlyMe"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Only You ({result.onlyMe.length})
              </button>
              <button
                onClick={() => setActiveCompareTab("onlyFriend")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeCompareTab === "onlyFriend"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Only Them ({result.onlyFriend.length})
              </button>
            </div>

            {activeCompareTab === "overlap" && (
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 text-base">Albums You Both Own</CardTitle>
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
            )}

            {activeCompareTab === "onlyMe" && (
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 text-base">Your Unique Albums</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                    {result.onlyMe.slice(0, 50).map((release) => (
                      <ReleaseCard key={release.instance_id} release={release} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeCompareTab === "onlyFriend" && (
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 text-base">
                    {result.friendUsername}&apos;s Unique Albums
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                    {result.onlyFriend.slice(0, 50).map((release) => (
                      <ReleaseCard key={release.instance_id} release={release} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
