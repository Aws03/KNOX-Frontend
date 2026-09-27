import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";
import {
  getStoredToken,
  clearSession,
  readSession,
  persistSession,
} from "@/lib/auth/authStorage";

export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

/**
 * Configured axios instance for API requests:
 * - attaches the stored access token to every request
 * - on a 401, refreshes the session once and retries the request
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export type TokenPair = { accessToken: string; refreshToken: string };

let refreshInFlight: Promise<TokenPair> | null = null;

/**
 * Exchanges the stored refresh token for a new token pair and stores it.
 *
 * Refresh tokens are single-use: the API treats a re-sent (already rotated) token as stolen and
 * signs the user out everywhere. So refreshing must happen once, even when several requests
 * (or several tabs) notice an expired token at the same time:
 * - within a tab, concurrent callers share one in-flight refresh;
 * - across tabs, a Web Lock serialises refreshes, and a tab that finds the stored access token
 *   already replaced (by another tab) adopts it instead of refreshing again.
 *
 * @param staleAccessToken the access token the caller found to be expired or rejected.
 */
export function refreshSession(staleAccessToken: string | null): Promise<TokenPair> {
  refreshInFlight ??= withCrossTabLock(() => exchangeRefreshToken(staleAccessToken)).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function exchangeRefreshToken(staleAccessToken: string | null): Promise<TokenPair> {
  const session = readSession();
  if (!session) throw new Error("No session to refresh");

  const alreadyRefreshed =
    session.token !== staleAccessToken && session.expiresAt - Date.now() > 30_000;
  if (alreadyRefreshed) {
    return { accessToken: session.token, refreshToken: session.refreshToken };
  }

  // Plain axios: this call must not go through the 401 interceptor below.
  const { data } = await axios.post<TokenPair>(`${BASE_URL}/auth/refresh`, {
    refreshToken: session.refreshToken,
  });
  persistSession({
    ...session,
    token: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: jwtDecode<{ exp: number }>(data.accessToken).exp * 1000,
  });
  return data;
}

function withCrossTabLock<T>(work: () => Promise<T>): Promise<T> {
  return typeof navigator !== "undefined" && navigator.locks
    ? (navigator.locks.request("knox-token-refresh", work) as Promise<T>)
    : work();
}

// One redirect per page life: many requests can 401 at once when a session ends.
let isEndingSession = false;

function endSession() {
  if (isEndingSession) return;
  isEndingSession = true;
  clearSession();
  if (!window.location.pathname.startsWith("/auth/")) {
    window.location.href = "/auth/login";
  }
}

type RetriableRequest = InternalAxiosRequestConfig & { _retried?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config as RetriableRequest | undefined;
    // Login/refresh/logout failures are for the auth flow itself to interpret.
    const isAuthEndpoint = request?.url?.includes("/auth/");
    if (error.response?.status !== 401 || !request || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (!request._retried && readSession()) {
      request._retried = true;
      const sentToken = String(request.headers?.Authorization ?? "").replace(/^Bearer /, "") || null;
      try {
        const { accessToken } = await refreshSession(sentToken);
        request.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(request);
      } catch {
        // The refresh token is expired or revoked: the session is over.
      }
    }

    endSession();
    return Promise.reject(error);
  }
);
