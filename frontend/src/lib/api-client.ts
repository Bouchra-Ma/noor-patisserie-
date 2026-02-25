import { useAuthStore } from "@/store/auth-store";

let cachedBaseUrl: string | null = null;
let baseUrlPromise: Promise<string> | null = null;

/** Récupère l'URL de l'API (depuis /api/config). Sur Vercel, la variable est lue au runtime. */
function getApiBaseUrl(): Promise<string> {
  if (cachedBaseUrl) return Promise.resolve(cachedBaseUrl);
  if (!baseUrlPromise) {
    baseUrlPromise = fetch("/api/config")
      .then((r) => r.json())
      .then(
        (d: { apiBaseUrl?: string }) =>
          (d.apiBaseUrl || "http://127.0.0.1:8000/api").replace(/\/$/, "")
      )
      .then((url) => {
        cachedBaseUrl = url;
        return url;
      });
  }
  return baseUrlPromise;
}

interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiClient(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const { requiresAuth = true, ...init } = options;
  const store = useAuthStore.getState();
  const API_BASE_URL = await getApiBaseUrl();

  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...init.headers,
  };

  // Add authorization token if required and available
  if (requiresAuth && store.accessToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${store.accessToken}`;
  }

  let response = await fetch(url, {
    ...init,
    headers,
    credentials: requiresAuth ? "include" : "omit",
  });

  // If unauthorized and we have a refresh token, try to refresh
  if (response.status === 401 && store.refreshToken && requiresAuth) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: store.refreshToken }),
        credentials: "include",
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        store.setAccessToken(data.access);

        // Retry original request with new token
        (headers as Record<string, string>)["Authorization"] = `Bearer ${data.access}`;
        response = await fetch(url, {
          ...init,
          headers,
          credentials: "include",
        });
      } else {
        // Refresh failed, clear auth
        store.clearAuth();
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      store.clearAuth();
    }
  }

  return response;
}

// Helper methods
export const api = {
  get: (endpoint: string, options?: ApiRequestOptions) =>
    apiClient(endpoint, { ...options, method: "GET" }),

  post: (endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiClient(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: (endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiClient(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: (endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiClient(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: (endpoint: string, options?: ApiRequestOptions) =>
    apiClient(endpoint, { ...options, method: "DELETE" }),
};
