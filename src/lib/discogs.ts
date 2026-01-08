/**
 * Discogs API Client
 *
 * Handles OAuth 1.0a authentication and API requests to Discogs.
 * Rate limit: 60 requests/minute (authenticated)
 */

const DISCOGS_API_BASE = "https://api.discogs.com";
const DISCOGS_REQUEST_TOKEN_URL = "https://api.discogs.com/oauth/request_token";
const DISCOGS_AUTHORIZE_URL = "https://www.discogs.com/oauth/authorize";
const DISCOGS_ACCESS_TOKEN_URL = "https://api.discogs.com/oauth/access_token";

export interface DiscogsUser {
  id: number;
  username: string;
  resource_url: string;
  consumer_name: string;
  avatar_url?: string;
}

export interface DiscogsRelease {
  id: number;
  instance_id: number;
  date_added: string;
  rating: number;
  basic_information: {
    id: number;
    master_id: number;
    master_url: string;
    title: string;
    year: number;
    thumb: string;
    cover_image: string;
    formats: Array<{
      name: string;
      qty: string;
      descriptions?: string[];
    }>;
    labels: Array<{
      name: string;
      catno: string;
      resource_url: string;
      id: number;
    }>;
    artists: Array<{
      name: string;
      id: number;
      resource_url: string;
    }>;
    genres: string[];
    styles: string[];
  };
}

export interface DiscogsCollection {
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
  };
  releases: DiscogsRelease[];
}

export interface OAuthTokens {
  oauth_token: string;
  oauth_token_secret: string;
}

export interface AccessTokens extends OAuthTokens {
  username?: string;
}

/**
 * Generate OAuth 1.0a signature base string
 */
function generateNonce(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Create OAuth 1.0a Authorization header
 */
function createOAuthHeader(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  token?: string,
  tokenSecret?: string,
  verifier?: string
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = generateNonce();

  const params: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: "PLAINTEXT",
    oauth_timestamp: timestamp,
    oauth_version: "1.0",
  };

  if (token) {
    params.oauth_token = token;
  }

  if (verifier) {
    params.oauth_verifier = verifier;
  }

  // PLAINTEXT signature = consumer_secret&token_secret
  const signature = `${encodeURIComponent(consumerSecret)}&${
    tokenSecret ? encodeURIComponent(tokenSecret) : ""
  }`;
  params.oauth_signature = signature;

  const headerParts = Object.entries(params)
    .map(([key, value]) => `${key}="${encodeURIComponent(value)}"`)
    .join(", ");

  return `OAuth ${headerParts}`;
}

/**
 * Request a temporary OAuth token from Discogs
 */
export async function getRequestToken(
  consumerKey: string,
  consumerSecret: string,
  callbackUrl: string
): Promise<OAuthTokens> {
  const authHeader = createOAuthHeader(
    "GET",
    DISCOGS_REQUEST_TOKEN_URL,
    consumerKey,
    consumerSecret
  );

  const response = await fetch(
    `${DISCOGS_REQUEST_TOKEN_URL}?oauth_callback=${encodeURIComponent(
      callbackUrl
    )}`,
    {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "DeepCogs/1.0",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get request token: ${text}`);
  }

  const text = await response.text();
  const params = new URLSearchParams(text);

  return {
    oauth_token: params.get("oauth_token") || "",
    oauth_token_secret: params.get("oauth_token_secret") || "",
  };
}

/**
 * Get the authorization URL for the user to visit
 */
export function getAuthorizeUrl(oauthToken: string): string {
  return `${DISCOGS_AUTHORIZE_URL}?oauth_token=${oauthToken}`;
}

/**
 * Exchange the verifier for access tokens
 */
export async function getAccessToken(
  consumerKey: string,
  consumerSecret: string,
  oauthToken: string,
  oauthTokenSecret: string,
  verifier: string
): Promise<AccessTokens> {
  const authHeader = createOAuthHeader(
    "POST",
    DISCOGS_ACCESS_TOKEN_URL,
    consumerKey,
    consumerSecret,
    oauthToken,
    oauthTokenSecret,
    verifier
  );

  const response = await fetch(DISCOGS_ACCESS_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "DeepCogs/1.0",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get access token: ${text}`);
  }

  const text = await response.text();
  const params = new URLSearchParams(text);

  return {
    oauth_token: params.get("oauth_token") || "",
    oauth_token_secret: params.get("oauth_token_secret") || "",
  };
}

/**
 * Create an authenticated Discogs API client
 */
