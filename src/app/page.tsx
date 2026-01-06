import { Button } from "@/components/ui/button";
import { VinylRecord } from "@/components/vinyl-record";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, oklch(0.18 0.03 45 / 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, oklch(0.20 0.02 30 / 0.5) 0%, transparent 50%),
            oklch(0.12 0.015 30)
          `,
        }}
      />

      {/* Floating records decoration */}
      <div className="fixed top-10 -right-20 opacity-20 blur-sm">
        <VinylRecord size={400} spinning />
      </div>
      <div className="fixed -bottom-32 -left-32 opacity-10 blur-sm">
        <VinylRecord size={500} spinning />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-24">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Vinyl DNA</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              How it works
            </Link>
            <Button asChild>
              <Link href="/login">Connect Discogs</Link>
            </Button>
          </nav>
        </header>

        {/* Hero section */}
        <section className="grid lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Powered by Discogs API
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              Discover your
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, oklch(0.80 0.16 55) 0%, oklch(0.65 0.18 45) 100%)",
                }}
              >
                musical DNA
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
              Analyze your vinyl collection, uncover patterns in your taste, and
              see how your music aligns with friends. What does your record shelf
              say about you?
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="glow-amber" asChild>
                <Link href="/login">
                  Connect Your Collection
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">See Demo</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-12 pt-8 border-t border-border">
              <div>
                <div className="text-3xl font-bold text-primary">15M+</div>
                <div className="text-sm text-muted-foreground">Releases in database</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">8M+</div>
                <div className="text-sm text-muted-foreground">Active collectors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Free to use</div>
              </div>
            </div>
          </div>

          {/* Vinyl visualization */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <VinylRecord size={420} spinning />
              {/* DNA helix overlay hint */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at center, oklch(0.75 0.15 55 / 0.1) 0%, transparent 70%)",
                }}
              />
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Three ways to explore</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your vinyl collection is more than records—it&apos;s a map of your
              musical journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
              <div
                className="w-14 h-14 rounded-xl mb-6 flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.18 45) 0%, oklch(0.60 0.15 40) 100%)",
                }}
              >
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Collection DNA</h3>
              <p className="text-muted-foreground leading-relaxed">
                Visualize your collection&apos;s genre breakdown, decade
                distribution, top labels, and discover blind spots in your
                musical taste.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
              <div
                className="w-14 h-14 rounded-xl mb-6 flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.14 180) 0%, oklch(0.50 0.12 175) 100%)",
                }}
              >
                <svg
                  className="w-7 h-7 text-white"
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
              </div>
              <h3 className="text-xl font-bold mb-3">Compare Collections</h3>
              <p className="text-muted-foreground leading-relaxed">
                See how your taste aligns with friends. Find overlapping
                records, discover what they have that you don&apos;t, and spot
                trade opportunities.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
              <div
                className="w-14 h-14 rounded-xl mb-6 flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.80 0.16 85) 0%, oklch(0.65 0.14 80) 100%)",
                }}
              >
                <svg
                  className="w-7 h-7 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Recommendations</h3>
              <p className="text-muted-foreground leading-relaxed">
                Based on your DNA profile, discover releases that fill gaps in
                your collection. Expand your horizons with personalized
                suggestions.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple setup</h2>
            <p className="text-muted-foreground text-lg">
              Connect your Discogs account and start exploring in seconds
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {[
              { step: "01", title: "Connect", desc: "Link your Discogs account" },
              { step: "02", title: "Analyze", desc: "We scan your collection" },
              { step: "03", title: "Discover", desc: "Explore your musical DNA" },
            ].map((item, i) => (
              <div key={item.step} className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-6xl font-bold text-muted-foreground/20 mb-2">
                    {item.step}
                  </div>
                  <div className="text-xl font-bold">{item.title}</div>
                  <div className="text-muted-foreground">{item.desc}</div>
                </div>
                {i < 2 && (
                  <svg
                    className="w-8 h-8 text-muted-foreground/30 hidden md:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-32">
          <div
            className="rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
            style={{
              background: `
                radial-gradient(ellipse at top, oklch(0.25 0.04 45) 0%, oklch(0.16 0.02 30) 100%)
              `,
            }}
          >
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to discover your DNA?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of collectors who&apos;ve uncovered new insights
                about their musical taste.
              </p>
              <Button size="lg" className="glow-amber" asChild>
                <Link href="/login">
                  Get Started Free
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </Button>
            </div>

            {/* Background decoration */}
            <div className="absolute -right-20 -bottom-20 opacity-10">
              <VinylRecord size={400} />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">V</span>
              </div>
              <span className="font-bold">Vinyl DNA</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Data provided by{" "}
              <a
                href="https://www.discogs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Discogs
              </a>
              . Not affiliated with Discogs.
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
