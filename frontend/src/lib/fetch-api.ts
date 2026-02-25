const API_BASE = (() => {
  const url = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api").replace(/\/$/, "");
  if (
    typeof window !== "undefined" &&
    !process.env.NEXT_PUBLIC_API_URL &&
    !/localhost|127\.0\.0\.1/.test(window.location.hostname)
  ) {
    console.error(
      "[Noor] NEXT_PUBLIC_API_URL n'est pas défini. Définissez-le dans Vercel puis redéployez."
    );
  }
  return url;
})();
const FETCH_TIMEOUT_MS = 5000;

/**
 * Fetch avec timeout pour éviter que la page reste bloquée si le backend ne répond pas.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchCatalogProducts(): Promise<unknown[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/catalog/products/`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("Failed to fetch products", res.statusText);
      return [];
    }
    return res.json();
  } catch (err) {
    console.error("Catalog fetch error (timeout or network):", err);
    return [];
  }
}

export async function fetchCatalogProductBySlug(slug: string): Promise<unknown | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/catalog/products/${slug}/`, {
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      console.error("Failed to fetch product", res.statusText);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error("Product fetch error (timeout or network):", err);
    return null;
  }
}
