"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { TextField } from "@/components/ui/text-field";

type AuthFormProps = {
  mode: "login" | "register";
  registered?: boolean;
};

export function AuthForm({ mode, registered = false }: AuthFormProps) {
  const isRegister = mode === "register";
  const router = useRouter();
  const auth = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      if (isRegister) {
        const fullName = String(formData.get("fullName") ?? "").trim();
        const confirmPassword = String(
          formData.get("confirmPassword") ?? "",
        );

        if (password !== confirmPassword) {
          setError("Your passwords don’t match. Please check and try again.");
          return;
        }

        if (!fullName) {
          setError("Please enter your full name.");
          return;
        }

        await auth.register({
          fullName,
          email,
          password,
        });
        router.replace("/login?registered=1");
      } else {
        await auth.login(email, password);
        router.replace("/dashboard");
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn’t complete that request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-1px)] items-center justify-center px-5 py-10 sm:px-8">
      <section className="w-full max-w-md">
        <Link href="/" className="mb-10 inline-flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-white">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current">
              <path d="M19.5 4.5C11 4.5 5.2 7.8 5.2 13.1a5.1 5.1 0 0 0 5.1 5.1c5.4 0 8.7-5.8 9.2-13.7Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4.5 20c2.4-4.3 5.4-7.3 10.1-10.1" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight">mealwise</span>
        </Link>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-[0_18px_55px_-42px_rgba(27,65,41,0.4)] sm:p-9">
          <p className="text-sm font-semibold text-primary">
            {isRegister ? "Start tracking" : "Welcome back"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {isRegister ? "Create your account" : "Log in to mealwise"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {isRegister
              ? "A clearer picture of your meal spending starts here."
              : "Sign in to pick up where you left off."}
          </p>

          <div
            role="note"
            className="mt-6 rounded-xl border border-border bg-background px-4 py-3 text-xs leading-5 text-muted"
          >
            {isRegister
              ? "Create an account with a valid email address and a password of at least 8 characters."
              : "Sign in with the email address and password you used to create your account."}
          </div>

          <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
            {isRegister ? (
              <TextField
                id="fullName"
                name="fullName"
                label="Full name"
                placeholder="e.g. Alex Johnson"
                autoComplete="name"
                required
              />
            ) : null}
            <TextField
              id="email"
              name="email"
              label="Email address"
              type="email"
              placeholder="you@university.edu"
              autoComplete="email"
              required
            />
            <TextField
              id="password"
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder={isRegister ? "At least 8 characters" : "Your password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={isRegister ? 8 : undefined}
              required
              trailingAction={
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="flex size-10 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <Icon
                    name={showPassword ? "eyeOff" : "eye"}
                    className="size-5"
                  />
                </button>
              }
            />
            {isRegister ? (
              <TextField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Enter your password again"
                autoComplete="new-password"
                minLength={8}
                required
                trailingAction={
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    aria-pressed={showConfirmPassword}
                    onClick={() =>
                      setShowConfirmPassword((visible) => !visible)
                    }
                    className="flex size-10 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <Icon
                      name={showConfirmPassword ? "eyeOff" : "eye"}
                      className="size-5"
                    />
                  </button>
                }
              />
            ) : null}

            {error ? (
              <p
                role="alert"
                className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
              >
                {error}
              </p>
            ) : null}
            {registered && !isRegister ? (
              <p
                role="status"
                className="rounded-xl bg-primary-soft px-4 py-3 text-sm leading-6 text-primary"
              >
                Your account has been created. You can now log in.
              </p>
            ) : null}

            <Button className="mt-1 w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Please wait…"
                : isRegister
                  ? "Create account"
                  : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {isRegister ? "Already have an account?" : "New to mealwise?"}{" "}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              {isRegister ? "Log in" : "Create an account"}
            </Link>
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="hover:text-primary">
            ← Back to home
          </Link>
        </p>
      </section>
    </main>
  );
}
