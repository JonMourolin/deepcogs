import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vinyl DNA | Discover Your Musical Identity",
  description:
    "Analyze your record collection, discover your musical DNA, and compare taste with friends. Powered by Discogs.",
  keywords: [
    "vinyl",
    "records",
    "discogs",
    "collection",
    "music",
    "DNA",
    "analysis",
  ],
  authors: [{ name: "Vinyl DNA" }],
  openGraph: {
    title: "Vinyl DNA | Discover Your Musical Identity",
    description:
      "Analyze your record collection, discover your musical DNA, and compare taste with friends.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
