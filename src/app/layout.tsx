import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Instrument_Serif } from "next/font/google";
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

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DeepCogs | Discover Your Musical Identity",
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
  authors: [{ name: "DeepCogs" }],
  openGraph: {
    title: "DeepCogs | Discover Your Musical Identity",
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
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} font-sans antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
