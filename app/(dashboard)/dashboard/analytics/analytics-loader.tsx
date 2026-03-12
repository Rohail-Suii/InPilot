"use client";

import dynamic from "next/dynamic";

const AnalyticsClient = dynamic(
  () => import("@/components/analytics/analytics-client").then((mod) => mod.AnalyticsClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    ),
  }
);

export function AnalyticsLoader() {
  return <AnalyticsClient />;
}
