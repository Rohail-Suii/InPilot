import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Track your automation performance, job search insights, and LinkedIn growth over time.",
};

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
        <BarChart3 className="h-8 w-8 text-emerald-400" />
      </div>
      <h2 className="text-xl font-semibold text-white">Analytics</h2>
      <p className="text-white/40 mt-2 max-w-md">
        Track your automation performance, job search insights, and LinkedIn growth over time.
      </p>
    </div>
  );
}
