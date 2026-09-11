export interface ShortenedUrl {
  id: number | string;
  short_code: string;
  original_url: string;
  created_at: string;
  expires_at?: string | null;
  click_count: number;
}

export interface CreateUrlOptions {
  alias?: string;
  expiresAt?: string;
  token?: string | null;
}

export interface CreateUrlResponse {
  shortUrl: string;
  originalUrl: string;
  shortCode?: string;
  id?: number | string;
  expiresAt?: string | null;
  existing?: boolean;
  message?: string;
  error?: string;
}

export interface UrlAnalytics {
  url: {
    id: number | string;
    shortCode: string;
    originalUrl: string;
    totalClicks: number;
    createdAt: string;
    expiresAt?: string | null;
  };
  clicksToday: number;
  clicksByDay: {
    date: string;
    clicks: number;
  }[];
  topReferrers: {
    referrer: string;
    clicks: number;
  }[];
  recentClicks: {
    clicked_at: string;
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
  }[];
}

export interface QrCodeResponse {
  shortUrl: string;
  qrCode: string; // Base64 data URL
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Storage key for mock links when running in demo/offline mode
const MOCK_STORAGE_KEY = "shortly_mock_urls";

function getInitialMockUrls(): ShortenedUrl[] {
  return [
    {
      id: "mock-1",
      short_code: "launch26",
      original_url: "https://github.com/scalable-architecture/enterprise-shortener",
      created_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
      expires_at: new Date(Date.now() + 3600 * 1000 * 24 * 30).toISOString(),
      click_count: 342,
    },
    {
      id: "mock-2",
      short_code: "docs-v2",
      original_url: "https://nextjs.org/docs/app/building-your-application",
      created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
      expires_at: null,
      click_count: 189,
    },
    {
      id: "mock-3",
      short_code: "ai-trends",
      original_url: "https://arxiv.org/abs/2402.12345",
      created_at: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
      expires_at: new Date(Date.now() + 3600 * 1000 * 24 * 7).toISOString(),
      click_count: 76,
    },
  ];
}

function getStoredMockUrls(): ShortenedUrl[] {
  if (typeof window === "undefined") return getInitialMockUrls();
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialMockUrls();
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialMockUrls();
  }
}

function saveMockUrls(urls: ShortenedUrl[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(urls));
  } catch (e) {
    console.warn("Could not save mock URLs:", e);
  }
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

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
 * Register User API
 */
export async function registerApi(name: string, email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }
  return data;
}

/**
 * Login User API
 */
export async function loginApi(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Invalid email or password");
  }
  return data;
}

/**
 * Creates a shortened URL
 */
export async function createShortUrl(
  url: string,
  options?: CreateUrlOptions
): Promise<CreateUrlResponse> {
  const normalized = normalizeUrl(url);
  const isDemo = !options?.token || options.token.startsWith("demo-");

  if (!isDemo) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/urls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${options.token}`,
        },
        body: JSON.stringify({
          url: normalized,
          alias: options.alias?.trim() || undefined,
          expiresAt: options.expiresAt || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to shorten URL");
      }

      const shortCode = data.url?.short_code || options.alias;
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

      return {
        shortUrl: `${origin}/${shortCode}`,
        originalUrl: data.url?.original_url || normalized,
        shortCode,
        id: data.url?.id,
        expiresAt: data.url?.expires_at,
        existing: data.message === "URL already exists",
        message: data.message,
      };
    } catch (err) {
      console.warn("API unavailable, falling back to client mode:", err);
      // Fallback to offline/demo generation
    }
  }

  // Offline / Demo fallback
  const mockCode = options?.alias?.trim() || Math.random().toString(36).substring(2, 8);
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const newMockUrl: ShortenedUrl = {
    id: `mock-${Date.now()}`,
    short_code: mockCode,
    original_url: normalized,
    created_at: new Date().toISOString(),
    expires_at: options?.expiresAt || null,
    click_count: 0,
  };

  const stored = getStoredMockUrls();
  const existing = stored.find((u) => u.original_url === normalized);
  if (existing) {
    return {
      shortUrl: `${origin}/${existing.short_code}`,
      originalUrl: existing.original_url,
      shortCode: existing.short_code,
      id: existing.id,
      existing: true,
      message: "URL already exists in your library",
    };
  }

  saveMockUrls([newMockUrl, ...stored]);

  return {
    shortUrl: `${origin}/${mockCode}`,
    originalUrl: normalized,
    shortCode: mockCode,
    id: newMockUrl.id,
    expiresAt: newMockUrl.expires_at,
    existing: false,
    message: "URL shortened successfully",
  };
}

/**
 * Fetch all shortened URLs for the user
 */
export async function fetchUrls(token?: string | null): Promise<ShortenedUrl[]> {
  const isDemo = !token || token.startsWith("demo-");

  if (!isDemo && token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/urls`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (err) {
      console.warn("Could not fetch remote URLs, using local storage:", err);
    }
  }

  return getStoredMockUrls();
}

