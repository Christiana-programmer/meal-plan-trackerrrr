import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Log in | mealwise",
};

async function LoginPageContent({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string | string[] }>;
}) {
  const params = await searchParams;
  const registered = params.registered === "1";

  return <AuthForm mode="login" registered={registered} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<AuthForm mode="login" />}>
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  );
}
