"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VinylRecord } from "@/components/vinyl-record";
import Link from "next/link";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    config: "Server configuration error. Please try again later.",
    missing_params: "Invalid OAuth response. Please try again.",
    expired: "Session expired. Please try again.",
    auth_failed: "Authentication failed. Please try again.",
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, oklch(0.18 0.03 45 / 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, oklch(0.20 0.02 30 / 0.5) 0%, transparent 50%),
            oklch(0.12 0.015 30)
          `,
        }}
      />

      {/* Floating vinyl decoration */}
      <div className="fixed -top-20 -left-20 opacity-10">
        <VinylRecord size={400} spinning />
      </div>
      <div className="fixed -bottom-40 -right-40 opacity-10">
        <VinylRecord size={500} spinning />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">D</span>
          </div>
          <span className="font-bold text-2xl tracking-tight">DeepCogs</span>
        </Link>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connect your collection</CardTitle>
            <CardDescription className="text-base">
              Sign in with your Discogs account to analyze your vinyl collection
              and discover your musical DNA.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {errorMessages[error] || "An error occurred. Please try again."}
              </div>
            )}

            <Button
              size="lg"
              className="w-full h-14 text-lg glow-amber"
              asChild
            >
              <a href="/api/auth/discogs">
                <svg
                  className="w-6 h-6 mr-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="12" cy="12" r="6" strokeDasharray="2 2" />
                </svg>
                Connect with Discogs
              </a>
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">By connecting, you allow DeepCogs to:</p>
              <ul className="space-y-1">
                <li className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  View your collection
                </li>
                <li className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  View your wantlist
                </li>
                <li className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Read your profile info
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have a Discogs account?{" "}
                <a
                  href="https://www.discogs.com/users/create"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Create one free
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your data stays private. We never modify your collection.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}
