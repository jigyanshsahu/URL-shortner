export interface ShortenedUrl {
  id?: number | string;
  short_code: string;
  original_url: string;
  created_at?: string;
  click_count?: number;
}

export interface CreateUrlResponse {
  shortUrl: string;
  originalUrl: string;
  existing?: boolean;
  error?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Normalizes input URL by adding https:// if protocol is missing
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Validates whether a string is a valid URL
 */
export function isValidUrl(input: string): boolean {
  try {
    const urlWithProtocol = normalizeUrl(input);
    const parsed = new URL(urlWithProtocol);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Creates a shortened URL via backend API
 */
export async function createShortUrl(url: string): Promise<CreateUrlResponse> {
  const normalized = normalizeUrl(url);

  try {
    const response = await fetch(`${API_BASE_URL}/api/urls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: normalized }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to connect to backend server";
    console.error("API Error in createShortUrl:", err);
    throw new Error(message);
  }
}

/**
 * Fetches all shortened URLs and analytics from the backend
 */
export async function fetchUrls(): Promise<ShortenedUrl[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/urls`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URLs: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Could not fetch URLs from backend:", err);
    return [];
  }
}
