"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService, type RegisterData } from "@/services/auth.service";
import type { MockUser } from "@/types/user";

type AuthContextValue = {
  user: MockUser | null;
  isReady: boolean;
  error: string | null;
  register: (data: RegisterData) => Promise<MockUser>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    Promise.resolve()
      .then(() => authService.getSession())
      .then((session) => {
        if (isCurrent) {
          setUser(session);
        }
      })
      .catch((cause: unknown) => {
        if (isCurrent) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Your demo sign-in could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsReady(true);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      authService.logout();
      setUser(null);
    }

    window.addEventListener("mealwise:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("mealwise:unauthorized", handleUnauthorized);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      error,
      register: (data) => authService.register(data),
      login: async (email, password) => {
        const signedInUser = await authService.login(email, password);
        authService.saveSession(signedInUser);
        setError(null);
        setUser(signedInUser);
      },
      logout: () => {
        authService.logout();
        setUser(null);
      },
    }),
    [error, isReady, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