/**
 * Delete a shortened URL
 */
export async function deleteUrl(id: string | number, token?: string | null): Promise<boolean> {
  const isDemo = !token || token.startsWith("demo-");

  if (!isDemo && token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/urls/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return true;
      }
    } catch (err) {
      console.warn("Delete API error, falling back locally:", err);
    }
  }

  const stored = getStoredMockUrls();
  saveMockUrls(stored.filter((u) => String(u.id) !== String(id)));
  return true;
}

/**
 * Update an existing shortened URL
 */
export async function updateUrl(
  id: string | number,
  payload: { url: string; alias?: string; expiresAt?: string | null },
  token?: string | null
): Promise<ShortenedUrl> {
  const isDemo = !token || token.startsWith("demo-");

  if (!isDemo && token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/urls/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update URL");
      }
      return data.url;
    } catch (err) {
      console.warn("Update API error, using local fallback:", err);
    }
  }

  const stored = getStoredMockUrls();
  const index = stored.findIndex((u) => String(u.id) === String(id));
  if (index !== -1) {
    stored[index] = {
      ...stored[index],
      original_url: payload.url,
      short_code: payload.alias || stored[index].short_code,
      expires_at: payload.expiresAt || null,
    };
    saveMockUrls(stored);
    return stored[index];
  }
  throw new Error("URL not found");
}

/**
 * Fetch detailed analytics for a URL
 */
export async function fetchUrlAnalytics(
  id: string | number,
  token?: string | null
): Promise<UrlAnalytics> {
  const isDemo = !token || token.startsWith("demo-");

  if (!isDemo && token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/urls/${id}/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (err) {
      console.warn("Analytics API failed, using generated mock analytics:", err);
    }
  }

  // Generate realistic analytics for mock/demo presentation
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Today"];
  const clicksByDay = days.map((day, idx) => ({
    date: day,
    clicks: Math.floor(Math.random() * 45) + (idx === 6 ? 68 : 12),
  }));

  const total = clicksByDay.reduce((a, b) => a + b.clicks, 0);

  return {
    url: {
      id,
      shortCode: "preview",
      originalUrl: "https://example.com/demo-destination",
      totalClicks: total,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    clicksToday: clicksByDay[6].clicks,
    clicksByDay,
    topReferrers: [
      { referrer: "Direct / Bookmark", clicks: Math.round(total * 0.42) },
      { referrer: "Twitter / X", clicks: Math.round(total * 0.28) },
      { referrer: "LinkedIn", clicks: Math.round(total * 0.16) },
      { referrer: "Google Search", clicks: Math.round(total * 0.14) },
    ],
    recentClicks: [
      {
        clicked_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        ip_address: "192.168.1.*** (US)",
        user_agent: "Chrome 122 on macOS (Apple Silicon)",
        referrer: "https://x.com",
      },
      {
        clicked_at: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
        ip_address: "10.0.0.*** (DE)",
        user_agent: "Safari 17 on iOS (iPhone 15 Pro)",
        referrer: "Direct",
      },
      {
        clicked_at: new Date(Date.now() - 1000 * 60 * 78).toISOString(),
        ip_address: "172.16.0.*** (JP)",
        user_agent: "Firefox 124 on Windows 11",
        referrer: "https://linkedin.com",
      },
      {
        clicked_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        ip_address: "198.51.100.*** (SG)",
        user_agent: "Chrome 122 on Android",
        referrer: "https://google.com",
      },
    ],
  };
}

/**
 * Fetch QR Code for a shortened URL
 */
export async function fetchUrlQrCode(
  id: string | number,
  token?: string | null,
  shortCode?: string
): Promise<QrCodeResponse> {
  const isDemo = !token || token.startsWith("demo-");

  if (!isDemo && token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/urls/${id}/qr`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (err) {
      console.warn("QR API failed, generating fallback QR code:", err);
    }
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const code = shortCode || "demo";
  const fullUrl = `${origin}/${code}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(
    fullUrl
  )}`;

  return {
    shortUrl: fullUrl,
    qrCode: qrCodeUrl,
  };
}
