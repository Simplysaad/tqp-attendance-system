import axios, {
    AxiosInstance,
    AxiosError,
    InternalAxiosRequestConfig,
} from "axios";
import { QURAN_SURAHS } from "@/lib/surah";

/**
 * Quran.Foundation Content API client.
 *
 * Auth model (Content APIs): OAuth2 client-credentials.
 *  - Exchange client_id/client_secret for a short-lived access token (~3600s, no refresh token).
 *  - Send `x-auth-token` + `x-client-id` on every content request.
 *  - On a 401, refresh the token once and retry the request once.
 *
 * SERVER-ONLY: the client secret must never reach the browser. Import this from
 * server actions / route handlers, never from a "use client" component.
 */

type QfEnv = "prelive" | "production";

const QF_ENV: QfEnv =
    process.env.QF_ENV === "production" ? "production" : "prelive";

const HOSTS: Record<QfEnv, { oauth: string; api: string }> = {
    prelive: {
        oauth: "https://prelive-oauth2.quran.foundation",
        api: "https://apis-prelive.quran.foundation",
    },
    production: {
        oauth: "https://oauth2.quran.foundation",
        api: "https://apis.quran.foundation",
    },
};

const { oauth: OAUTH_BASE_URL, api: API_BASE_URL } = HOSTS[QF_ENV];
const CLIENT_ID = process.env.QF_CLIENT_ID;
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET;

// ---------------------------------------------------------------------------
// Token management
// Cached in module scope; persists across requests on a warm server instance.
// ---------------------------------------------------------------------------
interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number; // seconds (3600)
    scope?: string;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0; // epoch ms

async function getAccessToken(forceRefresh = false): Promise<string> {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error(
            "Missing QF_CLIENT_ID / QF_CLIENT_SECRET environment variables."
        );
    }

    const now = Date.now();
    // Reuse the cached token until ~60s before it expires.
    if (!forceRefresh && cachedToken && now < tokenExpiresAt - 60_000) {
        return cachedToken;
    }

    const { data } = await axios.post<TokenResponse>(
        `${OAUTH_BASE_URL}/oauth2/token`,
        new URLSearchParams({
            grant_type: "client_credentials",
            scope: "content",
        }),
        {
            // Credentials go via HTTP Basic auth, as the QF docs specify.
            auth: { username: CLIENT_ID, password: CLIENT_SECRET },
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
    );

    cachedToken = data.access_token;
    tokenExpiresAt = now + data.expires_in * 1000;
    return cachedToken;
}

// ---------------------------------------------------------------------------
// Content API client
// ---------------------------------------------------------------------------
export const quranApi: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/content/api/v4`,
    timeout: 10_000,
});

// Attach fresh auth headers before every request.
quranApi.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await getAccessToken();
        config.headers.set("x-auth-token", token);
        config.headers.set("x-client-id", CLIENT_ID!);
        return config;
    }
);

// On a 401, refresh the token once and retry the request once.
quranApi.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const config = error.config as
            | (InternalAxiosRequestConfig & { _retry?: boolean })
            | undefined;

        if (error.response?.status === 401 && config && !config._retry) {
            config._retry = true;
            await getAccessToken(true); // force refresh; request interceptor re-attaches it
            return quranApi(config);
        }

        return Promise.reject(error);
    }
);

// ---------------------------------------------------------------------------
// Helpers (server-only)
// ---------------------------------------------------------------------------

/** List all chapters (surahs). */
export async function listChapters(language = "en") {
    const { data } = await quranApi.get("/chapters", { params: { language } });
    return data.chapters;
}

/** Get a single chapter by its number (1–114). */
export async function getChapter(chapterId: number, language = "en") {
    const { data } = await quranApi.get(`/chapters/${chapterId}`, {
        params: { language },
    });
    return data.chapter;
}

/** Get a single verse by its key, e.g. "2:255". */
export async function getVerseByKey(verseKey: string) {
    const { data } = await quranApi.get(`/verses/by_key/${verseKey}`, {
        params: { fields: "text_uthmani" },
    });
    return data.verse;
}

/**
 * Look up a verse from a surah *name* + aayah number.
 * Matches the shape stored in student memorization records
 * (e.g. { surah: "An-Nisa", aayah: 12 }).
 */
export async function getAayahInfo({
    surah,
    aayah,
}: {
    surah: string;
    aayah: number;
}) {
    const match = QURAN_SURAHS.find(
        (s) => s.name.toLowerCase() === surah.trim().toLowerCase()
    );
    if (!match) {
        throw new Error(`Surah "${surah}" not found in QURAN_SURAHS.`);
    }
    return getVerseByKey(`${match.number}:${aayah}`);
}

export interface MemorizationPosition {
    surah: string;
    aayah: number;
    juz?: number;
    page?: number;
}

/**
 * Resolve the authoritative juz + page for a surah name + aayah number from the
 * QF Content API, returning a position object ready to persist on a student/goal
 * record. (v4 verse objects include `juz_number` and `page_number` by default.)
 */
export async function getMemorizationPosition(
    surah: string,
    aayah: number
): Promise<MemorizationPosition> {
    const verse = await getAayahInfo({ surah, aayah });
    return {
        surah,
        aayah,
        juz: verse?.juz_number,
        page: verse?.page_number,
    };
}
