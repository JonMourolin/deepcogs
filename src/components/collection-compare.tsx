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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="flex gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
      {info.thumb && (
        <img
          src={info.thumb}
          alt={info.title}
          className="w-12 h-12 rounded object-cover flex-shrink-0"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{info.title}</p>
        <p className="text-sm text-muted-foreground truncate">
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

      // Find overlaps by master_id (same album, possibly different pressing)
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

      // Calculate compatibility score
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
      <Card>
        <CardHeader>
          <CardTitle>Compare Collections</CardTitle>
          <CardDescription>Loading your collection first...</CardDescription>
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
      <Card>
        <CardHeader>
          <CardTitle>Compare with a Friend</CardTitle>
          <CardDescription>
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
              className="max-w-xs"
            />
            <Button onClick={handleCompare} disabled={comparing || !friendUsername.trim()}>
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
            <p className="text-sm text-destructive mt-3">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {comparison && (
        <div className="space-y-6">
          {/* Compatibility Score */}
          <Card
            className="overflow-hidden"
            style={{
              background: `linear-gradient(135deg, oklch(0.20 0.03 45 / 0.5) 0%, oklch(0.16 0.02 30) 100%)`,
            }}
          >
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="text-7xl font-bold text-primary mb-2">
                  {comparison.compatibilityScore}%
                </div>
                <p className="text-lg text-muted-foreground">
                  Collection Compatibility with{" "}
                  <span className="font-semibold text-foreground">
                    {comparison.friendUsername}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {comparison.overlap.length} albums in common
                </p>
              </div>

              {/* Venn diagram representation */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/30 flex items-center justify-center">
                    <span className="font-bold text-lg">
                      {comparison.onlyMe.length}
                    </span>
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground">Only you</p>
                </div>
                <div className="text-center -mx-6 z-10">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                    <span className="font-bold text-lg text-primary-foreground">
                      {comparison.overlap.length}
                    </span>
                  </div>
                  <p className="text-sm mt-2 font-medium">Both</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
                    <span className="font-bold text-lg">
                      {comparison.onlyFriend.length}
                    </span>
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground">
                    Only {comparison.friendUsername}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Genre Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Genre Comparison</CardTitle>
              <CardDescription>
                How your genre preferences align
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comparison.genreOverlap.map((g) => (
                  <div key={g.genre} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{g.genre}</span>
                      <span className="text-muted-foreground">
                        You: {g.myCount} / {comparison.friendUsername}:{" "}
                        {g.friendCount}
                      </span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-secondary">
                      <div
                        className="bg-primary"
                        style={{
                          width: `${
                            (g.myCount / (g.myCount + g.friendCount)) * 100
                          }%`,
                        }}
                      />
                      <div
                        className="bg-muted-foreground/30"
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

          {/* Collection Details */}
          <Tabs defaultValue="overlap">
            <TabsList className="grid w-full grid-cols-3 bg-secondary">
              <TabsTrigger value="overlap">
                In Common ({comparison.overlap.length})
              </TabsTrigger>
              <TabsTrigger value="onlyMe">
                Only You ({comparison.onlyMe.length})
              </TabsTrigger>
              <TabsTrigger value="onlyFriend">
                Only Them ({comparison.onlyFriend.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overlap">
              <Card>
                <CardHeader>
                  <CardTitle>Albums You Both Own</CardTitle>
                  <CardDescription>
                    These are the releases you share with{" "}
                    {comparison.friendUsername}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {comparison.overlap.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No overlapping albums found
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                      {comparison.overlap.slice(0, 50).map((release) => (
                        <ReleaseCard
                          key={release.instance_id}
                          release={release}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="onlyMe">
              <Card>
                <CardHeader>
                  <CardTitle>Your Unique Albums</CardTitle>
                  <CardDescription>
                    Albums in your collection that {comparison.friendUsername}{" "}
                    doesn&apos;t have
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                    {comparison.onlyMe.slice(0, 50).map((release) => (
                      <ReleaseCard
                        key={release.instance_id}
                        release={release}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="onlyFriend">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {comparison.friendUsername}&apos;s Unique Albums
                  </CardTitle>
                  <CardDescription>
                    Albums they have that you might want to check out
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                    {comparison.onlyFriend.slice(0, 50).map((release) => (
                      <ReleaseCard
                        key={release.instance_id}
                        release={release}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
