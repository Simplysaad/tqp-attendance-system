
const BASE_URL = process.env.BASE_URL || ""


/**
 * Extracts search parameters from a URL or current window location into a plain object.
 * @param url - Optional target URL string. Defaults to `window.location.href` in browser environments.
 */
export function getQueryParams<T extends Record<string, string> = Record<string, string>>(
    url?: string, base = BASE_URL
): T {
    let searchString = "";

    if (url) {
        // Parse from provided string
        const parsedUrl = new URL(url, BASE_URL);

        searchString = parsedUrl.search;
    } else if (typeof window !== "undefined") {
        // Fallback to active browser URL
        searchString = window.location.search;
    }

    const params = new URLSearchParams(searchString);
    const result: Record<string, string> = {};

    params.forEach((value, key) => {
        result[key] = value;
    });

    return result as T;
}

/**
 * Constructs or updates a URL with search parameters provided as a plain key-value object.
 * @param baseUrl - Target path or full URL (e.g., "/login" or "https://example.com/dashboard")
 * @param params - Object containing search parameters to encode
 */
export function buildUrlWithParams(
    baseUrl: string,
    params: Record<string, string | number | boolean | null | undefined>
): string {
    // Handle relative path parsing safely
    const isRelative = !baseUrl.startsWith("http://") && !baseUrl.startsWith("https://");
    const urlObj = new URL(isRelative ? `${BASE_URL}${baseUrl.startsWith("/") ? "" : "/"}${baseUrl}` : baseUrl);

    // Merge/Set query parameters
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            urlObj.searchParams.set(key, String(value));
        }
    });

    if (isRelative) {
        return `${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
    }

    return urlObj.toString();
}