import type { Metadata } from "next";
import { AnalyticsLoader } from "./analytics-loader";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Track your automation performance, job search insights, and LinkedIn growth over time.",
};

export default function AnalyticsPage() {
  return <AnalyticsLoader />;
}
