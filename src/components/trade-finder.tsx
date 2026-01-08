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

interface TradeFinderProps {
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

interface ReverseTradeOpportunity {
  release: DiscogsRelease;
  matchedWant: WantlistItem;
}

interface TradeResult {
  friendUsername: string;
  youCanOffer: TradeOpportunity[];
  theyCanOffer: ReverseTradeOpportunity[];
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

export function TradeFinder({
  myUsername,
  myCollection,
  isLoading: myCollectionLoading,
}: TradeFinderProps) {
  const [friendUsername, setFriendUsername] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TradeResult | null>(null);

  const handleSearch = async () => {
    if (!friendUsername.trim()) return;
    if (friendUsername.toLowerCase() === myUsername.toLowerCase()) {
      setError("You can't trade with yourself!");
      return;
    }

    setSearching(true);
    setError(null);

    try {
      // Fetch friend's wantlist
      const wantlistResponse = await fetch(
        `/api/wantlist/${encodeURIComponent(friendUsername)}`
      );

      if (!wantlistResponse.ok) {
        const errorData = await wantlistResponse.json();
        throw new Error(errorData.error || "Failed to fetch wantlist");
      }

      const wantlistData = await wantlistResponse.json();
      const friendWants: WantlistItem[] = wantlistData.wants;

      // Fetch friend's collection for reverse matching
      const collectionResponse = await fetch(
        `/api/collection?username=${encodeURIComponent(friendUsername)}`
      );

      let friendCollection: DiscogsRelease[] = [];
      if (collectionResponse.ok) {
        const collectionData = await collectionResponse.json();
        friendCollection = collectionData.releases || [];
      }

      // Find what you can offer (your collection items that match their wantlist)
      const friendWantMasterIds = new Set(
        friendWants.map((w) => w.basic_information.master_id).filter(Boolean)
      );

      const youCanOffer: TradeOpportunity[] = myCollection
        .filter((r) => friendWantMasterIds.has(r.basic_information.master_id))
        .map((release) => ({
          release,
          matchedWant: friendWants.find(
            (w) => w.basic_information.master_id === release.basic_information.master_id
          )!,
        }));

      // Fetch my wantlist to find what friend has that I want
      let theyCanOffer: ReverseTradeOpportunity[] = [];
      try {
        const myWantlistResponse = await fetch(
          `/api/wantlist/${encodeURIComponent(myUsername)}`
        );

        if (myWantlistResponse.ok) {
          const myWantlistData = await myWantlistResponse.json();
          const myWants: WantlistItem[] = myWantlistData.wants;

          // Find friend's collection items that match my wantlist
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
      } catch (err) {
        console.error("Failed to fetch my wantlist:", err);
      }

      setResult({
        friendUsername,
        youCanOffer,
        theyCanOffer,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to find trade opportunities"
      );
    } finally {
      setSearching(false);
    }
  };

  if (myCollectionLoading) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Trade Finder</CardTitle>
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
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            Trade Finder
          </CardTitle>
          <CardDescription className="text-gray-500">
            Find records you own that a friend wants. Enter their Discogs username
            to discover trade opportunities.
            <span className="block mt-2 text-amber-600">
              Note: Your friend must have a public Discogs collection and wantlist.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter friend's Discogs username"
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
                  Searching...
                </>
              ) : (
                "Find Trades"
              )}
            </Button>
          </div>

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-gray-200">
            <CardContent className="py-6">
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{result.youCanOffer.length}</p>
                  <p className="text-sm text-gray-500">You can offer</p>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
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
                  <p className="text-sm text-gray-500">They can offer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* You can offer */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-green-600">You can offer</span>
                {result.youCanOffer.length > 0 && (
                  <Badge variant="default" className="bg-green-600 text-white">
                    {result.youCanOffer.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-gray-500">
                Records you have that {result.friendUsername} wants
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.youCanOffer.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  You don't have any records that {result.friendUsername} wants.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-blue-600">{result.friendUsername} can offer</span>
                {result.theyCanOffer.length > 0 && (
                  <Badge variant="default" className="bg-blue-600 text-white">
                    {result.theyCanOffer.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-gray-500">
                Records they have that you want
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.theyCanOffer.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {result.friendUsername} doesn't have any records from your wantlist.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
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
    </div>
  );
}
