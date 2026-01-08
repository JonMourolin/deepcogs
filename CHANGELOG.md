# Changelog

All notable changes to DeepCogs will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.3] - 2026-01-08

### Documentation
- Updated CLAUDE.md with new API routes, components, and improved git workflow
- Documented recommendation genre mismatch issue in ROADMAP.md with potential solutions

---

## [0.6.2] - 2026-01-08

### Added
- **User Profile Caching**: Avatar and collection count stored at login
- **Loading Progress**: Shows "Loading 45/234..." during collection fetch
- **Recommendations Caching**: localStorage with 24h TTL, refresh button
- **Collection Caching**: localStorage with 24h TTL for instant page loads

### Changed
- Style Breakdown now shows 15 sub-genres (was 10)

### Fixed
- Avatar field name from Discogs API

---

## [0.6.1] - 2026-01-08

### Added
- **Smart Recommendations**: Uses Last.fm similar artists for better discovery
- **Style-Based Compatibility**: Cosine similarity algorithm for accurate taste matching
- **Compatibility Scale**: Visual scale showing how similar two collections are
- **Biggest Differences**: Highlights where musical tastes diverge most

### Changed
- Recommendations now filter for vinyl-only and sort by popularity
- Comparison shows only "In Common" tab (removed Only You/Only Them)
- Exclude Various/VA from top artists, show 6 styles instead of 3
- Improved comparison UX with explanations, legend, and score breakdown

### Removed
- **Shareable DNA Card**: Removed download-as-image feature

---

## [0.6.0] - 2026-01-08

### Changed
- **Admin-Style Dashboard**: Complete redesign with fixed sidebar navigation
  - Stat cards at top (Total Releases, Top Genre, Top Decade, Top Label)
  - Vertical navigation with icons replacing horizontal tabs
  - Consistent light theme across all components
- **Elegant Landing Page**: Refined split-screen design
  - Full-bleed vinyl collection image on left panel
  - Clean white background with centered login form on right
  - Serif typography for headings

### Fixed
- Theme consistency: All dashboard components now use light theme (white cards, gray borders)

---

## [0.5.0] - 2026-01-07

### Changed
- **Landing Page Redesign**: New split-screen layout with login on left, value proposition on right
- Added Instrument Serif font for elegant headlines
- OAuth button now links directly to Discogs (removes intermediate login dialog)
- Animated vinyl record with DNA helix overlay on landing page

---

## [0.4.0] - 2026-01-07

### Added
- **OG vs Repress Detection**: Identify original pressings vs represses via format keywords

### Changed
- **Oddities moved to DNA**: Test Pressings, Promos, and Limited Editions now display in DNA tab
- **Simplified navigation**: Reduced from 4 tabs to 3 (DNA, Compare, Discover)
- Renamed section to "Oddities & Pressings" with 5-column layout

### Removed
- **Deep Cuts tab**: Removed as a separate tab, functionality merged into DNA

---

## [0.3.1] - 2026-01-07

### Changed
- **Trade Finder**: Now bidirectional - shows what you can offer AND what they can offer you
- Added warning about public Discogs account requirement

### Removed
- **Country Distribution**: Removed (added complexity without enough value)
- **Progressive Loading**: Removed (degraded UX) - collections now load fully automatically

### Documentation
- Added ROADMAP.md with feature ideas
- Updated CLAUDE.md with investigation guidelines

---

## [0.3.0] - 2026-01-06

### Added
- **Wantlist Integration**: Add releases to your Discogs wantlist directly from recommendations
- **Deep Cut Finder**: Discover rare and collectible releases in your collection (test pressings, promos, limited editions)
- **Shareable DNA Cards**: Download your collection DNA as a PNG image to share on social media
- **Trade Finder**: Find records you own that match a friend's wantlist

### Technical
- New API routes: `/api/wantlist`, `/api/wantlist/[username]`, `/api/release/[id]`
- Added `html-to-image` dependency for shareable cards
- Collection API now supports pagination

---

## [0.2.1] - 2026-01-06

### Fixed
- Fix recommendations failing on Vercel (timeout issue)
- Parallelize recommendation searches for faster response

### Added
- `vercel.json` with 30s function timeout

---

## [0.2.0] - 2026-01-06

### Changed
- Renamed project from "Vinyl DNA" to "DeepCogs"
- Updated branding across all UI components
- Updated API User-Agent header

---

## [0.1.1] - 2026-01-06

### Fixed
- Skip OAuth flow if user is already authenticated (prevents duplicate user count in Discogs)

---

## [0.1.0] - 2026-01-06

### Added
- **Collection DNA Analyzer**: Visualize your genre breakdown, decade distribution, and top labels
- **Collection Compatibility Matcher**: Compare your collection with friends to find overlaps and trade opportunities
- **Smart Recommendations**: Discover releases based on gaps in your musical taste
- Discogs OAuth 1.0a authentication flow
- Vinyl-themed dark UI with warm amber/orange color palette
- Responsive design for mobile and desktop
- HTTP-only cookie session management (no database required)

### Technical
- Next.js 16 with App Router
- TypeScript 5
- Tailwind CSS 4 with custom theme
- Recharts for data visualization
- shadcn/ui component library

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 0.6.3 | 2026-01-08 | Documentation updates (CLAUDE.md, ROADMAP.md) |
| 0.6.2 | 2026-01-08 | Caching (profile, collection, recommendations), loading progress |
| 0.6.1 | 2026-01-08 | Smart recommendations, style-based compatibility, removed DNA card |
| 0.6.0 | 2026-01-08 | Admin-style dashboard, elegant landing page |
| 0.5.0 | 2026-01-07 | Landing page redesign with split-screen layout |
| 0.4.0 | 2026-01-07 | OG vs Repress detection, merged Oddities into DNA, removed Deep Cuts tab |
| 0.3.1 | 2026-01-07 | Bidirectional Trade Finder, removed Country Distribution & Progressive Loading |
| 0.3.0 | 2026-01-06 | Wantlist integration, deep cuts, shareable cards, trade finder |
| 0.2.1 | 2026-01-06 | Fix recommendations timeout on Vercel |
| 0.2.0 | 2026-01-06 | Rename to DeepCogs |
| 0.1.1 | 2026-01-06 | Fix duplicate OAuth user count |
| 0.1.0 | 2026-01-06 | Initial release with DNA analyzer, collection compare, and recommendations |
