import { MessageType } from "@/shared/types/messages";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/v1";

/**
 * API client for the extension.
 * Handles auth token injection and refresh.
 */

async function getAuthToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: MessageType.GET_AUTH_TOKEN }, (response) => {
      resolve(response?.success ? response.data.accessToken : null);
    });
  });
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  query?: Record<string, string>,
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { data: null, error: "Not authenticated", status: 401 };
    }

    let url = `${API_BASE_URL}${path}`;
    if (query) {
      const params = new URLSearchParams(query);
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return { data: null, error: data.message || "Request failed", status: response.status };
    }

    return { data, error: null, status: response.status };
  } catch {
    return { data: null, error: "Network error", status: 0 };
  }
}

export const api = {
  get: <T>(path: string, query?: Record<string, string>) =>
    request<T>("GET", path, undefined, query),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
