# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 App Router application that analyzes Discogs vinyl record collections. It uses Discogs OAuth 1.0a for authentication and stores session data in HTTP-only cookies (no database).

### Core Data Flow

1. User authenticates via Discogs OAuth → tokens stored in cookies
2. Collection fetched from Discogs API → analyzed client-side
3. DNA/comparison/recommendations calculated from collection data

### Key Files

**Authentication:**
- `src/lib/discogs.ts` - Discogs API client with OAuth 1.0a implementation (PLAINTEXT signature method)
- `src/app/api/auth/discogs/route.ts` - Initiates OAuth, stores token secret in cookie
- `src/app/api/auth/discogs/callback/route.ts` - Exchanges verifier for access tokens

**API Routes:**
- `src/app/api/collection/route.ts` - Fetches user collection (up to 500 releases, paginated)
- `src/app/api/recommendations/route.ts` - Searches Discogs for recommendations based on genre gaps

**Feature Components:**
- `src/components/dna-charts.tsx` - Genre pie chart, decade bar chart, top labels (uses Recharts)
- `src/components/collection-compare.tsx` - Compare collections between two users using `master_id` matching
- `src/components/recommendations.tsx` - Display recommendations with release cards

### Discogs API Notes

- Rate limit: 60 requests/minute (authenticated)
- Collection comparison uses `master_id` to match same albums across different pressings
- Public collections can be fetched without user auth using `createSimpleDiscogsClient`

### Environment Variables

Required in `.env.local`:
```
DISCOGS_CONSUMER_KEY=xxx
DISCOGS_CONSUMER_SECRET=xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Styling

Uses Tailwind CSS 4 with OKLCH color palette. Theme colors defined in `src/app/globals.css` use warm amber/orange tones (vinyl-inspired dark theme).

## Git Workflow

### Branch Strategy

```
main                    # Production-ready code
├── feature/xxx         # New features
├── fix/xxx             # Bug fixes
└── hotfix/xxx          # Urgent production fixes
```

### Workflow

1. **Create branch** before starting work:
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Commit** after completing logical units:
   ```bash
   git add -A
   git commit -m "feat: add wantlist integration"
   ```

3. **Push** to GitHub:
   ```bash
   git push -u origin feature/feature-name
   ```

4. **Create PR** on GitHub to merge into `main`

5. **Delete branch** after merge

### Commit Message Format

```
<type>: <description>

Types:
- feat:     New feature
- fix:      Bug fix
- docs:     Documentation
- style:    Formatting (no code change)
- refactor: Code restructuring
- test:     Adding tests
- chore:    Maintenance
```

### Releasing a Version

1. Merge PR into `main`
2. Update `CHANGELOG.md` with new version entry
3. Commit changelog: `git add CHANGELOG.md && git commit -m "docs: update changelog for vX.X.X"`
4. Bump version: `npm version patch|minor|major -m "chore: release v%s"`
   - This updates both `package.json` and `package-lock.json`
   - Creates a git commit and tag automatically
5. Push: `git push && git push --tags`

**Important:** Always verify `package.json`, `package-lock.json`, and `CHANGELOG.md` versions are in sync before pushing.
