const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const ACCESS_TOKEN_KEY = "mealwise.access-token.v1";

type ApiErrorResponse = {
  detail?: string | Array<{ msg?: string }>;
};

function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function saveAccessToken(token: string) {
  if (typeof window === "undefined") {
    throw new Error("Authentication is only available in the browser.");
  }
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

function getErrorMessage(detail: ApiErrorResponse["detail"]) {
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg)
      .filter((message): message is string => Boolean(message))
      .join(" ");
  }
  return "The request could not be completed. Please try again.";
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = authenticated ? getAccessToken() : null;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new Error(
      "Could not reach the API. Make sure the backend is running and try again.",
    );
  }

  if (response.status === 401 && authenticated && token) {
    clearAccessToken();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("mealwise:unauthorized"));
    }
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorResponse;
    throw new Error(getErrorMessage(body.detail));
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
