import type { Metadata } from "next";
import { AnalyticsClient } from "@/components/analytics/analytics-client";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Track your automation performance, job search insights, and LinkedIn growth over time.",
};

export default function AnalyticsPage() {
  return <AnalyticsClient />;
}
