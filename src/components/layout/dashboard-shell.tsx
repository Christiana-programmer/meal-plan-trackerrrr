"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SiteNavigation } from "@/components/layout/site-navigation";
import type { MockUser } from "@/types/user";

type DashboardShellProps = {
  user: MockUser;
  onLogout: () => void;
  children: ReactNode;
};

const navigationItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/budget", label: "Budget" },
  { href: "/expenses", label: "Transactions" },
];

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-white">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-5 fill-none stroke-current"
        >
          <path
            d="M19.5 4.5C11 4.5 5.2 7.8 5.2 13.1a5.1 5.1 0 0 0 5.1 5.1c5.4 0 8.7-5.8 9.2-13.7Z"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 20c2.4-4.3 5.4-7.3 10.1-10.1"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight">mealwise</span>
    </Link>
  );
}

function NavigationContent({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <nav aria-label="Dashboard navigation" className="grid gap-1">
        {navigationItems.map((item, index) => {
          const iconName =
            index === 0
              ? "overview"
              : index === 1
                ? "budget"
                : "transactions";
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-soft text-primary"
                  : "text-muted hover:bg-background hover:text-foreground"
              }`}
            >
              <Icon name={iconName} className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 px-3 text-muted"
        onClick={onLogout}
      >
        <Icon name="logout" className="size-[18px]" />
        Log out
      </Button>
    </>
  );
}

export function DashboardShell({
  user,
  onLogout,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen overflow-x-clip">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[252px] flex-col border-r border-border bg-surface px-5 py-7 lg:flex">
        <Brand />
        <div className="mt-10">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Workspace
          </p>
          <NavigationContent onLogout={onLogout} />
        </div>
        <div className="mt-auto rounded-2xl bg-background p-4">
          <p className="text-xs font-semibold text-foreground">Demo mode</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Your sample data stays in this browser.
          </p>
        </div>
      </aside>

      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 xl:px-10">
            <div className="lg:hidden">
              <Brand />
            </div>
            <div className="hidden lg:block" aria-hidden="true" />
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">{user.fullName}</p>
                <p className="text-xs text-muted">Student account</p>
              </div>
              <span
                aria-label={`Signed in as ${user.fullName}`}
                title={user.fullName}
                className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary"
              >
                {user.fullName
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase())
                  .join("") || "S"}
              </span>
              <div className="lg:hidden">
                <SiteNavigation
                  items={navigationItems}
                  activeHref={pathname}
                />
              </div>
              <Button
                variant="ghost"
                className="hidden min-h-10 px-3 text-muted sm:inline-flex lg:hidden"
                onClick={onLogout}
              >
                Log out
              </Button>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
