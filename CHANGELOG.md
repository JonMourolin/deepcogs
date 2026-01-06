# Changelog

All notable changes to DeepCogs will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
| 0.1.1 | 2026-01-06 | Fix duplicate OAuth user count |
| 0.1.0 | 2026-01-06 | Initial release with DNA analyzer, collection compare, and recommendations |
