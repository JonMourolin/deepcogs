# Roadmap

Feature ideas and improvements for DeepCogs.

## Completed

- [x] **Wantlist Integration** - Add releases to Discogs wantlist from recommendations
- [x] **Deep Cut Finder** - Discover rare releases (test pressings, promos, limited editions)
- [x] **Shareable DNA Cards** - Download collection DNA as PNG for social sharing
- [x] **Trade Finder** - Bidirectional matching: what you can offer + what they can offer
- [x] **OG vs Repress** - Show original pressings vs represses breakdown

## Removed

- ~~Country Distribution~~ - Removed (added complexity without enough value)
- ~~Progressive Loading~~ - Removed (degraded UX)

## Known Issues

### Recommendations: Genre Mismatch Problem

**Issue:** Recommendations can show releases from unrelated genres. Example: The Beatles appearing under "Deep House" as "Similar to Melchior Sultana".

**Root Cause:** The recommendation flow is:
1. Identify top styles from user's collection (e.g., "Deep House")
2. Get artists from each style (e.g., Melchior Sultana)
3. Query Last.fm `artist.getSimilar` API for similar artists
4. Search Discogs for releases by those similar artists
5. Group results by the **original** style

The problem: Last.fm's similar artist matching is **genre-agnostic** - it's based on listener overlap and popularity, not musical style. So rock artists can be returned as "similar" to electronic artists.

**Current code:** `src/app/api/recommendations/route.ts:145-149` searches Discogs by artist name only, with no style filter applied.

**Potential Solutions:**

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| **A. `tag.getTopArtists`** | Use Last.fm's tag-based endpoint instead of similarity | Results guaranteed genre-relevant | Less personalized, not based on user's specific artists |
| **B. Filter by artist tags** | Call `artist.getTopTags` for each similar artist, filter by matching genre | Keeps personalization | More API calls, slower |
| **C. Filter Discogs results** | Check if returned release's `style[]` contains target style | Simple to implement | May reduce results, style names may not match exactly |
| **D. Hybrid scoring** | Weight results by genre match + similarity score | Balanced approach | More complex logic |

**Decision:** TBD - none of the options are fully satisfying yet.

---

## Ideas

### Collection Rediscovery
Smart groupings to rediscover your collection based on style, niche, era, time period, or geography. Examples: Zouk, Spiritual Jazz, French 90s Urban Rap, Grunge Era, UK Garage from the UK.
