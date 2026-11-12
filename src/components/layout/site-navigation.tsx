import Link from "next/link";

export type NavigationItem = {
  href: string;
  label: string;
};

type SiteNavigationProps = {
  items: NavigationItem[];
  activeHref?: string;
};

function NavigationLinks({
  items,
  activeHref,
}: SiteNavigationProps) {
  return (
    <>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.href === activeHref ? "page" : undefined}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary-soft hover:text-primary ${
            item.href === activeHref ? "bg-primary-soft text-primary" : "text-muted"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function SiteNavigation({ items, activeHref }: SiteNavigationProps) {
  return (
    <nav aria-label="Main navigation">
      <div className="hidden items-center gap-1 md:flex">
        <NavigationLinks items={items} activeHref={activeHref} />
      </div>
      <details className="group relative md:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground focus-visible:outline-primary">
          Menu
        </summary>
        <div className="absolute right-0 z-10 mt-2 grid min-w-48 gap-1 rounded-2xl border border-border bg-surface p-2 shadow-lg">
          <NavigationLinks items={items} activeHref={activeHref} />
        </div>
      </details>
    </nav>
  );
}
