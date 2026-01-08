# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Investigate Before Answering

Never speculate about code you have not opened. If the user references a specific file, you MUST read the file before answering. Make sure to investigate and read relevant files BEFORE answering questions about the codebase. Never make any claims about code before investigating unless you are certain of the correct answer — give grounded and hallucination-free answers.

## Commands

```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Architecture

DeepCogs is a Next.js 16 App Router application that analyzes Discogs vinyl record collections. It uses Discogs OAuth 1.0a for authentication and stores session data in HTTP-only cookies (no database).

### Core Data Flow

1. User authenticates via Discogs OAuth → tokens stored in cookies
2. Collection fetched from Discogs API → analyzed client-side
3. DNA/comparison/recommendations calculated from collection data

### Key Files

**Authentication:**
- `src/lib/discogs.ts` - Discogs API client with OAuth 1.0a implementation (PLAINTEXT signature method)
- `src/app/api/auth/discogs/route.ts` - Initiates OAuth, stores token secret in cookie
- `src/app/api/auth/discogs/callback/route.ts` - Exchanges verifier for access tokens
- `src/app/api/auth/logout/route.ts` - Clears auth cookies and redirects to home

**API Routes:**
- `src/app/api/collection/route.ts` - Fetches user collection (paginated)
- `src/app/api/release/[id]/route.ts` - Fetches single release details (country, year)
- `src/app/api/wantlist/route.ts` - Add/remove releases from wantlist (POST/DELETE)
- `src/app/api/wantlist/[username]/route.ts` - Fetches a user's wantlist
- `src/app/api/recommendations/route.ts` - Generates recommendations using genre/style analysis
- `src/app/api/lastfm/similar/route.ts` - Queries Last.fm API for similar artists

**Feature Components:**
- `src/components/dna-charts.tsx` - Genre pie chart, decade bar chart, top labels (uses Recharts)
- `src/components/collection-compare.tsx` - Compare collections between two users using `master_id` matching
- `src/components/friend-compare.tsx` - Advanced comparison with cosine similarity scoring, style analysis, trade opportunities
- `src/components/trade-finder.tsx` - Bidirectional trade matching between collections/wantlists
- `src/components/recommendations.tsx` - Display recommendations with release cards
- `src/components/vinyl-record.tsx` - Animated vinyl record visualization component

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
LASTFM_API_KEY=xxx              # Optional: enables similar artist recommendations
```

### Styling

Uses Tailwind CSS 4 with OKLCH color palette. Theme colors defined in `src/app/globals.css` use warm amber/orange tones (vinyl-inspired dark theme).

## Git Workflow

**NEVER commit directly to main. NEVER merge without user approval.**

### Branch Strategy

```
main                    # Production-ready code
├── feature/xxx         # New features
├── fix/xxx             # Bug fixes
└── hotfix/xxx          # Urgent production fixes
```

### Workflow

1. **Sync main** before creating a branch (start from latest main to reduce conflicts):
   ```bash
   git checkout main
   git pull --rebase
   git checkout -b feature/feature-name
   ```
   Optional safety checks: `git status`, `git log --oneline -5`

2. **Commit** after completing logical units:
   ```bash
   git add -A
   git commit -m "feat: add wantlist integration"
   ```

3. **Push** to GitHub:
   ```bash
   git push -u origin feature/feature-name
   ```

4. **Create PR** on GitHub:
   ```bash
   gh pr create --title "feat: ..." --body "..."
   ```

5. **STOP. Wait for user approval.**
   - User will test the changes
   - User will say "merge" or give approval
   - **NEVER run `gh pr merge` without explicit user approval**

6. **Merge** only after user says to:
   ```bash
   gh pr merge <number> --merge
   ```

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

**Goal:** Ensure the Git tag (e.g. v1.2.3) points to the exact commit that is on main.

1. **Create release branch:**
   ```bash
   git checkout main
   git pull --rebase
   git checkout -b chore/release-x.x.x
   ```

2. **Update CHANGELOG.md**, then commit:
   ```bash
   git add CHANGELOG.md
   git commit -m "docs: update changelog for vX.X.X"
   ```

3. **Push and open a PR:**
   ```bash
   git push -u origin chore/release-x.x.x
   gh pr create --title "chore(release): vX.X.X" --body "Release vX.X.X"
   ```

4. **STOP. Wait for user approval.**
   After approval, merge the PR on GitHub (or via CLI if allowed).

5. **After PR is merged**, switch back to main and pull:
   ```bash
   git checkout main
   git pull --rebase
   ```

6. **Bump version and create tag on main:**
   ```bash
   npm version patch|minor|major
   ```

7. **Push the commit and tag:**
   ```bash
   git push
   git push --tags
   ```

8. **(Optional)** Verify tag points to main HEAD:
   ```bash
   git show --no-patch --decorate
   git tag --points-at HEAD
   ```

### Deploying

**NEVER deploy without user approval.** Vercel auto-deploys from main, so merging = deploying. Always wait for user to approve merge.
