"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export function ProtectedDashboardRoute({
  children,
}: {
  children: (userId: string) => ReactNode;
}) {
  const { user, isReady, error, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !user && !error) {
      router.replace("/login");
    }
  }, [error, isReady, router, user]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-10">
        <div
          className="w-full max-w-md rounded-2xl border border-danger/20 bg-surface p-6"
          role="alert"
        >
          <h1 className="text-lg font-semibold">Sign-in unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{error}</p>
          <Link
            href="/login"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  if (!isReady || !user) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-5 text-sm text-muted"
        role="status"
      >
        Opening your dashboard…
      </main>
    );
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <DashboardShell user={user} onLogout={handleLogout}>
      {children(user.id)}
    </DashboardShell>
  );
}
