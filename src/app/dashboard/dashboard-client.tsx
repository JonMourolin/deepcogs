"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VinylRecord } from "@/components/vinyl-record";
import { DNACharts } from "@/components/dna-charts";
import { CollectionCompare } from "@/components/collection-compare";
import { Recommendations } from "@/components/recommendations";
import { DeepCuts } from "@/components/deep-cuts";
import { DNACard } from "@/components/dna-card";
import { TradeFinder } from "@/components/trade-finder";
import Link from "next/link";
import type { DiscogsRelease } from "@/lib/discogs";

interface DashboardClientProps {
  username: string;
}

interface CollectionData {
  releases: DiscogsRelease[];
  total: number;
}

export function DashboardClient({ username }: DashboardClientProps) {
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (page: number, existingReleases: DiscogsRelease[] = []) => {
    const response = await fetch(`/api/collection?username=${username}&page=${page}`);
    if (!response.ok) {
      throw new Error("Failed to fetch collection");
    }
    const data = await response.json();
    return {
      releases: [...existingReleases, ...data.releases],
      total: data.total,
      hasMore: data.hasMore,
      page: data.page,
    };
  }, [username]);


  useEffect(() => {
    async function fetchCollection() {
      try {
        setLoading(true);
        let allReleases: DiscogsRelease[] = [];
        let currentPageNum = 1;
        let hasMore = true;
        let total = 0;

        // Fetch all pages until we have the complete collection
        while (hasMore) {
          const result = await fetchPage(currentPageNum, allReleases);
          allReleases = result.releases;
          total = result.total;
          hasMore = result.hasMore;
          currentPageNum = result.page + 1;
        }

        setCollection({ releases: allReleases, total });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load collection");
      } finally {
        setLoading(false);
      }
    }

    fetchCollection();
  }, [fetchPage]);

  return (
    <main className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse at 10% 10%, oklch(0.18 0.03 45 / 0.2) 0%, transparent 40%),
            radial-gradient(ellipse at 90% 90%, oklch(0.20 0.02 30 / 0.3) 0%, transparent 40%),
            oklch(0.12 0.015 30)
          `,
        }}
      />

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">D</span>
            </div>
            <span className="font-bold text-lg tracking-tight">DeepCogs</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                  {username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{username}</span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/auth/logout">Sign out</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-6 py-8">
        {/* Welcome section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {username}
            </h1>
            <p className="text-muted-foreground">
              {loading
                ? "Loading your collection..."
                : collection
                ? `${collection.total} releases in your collection`
                : "Your collection DNA awaits"}
            </p>
          </div>
          <div className="hidden md:block">
            <VinylRecord size={80} spinning={loading} />
          </div>
        </div>

        {error && (
          <Card className="mb-8 border-destructive/50 bg-destructive/10">
            <CardContent className="py-4">
              <p className="text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="dna" className="space-y-8">
          <TabsList className="grid w-full max-w-lg grid-cols-4 bg-secondary">
            <TabsTrigger value="dna">DNA</TabsTrigger>
            <TabsTrigger value="deep-cuts">Deep Cuts</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>

          {/* DNA Tab */}
          <TabsContent value="dna" className="space-y-8">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-48 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : collection ? (
              <>
                <DNACharts releases={collection.releases} />
                <div className="grid md:grid-cols-2 gap-6">
                  <DNACard
                    username={username}
                    releases={collection.releases}
                    isLoading={loading}
                  />
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No collection data available. Add some records on Discogs
                    first!
                  </p>
                  <Button className="mt-4" asChild>
                    <a
                      href="https://www.discogs.com/user/collection"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Go to Discogs Collection
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Deep Cuts Tab */}
          <TabsContent value="deep-cuts" className="space-y-8">
            <DeepCuts
              releases={collection?.releases || []}
              isLoading={loading}
            />
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-8">
            <CollectionCompare
              myUsername={username}
              myCollection={collection?.releases || []}
              isLoading={loading}
            />
            <TradeFinder
              myUsername={username}
              myCollection={collection?.releases || []}
              isLoading={loading}
            />
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-8">
            <Recommendations
              releases={collection?.releases || []}
              isLoading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
