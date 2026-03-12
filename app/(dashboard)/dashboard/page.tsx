import { Suspense } from "react";
import { auth } from "@/auth";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickStartCards } from "@/components/dashboard/quick-start-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { GettingStarted } from "@/components/dashboard/getting-started";
import { CardSkeleton } from "@/components/ui/spinner";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          Welcome back, {session?.user?.name?.split(" ")[0] || "there"}
        </h2>
        <p className="text-white/50 mt-1">
          Here&apos;s your LinkedIn automation overview
        </p>
      </div>

      {/* Stats */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <StatsCards />
      </Suspense>

      {/* Getting Started Checklist (for new users) */}
      <GettingStarted />

      {/* Quick Start */}
      <QuickStartCards />

      {/* Recent Activity */}
      <Suspense
        fallback={
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <RecentActivity />
      </Suspense>
    </div>
  );
}
