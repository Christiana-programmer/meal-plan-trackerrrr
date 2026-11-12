import type { Metadata } from "next";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";

export const metadata: Metadata = {
  title: "Dashboard | mealwise",
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
