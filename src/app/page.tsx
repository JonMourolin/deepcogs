"use client";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT PANEL - Login/Connect Section */}
      <div
        className="lg:w-1/2 min-h-screen flex flex-col justify-between p-8 lg:p-16"
        style={{ background: "#FDFBF7" }}
      >
        {/* Logo */}
        <header>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #333 100%)" }}
            >
              <span className="text-white font-black text-xl">D</span>
            </div>
            <span className="font-black text-2xl tracking-tight text-gray-900">
              DeepCogs
            </span>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <h1
            className="text-4xl lg:text-5xl leading-tight mb-5 text-gray-900"
            style={{ fontFamily: "var(--font-serif), 'Times New Roman', serif" }}
          >
            Connect your collection
          </h1>

          <p className="text-lg leading-relaxed mb-8 text-gray-600">
            Sign in with your Discogs account to analyze your vinyl collection
            and discover your musical DNA.
          </p>

          <div className="space-y-6">
            <Button
              asChild
              size="lg"
              className="w-full h-14 text-base font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #E67E22 0%, #D35400 100%)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(230, 126, 34, 0.4)",
              }}
            >
              <a href="/api/auth/discogs" className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                </svg>
                Connect with Discogs
              </a>
            </Button>

            {/* Permissions list */}
            <div className="text-sm text-gray-500">
              <p className="mb-3">By connecting, you allow DeepCogs to:</p>
              <ul className="space-y-2">
                {["View your collection", "View your wantlist", "Read your profile info"].map(
                  (permission) => (
                    <li key={permission} className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 flex-shrink-0 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{permission}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Create account link */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Don&apos;t have a Discogs account?{" "}
                <a
                  href="https://www.discogs.com/users/create"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-700 underline hover:no-underline font-medium"
                >
                  Create one free
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="space-y-2">
          <p className="text-sm text-gray-500">
            Your data stays private. We never modify your collection.
          </p>
          <p className="text-xs text-gray-400">
            Data via{" "}
            <a
              href="https://discogs.com"
              className="underline hover:no-underline hover:text-gray-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discogs
            </a>
            . Not affiliated.
          </p>
        </footer>
      </div>

      {/* RIGHT PANEL - Value Proposition */}
      <div
        className="lg:w-1/2 min-h-screen relative overflow-hidden flex items-center justify-center p-8 lg:p-16"
        style={{
          background: "linear-gradient(135deg, #1a1410 0%, #0d0a08 50%, #1a1410 100%)",
        }}
      >
        {/* Decorative vinyl grooves */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              repeating-radial-gradient(
                circle at 50% 35%,
                transparent 0px,
                transparent 60px,
                rgba(230, 126, 34, 0.15) 61px,
                transparent 62px
              )
            `,
          }}
        />

        {/* Floating accent shapes */}
        <div
          className="absolute top-16 right-16 w-32 h-32 rounded-full blur-3xl opacity-60"
          style={{ background: "rgba(230, 126, 34, 0.5)" }}
        />
        <div
          className="absolute bottom-24 left-12 w-40 h-40 rounded-full blur-3xl opacity-40"
          style={{ background: "rgba(211, 84, 0, 0.4)" }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-lg">
          {/* Vinyl illustration */}
          <div className="mb-10 flex justify-center">
            <div className="relative">
              {/* Vinyl record */}
              <div
                className="w-56 h-56 lg:w-72 lg:h-72 rounded-full animate-spin-slow relative"
                style={{
                  background: `
                    radial-gradient(circle at center,
                      #0a0a0a 0%,
                      #0a0a0a 14%,
                      #1a1a1a 15%,
                      #0f0f0f 16%,
                      #1a1a1a 17%,
                      #0f0f0f 18%,
                      #1a1a1a 25%,
                      #0f0f0f 26%,
                      #1a1a1a 35%,
                      #0f0f0f 36%,
                      #1a1a1a 45%,
                      #0f0f0f 46%,
                      #141414 100%
                    )
                  `,
                  boxShadow: `
                    0 0 0 3px #2a2a2a,
                    0 0 80px rgba(230, 126, 34, 0.3),
                    0 20px 60px rgba(0, 0, 0, 0.6),
                    inset 0 0 40px rgba(0, 0, 0, 0.8)
                  `,
                }}
              >
                {/* Vinyl shine/reflection */}
                <div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
                  }}
                />

                {/* Center label */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #E67E22 0%, #D35400 100%)",
                    boxShadow: "inset 0 2px 10px rgba(0,0,0,0.4), 0 0 20px rgba(230,126,34,0.5)",
                  }}
                >
                  {/* Label texture */}
                  <div
                    className="absolute inset-2 rounded-full opacity-20"
                    style={{
                      background: "repeating-radial-gradient(circle at center, transparent 0px, transparent 2px, rgba(0,0,0,0.1) 3px, transparent 4px)",
                    }}
                  />
                  {/* Spindle hole */}
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: "#1a1a1a",
                      boxShadow: "inset 0 1px 3px rgba(0,0,0,0.8)",
                    }}
                  />
                </div>
              </div>

              {/* DNA helix overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg
                  viewBox="0 0 100 100"
                  className="w-40 h-40 lg:w-52 lg:h-52"
                  style={{ filter: "drop-shadow(0 0 15px rgba(230, 126, 34, 0.6))" }}
                >
                  {/* Helix strand 1 */}
                  <path
                    d="M30 15 Q50 30 70 15 Q50 30 30 45 Q50 60 70 45 Q50 60 30 75 Q50 90 70 75"
                    fill="none"
                    stroke="#E67E22"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                  {/* Helix strand 2 */}
                  <path
                    d="M70 15 Q50 30 30 15 Q50 30 70 45 Q50 60 30 45 Q50 60 70 75 Q50 90 30 75"
                    fill="none"
                    stroke="#F39C12"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                  {/* Connection dots */}
                  {[22, 37, 52, 67, 82].map((y, i) => (
                    <g key={i}>
                      <circle
                        cx={i % 2 === 0 ? 38 : 62}
                        cy={y}
                        r="4"
                        fill="#E67E22"
                      />
                      <circle
                        cx={i % 2 === 0 ? 62 : 38}
                        cy={y}
                        r="4"
                        fill="#F39C12"
                      />
                      {/* Connecting line */}
                      <line
                        x1={i % 2 === 0 ? 38 : 62}
                        y1={y}
                        x2={i % 2 === 0 ? 62 : 38}
                        y2={y}
                        stroke="rgba(230,126,34,0.4)"
                        strokeWidth="1"
                      />
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* Value prop text */}
          <div className="text-center">
            <h2
              className="text-3xl lg:text-4xl mb-4 text-white"
              style={{ fontFamily: "var(--font-serif), 'Times New Roman', serif" }}
            >
              Your Musical DNA
            </h2>
            <p className="text-lg leading-relaxed mb-8 text-gray-400">
              Genre breakdowns, decade distributions, label obsessions—see the
              patterns that make your collection uniquely yours.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {["Genre DNA", "Compare Friends", "Find Gaps", "Get Recommendations"].map(
                (feature) => (
                  <span
                    key={feature}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
                    style={{
                      background: "rgba(230, 126, 34, 0.15)",
                      color: "#E67E22",
                      border: "1px solid rgba(230, 126, 34, 0.3)",
                    }}
                  >
                    {feature}
                  </span>
                )
              )}
            </div>

            {/* Page indicators */}
            <div className="flex justify-center gap-2 mt-10">
              <div
                className="w-8 h-2 rounded-full"
                style={{ background: "#E67E22" }}
              />
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "rgba(255,255,255,0.2)" }}
              />
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "rgba(255,255,255,0.2)" }}
              />
            </div>
          </div>
        </div>

        {/* Corner accent */}
        <div
          className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none"
          style={{
            background: "radial-gradient(circle at bottom right, rgba(230,126,34,0.1) 0%, transparent 70%)",
          }}
        />
      </div>
    </main>
  );
}
