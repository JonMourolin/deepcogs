# Changelog

All notable changes to DeepCogs will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
| 0.3.1 | 2026-01-07 | Bidirectional Trade Finder, removed Country Distribution & Progressive Loading |
| 0.3.0 | 2026-01-06 | Wantlist integration, deep cuts, shareable cards, trade finder |
| 0.2.1 | 2026-01-06 | Fix recommendations timeout on Vercel |
| 0.2.0 | 2026-01-06 | Rename to DeepCogs |
| 0.1.1 | 2026-01-06 | Fix duplicate OAuth user count |
| 0.1.0 | 2026-01-06 | Initial release with DNA analyzer, collection compare, and recommendations |
