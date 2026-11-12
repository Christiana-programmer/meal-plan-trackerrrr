import type { MockUser } from "@/types/user";
import {
  apiRequest,
  clearAccessToken,
  saveAccessToken,
} from "@/services/api-client";

export type RegisterData = {
  fullName: string;
  email: string;
  password: string;
};

export interface AuthService {
  register(data: RegisterData): Promise<MockUser>;
  login(email: string, password: string): Promise<MockUser>;
  getSession(): MockUser | null;
  saveSession(user: MockUser): void;
  logout(): void;
}

const SESSION_STORAGE_KEY = "mealwise.auth-user.v1";

type AuthResponse = {
  user: MockUser;
  accessToken: string;
};

function isMockUser(value: unknown): value is MockUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "string" &&
    typeof user.fullName === "string" &&
    typeof user.email === "string"
  );
}

export const authService: AuthService = {
  async register(data: RegisterData): Promise<MockUser> {
    const response = await apiRequest<AuthResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false,
    );
    return response.user;
  },

  async login(email: string, password: string): Promise<MockUser> {
    const response = await apiRequest<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false,
    );
    saveAccessToken(response.accessToken);
    return response.user;
  },

  getSession() {
    if (typeof window === "undefined") {
      return null;
    }

    const savedUser = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (
      !savedUser ||
      !window.sessionStorage.getItem("mealwise.access-token.v1")
    ) {
      return null;
    }

    let parsedSession: unknown;
    try {
      parsedSession = JSON.parse(savedUser);
    } catch {
      throw new Error(
        "Your sign-in could not be read. Log in again to continue.",
      );
    }

    if (!isMockUser(parsedSession)) {
      throw new Error(
        "Your sign-in has an unexpected format. Log in again to continue.",
      );
    }

    return parsedSession;
  },

  saveSession(user) {
    if (typeof window === "undefined") {
      throw new Error("Sign-in is only available in the browser.");
    }

    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  },

  logout() {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    clearAccessToken();
  },
};
