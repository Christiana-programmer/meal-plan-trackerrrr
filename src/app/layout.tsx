import type { Metadata } from "next";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "mealwise | Campus Meal Plan Tracker",
  description: "Track your meal budget, spending, and remaining balance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