export function createDiscogsClient(
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessTokenSecret: string
) {
  async function makeRequest<T>(
    endpoint: string,
    method: string = "GET"
  ): Promise<T> {
    const url = `${DISCOGS_API_BASE}${endpoint}`;
    const authHeader = createOAuthHeader(
      method,
      url,
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret
    );

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: authHeader,
        "User-Agent": "DeepCogs/1.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Discogs API error: ${response.status} - ${text}`);
    }

    return response.json();
  }

  return {
    /**
     * Get the authenticated user's identity
     */
    async getIdentity(): Promise<DiscogsUser> {
      return makeRequest<DiscogsUser>("/oauth/identity");
    },

    /**
     * Get a user's profile
     */
    async getUser(username: string): Promise<DiscogsUser> {
      return makeRequest<DiscogsUser>(`/users/${username}`);
    },

    /**
     * Get a user's collection (paginated)
     */
    async getCollection(
      username: string,
      folderId: number = 0,
      page: number = 1,
      perPage: number = 50
    ): Promise<DiscogsCollection> {
      return makeRequest<DiscogsCollection>(
        `/users/${username}/collection/folders/${folderId}/releases?page=${page}&per_page=${perPage}&sort=added&sort_order=desc`
      );
    },

    /**
     * Get all releases from a user's collection
     */
    async getAllCollection(username: string): Promise<DiscogsRelease[]> {
      const allReleases: DiscogsRelease[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await this.getCollection(username, 0, page, 100);
        allReleases.push(...response.releases);

        if (page >= response.pagination.pages) {
          hasMore = false;
        } else {
          page++;
          // Small delay to respect rate limits
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      return allReleases;
    },

    /**
     * Get a user's wantlist (paginated)
     */
    async getWantlist(
      username: string,
      page: number = 1,
      perPage: number = 50
    ): Promise<{
      pagination: DiscogsCollection["pagination"];
      wants: DiscogsRelease[];
    }> {
      return makeRequest(
        `/users/${username}/wants?page=${page}&per_page=${perPage}`
      );
    },

    /**
     * Get release details
     */
    async getRelease(releaseId: number): Promise<unknown> {
      return makeRequest(`/releases/${releaseId}`);
    },

    /**
     * Search the database with optional filters
     */
    async search(
      query: string,
      type?: string,
      options?: {
        format?: string;
        sort?: "year" | "title" | "have" | "want";
        sort_order?: "asc" | "desc";
      }
    ): Promise<unknown> {
      const params = new URLSearchParams({ q: query });
      if (type) params.append("type", type);
      if (options?.format) params.append("format", options.format);
      if (options?.sort) params.append("sort", options.sort);
      if (options?.sort_order) params.append("sort_order", options.sort_order);
      return makeRequest(`/database/search?${params.toString()}`);
    },

    /**
     * Add a release to the user's wantlist
     */
    async addToWantlist(
      username: string,
      releaseId: number
    ): Promise<{ id: number; rating: number; notes: string }> {
      return makeRequest(`/users/${username}/wants/${releaseId}`, "PUT");
    },

    /**
     * Remove a release from the user's wantlist
     */
    async removeFromWantlist(
      username: string,
      releaseId: number
    ): Promise<void> {
      return makeRequest(`/users/${username}/wants/${releaseId}`, "DELETE");
    },
  };
}

/**
 * Create a simple Discogs client using key/secret (no user auth)
 */
export function createSimpleDiscogsClient(
  consumerKey: string,
  consumerSecret: string
) {
  async function makeRequest<T>(
    endpoint: string,
    method: string = "GET"
  ): Promise<T> {
    const url = `${DISCOGS_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Discogs key=${consumerKey}, secret=${consumerSecret}`,
        "User-Agent": "DeepCogs/1.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Discogs API error: ${response.status} - ${text}`);
    }

    return response.json();
  }

  return {
    /**
     * Get a user's public collection (no auth needed for public collections)
     */
    async getPublicCollection(
      username: string,
      folderId: number = 0,
      page: number = 1,
      perPage: number = 50
    ): Promise<DiscogsCollection> {
      return makeRequest<DiscogsCollection>(
        `/users/${username}/collection/folders/${folderId}/releases?page=${page}&per_page=${perPage}&sort=added&sort_order=desc`
      );
    },

    /**
     * Get all releases from a user's public collection
     */
    async getAllPublicCollection(username: string): Promise<DiscogsRelease[]> {
      const allReleases: DiscogsRelease[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await this.getPublicCollection(username, 0, page, 100);
        allReleases.push(...response.releases);

        if (page >= response.pagination.pages) {
          hasMore = false;
        } else {
          page++;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      return allReleases;
    },

    /**
     * Get a user's profile
     */
    async getUser(username: string): Promise<DiscogsUser> {
      return makeRequest<DiscogsUser>(`/users/${username}`);
    },

    /**
     * Search the database
     */
    async search(query: string, type?: string): Promise<unknown> {
      const params = new URLSearchParams({ q: query });
      if (type) params.append("type", type);
      return makeRequest(`/database/search?${params.toString()}`);
    },
  };
}
