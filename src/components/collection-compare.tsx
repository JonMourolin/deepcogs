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
import { Skeleton } from "@/components/ui/skeleton";
import type { DiscogsRelease } from "@/lib/discogs";

interface CollectionCompareProps {
  myUsername: string;
  myCollection: DiscogsRelease[];
  isLoading: boolean;
}

interface ComparisonResult {
  friendUsername: string;
  friendCollection: DiscogsRelease[];
  overlap: DiscogsRelease[];
  onlyMe: DiscogsRelease[];
  onlyFriend: DiscogsRelease[];
  compatibilityScore: number;
  genreOverlap: { genre: string; myCount: number; friendCount: number }[];
}

function calculateCompatibility(
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

export function CollectionCompare({
  myUsername,
  myCollection,
  isLoading: myCollectionLoading,
}: CollectionCompareProps) {
  const [friendUsername, setFriendUsername] = useState("");
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [activeTab, setActiveTab] = useState<"overlap" | "onlyMe" | "onlyFriend">("overlap");

  const handleCompare = async () => {
    if (!friendUsername.trim()) return;
    if (friendUsername.toLowerCase() === myUsername.toLowerCase()) {
      setError("You can't compare with yourself!");
      return;
    }

    setComparing(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/collection?username=${encodeURIComponent(friendUsername)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch friend's collection");
      }

      const data = await response.json();
      const friendCollection: DiscogsRelease[] = data.releases;

      if (friendCollection.length === 0) {
        throw new Error("Friend's collection is empty or private");
      }

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

      const genreOverlap = calculateCompatibility(myCollection, friendCollection);

      setComparison({
        friendUsername,
        friendCollection,
        overlap,
        onlyMe,
        onlyFriend,
        compatibilityScore,
        genreOverlap,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to compare collections"
      );
    } finally {
      setComparing(false);
    }
  };

  if (myCollectionLoading) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Compare Collections</CardTitle>
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
      {/* Search form */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Compare with a Friend</CardTitle>
          <CardDescription className="text-gray-500">
            Enter a Discogs username to compare your collections and discover
            overlapping taste
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter Discogs username"
              value={friendUsername}
              onChange={(e) => setFriendUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCompare()}
              disabled={comparing}
              className="max-w-xs bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
            />
            <Button
              onClick={handleCompare}
              disabled={comparing || !friendUsername.trim()}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              {comparing ? (
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
                  Comparing...
                </>
              ) : (
                "Compare"
              )}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-3">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {comparison && (
        <div className="space-y-6">
          {/* Compatibility Score */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="text-7xl font-bold text-amber-600 mb-2">
                  {comparison.compatibilityScore}%
                </div>
                <p className="text-lg text-gray-600">
                  Collection Compatibility with{" "}
                  <span className="font-semibold text-gray-900">
                    {comparison.friendUsername}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {comparison.overlap.length} albums in common
                </p>
              </div>

              {/* Venn diagram representation */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-amber-200 flex items-center justify-center">
                    <span className="font-bold text-lg text-amber-800">
                      {comparison.onlyMe.length}
                    </span>
                  </div>
                  <p className="text-sm mt-2 text-gray-500">Only you</p>
                </div>
                <div className="text-center -mx-6 z-10">
                  <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center">
                    <span className="font-bold text-lg text-white">
                      {comparison.overlap.length}
                    </span>
                  </div>
                  <p className="text-sm mt-2 font-medium text-gray-900">Both</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="font-bold text-lg text-gray-700">
                      {comparison.onlyFriend.length}
                    </span>
                  </div>
                  <p className="text-sm mt-2 text-gray-500">
                    Only {comparison.friendUsername}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Genre Comparison */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Genre Comparison</CardTitle>
              <CardDescription className="text-gray-500">
                How your genre preferences align
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comparison.genreOverlap.map((g) => (
                  <div key={g.genre} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">{g.genre}</span>
                      <span className="text-gray-500">
                        You: {g.myCount} / {comparison.friendUsername}:{" "}
                        {g.friendCount}
                      </span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                      <div
                        className="bg-amber-500"
                        style={{
                          width: `${
                            (g.myCount / (g.myCount + g.friendCount)) * 100
                          }%`,
                        }}
                      />
                      <div
                        className="bg-gray-300"
                        style={{
                          width: `${
                            (g.friendCount / (g.myCount + g.friendCount)) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Collection Details with custom tabs */}
          <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab("overlap")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "overlap"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                In Common ({comparison.overlap.length})
              </button>
              <button
                onClick={() => setActiveTab("onlyMe")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "onlyMe"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Only You ({comparison.onlyMe.length})
              </button>
              <button
                onClick={() => setActiveTab("onlyFriend")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "onlyFriend"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Only Them ({comparison.onlyFriend.length})
              </button>
            </div>

            {activeTab === "overlap" && (
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Albums You Both Own</CardTitle>
                  <CardDescription className="text-gray-500">
                    These are the releases you share with {comparison.friendUsername}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {comparison.overlap.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No overlapping albums found
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                      {comparison.overlap.slice(0, 50).map((release) => (
                        <ReleaseCard key={release.instance_id} release={release} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "onlyMe" && (
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Your Unique Albums</CardTitle>
                  <CardDescription className="text-gray-500">
                    Albums in your collection that {comparison.friendUsername} doesn&apos;t have
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                    {comparison.onlyMe.slice(0, 50).map((release) => (
                      <ReleaseCard key={release.instance_id} release={release} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "onlyFriend" && (
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">
                    {comparison.friendUsername}&apos;s Unique Albums
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Albums they have that you might want to check out
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                    {comparison.onlyFriend.slice(0, 50).map((release) => (
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
