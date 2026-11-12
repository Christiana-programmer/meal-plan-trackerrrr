import Link from "next/link";

const benefits = [
  {
    number: "01",
    title: "Know what’s left",
    description:
      "See your remaining meal balance at a glance, without doing the maths.",
  },
  {
    number: "02",
    title: "Spend with a plan",
    description:
      "Get a daily spending guide that adjusts as your budget and expenses change.",
  },
  {
    number: "03",
    title: "Keep it all together",
    description:
      "Record cafeteria purchases and look back at where your meal credits went.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="Mealwise home" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-white">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current">
              <path d="M19.5 4.5C11 4.5 5.2 7.8 5.2 13.1a5.1 5.1 0 0 0 5.1 5.1c5.4 0 8.7-5.8 9.2-13.7Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4.5 20c2.4-4.3 5.4-7.3 10.1-10.1" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight">mealwise</span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-primary-soft"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover sm:px-5"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:pb-28 lg:pt-24">
        <div className="max-w-2xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-sm font-medium text-muted">
            <span className="size-2 rounded-full bg-primary" />
            A calmer way to manage your meal plan
          </p>
          <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Make your meal budget <span className="text-primary">go further.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted">
            Keep an eye on your cafeteria spending, know what’s left, and make
            your meal credits last through the semester.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Create your free account
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary-soft"
            >
              I already have an account
            </Link>
          </div>
          <p className="mt-5 text-xs leading-5 text-muted">
            Frontend demo · Your password is never saved
          </p>
        </div>

        <div
          aria-label="Illustration of a sample meal budget"
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="absolute -left-7 top-12 size-28 rounded-full bg-primary-soft blur-2xl" />
          <div className="relative rounded-[2rem] border border-border bg-surface p-5 shadow-[0_24px_70px_-38px_rgba(27,65,41,0.35)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted">Your meal budget</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  ₦42,000<span className="text-xl text-muted">.00</span>
                </p>
              </div>
              <span className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
                On track
              </span>
            </div>

            <div className="mt-8 rounded-2xl bg-background p-4 sm:p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Budget progress</span>
                <span className="text-muted">16% spent</span>
              </div>
              <div
                role="img"
                aria-label="16 percent of the sample budget spent"
                className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#e5ebe5]"
              >
                <div className="h-full w-[16%] rounded-full bg-primary" />
              </div>
              <div className="mt-3 flex justify-between text-xs text-muted">
                <span>₦8,000 spent</span>
                <span>₦50,000 total</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-medium text-muted">Daily guide</p>
                <p className="mt-2 text-xl font-semibold">₦6,000</p>
                <p className="mt-1 text-xs text-muted">to spend today</p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-medium text-muted">Time left</p>
                <p className="mt-2 text-xl font-semibold">7 days</p>
                <p className="mt-1 text-xs text-muted">in this budget</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-sm font-semibold text-primary">
                  L
                </span>
                <div>
                  <p className="text-sm font-semibold">Lunch</p>
                  <p className="mt-0.5 text-xs text-muted">Today · Cafeteria</p>
                </div>
              </div>
              <p className="text-sm font-semibold">−₦2,000</p>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted">
            Sample figures for illustration only
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="max-w-lg">
            <p className="text-sm font-semibold text-primary">A little more clarity</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your budget, without the guesswork.
            </h2>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-12">
            {benefits.map((benefit) => (
              <article key={benefit.number}>
                <p className="text-sm font-semibold text-primary">{benefit.number}</p>
                <h3 className="mt-4 text-lg font-semibold">{benefit.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p>mealwise · Built for students</p>
        <p>Simple tracking. Smarter spending.</p>
      </footer>
    </main>
  );
}
